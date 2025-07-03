const Membre = require("../models/Membre");


exports.ajouterMembre = async (req, res) => {
  try {
    const membreData = req.body;
    membreData.referentId = req.user.id; // ID du référent connecté

    const nouveauMembre = new Membre(membreData);
    await nouveauMembre.save();

    res.status(201).json({ message: "Membre ajouté avec succès", membre: nouveauMembre });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};



exports.listerMembres = async (req, res) => {
  try {
    const membres = await Membre.find();
    res.json(membres);
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err });
  }
};


exports.membresParReferent = async (req, res) => {
  try {
    const referentId = req.user.id;

    const membres = await Membre.find({ referentId });
    res.status(200).json(membres);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

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

// // Mise ajout sur 4 dim
// exports.mettreAJourSuivi = async (req, res) => {
//   try {
//     const { suivi } = req.body;
//     const membre = await Membre.findByIdAndUpdate(
//       req.params.id,
//       { $set: { suivi } },
//       { new: true }
//     );
//     if (!membre) return res.status(404).json({ message: "Membre non trouvé" });
//     res.json(membre);
//   } catch (error) {
//     res.status(500).json({ message: "Erreur mise à jour du suivi" });
//   }
// };
