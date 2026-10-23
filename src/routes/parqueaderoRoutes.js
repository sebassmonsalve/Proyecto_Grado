const express = require('express');
const router = express.Router();
const parqueaderoController = require('../controllers/parqueaderoController');
const { verificarToken, verificarRol } = require('../controllers/authController');
const db = require('../config/db');

// Roles de acceso
const operacion = [verificarToken, verificarRol('OPERARIO', 'ADMINISTRADOR')];
const soloAdmin = [verificarToken, verificarRol('ADMINISTRADOR')];

// --- RUTAS PÚBLICAS (PWA MÓVIL) ---
router.get('/disponibilidad', parqueaderoController.obtenerDisponibilidad);

// FASE 2: Consultar estancia activa por Placa o ID de Tiquete (Pública para clientes)
router.get('/estancia/:criterio', async (req, res) => {
  try {
    const { criterio } = req.params;

    // Consulta alineada con phpMyAdmin: usa 'hora_entrada' y estado = 'PARQUEADO'
    const [filas] = await db.query(
      `SELECT rv.id, rv.placa, rv.tipo_vehiculo, rv.hora_entrada,
              t.tarifa_por_hora
       FROM registros_vehiculos rv
       INNER JOIN tarifas t ON rv.tipo_vehiculo = t.tipo_vehiculo
       WHERE (rv.placa = ? OR rv.id = ?) AND rv.estado = 'PARQUEADO'
       LIMIT 1`,
      [criterio, criterio]
    );

    if (filas.length === 0) {
      return res.json({ 
        success: false, 
        mensaje: 'No se encontró un vehículo activo registrado con esa placa o tiquete.' 
      });
    }

    const vehiculo = filas[0];
    const inicio = new Date(vehiculo.hora_entrada);
    const ahora = new Date();
    
    // Cálculo de tiempo transcurrido
    const difMs = ahora - inicio;
    const minutosTotales = Math.floor(difMs / (1000 * 60));
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;

    // Cálculo de cobro acumulado (mínimo 1 hora)
    const horasACobrar = Math.max(1, Math.ceil(minutosTotales / 60));
    const montoEstimado = horasACobrar * parseFloat(vehiculo.tarifa_por_hora);

    res.json({
      success: true,
      estancia: {
        tiqueteId: vehiculo.id,
        placa: vehiculo.placa,
        tipoVehiculo: vehiculo.tipo_vehiculo,
        horaIngreso: inicio.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true }),
        tiempoTranscurrido: `${horas}h ${minutos}m`,
        montoEstimado: Math.round(montoEstimado)
      }
    });

  } catch (error) {
    console.error('Error al consultar estancia:', error);
    res.status(500).json({ success: false, mensaje: 'Error al consultar el tiquete.' });
  }
});

// --- RUTAS PROTEGIDAS (SISTEMA INTERNO) ---
router.get('/estado', operacion, parqueaderoController.obtenerEstado);
router.post('/ingreso', operacion, parqueaderoController.registrarIngreso);
router.put('/salida/:id', operacion, parqueaderoController.registrarSalida);
router.put('/anular/:id', soloAdmin, parqueaderoController.anularRegistro);

module.exports = router;