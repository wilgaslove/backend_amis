const express = require("express");
const router = express.Router();
const { login, changePassword, me } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/login", login);
router.post("/change-password", authMiddleware, changePassword);
router.get("/me", authMiddleware, me);

module.exports = router;
