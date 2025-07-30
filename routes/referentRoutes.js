const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const referentController = require('../controllers/referentController');


// route pour récupérer tous les referents. 
//  router.get('/referents', authMiddleware, getAllReferents);


// 🔐 Toutes les routes ici nécessitent d'être authentifié
router.use(authMiddleware);

router.get('/referents-membres', referentController.referentsEtLeursMembres);

module.exports = router;


