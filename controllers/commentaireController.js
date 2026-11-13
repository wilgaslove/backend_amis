const Commentaire = require("../models/Commentaire");
const { filtreCommentaires } = require("../utils/scope");

exports.addComment = async (req, res) => {
  try {
    if (!req.body.message?.trim()) return res.status(400).json({ error: "Message vide" });
    const commentaire = await Commentaire.create({
      user: req.user._id,
      message: req.body.message,
      instance: req.user.role === "pasteur" ? null : req.user.instance || null,
    });
    res.json(await commentaire.populate("user", "_id nom prenom userLogin"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Chaque instance voit ses commentaires + ceux du pasteur principal ; le pasteur voit tout.
exports.getComments = async (req, res) => {
  try {
    const comments = await Commentaire.find(filtreCommentaires(req.user))
      .populate("user", "nom prenom userLogin")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const comment = await Commentaire.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Commentaire introuvable" });
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Non autorisé" });
    }
    comment.message = req.body.message;
    await comment.save();
    res.json(await comment.populate("user", "nom prenom userLogin"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Commentaire.findById(req.params.id);
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
