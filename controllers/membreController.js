
const Membre = require("../models/Membre");

// Créer un nouveau membre
exports.ajouterMembre = async (req, res) => {
  try {
    const user = req.user;

    // Ajouter l'ID du référent dans le corps de la requête si l'utilisateur est un référent
    if (user.role === 'referent') {
      req.body.referentId = user._id;
    }

    // Créer un nouveau membre
    const nouveauMembre = new Membre(req.body);
    await nouveauMembre.save();

    // Ajouter le membre à la liste des membres du référent
    await Referent.findByIdAndUpdate(
      req.body.referentId,
      { $push: { membres: nouveauMembre._id } }, // Ajouter l'ID du nouveau membre
      { new: true } // Optionnel : retourner le document mis à jour
    );

    // Répondre avec les informations du membre créé
    res.status(201).json({
      message: 'Membre créé avec succès',
      membre: {
        id: nouveauMembre._id,
        firstName: nouveauMembre.firstName,
        lastName: nouveauMembre.lastName
      }
    });
  } catch (err) {
    console.error("❌ Erreur ajout membre :", err);
    res.status(500).json({ message: "Erreur lors de l'ajout du membre", error: err });
  }
};

// Lister tous les membres
exports.listerMembres = async (req, res) => {
  try {
    const membres = await Membre.find();
    res.json(membres);
  
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err });
  }
};


// Lister les membres du référent connecté
exports.membresParReferent = async (req, res) => {
  try {
    const referentId = req.user.id;

    const membres = await Membre.find({ referentId });
    res.status(200).json(membres);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Compter les membres du référent connecté
exports.compterMembresParReferent = async (req, res) => {
  try {
    const referentId = req.user.id; // ID du référent connecté (grâce au middleware auth)
    const count = await Membre.countDocuments({ referentId }); // Assure-toi que chaque membre a un champ `referentId`
    res.json({ total: count });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du comptage des membres." });
  }
};

// Modifier un membre
exports.modifierMembre = async (req, res) => {
  try {
    const membreId = req.params.id;

    const membre = await Membre.findById(membreId);
    if (!membre) {
      return res.status(404).json({ message: 'Membre non trouvé' });
    }

    // Si le référent tente de modifier un membre qui n’est pas le sien
    if (req.user.role === 'referent' && membre.referentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé. Ce membre ne vous est pas assigné.' });
    }

    // Mise à jour
    const membreMisAJour = await Membre.findByIdAndUpdate(membreId, req.body, { new: true });

    res.status(200).json({ message: 'Membre mis à jour', membre: membreMisAJour });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Supprimer un membre
exports.supprimerMembre = async (req, res) => {
  try {
    const membreId = req.params.id;

    const membre = await Membre.findById(membreId);
    if (!membre) {
      return res.status(404).json({ message: 'Membre non trouvé' });
    }

    // Si le référent tente de supprimer un membre qui ne lui appartient pas
    if (req.user.role === 'referent' && membre.referentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé. Ce membre ne vous est pas assigné.' });
    }

    await Membre.findByIdAndDelete(membreId);

    res.status(200).json({ message: 'Membre supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};


