const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRole');
const {creerReferent} = require('../controllers/referentController');

const {listerLeaders,} = require('../controllers/leaderController');

// ✅ Liste des leaders
router.get('/leaders', authMiddleware, checkRole(['admin']), listerLeaders);

// Leader crée un référent
 router.post('/referents/creer', authMiddleware, checkRole(['leader', 'admin']), creerReferent);

module.exports = router;