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
    }
});

module.exports = mongoose.model('User', userSchema);
