// const User = require('../models/User'); // adapte si ton modèle s'appelle autrement

// // Lister tous les utilisateurs qui sont des référents
// const listerReferents = async (req, res) => {
//   try {
//     const referents = await User.find({ role: 'referent' }).select('nom prenom _id');
//     res.json(referents);
//   } catch (error) {
//     res.status(500).json({ message: "Erreur serveur lors de la récupération des référents." });
//   }
// };

// module.exports = { listerReferents };
 
const User = require('../models/User');
const Membre = require('../models/Membre');

// ✅ Liste tous les référents (utilisateurs avec rôle "referent")
const listerReferents = async (req, res) => {
  try {
    const referents = await User.find({ role: 'referent' }).select('-password'); // exclure mot de passe
    res.json(referents);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des référents', error });
  }
};

// ✅ Liste les membres associés à un référent spécifique
const getMembresDuReferent = async (req, res) => {
  try {
    const referentId = req.params.id;
    const membres = await Membre.find({ referent: referentId });
    res.json(membres);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des membres du référent', error });
  }
};

module.exports = {
  listerReferents,
  getMembresDuReferent
};
