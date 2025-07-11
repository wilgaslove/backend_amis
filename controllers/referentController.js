const User = require('../models/User');
const Membre = require('../models/Membre');

// ✅ Liste tous les référents

exports.listerReferents = async (req, res) => {
  try {
    console.log("📥 Route /api/referents appelée !");
    
    const referents = await User.find({ role: 'referent' }).select('-password');

    console.log("✅ Référents récupérés :", referents.length);

    res.status(200).json(referents);
  } catch (error) {
    console.error("❌ Erreur dans listerReferents:", error);
    res.status(500).json({ message: 'Erreur lors de la récupération des référents', error });
  }
};

// ✅ Liste les membres associés à un référent
// controllers/referentController.js

// controllers/referentController.js
exports.listerReferentsAvecMembres = async (req, res) => {
  console.log("Route /referents/membres atteinte");
  
  try {
    const referents = await Referent.find()
      .populate('user', 'nom')
      .populate('membres', 'fistName lastName');
      
    console.log("Référents récupérés :", referents);
    res.status(200).json(referents);
  } catch (error) {
    console.error("Erreur dans listerReferentsAvecMembres :", error);
    res.status(500).json({ message: 'Erreur lors de la récupération des référents et de leurs membres', error });
  }
};

// exports.getMembresDuReferent = async (req, res) => {
//   try {
//     const membres = await Membre.find({ referent: req.params.id });
//     res.json(membres);
//   } catch (error) {
//     res.status(500).json({ message: "Erreur lors de la récupération des membres." });
//   }
// };


// const Referent = require('../models/Referent');

// Leader laisse un commentaire sur un référent
exports.ajouterCommentaireLeader = async (req, res) => {
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
exports.ajouterCommentaireAdmin = async (req, res) => {
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


