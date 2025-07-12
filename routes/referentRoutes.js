const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Membre = require('../models/Membre');

// ✅ Obtenir tous les référents
router.get('/', async (req, res) => {
  try {
    const referents = await User.find({ role: 'referent' });
    res.json(referents);
  } catch (err) {
    res.status(500).json({ message: 'Erreur chargement des référents' });
  }
});

// ✅ Obtenir les membres d’un référent
router.get('/:id/membres', async (req, res) => {
  try {
    const membres = await Membre.find({ referentId: req.params.id });
    res.json(membres);
  } catch (err) {
    res.status(500).json({ message: 'Erreur chargement membres du référent' });
  }
});

module.exports = router;

