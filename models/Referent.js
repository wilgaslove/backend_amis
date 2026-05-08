const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const referentSchema = new Schema({
  commentaireLeader: String,
  commentaireAdmin: String,
  user: {  // Le champ te permet d'avoir les infos de la personne connectée.
    
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, { timestamps: true });


module.exports = mongoose.model("Referent", referentSchema);


