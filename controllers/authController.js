const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";
const BCRYPT_SALT_ROUNDS = 10;

// Version "publique" d'un utilisateur (jamais le mot de passe)
const versionPublique = (user) => {
  const instance = user.instance && user.instance._id ? user.instance : null;
  return {
    id: user._id,
    userLogin: user.userLogin,
    nom: user.nom,
    prenom: user.prenom,
    role: user.role === "admin" ? "pasteur" : user.role,
    mustChangePassword: user.mustChangePassword,
    instance: instance
      ? {
          id: instance._id,
          ville: instance.ville,
          pays: instance.pays,
          indicatif: instance.indicatif,
          conserverZero: instance.conserverZero,
        }
      : null,
  };
};
exports.versionPublique = versionPublique;

// NB : l'inscription publique (/register) a été supprimée. Les comptes sont créés
// par la hiérarchie : pasteur → AP → leader → référent (voir userController).

// Connexion
exports.login = async (req, res) => {
  try {
    const { userLogin, motDePasse } = req.body;
    if (!userLogin || !motDePasse) {
      return res.status(400).json({ message: "Identifiant et mot de passe requis" });
    }

    const user = await User.findOne({ userLogin }).populate("instance");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });

    const safeUser = versionPublique(user);
    const token = jwt.sign({ id: user._id, role: safeUser.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ message: "Connexion réussie", token, user: safeUser });
  } catch (error) {
    console.error("Erreur login :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Profil de l'utilisateur connecté
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("instance");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json(versionPublique(user));
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Changer mot de passe (utilisateur connecté)
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Ancien et nouveau mot de passe requis" });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Le mot de passe doit contenir au moins 8 caractères" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const isMatch = await bcrypt.compare(oldPassword, user.motDePasse);
    if (!isMatch) return res.status(400).json({ message: "Ancien mot de passe incorrect" });

    const isSame = await bcrypt.compare(newPassword, user.motDePasse);
    if (isSame) {
      return res
        .status(400)
        .json({ message: "Le nouveau mot de passe doit être différent de l’ancien" });
    }

    user.motDePasse = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: "Mot de passe changé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
