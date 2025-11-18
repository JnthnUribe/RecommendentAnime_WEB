// --- CARGA DE .ENV (FORMA ROBUSTA) ---
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mysql = require('mysql2/promise');

// Crea un "pool" de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Mensaje de éxito
pool.getConnection()
  .then(connection => {
    console.log('✅ Conectado exitosamente a la base de datos MySQL');
    connection.release(); 
  })
  .catch(err => {
    console.error('❌ Error al conectar a la base de datos:', err.message);
  });

module.exports = pool;