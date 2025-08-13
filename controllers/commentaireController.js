const Commentaire = require('../models/Commentaire');

// ➕ Ajouter un commentaire
exports.addComment = async (req, res) => {
  try {
    const comment = await Commentaire.create({
      user: req.user._id,
      message: req.body.message
    });
    const populatedComment = await Commentaire.populate("user", "nom prenom userLogin");
    res.json(populatedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📄 Récupérer tous les commentaires
exports.getComments = async (req, res) => {
  try {
    const comments = await Commentaire.find()
      .populate("user", "nom prenom userLogin")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Modifier un commentaire
exports.updateComment = async (req, res) => {
  try {
    const comment = await Commentaire.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Commentaire introuvable" });

    if (Commentaire.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Non autorisé" });
    }

    Commentaire.message = req.body.message;
    Commentaire.updatedAt = Date.now();
    await Commentaire.save();

    const populatedComment = await Commentaire.populate("user", "nom prenom userLogin");
    res.json(populatedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Supprimer un commentaire
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Commentaire.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Commentaire introuvable" });

    if (Commentaire.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Non autorisé" });
    }

    await Commentaire.deleteOne();
    res.json({ message: "Commentaire supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
