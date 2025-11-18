// --- CARGA DE .ENV (FORMA ROBUSTA) ---
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

// Importar rutas
const authRoutes = require('./routes/auth');
const animeRoutes = require('./routes/animes');
const recommendRoutes = require('./routes/recommend');

// Inicialización de la app
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
const corsOptions = {
  origin: 'http://localhost:4200'
};
app.use(cors(corsOptions));
app.use(express.json());

// --- Rutas de la API ---
app.get('/api', (req, res) => {
  res.json({ message: '¡API de OtakuShelf funcionando!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/animes', animeRoutes);

// --- Iniciar el Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});