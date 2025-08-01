const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const referentController = require('../controllers/referentController');



// 🔐 Toutes les routes ici nécessitent d'être authentifié
router.use(authMiddleware);

router.get('/referents-membres', referentController.referentsEtLeursMembres);
router.get('/leaders-commentaires', referentController.ajouterCommentaireLeader);
router.get('/admin-commentaires', referentController.ajouterCommentaireAdmin);
module.exports = router;


