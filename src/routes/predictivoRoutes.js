const express = require('express');
const router = express.Router();

// No hay predicción publicada al iniciar el servidor.
let franjaSimulada = null;

// Recomendaciones para el cliente.
const prediccionesCliente = {
  '21': {
    horaSimulada: '09:30 PM (Hora Actual - Demanda Baja)',
    nivelDemanda: 'Demanda Baja (15%)',
    recomendacion: '💡 Excelente horario para estacionar. Hay múltiples cupos libres en todas las zonas y el ingreso es fluido sin esperas.'
  },

  '08': {
    horaSimulada: '08:00 AM (Entrada Jornada - Demanda Moderada)',
    nivelDemanda: 'Demanda Moderada (50%)',
    recomendacion: '✅ Flujo regular de vehículos por inicio de jornada. Encontrarás espacio disponible con facilidad en los sectores principales.'
  },

  '11': {
    horaSimulada: '11:00 AM (Pico Mañana - Demanda Alta 85%)',
    nivelDemanda: 'Demanda Alta (85%)',
    recomendacion: '🚗 Elevado flujo vehicular por jornada académica. Te sugerimos dirigirte directamente a las bahías posteriores para parquear más rápido.'
  },

  '16': {
    horaSimulada: '04:00 PM (Pico Tarde / Salida - Demanda Máxima 95%)',
    nivelDemanda: 'Demanda Máxima (95%)',
    recomendacion: '⚠️ Congestión alta por hora pico de salida. Te recomendamos llegar con anticipación o verificar opciones alternativas en el mapa.'
  }
};

// GET /api/predictivo/resumen
// Permite verificar si el router está funcionando y
// consultar la última simulación publicada.
router.get('/resumen', (req, res) => {
  console.log('[PREDICTIVO] Ejecutando GET /resumen');

  if (franjaSimulada === null) {
    return res.json({
      success: true,
      configurada: false,
      mensaje: 'El administrador todavía no ha publicado una recomendación.'
    });
  }

  const datos = prediccionesCliente[franjaSimulada];

  if (!datos) {
    return res.status(500).json({
      success: false,
      mensaje: 'No se encontraron los datos de la franja activa.'
    });
  }

  return res.json({
    success: true,
    configurada: true,
    clave: franjaSimulada,
    horaSimulada: datos.horaSimulada,
    nivelDemanda: datos.nivelDemanda,
    recomendacion: datos.recomendacion
  });
});

// POST /api/predictivo/simular
// Guarda la franja seleccionada por el administrador.
router.post('/simular', (req, res) => {
  console.log('[PREDICTIVO] Ejecutando POST /simular');
  console.log('[PREDICTIVO] Datos recibidos:', req.body);

  try {
    const hora = String(req.body?.hora ?? '').trim();

    if (!Object.prototype.hasOwnProperty.call(
      prediccionesCliente,
      hora
    )) {
      return res.status(400).json({
        success: false,
        mensaje: 'La franja horaria seleccionada no es válida.',
        horaRecibida: hora
      });
    }

    // Publicar la nueva simulación.
    franjaSimulada = hora;

    const datos = prediccionesCliente[franjaSimulada];

    console.log(
      `[PREDICTIVO] Franja publicada correctamente: ${franjaSimulada}`
    );

    return res.json({
      success: true,
      configurada: true,
      clave: franjaSimulada,
      horaSimulada: datos.horaSimulada,
      nivelDemanda: datos.nivelDemanda,
      recomendacion: datos.recomendacion,
      mensaje: 'Simulación enviada a la app móvil con éxito.'
    });

  } catch (error) {
    console.error(
      '[PREDICTIVO] Error al procesar la simulación:',
      error
    );

    return res.status(500).json({
      success: false,
      mensaje: 'Error al procesar la simulación.'
    });
  }
});

module.exports = router;