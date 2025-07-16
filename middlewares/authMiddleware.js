 const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// const authMiddleware = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ message: 'Non autorisé. Token manquant.' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');

//     // 🔍 On récupère l'utilisateur depuis la base de données
//     const user = await User.findById(decoded.id).select('-password');

//     if (!user) {
//       return res.status(401).json({ message: 'Utilisateur introuvable' });
//     }

//     req.user = user; // ✅ On attache l’objet User complet
//     next();

//   } catch (err) {
//     console.error("Erreur de validation du token :", err);
//     return res.status(403).json({ message: 'Token invalide.' });
//   }
// };

// const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔐 Header Authorization reçu :", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    console.log("✅ Token décodé :", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Token invalide :", err);
    return res.status(403).json({ message: 'Token invalide' });
  }
};

module.exports = authMiddleware;

module.exports = authMiddleware;
