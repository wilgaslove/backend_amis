const express = require('express');
const router = express.Router();
const { register, login, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRole');
const User = require('../models/User');
const { ajouterMembre, listerMembres} = require('../controllers/membreController');


router.post('/register', register);
router.post('/login', login);
router.post('/change-password', authMiddleware, changePassword);
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-motDePasse');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
});
router.post('/membres', authMiddleware, checkRole(['referent']), ajouterMembre);
router.get('/membres', authMiddleware, checkRole(['leader', 'admin']), listerMembres);

module.exports = router;
