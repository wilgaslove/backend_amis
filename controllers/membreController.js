const Membre = require("../models/Membre");

exports.ajouterMembre = async (req, res) => {
  try {
    const membre = new Membre(req.body);
    await membre.save();
    res.status(201).json(membre);
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err });
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
