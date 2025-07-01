const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const membreRoutes = require('./routes/membreRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Connexion à MongoDB Atlas (⚠️ sans options dépréciées)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connexion réussie à MongoDB Atlas'))
  .catch(err => console.error('❌ Erreur de connexion :', err));

// Routes
app.use('/api', authRoutes);     // /api/register, /api/login
app.use('/api', membreRoutes);   // /api/membres

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
