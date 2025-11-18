// --- CARGA DE .ENV (FORMA ROBUSTA) ---
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = require('pg'); // <-- ¡Cambiamos a 'pg'!
const mysql = require('mysql2/promise');

let pool;

// --- LÓGICA DE CONEXIÓN INTELIGENTE ---
if (process.env.DATABASE_URL) {
  // --- ESTAMOS EN RENDER (PRODUCCIÓN) ---
  // Usamos PostgreSQL con la URL que nos da Render
  console.log('Detectada variable DATABASE_URL, conectando a PostgreSQL (Render)...');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Requerido por Render
    }
  });

} else {
  // --- ESTAMOS EN LOCAL (DESARROLLO) ---
  // Usamos MySQL con los datos de tu .env
  console.log('DATABASE_URL no encontrada, conectando a MySQL (Local)...');
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

// Mensaje de éxito (funciona para ambos)
pool.query('SELECT NOW()') // 'SELECT NOW()' es SQL válido en ambos
  .then(() => {
    console.log('✅ Conectado exitosamente a la base de datos.');
  })
  .catch(err => {
    console.error('❌ Error al conectar a la base de datos:', err.message);
  });

module.exports = pool;