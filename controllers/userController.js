const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const Membre = require("../models/Membre");
const Referent = require("../models/Referent");
const Instance = require("../models/Instance");
const { ROLES_CREABLES, filtreUtilisateurs, leaderDe } = require("../utils/scope");

// ➕ Créer un compte du niveau en dessous :
//    pasteur → AP   |   AP → leader ou AL   |   leader → référent ou AL   |   AL → référent ou AL (comme le leader)
exports.creer = async (req, res) => {
  try {
    const createur = req.user;
    const permis = ROLES_CREABLES[createur.role];
    if (!permis) {
      return res.status(403).json({ message: "Vous ne pouvez pas créer de comptes." });
    }
    const { nom, prenom, userLogin, motDePasse, instanceId, role: roleDemande, leaderId } = req.body;
    const roleCree = roleDemande || permis[0];
    if (!permis.includes(roleCree)) {
      return res.status(403).json({ message: "Vous ne pouvez pas créer ce type de compte." });
    }

    if (!nom?.trim() || !prenom?.trim() || !userLogin?.trim() || !motDePasse) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }
    if (motDePasse.length < 8) {
      return res
        .status(400)
        .json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
    }

    // Supérieur direct : référents et assistants d'un leader dépendent TOUJOURS de ce leader
    // (que le compte soit créé par le leader lui-même, par un de ses AL, ou par un AP).
    let parent = createur._id;
    if (roleCree === "referent" || (roleCree === "al" && createur.role !== "ap")) {
      parent = leaderDe(createur);
    } else if (roleCree === "al" && createur.role === "ap") {
      const leader =
        mongoose.isValidObjectId(leaderId) && createur.instance
          ? await User.findOne({ _id: leaderId, role: "leader", instance: createur.instance })
          : null;
      if (!leader) {
        return res
          .status(400)
          .json({ message: "Choisissez le leader que cet assistant va seconder." });
      }
      parent = leader._id;
    }
    if (!parent) {
      return res.status(400).json({
        message:
          "Votre compte n'est rattaché à aucun leader. Demandez à votre Assistant Pasteur ou au pasteur de vous rattacher (écran « Mon équipe »).",
      });
    }

    // Instance : le pasteur choisit celle de l'AP ; les autres héritent de la leur.
    let instance;
    if (createur.role === "pasteur") {
      instance = instanceId ? await Instance.findById(instanceId) : null;
      if (!instance || !instance.actif) {
        return res.status(400).json({ message: "Choisissez une instance (ville / pays) valide." });
      }
    } else {
      if (!createur.instance) {
        return res
          .status(400)
          .json({ message: "Votre compte n'est rattaché à aucune instance." });
      }
      instance = await Instance.findById(createur.instance);
    }

    if (await User.findOne({ userLogin: userLogin.trim() })) {
      return res.status(400).json({ message: "Ce login est déjà utilisé." });
    }

    const nouveau = await User.create({
      nom: nom.trim(),
      prenom: prenom.trim(),
      userLogin: userLogin.trim(),
      motDePasse: await bcrypt.hash(motDePasse, 10),
      role: roleCree,
      instance: instance._id,
      parent,
      mustChangePassword: true, // la personne choisit son propre mot de passe à la 1re connexion
    });

    if (roleCree === "referent") {
      await Referent.create({ user: nouveau._id, commentaireLeader: "", commentaireAdmin: "" });
    }

    res.status(201).json({
      message: "Compte créé avec succès.",
      utilisateur: {
        _id: nouveau._id,
        nom: nouveau.nom,
        prenom: nouveau.prenom,
        userLogin: nouveau.userLogin,
        role: nouveau.role,
        instance: instance._id,
      },
    });
  } catch (error) {
    console.error("❌ Erreur création compte :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Ancienne route : un leader crée un référent (conservée pour les anciennes versions de l'app)
exports.creerReferent = (req, res) => exports.creer(req, res);

// 👥 L'équipe visible par l'utilisateur (AP, leaders, référents selon son niveau)
exports.equipe = async (req, res) => {
  try {
    const utilisateurs = await User.find(filtreUtilisateurs(req.user))
      .select("nom prenom userLogin role instance parent createdAt")
      .populate("instance", "ville pays")
      .populate("parent", "nom prenom role")
      .sort({ role: 1, nom: 1 })
      .lean();

    // Nombre de suivis par référent
    const ids = utilisateurs.filter((u) => u.role === "referent" || u.role === "al").map((u) => u._id);
    const comptes = await Membre.aggregate([
      { $match: { referentId: { $in: ids } } },
      { $group: { _id: "$referentId", total: { $sum: 1 } } },
    ]);
    const parReferent = Object.fromEntries(comptes.map((c) => [String(c._id), c.total]));

    res.json(
      utilisateurs.map((u) => ({
        ...u,
        nbSuivis: u.role === "referent" || u.role === "al" ? parReferent[String(u._id)] || 0 : undefined,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔗 Rattacher un référent à un leader (AP ou pasteur) — utile pour les comptes d'avant la migration
exports.rattacher = async (req, res) => {
  try {
    const cible = await User.findOne({
      $and: [{ _id: req.params.id }, filtreUtilisateurs(req.user)],
    });
    if (!cible || !["referent", "al"].includes(cible.role)) {
      return res.status(404).json({ message: "Compte introuvable." });
    }

    const leader = await User.findOne({ _id: req.body.parentId, role: "leader" });
    if (!leader || String(leader.instance) !== String(cible.instance)) {
      return res
        .status(400)
        .json({ message: "Le leader doit appartenir à la même instance que ce compte." });
    }

    cible.parent = leader._id;
    await cible.save();
    res.json({ message: "Compte rattaché au leader." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 📋 Référents visibles + leurs suivis (format historique, utilisé par le tableau de bord)
exports.referentsEtLeursMembres = async (req, res) => {
  try {
    const referents = await User.find({
      $and: [filtreUtilisateurs(req.user), { role: { $in: ["referent", "al"] } }],
    })
      .select("nom prenom userLogin role instance parent")
      .lean();

    const membres = await Membre.find({ referentId: { $in: referents.map((r) => r._id) } }).lean();
    const parReferent = {};
    for (const m of membres) (parReferent[String(m.referentId)] ||= []).push(m);

    res.status(200).json(
      referents.map((r) => ({
        referent: {
          _id: r._id,
          nom: r.nom,
          prenom: r.prenom,
          userLogin: r.userLogin,
          role: r.role,
          instance: r.instance,
        },
        membres: parReferent[String(r._id)] || [],
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
