const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("Vérification de l'en-tête d'autorisation :", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Non autorisé. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    console.log("Token décodé :", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Erreur de validation du token :", err);
    return res.status(403).json({ message: 'Token invalide.' });
  }
};

module.exports = authMiddleware;