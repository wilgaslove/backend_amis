const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Non autorisé. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'secret_key'); // 🔐 à sécuriser dans .env
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide.' });
  }
};

module.exports = auth;
