const User = require('../models/User'); // adapte si ton modèle s'appelle autrement

// Lister tous les utilisateurs qui sont des référents
const listerReferents = async (req, res) => {
  try {
    const referents = await User.find({ role: 'referent' }).select('nom prenom _id');
    res.json(referents);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération des référents." });
  }
};

module.exports = { listerReferents };
