const mongoose = require('mongoose');

const membreSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  profession: String,
  contact: String,
  address: String,
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
  image: {
    type: String,
    default: "" // par défaut vide
  },
  suivi: {
    dimanche1: { type: Boolean, default: false },
    dimanche2: { type: Boolean, default: false },
    dimanche3: { type: Boolean, default: false },
    dimanche4: { type: Boolean, default: false }
  },
  referentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Referent',  
    required: true
   },
  
});

module.exports = mongoose.model("Membre", membreSchema);



