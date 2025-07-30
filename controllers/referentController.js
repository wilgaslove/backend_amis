const bcrypt = require("bcrypt");
const User = require("../models/User");
const Membre = require("../models/Membre");
const Referent = require("../models/Referent");

// exports.listerMembres = async (req, res) => {
//   try {
//     const membres = await Membre.find();
//     res.json(membres);
//   } catch (err) {
//     res.status(500).json({ message: "Erreur", error: err });
//   }
// };

// // Création d'un référent par un leader.
exports.creerReferent = async (req, res) => {
  console.log("📥 Route POST /api/referents/creer appelée");
  console.log("🔐 Utilisateur connecté :", req.user);
  try {
    const { nom, prenom, userLogin, motDePasse } = req.body;

    // Vérifier si le login existe déjà
    const loginExistant = await User.findOne({ userLogin });
    if (loginExistant) {
      return res.status(400).json({ message: "Ce login est déjà utilisé." });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Créer le user
    const nouveauUser = new User({
      nom,
      prenom,
      userLogin,
      motDePasse: hashedPassword,
      role: "referent",
    });

    await nouveauUser.save();

    // Créer le référent lié
    const nouveauReferent = new Referent({
      user: nouveauUser._id,
      commentaireLeader: "",
      commentaireAdmin: ""
    });

    await nouveauReferent.save();

    res.status(201).json({
      message: "Référent créé avec succès.",
      referent: nouveauReferent,
    });
  } catch (error) {
    console.error("❌ Erreur création référent :", error);
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

// // ✅ Liste tous les référents
// exports.getAllReferents = async (req, res) => {
//   try {
//     const referents = await Referent.find(); // tu peux filtrer par leader si besoin
//     res.status(200).json(referents);
//   } catch (error) {
//     res.status(500).json({ message: "Erreur lors de la récupération des référents" });
//   }
// };

// // ✅ Liste les membres associés à un référen
// // exports.getMembreDuReferent = async (req, res) => {
// //   try {
// //     const referents = await Referent.find()
// //       .populate('user', 'nom prenom userLogin role')
// //       .populate('membres');
// //     res.json(referents);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: 'Erreur lors de la récupération des référents' });
// //   }
// // };

// // exports.getReferentsAvecMembres = async (req, res) => {
// //   try {
// //     // Récupérer tous les référents
// //     const referents = await Referent.find().populate('user', 'nom prenom userLogin');

// //     // Récupérer les membres associés à chaque référent
// //     const referentsAvecMembres = await Promise.all(referents.map(async (referent) => {
// //       const membres = await Membre.find({ referentId: referent._id });
// //       return { ...referent.toObject(), membres };
// //     }));

// //     res.status(200).json(referentsAvecMembres);
// //   } catch (err) {
// //     console.error("❌ Erreur récupération des référents :", err);
// //     res.status(500).json({ message: "Erreur lors de la récupération des référents", error: err });
// //   }
// // };

// // exports.getMembresDuReferent = async (req, res) => {
// //   try {
// //     const referentId = req.params.id;

// //     // Récupère les membres ayant ce référent
// //     const membres = await User.find({ referent: referentId });

// //     res.status(200).json(membres);
// //   } catch (error) {
// //     console.error("Erreur récupération membres :", error);
// //     res.status(500).json({ message: "Erreur lors de la récupération des membres." });
// //   }
// // };

// // Leader laisse un commentaire sur un référent

exports.ajouterCommentaireLeader = async (req, res) => {
  try {
    const { referentId } = req.params;
    const { commentaire } = req.body;

    const referent = await Referent.findById(referentId);
    if (!referent)
      return res.status(404).json({ message: "Référent introuvable" });

    referent.commentaireLeader = commentaire;
    await referent.save();

    res.json({ message: "Commentaire du leader ajouté", referent });
  } catch (error) {
    res.status(500).json({ message: "Erreur ajout commentaire", error });
  }
};

// Admin laisse un commentaire sur un référent
exports.ajouterCommentaireAdmin = async (req, res) => {
  try {
    const { referentId } = req.params;
    const { commentaire } = req.body;

    const referent = await Referent.findById(referentId);
    if (!referent)
      return res.status(404).json({ message: "Référent introuvable" });

    referent.CommantaireAdmin = commentaire;
    await referent.save();

    res.json({ message: "Commentaire de l'admin ajouté", referent });
  } catch (error) {
    res.status(500).json({ message: "Erreur ajout commentaire admin", error });
  }
};

exports.referentsEtLeursMembres = async (req, res) => {
  try {
    const currentUser = req.user;

    // Vérifie si l'utilisateur a le droit d'accès
    if (!["admin", "leader"].includes(currentUser.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Récupérer tous les utilisateurs ayant le rôle 'referent'
    const referents = await User.find({ role: "referent" });

    // Pour chaque référent, trouver les membres liés
    const resultats = await Promise.all(
      referents.map(async (referent) => {
        const membres = await Membre.find({ referentId: referent._id });
        return {
          referent: {
            _id: referent._id,
            nom: referent.nom,
            prenom: referent.prenom,
            userLogin: referent.userLogin,
          },
          membres,
        };
      })
    );

    res.status(200).json(resultats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
