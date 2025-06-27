
const mongoose = require('mongoose');
const express = require('express');
const app = express();

// Middleware pour JSON
app.use(express.json());

require('dotenv').config();

// Connexion à MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connexion réussie à MongoDB Atlas'))
  .catch(err => console.error('❌ Erreur de connexion :', err));

// Exemple de route
app.get('/', (req, res) => {
  res.send('API opérationnelle');
});

app.listen(3000, () => {
  console.log('🚀 Serveur lancé sur http://localhost:3000');
});


// const express = require('express');
// const dotenv = require('dotenv');
// const connectDB = require('./config/db');
// const membreRoutes = require('./routes/membreRoutes');
// const authRoutes = require('./routes/authRoutes'); // ✅ Ajout de la route auth

// dotenv.config();
// connectDB();

// const app = express();
// app.use(express.json());

// // Routes
// app.use('/api', membreRoutes);
// //app.use('/api/auth', authRoutes); // ✅ Toutes les routes auth (register/login) seront accessibles via /api/auth
// app.use('/api',  authRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));
