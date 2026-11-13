// Crée le compte Pasteur principal (nouvelle installation uniquement).
//   node scripts/creer-pasteur.js <login> <motDePasse> "<Nom>" "<Prénom>"
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

(async () => {
  const [login, mdp, nom = "", prenom = ""] = process.argv.slice(2);
  if (!login || !mdp || mdp.length < 8) {
    console.error('Usage : node scripts/creer-pasteur.js <login> <motDePasse (8+ car.)> "<Nom>" "<Prénom>"');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  if (await User.findOne({ userLogin: login })) {
    console.error("❌ Ce login existe déjà.");
    process.exit(1);
  }
  await User.create({
    userLogin: login, nom, prenom, role: "pasteur",
    motDePasse: await bcrypt.hash(mdp, 10), mustChangePassword: true,
  });
  console.log("✅ Pasteur principal créé.");
  await mongoose.disconnect();
})();
