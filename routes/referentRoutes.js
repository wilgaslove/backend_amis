const express = require('express');
const router = express.Router();
const { getAllReferents, getReferentsAvecMembres } = require('../controllers/referentController');
const authMiddleware = require('../middlewares/authMiddleware');
const Referent = require('../models/Referent');
const User = require('../models/User');
const Membre = require('../models/Membre');
const { listerMembres } = require('../controllers/membreController');
const checkRole = require('../middlewares/checkRole');

// Middleware pour authentifier l'utilisateur
router.use(authMiddleware);

// Route pour récupérer tous les référents
router.get('/referents', checkRole(['leader', 'admin']), getAllReferents);

// Récupérer tous les référents avec leurs membres
router.get('/referents-avec-membres', checkRole(['leader', 'admin']), async (req, res) => {
  try {
    const referents = await Referent.find().populate('user');

    const referentsAvecMembres = await Promise.all(
      referents.map(async (referent) => {
        const membres = await Membre.find({ referentId: referent._id });
        return {
          ...referent.toObject(),
          membres,
        };
      })
    );

    res.status(200).json(referentsAvecMembres);
  } catch (error) {
    console.error('Erreur lors de la récupération des référents avec membres :', error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

// Lister tous les membres (admin, leader uniquement)
router.get('/membres', checkRole(['admin', 'leader']), listerMembres);

// Obtenir les membres liés à un référent
router.get('/referents/:id/membres', checkRole(['leader', 'admin']), async (req, res) => {
  try {
    const referentId = req.params.id;

    const membres = await Membre.find({ referentId });
    res.json(membres);
  } catch (err) {
    console.error('Erreur serveur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour récupérer tous les référents et leurs membres
router.get('/referents-with-membres', checkRole(['leader', 'admin']), async (req, res) => {
  try {
    const referents = await User.find({ role: 'referent' });

    const referentsAvecMembres = await Promise.all(referents.map(async (referent) => {
      const membres = await Membre.find({ referentId: referent._id });
      return {
        referent,
        membres,
      };
    }));

    res.json(referentsAvecMembres);
  } catch (error) {
    console.error('Erreur lors de la récupération des référents et membres :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des référents et membres' });
  }
});

module.exports = router;