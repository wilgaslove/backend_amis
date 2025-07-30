const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const referentSchema = new Schema({
  commentaireLeader: String,
  commentaireAdmin: String,
  user: {  // ← ce champ te permet d’accéder aux infos de connexion
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, { timestamps: true });


module.exports = mongoose.model("Referent", referentSchema);


