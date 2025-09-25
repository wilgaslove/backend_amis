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
const authMiddleware = require('../middlewares/authMiddleware'); 
const checkRole = require('../middlewares/checkRole');

const upload = require("../middlewares/upload");




// Route pour ajouter un membre avec upload d'image
// Exemple avec Express + Mongoose
// router.post("/membres", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.body.dateArrivee) delete req.body.dateArrivee;

//     const membre = new Membre({
//       ...req.body,
//       image: req.file ? `/uploads/${req.file.filename}` : null,
//     });

//     await membre.save();
//     res.status(201).json({ message: "Membre ajouté avec succès", membre });
//   } catch (error) {
//     console.error("Erreur lors de l'ajout du membre:", error);
//     res.status(500).json({ message: "Erreur lors de l'ajout du membre", error });
//   }
// });



// Ajouter un membre (référent uniquement)
 router.post('/membres', authMiddleware, checkRole(['referent']), ajouterMembre);



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


