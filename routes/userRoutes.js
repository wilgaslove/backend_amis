const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/checkRole');
const checkRole = require('../middlewares/checkRole');

const {
  listerReferents,
  getMembresDuReferent
} = require('../controllers/referentController');

const {
  listerLeaders,
  getMembresDuLeader
} = require('../controllers/leaderController');

// ✅ Liste des référents
router.get('/referents', authMiddleware, checkRole(['admin', 'leader']), listerReferents);

// ✅ Membres d’un référent
router.get('/referents/:id/membres', authMiddleware, checkRole(['admin', 'leader']), getMembresDuReferent);

// ✅ Liste des leaders
router.get('/leaders', authMiddleware, checkRole(['admin']), listerLeaders);

// ✅ Membres d’un leader
router.get('/leaders/:id/membres', authMiddleware, checkRole(['admin']), getMembresDuLeader);

module.exports = router;
