const express = require('express');
const router = express.Router();
const { ajouterMembre, listerMembres, membresParReferent  } = require("../controllers/membreController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/membres', authMiddleware, ajouterMembre);
router.get('/membres', authMiddleware, listerMembres);


// Ajouter un membre (référent uniquement)
router.post('/membres', authMiddleware, checkRole(['referent']), ajouterMembre);

// Lister tous les membres (admin, leader uniquement)
router.get('/membres', authMiddleware, checkRole(['admin', 'leader']), listerMembres);

// Lister les membres du référent connecté
router.get('/mes-membres', authMiddleware, checkRole(['referent']), membresParReferent);


module.exports = router;
