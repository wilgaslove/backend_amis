// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'; // mettre en .env
const BCRYPT_SALT_ROUNDS = 10; // ou process.env

// Inscription
exports.register = async (req, res) => {
  try {
    const { userLogin, nom, prenom, motDePasse, role, mustChangePassword } = req.body;

    const existingUser = await User.findOne({ userLogin });
    if (existingUser) return res.status(400).json({ message: 'Utilisateur déjà existant' });

    const hashedPassword = await bcrypt.hash(motDePasse, BCRYPT_SALT_ROUNDS);

    const newUser = new User({
      userLogin,
      nom,
      prenom,
      motDePasse: hashedPassword,
      role,
      mustChangePassword: !!mustChangePassword // boolean
    });

    await newUser.save();
    res.status(201).json({ message: 'Utilisateur enregistré avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    const { userLogin, motDePasse } = req.body;

    const user = await User.findOne({ userLogin });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe incorrect' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Ne renvoie pas le motDePasse
    const safeUser = {
      id: user._id,
      userLogin: user.userLogin,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      mustChangePassword: user.mustChangePassword
    };

    res.status(200).json({ message: 'Connexion réussie', token, user: safeUser });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Changer mot de passe (utilisateur connecté)
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // remplit par authMiddleware
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Ancien et nouveau mot de passe requis' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    const isMatch = await bcrypt.compare(oldPassword, user.motDePasse);
    if (!isMatch) return res.status(400).json({ message: 'Ancien mot de passe incorrect' });

    const isSame = await bcrypt.compare(newPassword, user.motDePasse);
    if (isSame) return res.status(400).json({ message: 'Le nouveau mot de passe doit être différent de l’ancien' });

    const hashed = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    user.motDePasse = hashed;
    user.mustChangePassword = false; // marque comme changé
    await user.save();

    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};
