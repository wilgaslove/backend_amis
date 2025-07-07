const User = require('../models/User');
const Membre = require('../models/Membre');

// ✅ Liste tous les référents
const listerReferents = async (req, res) => {
  try {
    const referents = await User.find({ role: 'referent' }).select('-password');
    res.json(referents);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des référents', error });
  }
};

// ✅ Liste les membres associés à un référent
const getMembresDuReferent = async (req, res) => {
  try {
    const referentId = req.params.id;

    // Vérifie si le référent existe
    const referent = await User.findById(referentId);
    if (!referent || referent.role !== 'referent') {
      return res.status(404).json({ message: 'Référent non trouvé' });
    }

    // Cherche les membres associés
    const membres = await Membre.find({ referent: referentId }).lean();
    res.json(membres);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des membres du référent', error });
  }
};

const Referent = require('../models/Referent');

// Leader laisse un commentaire sur un référent
const ajouterCommentaireLeader = async (req, res) => {
  try {
    const { referentId } = req.params;
    const { commentaire } = req.body;

    const referent = await Referent.findById(referentId);
    if (!referent) return res.status(404).json({ message: 'Référent introuvable' });

    referent.commentaireLeader = commentaire;
    await referent.save();

    res.json({ message: 'Commentaire du leader ajouté', referent });
  } catch (error) {
    res.status(500).json({ message: 'Erreur ajout commentaire', error });
  }
};

// Admin laisse un commentaire sur un référent
const ajouterCommentaireAdmin = async (req, res) => {
  try {
    const { referentId } = req.params;
    const { commentaire } = req.body;

    const referent = await Referent.findById(referentId);
    if (!referent) return res.status(404).json({ message: 'Référent introuvable' });

    referent.CommantaireAdmin = commentaire;
    await referent.save();

    res.json({ message: 'Commentaire de l\'admin ajouté', referent });
  } catch (error) {
    res.status(500).json({ message: 'Erreur ajout commentaire admin', error });
  }
};


module.exports = {
  listerReferents,
  getMembresDuReferent,
  ajouterCommentaireLeader,
  ajouterCommentaireAdmin
};
