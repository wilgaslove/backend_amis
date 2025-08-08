const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userLogin: { type: String, required: true, unique: true},
    nom: String,
    prenom: String,
    motDePasse: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'leader', 'referent'],
        default: 'referent'
    },
      mustChangePassword: { type: Boolean, default: false }, // <-- nouveau champ
  // autres champs...
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
