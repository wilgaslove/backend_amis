const express = require('express');
const router = express.Router(); // ✅ correct
const { listerReferents } = require('../controllers/referentController');
const authMiddleware = require('../middlewares/checkRole');
const checkRole = require('../middlewares/checkRole');

// ✅ Route pour obtenir la liste des référents (admin ou leader uniquement)
router.get('/referents', authMiddleware, checkRole(['admin', 'leader']), listerReferents);

module.exports = router;