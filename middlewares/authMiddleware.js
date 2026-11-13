const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Non autorisé. Token manquant." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("-motDePasse");
    if (!user) {
      return res.status(401).json({ message: "Utilisateur introuvable" });
    }

    // Compatibilité : l'ancien rôle "admin" (en base non migrée) = pasteur principal
    if (user.role === "admin") user.role = "pasteur";

    req.user = user;
    next();
  } catch (err) {
    console.error("Erreur de validation du token :", err.message);
    return res.status(403).json({ message: "Token invalide." });
  }
};

module.exports = authMiddleware;
