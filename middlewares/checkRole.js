// middlewares/checkRole.js
module.exports = function checkRole(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès interdit." });
    }
    next();
  };
};
