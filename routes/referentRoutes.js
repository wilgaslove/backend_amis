// routes/referentRoutes.js
const express = require('express');
const router = express.Router();
const referentController = require('../controllers/referentController');

// Liste tous les référents
router.get('/', referentController.listerReferents);

// Récupère les membres liés à un référent
router.get('/:id/membres', referentController.getMembresDuReferent);

module.exports = router;
