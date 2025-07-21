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
  visiteMaison: Boolean,
  contactRegulier: Boolean,
  note: String,
  suivi: {
    dimanche1: { type: Boolean, default: false },
    dimanche2: { type: Boolean, default: false },
    dimanche3: { type: Boolean, default: false },
    dimanche4: { type: Boolean, default: false }
  },
  referentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Referent',  //User
    required: true
   },
  // createdBy: {  // Champ pour stocker le userLogin
  //   type: String,
  //   required: true
  // }
});

module.exports = mongoose.model("Membre", membreSchema);
