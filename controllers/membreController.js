const Membre = require("../models/Membre");
const { filtreMembres, et } = require("../utils/scope");

// Champs que le client n'a PAS le droit de fixer lui-même
const CHAMPS_PROTEGES = [
  "_id", "referentId", "instance", "hasPhoto", "photoData", "photoType",
  "createdAt", "updatedAt", "__v",
];
const nettoyer = (body) => {
  const copie = { ...body };
  CHAMPS_PROTEGES.forEach((c) => delete copie[c]);
  return copie;
};

// Retrouve un suivi UNIQUEMENT s'il est dans le périmètre de l'utilisateur
const trouverDansPerimetre = async (user, id, selection = "") => {
  const filtre = await filtreMembres(user);
  return Membre.findOne(et({ _id: id }, filtre)).select(selection);
};

// Un assistant leader voit tout l'équipe, mais ne modifie / ne photographie que SES suivis
// (ceux dont il est le référent). Les autres rôles gardent les droits liés à leur périmètre.
const droitEcriture = (user, membre) =>
  user.role !== "al" || String(membre.referentId) === String(user._id);
const REFUS_ECRITURE = { message: "Vous ne pouvez modifier que vos propres suivis." };

// ➕ Créer un suivi (référent ou assistant leader) — rattaché automatiquement à lui et à son instance
exports.ajouterMembre = async (req, res) => {
  try {
    const user = req.user;
    if (!user.instance) {
      return res.status(400).json({
        message: "Votre compte n'est rattaché à aucune instance. Contactez votre Assistant Pasteur.",
      });
    }
    const nouveau = new Membre({
      ...nettoyer(req.body),
      referentId: user._id,
      instance: user.instance,
    });
    await nouveau.save();

    res.status(201).json({
      message: "Membre créé avec succès",
      membre: { id: nouveau._id, firstName: nouveau.firstName, lastName: nouveau.lastName },
    });
  } catch (err) {
    console.error("❌ Erreur ajout membre :", err);
    res.status(500).json({ message: "Erreur lors de l'ajout du membre" });
  }
};

// 📄 Liste des suivis dans le périmètre (pasteur: tout / AP: son instance / leader / référent)
exports.listerMembres = async (req, res) => {
  try {
    const membres = await Membre.find(await filtreMembres(req.user)).sort({ createdAt: -1 });
    res.json(membres);
  } catch (err) {
    res.status(500).json({ message: "Erreur" });
  }
};

exports.compterMembresParReferent = async (req, res) => {
  try {
    res.json({ total: await Membre.countDocuments({ referentId: req.user._id }) });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du comptage des membres." });
  }
};

// ✏️ Modifier un suivi
exports.modifierMembre = async (req, res) => {
  try {
    const membre = await trouverDansPerimetre(req.user, req.params.id);
    if (!membre) return res.status(404).json({ message: "Membre non trouvé" });
    if (!droitEcriture(req.user, membre)) return res.status(403).json(REFUS_ECRITURE);

    membre.set(nettoyer(req.body));
    await membre.save();
    res.status(200).json({ message: "Membre mis à jour", membre });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🗑️ Supprimer un suivi (la photo, stockée dans le même document, disparaît avec lui)
exports.supprimerMembre = async (req, res) => {
  try {
    const membre = await trouverDansPerimetre(req.user, req.params.id);
    if (!membre) return res.status(404).json({ message: "Membre non trouvé" });
    await membre.deleteOne();
    res.status(200).json({ message: "Membre supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ───────────── PHOTOS ─────────────

// Vérifie le contenu réel du fichier (pas seulement ce que déclare le navigateur)
const typeReel = (buf) => {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return "image/png";
  if (buf.slice(0, 3).toString("ascii") === "GIF") return "image/gif";
  if (buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "WEBP")
    return "image/webp";
  return null;
};

exports.envoyerPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Aucune photo reçue." });
    const type = typeReel(req.file.buffer);
    if (!type) return res.status(400).json({ message: "Ce fichier n'est pas une image valide." });

    const membre = await trouverDansPerimetre(req.user, req.params.id);
    if (!membre) return res.status(404).json({ message: "Membre non trouvé" });
    if (!droitEcriture(req.user, membre)) return res.status(403).json(REFUS_ECRITURE);

    membre.photoData = req.file.buffer;
    membre.photoType = type;
    membre.hasPhoto = true;
    await membre.save();
    res.json({ message: "Photo enregistrée", hasPhoto: true });
  } catch (err) {
    console.error("Erreur photo :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.lirePhoto = async (req, res) => {
  try {
    const membre = await trouverDansPerimetre(req.user, req.params.id, "+photoData +photoType");
    if (!membre || !membre.photoData) return res.status(404).json({ message: "Pas de photo" });
    res.set({
      "Content-Type": membre.photoType || "image/jpeg",
      "Cache-Control": "private, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    });
    res.send(membre.photoData);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.supprimerPhoto = async (req, res) => {
  try {
    const membre = await trouverDansPerimetre(req.user, req.params.id);
    if (!membre) return res.status(404).json({ message: "Membre non trouvé" });
    if (!droitEcriture(req.user, membre)) return res.status(403).json(REFUS_ECRITURE);
    membre.photoData = undefined;
    membre.photoType = undefined;
    membre.hasPhoto = false;
    await membre.save();
    res.json({ message: "Photo supprimée", hasPhoto: false });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
