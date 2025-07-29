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

// const referentSchema = new Schema(
//   {
//     commentaireLeader: String,
//     commentaireAdmin: String,
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // // 🔁 Relation virtuelle vers les membres liés
// referentSchema.virtual("membres", {
//   ref: "Membre",
//   localField: "_id",
//   foreignField: "referentId",
// });

module.exports = mongoose.model("Referent", referentSchema);


