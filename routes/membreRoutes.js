const express = require('express');
const router = express.Router();
const { ajouterMembre, listerMembres } = require("../controllers/membreController");

router.post('/membres', ajouterMembre);
router.get('/membres', listerMembres);

module.exports = router;
