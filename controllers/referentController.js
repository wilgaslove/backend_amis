const bcrypt = require('bcrypt')
const User = require('../models/User');
const Membre = require('../models/Membre');
const Referent = require('../models/Referent');




// Création d'un référent par un leader. 
exports.creerReferent = async (req, res) => {
  console.log("📥 Route POST /api/referents/creer appelée");
  try {
    const { nom, prenom, userLogin, motDePasse } = req.body;

    // Vérifier si le login existe déjà
    const loginExistant = await User.findOne({ userLogin });
    if (loginExistant) {
      return res.status(400).json({ message: 'Ce login est déjà utilisé.' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Créer le user
    const nouveauUser = new User({
      nom,
      prenom,
      userLogin,
      motDePasse: hashedPassword,
      role: 'referent'
    });

    await nouveauUser.save();

    // Créer le référent lié
    const nouveauReferent = new Referent({
      user: nouveauUser._id,
      commentaireLeader: '',
      commentaireAdmin: '',
      membres: []
    });

    await nouveauReferent.save();

    res.status(201).json({
      message: 'Référent créé avec succès.',
      referent: nouveauReferent
    });
  } catch (error) {
    console.error('❌ Erreur création référent :', error);
    res.status(500).json({ message: 'Erreur serveur.', error });
  }
};


// ✅ Liste tous les référents
exports.listerReferents = async (req, res) => {
  try {
    console.log("📥 Route /api/referents appelée !");
    
    const referents = await User.find({ role: 'referent' }).select('-password');

    console.log("✅ Référents récupérés :", referents.length);

    res.status(200).json(referents);
  } catch (error) {
    console.error("❌ Erreur dans listerReferents:", error);
    res.status(500).json({ message: 'Erreur lors de la récupération des référents', error });
  }
};

// ✅ Liste les membres associés à un référent
exports.listerReferentsAvecMembres = async (req, res) => {
  console.log("Route /referents/membres atteinte");
  
  try {
    const referents = await Referent.find()
      .populate('user', 'nom')
      .populate('membres', 'fistName lastName');
      
    console.log("Référents récupérés :", referents);
    res.status(200).json(referents);
  } catch (error) {
    console.error("Erreur dans listerReferentsAvecMembres :", error);
    res.status(500).json({ message: 'Erreur lors de la récupération des référents et de leurs membres', error });
  }
};



// Leader laisse un commentaire sur un référent
exports.ajouterCommentaireLeader = async (req, res) => {
  try {
    const { referentId } = req.params;
    const { commentaire } = req.body;

    const referent = await Referent.findById(referentId);
    if (!referent) return res.status(404).json({ message: 'Référent introuvable' });

    referent.commentaireLeader = commentaire;
    await referent.save();

    res.json({ message: 'Commentaire du leader ajouté', referent });
  } catch (error) {
    res.status(500).json({ message: 'Erreur ajout commentaire', error });
  }
};

// Admin laisse un commentaire sur un référent
exports.ajouterCommentaireAdmin = async (req, res) => {
  try {
    const { referentId } = req.params;
    const { commentaire } = req.body;

    const referent = await Referent.findById(referentId);
    if (!referent) return res.status(404).json({ message: 'Référent introuvable' });

    referent.CommantaireAdmin = commentaire;
    await referent.save();

    res.json({ message: 'Commentaire de l\'admin ajouté', referent });
  } catch (error) {
    res.status(500).json({ message: 'Erreur ajout commentaire admin', error });
  }
};



