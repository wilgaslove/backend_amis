const express = require('express');
const router = express.Router();
const {
  ajouterMembre,
  listerMembres,
  membresParReferent,
  modifierMembre,
  supprimerMembre,
  compterMembresParReferent, 

} = require("../controllers/membreController");
const Membre = require('../models/Membre');
const authMiddleware = require('../middlewares/authMiddleware'); // ✅ Garder une seule fois
const checkRole = require('../middlewares/checkRole');

// // ✅ Ta nouvelle route ici

// Ajouter un membre (référent uniquement)
router.post('/membres', authMiddleware, checkRole(['referent']), ajouterMembre);

// Lister tous les membres (admin, leader uniquement)
router.get('/membres', authMiddleware, checkRole(['admin', 'leader']), listerMembres);

// Lister les membres du référent connecté
router.get('/mes-membres', authMiddleware, checkRole(['referent']), membresParReferent);

// Modifier un membre (référent/admin/leader)
router.put('/membres/:id', authMiddleware, checkRole(['referent', 'admin', 'leader']), modifierMembre);

// Supprimer un membre (référent/admin/leader)
router.delete('/membres/:id', authMiddleware, checkRole(['referent', 'admin', 'leader']), supprimerMembre);

// ✅ Compter les membres du référent connecté
router.get('/mes-membres/count', authMiddleware, checkRole(['referent']), compterMembresParReferent);

router.get('/par-referent/:referentId', authMiddleware, async (req, res) => {
  try {
    const referentId = req.params.referentId;

    const membres = await Membre.find({ referentId });

    res.json(membres);
  } catch (err) {
    console.error("Erreur lors de la récupération des membres :", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;


