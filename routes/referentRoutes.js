const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const referentController = require('../controllers/referentController');



// 🔐 Toutes les routes ici nécessitent d'être authentifié
router.use(authMiddleware);

router.get('/referents-membres', referentController.referentsEtLeursMembres);
// ✅ Ajouter un commentaire pour un leader
router.get('/leaders-commentaires', referentController.ajouterCommentaireLeader);
// ✅ Ajouter un commentaire pour un admin
router.get('/admin-commentaires', referentController.ajouterCommentaireAdmin);
module.exports = router;