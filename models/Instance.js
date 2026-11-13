const mongoose = require("mongoose");

// Une instance = une église locale (une ville dans un pays).
const instanceSchema = new mongoose.Schema(
  {
    ville: { type: String, required: true, trim: true },
    pays: { type: String, required: true, trim: true },
    // Indicatif téléphonique du pays, chiffres uniquement (ex: "229", "33", "225").
    // Sert à construire les liens WhatsApp / Appel quand un numéro est saisi sans "+".
    indicatif: { type: String, trim: true, default: "" },
    // Certains pays (Bénin, Côte d'Ivoire...) font partie du numéro le "0"/"01" initial.
    // Si true, on ne retire jamais le 0 initial en construisant le numéro international.
    conserverZero: { type: Boolean, default: false },
    actif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Pas deux fois la même ville dans le même pays (insensible à la casse)
instanceSchema.index(
  { ville: 1, pays: 1 },
  { unique: true, collation: { locale: "fr", strength: 2 } }
);

module.exports = mongoose.model("Instance", instanceSchema);
