 const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const authMiddleware = async (req, res, next) => {
  
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Non autorisé. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');

    // 🔍 On récupère l'utilisateur depuis la base de données
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    req.user = user; // ✅ On attache l’objet User complet
    next();

  } catch (err) {
    console.error("Erreur de validation du token :", err);
    return res.status(403).json({ message: 'Token invalide.' });
  }
};

 module.exports = authMiddleware;




// middlewares/authMiddleware.js


// const authMiddleware = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) return res.status(401).json({ message: 'Token manquant' });

//   const token = authHeader.split(' ')[1]; // format: "Bearer TOKEN"
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
//     req.user = decoded; // important pour checkRole
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: 'Token invalide' });
//   }
// };

// module.exports = authMiddleware;



