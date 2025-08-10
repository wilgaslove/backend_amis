const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

const membreRoutes = require('./routes/membreRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const referentRoutes = require('./routes/referentRoutes');

dotenv.config();

const app = express();

// Configuration CORS — autoriser localhost pour dev + ton frontend Firebase en prod
const corsOptions = {
  origin: [
    'http://localhost:5173',                 // Frontend en dev local (Vite)
    'https://amis-des-nouveaux-mdt.web.app' // Frontend Firebase hébergé en prod
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware pour parser le JSON
app.use(express.json());

// Connexion à MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connexion réussie à MongoDB Atlas'))
  .catch(err => console.error('❌ Erreur de connexion :', err));

// Routes (bien séparées par chemin pour éviter doublons)
app.use('/api/auth', authRoutes);
app.use('/api/membres', membreRoutes);
app.use('/api/users', userRoutes);
app.use('/api/referents', referentRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
