const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");
const { exporterMembres } = require("../controllers/exportController");

router.get(
  "/membres",
  authMiddleware,
  checkRole(["pasteur", "ap", "leader", "al", "referent"]),
  exporterMembres
);

module.exports = router;
