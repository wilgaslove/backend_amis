const mongoose = require("mongoose");
require("dotenv").config(); // Charger les variables d'environnement

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connexion à MongoDB réussie !");
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB", error);
  }
};

module.exports = connectDB;
