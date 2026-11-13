const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userLogin: { type: String, required: true, unique: true },
    nom: String,
    prenom: String,
    motDePasse: { type: String, required: true },
    // pasteur : pasteur principal (toutes les instances)
    // ap      : assistant pasteur (une instance)
    // leader  : créé par un AP
    // al      : assistant leader — mêmes droits que le leader qu'il assiste (parent = ce leader)
    // referent: créé par un leader
    // 'admin' est l'ancien nom du pasteur : conservé uniquement pour les données non migrées.
    role: {
      type: String,
      enum: ["pasteur", "ap", "leader", "al", "referent", "admin"],
      default: "referent",
    },
    // Instance (ville/pays) de rattachement. null pour le pasteur principal.
    instance: { type: mongoose.Schema.Types.ObjectId, ref: "Instance", default: null },
    // Supérieur direct = la personne qui a créé ce compte (ou à qui il a été rattaché).
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    mustChangePassword: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ instance: 1, role: 1 });
userSchema.index({ parent: 1 });

module.exports = mongoose.model("User", userSchema);
