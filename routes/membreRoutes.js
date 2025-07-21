const express = require('express');
const router = express.Router();
const {
  ajouterMembre,
  listerMembres,
  membresParReferent,
  modifierMembre,
  supprimerMembre,
  compterMembresParReferent, 
  getMembresParReferent

} = require("../controllers/membreController");

const authMiddleware = require('../middlewares/authMiddleware'); // ✅ Garder une seule fois
const checkRole = require('../middlewares/checkRole');

// // ✅ Ta nouvelle route ici
// router.put('/membres/:id/suivi', authMiddleware, checkRole(['referent', 'admin', 'leader']), mettreAJourSuivi);

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

router.get('/membres/referent/:referentId', getMembresParReferent);

module.exports = router;


