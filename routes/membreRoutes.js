const express = require('express');
const router = express.Router();
const {
  ajouterMembre,
  listerMembres,
  membresParReferent,
  modifierMembre,
  supprimerMembre,
  compterMembresParReferent, 
  
} = require("../controllers/membreController");
// const upload = require("../middlewares/upload");

const multer = require('multer');
const path = require("path");

// utilisation de multer pour la gestion des fichiers




const authMiddleware = require('../middlewares/authMiddleware'); // ✅ Garder une seule fois
const checkRole = require('../middlewares/checkRole');


// Configuration de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Répertoire où l'image sera stockée
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Renomme le fichier
  },
});


const upload = multer({ storage });

// Ajouter un membre (référent uniquement)
// router.post('/membres', authMiddleware, checkRole(['referent']), ajouterMembre);
router.post(
  "/membres",
  authMiddleware,
  checkRole(["referent"]),
  upload.single("image"), // <-- ici le champ doit s’appeler "image"
  ajouterMembre
);



// Lister tous les membres (admin, leader uniquement)
router.get('/membres', authMiddleware, checkRole(['admin', 'leader']), listerMembres);

// Lister les membres du référent connecté
router.get('/mes-membres', authMiddleware, checkRole(['referent']), membresParReferent);

// Modifier un membre (référent/admin/leader)
router.put('/membres/:id', authMiddleware, checkRole(['referent', 'admin', 'leader']), modifierMembre);

// Supprimer un membre (référent/admin/leader)
router.delete('/membres/:id', authMiddleware, checkRole(['referent', 'admin', 'leader']), supprimerMembre);

// ✅ Compter les membres du référent connecté
router.get('/mes-membres/count', authMiddleware, checkRole(['referent']), compterMembresParReferent);

module.exports = router;


