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

// CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://amis-des-nouveaux-mdt.web.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connexion réussie à MongoDB Atlas'))
  .catch(err => console.error('❌ Erreur de connexion :', err));


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




// Route test
app.get('/', (req, res) => {
  res.send('🚀 Backend Railway fonctionne parfaitement !');
});

// Lancement serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
