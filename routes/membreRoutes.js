const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/membreController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");
const uploadPhoto = require("../middlewares/upload");

const TOUS = ["pasteur", "ap", "leader", "al", "referent"];

router.use(authMiddleware);

// Suivis
router.post("/membres", checkRole(["referent", "al"]), ctrl.ajouterMembre); // un AL a aussi ses propres suivis
router.get("/membres", checkRole(TOUS), ctrl.listerMembres); // filtré selon le rôle
router.get("/mes-membres", checkRole(TOUS), ctrl.listerMembres); // alias (anciennes versions)
router.get("/mes-membres/count", checkRole(["referent"]), ctrl.compterMembresParReferent);
router.put("/membres/:id", checkRole(TOUS), ctrl.modifierMembre);
router.delete("/membres/:id", checkRole(TOUS), ctrl.supprimerMembre);

// Photos
router.post("/membres/:id/photo", checkRole(TOUS), uploadPhoto, ctrl.envoyerPhoto);
router.get("/membres/:id/photo", checkRole(TOUS), ctrl.lirePhoto);
router.delete("/membres/:id/photo", checkRole(TOUS), ctrl.supprimerPhoto);

module.exports = router;
