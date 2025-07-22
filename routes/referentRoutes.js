const express = require('express');
const router = express.Router();
const { getAllReferents, getReferentsAvecMembres  } = require('../controllers/referentController');
const authMiddleware = require('../middlewares/authMiddleware');
const Referent = require('../models/Referent');
const User = require('../models/User');
const Membre = require('../models/Membre');
const { listerMembres } = require('../controllers/membreController');
const checkRole = require('../middlewares/checkRole');



// route pour récupérer tous les referents. 
router.get('/referents', authMiddleware, getAllReferents);

// GET membres d’un référent
// router.get('/api/referents/:id/membres', referentController.getMembresDuReferent);
// router.get('/referents', authMiddleware, getAllReferents);



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


// 🔐 Toutes les routes ici nécessitent d'être authentifié
router.use(authMiddleware);

// 🧑‍🤝‍🧑 Route : GET /api/referents
// Récupérer tous les référents
router.get('/', async (req, res) => {
  try {
    const referents = await User.find({ role: 'referent' });
    res.json(referents);
  } catch (error) {
    console.error("Erreur lors de la récupération des référents :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// Récupérer tous les référents avec leurs membres liés
router.get('/avec-membres', async (req, res) => {
  try {
    const referents = await User.find({ role: 'referent' }).lean();

    const referentsAvecMembres = await Promise.all(
      referents.map(async (referent) => {
        const membres = await User.find({ referent: referent._id });
        return {
          ...referent,
          membres,
        };
      })
    );

    res.json(referentsAvecMembres);
  } catch (error) {
    console.error("Erreur lors de la récupération des référents avec membres :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Récupérer les membres d'un référent spécifique
// router.get('/:id/membres', async (req, res) => {
//   try {
//     const referentId = req.params.id;

//     const referent = await User.findById(referentId);
//     if (!referent || referent.role !== 'referent') {
//       return res.status(404).json({ message: 'Référent non trouvé' });
//     }

//     const membres = await User.find({ referent: referentId });
//     res.json(membres);
//   } catch (error) {
//     console.error("Erreur lors de la récupération des membres du référent :", error);
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// });

// Récupérer tous les référents avec les membres liés

router.get('/referents-avec-membres', async (req, res) => {
  try {
    const referents = await Referent.find().populate('user');

    // Pour chaque référent, on récupère dynamiquement les membres liés via referentId
    const referentsAvecMembres = await Promise.all(
      referents.map(async (referent) => {
        const membres = await Membre.find({ referentId: referent._id });
        return {
          ...referent.toObject(),
          membres
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
router.get('/membres', authMiddleware, checkRole(['admin', 'leader']), listerMembres);


// Obtenir les membres liés à un référent
router.get('/referents/:id/membres', async (req, res) => {
  try {
    const referentId = req.params.id;

    // Cherche les membres dont le champ referentId est égal à l'ID donné
    const membres = await Membre.find({ referentId });

    res.json(membres);
  } catch (err) {
    console.error('Erreur serveur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;


