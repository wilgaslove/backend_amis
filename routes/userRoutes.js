const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRole');
const {
  listerReferents,
  getMembresDuReferent,
  ajouterCommentaireLeader,
  listerReferentsAvecMembres,
  ajouterCommentaireAdmin,
  creerReferent
} = require('../controllers/referentController');

const {
  listerLeaders,
  getMembresDuLeader
} = require('../controllers/leaderController');

// ✅ Liste des leaders
router.get('/leaders', authMiddleware, checkRole(['admin']), listerLeaders);

// ✅ Membres d’un leader
router.get('/leaders/:id/membres', authMiddleware, checkRole(['admin']), getMembresDuLeader);

// Leader commente un référent
// router.post('/referents/:referentId/commentaire-leader', authMiddleware, checkRole(['leader']), ajouterCommentaireLeader);

// Admin commente un référent
// router.post('/referents/:referentId/commentaire-admin', authMiddleware, checkRole(['admin']), ajouterCommentaireAdmin);

// Leader crée un référent
 router.post('/referents/creer', authMiddleware, checkRole(['leader']), creerReferent);
// router.post('/referents/creer', creerReferent);

module.exports = router;