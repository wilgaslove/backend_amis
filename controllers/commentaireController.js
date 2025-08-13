const Commentaire = require('/../models/Commentaire');

// ➕ Ajouter un commentaire
exports.addComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      user: req.user._id,
      message: req.body.message
    });
    const populatedComment = await comment.populate("user", "nom prenom userLogin");
    res.json(populatedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📄 Récupérer tous les commentaires
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find()
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
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Commentaire introuvable" });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Non autorisé" });
    }

    comment.message = req.body.message;
    comment.updatedAt = Date.now();
    await comment.save();

    const populatedComment = await comment.populate("user", "nom prenom userLogin");
    res.json(populatedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Supprimer un commentaire
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Commentaire introuvable" });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Non autorisé" });
    }

    await comment.deleteOne();
    res.json({ message: "Commentaire supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
