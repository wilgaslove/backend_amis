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
