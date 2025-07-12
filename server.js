const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const membreRoutes = require('./routes/membreRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
// const referentRoutes = require('./routes/referentRoutes'); 


dotenv.config();

const app = express();

app.get('/test-direct', (req, res) => {
  console.log("✅ Route /test-direct appelée !");
  res.send("Test direct OK");
});

// URL du frontend 
// ✅ Autoriser les requêtes venant du frontend Vue.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // Si tu utilises les cookies ou headers d'authentification
}));

// Middleware pour parser le JSON
app.use(express.json());

// Connexion à MongoDB Atlas (⚠️ sans options dépréciées)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connexion réussie à MongoDB Atlas'))
  .catch(err => console.error('❌ Erreur de connexion :', err));

// Routes
//api/register, /api/login
app.use('/api', authRoutes);     
// // /api/membres
app.use('/api', membreRoutes);   
// api/userRoutes
app.use('/api', userRoutes);

// //api récupération des référents
//  app.use('/api/referents', referentRoutes); 
app.use('/api/referents', require('./routes/referentRoutes'));




// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});

