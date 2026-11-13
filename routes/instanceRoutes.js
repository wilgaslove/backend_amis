const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");
const ctrl = require("../controllers/instanceController");

router.use(authMiddleware);
router.get("/", ctrl.lister);
router.post("/", checkRole(["pasteur"]), ctrl.creer);
router.put("/:id", checkRole(["pasteur"]), ctrl.modifier);

module.exports = router;
