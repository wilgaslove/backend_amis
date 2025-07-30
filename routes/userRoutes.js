const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRole');
const {
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


// Leader crée un référent
 router.post('/referents/creer', authMiddleware, checkRole(['leader']), creerReferent);

module.exports = router;