const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inscription
exports.register = async (req, res) => {
  try {
    const { user_login, nom, prenom, motDePasse, role } = req.body;

    const existingUser = await User.findOne({ user_login });
    if (existingUser) return res.status(400).json({ message: 'Utilisateur déjà existant' });

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const newUser = new User({
      user_login,
      nom,
      prenom,
      motDePasse: hashedPassword,
      role
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
    const { user_login, motDePasse } = req.body;

    const user = await User.findOne({ user_login });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe incorrect' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      'secret_key', // 🔒 À mettre dans un .env
      { expiresIn: '1d' }
    );

    res.status(200).json({ message: 'Connexion réussie', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};
