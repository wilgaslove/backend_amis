const User = require('../models/User');
const Membre = require('../models/Membre');

// ✅ Liste tous les leaders
exports.listerLeaders = async (req, res) => {
  try {
    const leaders = await User.find({ role: 'leader' }).select('-password').lean();
    res.json(leaders);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des leaders', error });
  }
};

// ✅ Liste des membres associés à un leader
exports.getMembresDuLeader = async (req, res) => {
  try {
    const leaderId = req.params.id;

    // Vérifie que le leader existe
    const leader = await User.findById(leaderId);
    if (!leader || leader.role !== 'leader') {
      return res.status(404).json({ message: 'Leader non trouvé' });
    }

    // Récupère les référents liés à ce leader
    const referents = await User.find({ role: 'referent', leader: leaderId });

    // Extraire les IDs des référents
    const referentIds = referents.map(r => r._id);

    // Récupère les membres associés
    const membres = await Membre.find({ referent: { $in: referentIds } }).lean();

    res.json(membres);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des membres du leader', error });
  }
};

