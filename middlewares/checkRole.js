// middlewares/checkRole.js
// module.exports = function checkRole(roles = []) {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: "Accès interdit." });
//     }
//     next();
//   };
// };

// // middlewares/checkRole.js
// module.exports = function checkRole(roles = []) {
//   return (req, res, next) => {
//     // Vérifie que req.user existe bien
//     if (!req.user || !req.user.role) {
//       return res.status(401).json({ message: "Utilisateur non authentifié." });
//     }

//     // Vérifie si le rôle de l'utilisateur est autorisé
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: "Accès interdit." });
//     }

//     next();
//   };
// };

module.exports = (roles) => {
  return (req, res, next) => {
    console.log("🔍 Utilisateur connecté :", req.user);
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès interdit : rôle insuffisant' });
    }
    next();
  };
};
