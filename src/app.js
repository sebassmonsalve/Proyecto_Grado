const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

require('dotenv').config();

// Rutas de la aplicación.
const parqueaderoRoutes = require('./routes/parqueaderoRoutes');
const authRoutes = require('./routes/authRoutes');
const predictivoRoutes = require('./routes/predictivoRoutes');

const { protegerPagina } = require('./controllers/authController');
const {
  generarReportePredictivoPDF
} = require('./controllers/reportePredictivoController');

const app = express();

// Middlewares globales.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Página de inicio principal.
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Reporte predictivo en PDF.
app.get(
  '/api/reportes/predictivo-pdf',
  generarReportePredictivoPDF
);

// Proteger las páginas del personal.
app.use('/admin.html', protegerPagina('ADMINISTRADOR'));
app.use(
  '/operario.html',
  protegerPagina('OPERARIO', 'ADMINISTRADOR')
);

// Endpoints de la API.
// Se registran antes de servir los archivos estáticos.

app.use('/api/auth', authRoutes);

// Registro de diagnóstico para comprobar si la solicitud
// está llegando al router predictivo.
app.use('/api/predictivo', (req, res, next) => {
  console.log(
    `[PREDICTIVO] ${req.method} ${req.originalUrl}`
  );

  next();
}, predictivoRoutes);

app.use('/api/parqueadero', parqueaderoRoutes);

// Servir archivos de la carpeta public.
app.use(express.static(path.join(__dirname, '../public')));

// Ruta para solicitudes que no coincidan con ningún endpoint.
app.use((req, res) => {
  console.log(
    `[404] ${req.method} ${req.originalUrl}`
  );

  res.status(404).json({
    success: false,
    mensaje: 'Ruta no encontrada',
    ruta: req.originalUrl,
    metodo: req.method
  });
});

// Inicio del servidor.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Servidor] Escuchando en http://localhost:${PORT}`);
  console.log('[Servidor] Router predictivo registrado en /api/predictivo');
});

module.exports = app;