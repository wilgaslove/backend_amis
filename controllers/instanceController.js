const Instance = require("../models/Instance");

const chiffres = (v) => String(v || "").replace(/\D/g, "");

// Liste des instances visibles : le pasteur les voit toutes, les autres seulement la leur
exports.lister = async (req, res) => {
  try {
    const filtre = req.user.role === "pasteur" ? {} : { _id: req.user.instance || null };
    const instances = await Instance.find(filtre).sort({ pays: 1, ville: 1 }).lean();
    res.json(instances);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Créer une instance (pasteur principal uniquement)
exports.creer = async (req, res) => {
  try {
    const { ville, pays, indicatif, conserverZero } = req.body;
    if (!ville?.trim() || !pays?.trim()) {
      return res.status(400).json({ message: "La ville et le pays sont obligatoires." });
    }
    const instance = await Instance.create({
      ville: ville.trim(),
      pays: pays.trim(),
      indicatif: chiffres(indicatif),
      conserverZero: !!conserverZero,
    });
    res.status(201).json(instance);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Cette instance existe déjà." });
    }
    console.error("Erreur création instance :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Modifier une instance (pasteur principal uniquement)
exports.modifier = async (req, res) => {
  try {
    const maj = {};
    if (req.body.ville !== undefined) maj.ville = String(req.body.ville).trim();
    if (req.body.pays !== undefined) maj.pays = String(req.body.pays).trim();
    if (req.body.indicatif !== undefined) maj.indicatif = chiffres(req.body.indicatif);
    if (req.body.conserverZero !== undefined) maj.conserverZero = !!req.body.conserverZero;
    if (req.body.actif !== undefined) maj.actif = !!req.body.actif;

    const instance = await Instance.findByIdAndUpdate(req.params.id, maj, {
      new: true,
      runValidators: true,
    });
    if (!instance) return res.status(404).json({ message: "Instance introuvable" });
    res.json(instance);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Cette instance existe déjà." });
    }
    res.status(500).json({ message: "Erreur serveur" });
  }
};
