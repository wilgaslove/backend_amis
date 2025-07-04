const User = require('../models/User');
const Membre = require('../models/Membre');

// ✅ Liste tous les leaders
const listerLeaders = async (req, res) => {
  try {
    const leaders = await User.find({ role: 'leader' }).select('-password');
    res.json(leaders);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des leaders', error });
  }
};

// ✅ Liste tous les membres associés à un leader (via ses référents)
const getMembresDuLeader = async (req, res) => {
  try {
    const leaderId = req.params.id;

    // Récupérer les référents liés à ce leader
    const referents = await User.find({ role: 'referent', leader: leaderId });

    // Extraire les ID des référents
    const referentIds = referents.map(r => r._id);

    // Chercher les membres liés à ces référents
    const membres = await Membre.find({ referent: { $in: referentIds } });

    res.json(membres);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des membres du leader', error });
  }
};

module.exports = {
  listerLeaders,
  getMembresDuLeader
};
