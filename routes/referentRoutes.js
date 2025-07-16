const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Membre = require('../models/Membre');
const Referent = require('../models/Referent')


// ✅ Tous les référents avec leurs User et leurs membres
router.get('/', async (req, res) => {
  try {
    const referents = await Referent.find()
      .populate('user', 'nom prenom userLogin role')   // Données utilisateur
      .populate('membres');                            // Membres liés
    res.json(referents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur chargement des référents' });
  }
});



// ✅ Tous les membres d’un référent donné
router.get('/:referentId/membres', async (req, res) => {
  try {
    const referent = await Referent.findById(req.params.referentId).populate('membres');
    if (!referent) return res.status(404).json({ message: 'Référent introuvable' });

    res.json(referent.membres);
  } catch (err) {
    res.status(500).json({ message: 'Erreur chargement membres du référent' });
  }
});

// Referent.find().then(data => console.log(data)).catch(err => console.error(err));
module.exports = router;

