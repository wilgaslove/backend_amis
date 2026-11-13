const mongoose = require('mongoose');


const membreSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  profession: String,
  // genre: String,
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
  commentAvoirRelationChrist: Boolean,
  renouvelleMonEngagement: Boolean,
  nouvelleNaissance: Boolean,

  commentVousAvezConnuEglise: {
    reseauSociaux: Boolean,
    invitation: Boolean,
    passageProximite: Boolean,
    autre: { type: Boolean, default: false },
  },

  personneUrgence: {
    nomPrenom: String,
    contact: String,
  },

  // Photo : stockée en base (le disque de l'hébergeur est éphémère).
  // photoData n'est jamais renvoyé dans les listes (select: false) ; hasPhoto sert d'indicateur.
  hasPhoto: { type: Boolean, default: false },
  photoType: { type: String, select: false },
  photoData: { type: Buffer, select: false },

  genre: {
  type: String,
  enum: ['Homme', 'Femme', 'Autre'],
  default: 'Autre',
  required: true
},

  suivi: {
    dimanche1: { type: Boolean, default: false },
    dimanche2: { type: Boolean, default: false },
    dimanche3: { type: Boolean, default: false },
    dimanche4: { type: Boolean, default: false },
  },
  // Référent (compte User) qui gère ce suivi
  referentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Instance (copie de celle du référent, pour filtrer vite)
  instance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instance",
    index: true,
  },
}, {  // Ajout de l'option timestamps pour enregistrer les dates de création et de mise à jour
  timestamps: true
});


membreSchema.index({ referentId: 1 });

module.exports = mongoose.model("Membre", membreSchema);
