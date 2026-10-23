// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { login, logout, verificarToken, yo } = require('../controllers/authController');

router.post('/login', login);
router.post('/logout', logout);
router.get('/yo', verificarToken, yo);

module.exports = router;
