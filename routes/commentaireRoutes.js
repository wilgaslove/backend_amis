const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/commentaireController");

router.use(authMiddleware); // plus de lecture publique des commentaires
router.post("/", ctrl.addComment);
router.get("/", ctrl.getComments);
router.put("/:id", ctrl.updateComment);
router.delete("/:id", ctrl.deleteComment);

module.exports = router;
