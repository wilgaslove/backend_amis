const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");
const ctrl = require("../controllers/userController");

router.use(authMiddleware);

// Créer le niveau juste en dessous (pasteur→AP, AP→leader, leader→référent)
router.post("/users", checkRole(["pasteur", "ap", "leader", "al"]), ctrl.creer);
// Ancienne route (anciennes versions de l'application)
router.post("/referents/creer", checkRole(["leader", "al"]), ctrl.creerReferent);

router.get("/equipe", checkRole(["pasteur", "ap", "leader", "al"]), ctrl.equipe);
router.put("/users/:id/rattacher", checkRole(["pasteur", "ap"]), ctrl.rattacher);
router.get("/referents-membres", checkRole(["pasteur", "ap", "leader", "al"]), ctrl.referentsEtLeursMembres);

module.exports = router;
