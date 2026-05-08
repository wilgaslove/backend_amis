const mongoose = require('mongoose');


const membreSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  profession: String,
  Sexe: String,
  situationMatrimoniale: String,
  contact: String,
  address: String,
  mail: String,
  dateArrivee: Date,
  baptise: Boolean,
  requetePriere: String,
  desireRencontrerPasteur: Boolean,
  rdvPasteur: Date,
  veuxIntegrer: Boolean,
  visiteMaison: Boolean,
  contactRegulier: Boolean,
  veuxFaireBapteme: Boolean,
  note: String,
  dePassage: Boolean,
  // commentAvoirRelationChrist: Boolean,
  // renouvelleMonEngagement: Boolean,
  nouvelleNaissance: Boolean,

  commentVousAvezConnuEglise: {
    reseauSociaux: Boolean,
    invitation: Boolean,
    passageProximite: Boolean,
    autre: String,
  },

  personneUrgence: {
    nomPrenom: String,
    contact: String,
  },

  image: String, 
  
   genre: { type: String, enum: ['Homme', 'Femme', 'Autre'] },

  suivi: {
    dimanche1: { type: Boolean, default: false },
    dimanche2: { type: Boolean, default: false },
    dimanche3: { type: Boolean, default: false },
    dimanche4: { type: Boolean, default: false },
  },
  referentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Referent",
    required: true, 
  },

  timestamps: true,
});


module.exports = mongoose.model("Membre", membreSchema);



  