const express = require('express');
const router = express.Router();
const { ajouterMembre, listerMembres } = require("../controllers/membreController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/membres', authMiddleware, ajouterMembre);
router.get('/membres', authMiddleware, listerMembres);

module.exports = router;
