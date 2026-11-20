const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear la piscina de conexiones con soporte para Promesas (async/await)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'parqueadero_cul',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Comprobar la conexión inicial
pool.getConnection()
  .then(connection => {
    console.log(`[DB] Conexión a MySQL (${process.env.DB_NAME || 'parqueadero_cul'}) establecida correctamente con Promesas.`);
    connection.release();
  })
  .catch(err => {
    console.error('[DB] Error al conectar con MySQL:', err.message);
  });

module.exports = pool;