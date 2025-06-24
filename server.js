const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const membreRoutes = require('./routes/membreRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use('/api', membreRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));
