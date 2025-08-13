const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const CommentaireController = require("../controllers/commentaireController");

router.post("/", authMiddleware, CommentaireController.addComment);
router.get("/", CommentaireController.getComments);
router.put("/:id", authMiddleware, CommentaireController.updateComment);
router.delete("/:id", authMiddleware, CommentaireController.deleteComment);

module.exports = router;
