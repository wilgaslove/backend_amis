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


// ma table users avec le role referent
// _id: objectId(68849b3e3ef74017cc545789)
// userLogin: "Gaston.ADJOVI"
// nom: "Gaston"
// prenom: "ADJOVI"
// motDePasse: "$2b$10$0LNRrQx5NjIcUzQu0Uf.ueoeINExKdLYZAhhhzXG0F.77xEbbnFNm"
// role: "referent"
// __v: 0


