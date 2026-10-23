// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// POST /api/auth/login
async function login(req, res) {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios.' });
    }

    const [filas] = await pool.query(
      'SELECT id, nombre, correo, password_hash, rol FROM usuarios WHERE correo = ? LIMIT 1',
      [correo]
    );

    const usuario = filas[0];

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res
      .cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 8 * 60 * 60 * 1000 })
      .status(200)
      .json({
        mensaje: 'Inicio de sesión exitoso.',
        usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
        token,
      });
  } catch (error) {
    console.error('[authController.login]', error);
    res.status(500).json({ mensaje: 'Error interno al iniciar sesión.' });
  }
}

// POST /api/auth/logout
function logout(req, res) {
  res.clearCookie('token');
  res.status(200).json({ mensaje: 'Sesión cerrada.' });
}

// Middleware: verifica que exista un token válido.
function verificarToken(req, res, next) {
  const token =
    req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ mensaje: 'No autenticado.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Sesión inválida o expirada.' });
  }
}

// Middleware: restringe acceso por rol. Ej: verificarRol('ADMINISTRADOR')
function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tiene permisos para esta acción.' });
    }
    next();
  };
}

// Middleware para PÁGINAS HTML: sin sesión o sin permiso, redirige en vez de responder JSON.
function protegerPagina(...rolesPermitidos) {
  return (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return res.redirect('/login.html');
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (!rolesPermitidos.includes(payload.rol)) {
        return res.redirect(payload.rol === 'OPERARIO' ? '/operario.html' : '/login.html');
      }
      req.usuario = payload;
      next();
    } catch (error) {
      res.clearCookie('token');
      return res.redirect('/login.html');
    }
  };
}

// GET /api/auth/yo : datos del usuario con sesión activa (para mostrar el nombre en el encabezado)
function yo(req, res) {
  const { id, nombre, rol } = req.usuario;
  res.status(200).json({ success: true, usuario: { id, nombre, rol } });
}

module.exports = { login, logout, verificarToken, verificarRol, protegerPagina, yo };