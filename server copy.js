const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const membreRoutes = require('./routes/membreRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const referentRoutes = require('./routes/referentRoutes')


dotenv.config();

const app = express();



// app.get('/test-direct', (req, res) => {
//   console.log("✅ Route /test-direct appelée !");
//   res.send("Test direct OK");
// });

// URL du frontend 
// Autoriser les requêtes venant du frontend Vue.js//Configuration CORS complète
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// ✅ Parser JSON
app.use(cors(corsOptions));


// Middleware pour parser le JSON
app.use(express.json());

// Connexion à MongoDB Atlas (⚠️ sans options dépréciées)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connexion réussie à MongoDB Atlas'))
  .catch(err => console.error('❌ Erreur de connexion :', err));

// Les différentes routes de l'API
// api/authRoutes
//api/register, /api/login
app.use('/api', authRoutes);  

// // /api/membres
app.use('/api', membreRoutes);   

// api/userRoutes
 app.use('/api', require('./routes/userRoutes'));

 //récupéré les membres 
 app.use('/api/membres', require('./routes/membreRoutes'));

// //api récupération des référents
app.use('/api/referents', require('./routes/referentRoutes'));

// Utiliser les routes
app.use('/api', referentRoutes);


// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});

