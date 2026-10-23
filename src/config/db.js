const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear la piscina de conexiones con soporte para Promesas (async/await)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'parqueadero_cul',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Comprobar la conexión inicial
pool.getConnection()
  .then(connection => {
    console.log('[DB] Conexión a MySQL (parqueadero_cul) establecida correctamente con Promesas.');
    connection.release();
  })
  .catch(err => {
    console.error('[DB] Error al conectar con MySQL:', err.message);
  });

module.exports = pool;