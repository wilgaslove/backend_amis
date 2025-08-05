const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const referentController = require('../controllers/referentController');



// 🔐 Toutes les routes ici nécessitent d'être authentifié
router.use(authMiddleware);

router.get('/referents-membres', referentController.referentsEtLeursMembres);
// ✅ Ajouter un commentaire pour un leader
// router.get('/leaders-commentaires', referentController.ajouterCommentaireLeader);
// ✅ Ajouter un commentaire pour un admin
// router.get('/admin-commentaires', referentController.ajouterCommentaireAdmin);

// routes/referentRoutes.js
router.post('/leaders-commentaires/:referentId', referentController.ajouterCommentaireLeader)
router.post('/admin-commentaires/:referentId', referentController.ajouterCommentaireAdmin)

// Nouvelle route pour récupérer les commentaires visibles par le référent connecté
router.get('/commentaires/:referentId', referentController.getCommentairesPourReferent)


module.exports = router;