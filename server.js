const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

dotenv.config();
const app = express();

if (!process.env.JWT_SECRET) {
  console.warn("⚠️  JWT_SECRET absent : un secret par défaut public est utilisé. Définissez-le en production !");
}

// CORS
const originesSupp = (process.env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: ["http://localhost:5173", "https://amis-des-nouveaux-mdt.web.app", ...originesSupp],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
  })
);

app.use(express.json());

// Connexion MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connexion réussie à MongoDB Atlas"))
  .catch((err) => console.error("❌ Erreur de connexion :", err));

app.use("/api", require("./routes/authRoutes")); // /login /change-password /me
app.use("/api/instances", require("./routes/instanceRoutes"));
app.use("/api", require("./routes/userRoutes")); // /users /equipe /referents-membres
app.use("/api", require("./routes/membreRoutes")); // /membres /mes-membres + photos
app.use("/api/export", require("./routes/exportRoutes"));
app.use("/api/commentaires", require("./routes/commentaireRoutes"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
