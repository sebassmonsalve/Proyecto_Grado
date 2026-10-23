// src/controllers/predictivoController.js
// Módulo básico de análisis predictivo (Objetivo específico 4).
// En esta etapa (20% de avance) se deja el esqueleto de las
// funciones con reglas estadísticas simples: promedio móvil por
// franja horaria y detección de anomalías por umbral. La captura
// automática de "fotografías" de ocupación (job/cron que llena
// ocupacion_historica) se implementará en la Fase 3.

const pool = require('../config/db');

// GET /api/predictivo/ocupacion-estimada
// Devuelve, por hora del día (0-23), el promedio histórico de
// ocupación registrado en la tabla ocupacion_historica.
async function estimarOcupacionPorHora(req, res) {
  try {
    const [filas] = await pool.query(`
      SELECT hora,
             AVG(cupos_ocupados) AS ocupacion_promedio,
             AVG(cupos_ocupados / capacidad_total) * 100 AS porcentaje_promedio
      FROM ocupacion_historica
      GROUP BY hora
      ORDER BY hora ASC
    `);

    res.status(200).json({
      mensaje: filas.length
        ? 'Estimación basada en el histórico disponible.'
        : 'Aún no hay suficientes datos históricos para estimar la ocupación.',
      datos: filas,
    });
  } catch (error) {
    console.error('[predictivoController.estimarOcupacionPorHora]', error);
    res.status(500).json({ mensaje: 'Error interno al calcular la estimación.' });
  }
}

// GET /api/predictivo/anomalias
// Regla simple: marca como anómala una franja horaria cuyo
// registro de ocupación se aleje más de un umbral (en puntos
// porcentuales) del promedio histórico de esa misma hora.
const UMBRAL_ANOMALIA_PORCENTAJE = 25;

async function detectarAnomalias(req, res) {
  try {
    const [promedios] = await pool.query(`
      SELECT hora, AVG(cupos_ocupados / capacidad_total) * 100 AS porcentaje_promedio
      FROM ocupacion_historica
      GROUP BY hora
    `);

    const promedioPorHora = new Map(
      promedios.map((fila) => [fila.hora, Number(fila.porcentaje_promedio)])
    );

    const [recientes] = await pool.query(`
      SELECT id, fecha, hora, cupos_ocupados, capacidad_total
      FROM ocupacion_historica
      ORDER BY fecha DESC, hora DESC
      LIMIT 50
    `);

    const anomalias = recientes
      .map((registro) => {
        const porcentajeActual = (registro.cupos_ocupados / registro.capacidad_total) * 100;
        const promedioHistorico = promedioPorHora.get(registro.hora) ?? porcentajeActual;
        const diferencia = Math.abs(porcentajeActual - promedioHistorico);
        return { ...registro, porcentajeActual, promedioHistorico, diferencia };
      })
      .filter((registro) => registro.diferencia > UMBRAL_ANOMALIA_PORCENTAJE);

    res.status(200).json({
      umbralUtilizado: UMBRAL_ANOMALIA_PORCENTAJE,
      totalAnomalias: anomalias.length,
      anomalias,
    });
  } catch (error) {
    console.error('[predictivoController.detectarAnomalias]', error);
    res.status(500).json({ mensaje: 'Error interno al detectar anomalías.' });
  }
}

// GET /api/predictivo/recomendaciones
// Genera recomendaciones textuales muy simples a partir de las
// anomalías y la ocupación estimada. Se ampliará en la Fase 3.
async function generarRecomendaciones(req, res) {
  try {
    const recomendaciones = [
      'Módulo de recomendaciones en construcción: se completará junto con la carga histórica en la Fase 3 (Objetivo 4).',
    ];
    res.status(200).json({ recomendaciones });
  } catch (error) {
    console.error('[predictivoController.generarRecomendaciones]', error);
    res.status(500).json({ mensaje: 'Error interno al generar recomendaciones.' });
  }
}

module.exports = { estimarOcupacionPorHora, detectarAnomalias, generarRecomendaciones };