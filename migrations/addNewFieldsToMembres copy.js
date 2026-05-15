require("dotenv").config();

const mongoose = require("mongoose");
const Membre = require("../models/Membre");

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {

    console.log("MongoDB connecté");

    const membres = await Membre.find();

    for (const membre of membres) {

      // Champs booléens
      membre.commentAvoirRelationChrist ??= false;
      membre.renouvelleMonEngagement ??= false;
      membre.nouvelleNaissance ??= false;

      // Objet commentVousAvezConnuEglise
      if (!membre.commentVousAvezConnuEglise) {
        membre.commentVousAvezConnuEglise = {};
      }

      membre.commentVousAvezConnuEglise.reseauSociaux ??= false;
      membre.commentVousAvezConnuEglise.invitation ??= false;
      membre.commentVousAvezConnuEglise.passageProximite ??= false;
      membre.commentVousAvezConnuEglise.autre ??= "";

      // Objet personneUrgence
      if (!membre.personneUrgence) {
        membre.personneUrgence = {};
      }

      membre.personneUrgence.nomPrenom ??= "";
      membre.personneUrgence.contact ??= "";

      // Genre
      membre.genre ??= "Autre";

      // Suivi
      if (!membre.suivi) {
        membre.suivi = {};
      }

      membre.suivi.dimanche1 ??= false;
      membre.suivi.dimanche2 ??= false;
      membre.suivi.dimanche3 ??= false;
      membre.suivi.dimanche4 ??= false;

      await membre.save();
    }

    console.log("Migration terminée avec succès");

    mongoose.connection.close();

  })
  .catch((err) => {
    console.error(err);
  });