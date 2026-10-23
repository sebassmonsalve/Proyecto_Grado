const db = require('../config/db');

// Obtener estado general y listas para la interfaz
exports.obtenerEstado = async (req, res) => {
  try {
    // Capacidad configurada
    const [config] = await db.query('SELECT capacidad_total FROM configuracion_parqueadero WHERE id = 1');
    const capacidadTotal = config[0] ? config[0].capacidad_total : 50;

    // Vehículos parqueados actualmente
    const [activos] = await db.query(
      "SELECT id, placa, tipo_vehiculo, hora_entrada, estado FROM registros_vehiculos WHERE estado = 'PARQUEADO' ORDER BY hora_entrada DESC"
    );

    // Vehículos retirados
    const [retirados] = await db.query(
      "SELECT id, placa, tipo_vehiculo, hora_entrada, hora_salida, monto_total, estado FROM registros_vehiculos WHERE estado = 'FINALIZADO' AND anulado = 0 ORDER BY hora_salida DESC"
    );

    const cuposOcupados = activos.length;
    const cuposLibres = Math.max(0, capacidadTotal - cuposOcupados);

    res.json({
      success: true,
      capacidadTotal,
      cuposOcupados,
      cuposLibres,
      activos,
      retirados
    });
  } catch (error) {
    console.error('Error al obtener estado:', error);
    res.status(500).json({ success: false, mensaje: 'Error al consultar la base de datos' });
  }
};

// Registrar nuevo ingreso
exports.registrarIngreso = async (req, res) => {
  try {
    const { placa, tipo_vehiculo } = req.body;

    if (!placa || !tipo_vehiculo) {
      return res.status(400).json({ success: false, mensaje: 'Debe ingresar la placa y el tipo de vehículo' });
    }

    // Comprobar si ya está dentro
    const [existente] = await db.query(
      "SELECT id FROM registros_vehiculos WHERE placa = ? AND estado = 'PARQUEADO'",
      [placa.toUpperCase()]
    );

    if (existente.length > 0) {
      return res.status(400).json({ success: false, mensaje: 'El vehículo ya está dentro del parqueadero' });
    }

    // Insertar en la BD
    await db.query(
      "INSERT INTO registros_vehiculos (placa, tipo_vehiculo, hora_entrada, estado, usuario_ingreso_id) VALUES (?, ?, NOW(), 'PARQUEADO', ?)",
      [placa.toUpperCase(), tipo_vehiculo, req.usuario.id]
    );

    res.status(201).json({ success: true, mensaje: 'Ingreso registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar ingreso:', error);
    res.status(500).json({ success: false, mensaje: 'Error al insertar en la base de datos' });
  }
};

// Registrar salida y calcular tarifa
exports.registrarSalida = async (req, res) => {
  try {
    const { id } = req.params;

    const [registros] = await db.query("SELECT * FROM registros_vehiculos WHERE id = ? AND estado = 'PARQUEADO'", [id]);
    if (registros.length === 0) {
      return res.status(404).json({ success: false, mensaje: 'Vehículo no encontrado o ya fue retirado' });
    }

    const vehiculo = registros[0];

    // Obtener la tarifa por hora según el tipo de vehículo
    const [tarifas] = await db.query("SELECT tarifa_por_hora FROM tarifas WHERE tipo_vehiculo = ?", [vehiculo.tipo_vehiculo]);
    const tarifaHora = tarifas.length > 0 ? parseFloat(tarifas[0].tarifa_por_hora) : 3000;

    // Calcular cobro (mínimo 1 hora)
    const horaEntrada = new Date(vehiculo.hora_entrada);
    const horaSalida = new Date();
    const difHoras = Math.max(Math.ceil((horaSalida - horaEntrada) / (1000 * 60 * 60)), 1);
    const montoTotal = difHoras * tarifaHora;

    // Actualizar registro
    await db.query(
      "UPDATE registros_vehiculos SET hora_salida = NOW(), monto_total = ?, estado = 'FINALIZADO', usuario_salida_id = ? WHERE id = ?",
      [montoTotal, req.usuario.id, id]
    );

    res.json({ success: true, mensaje: 'Salida registrada con éxito', montoTotal });
  } catch (error) {
    console.error('Error al registrar salida:', error);
    res.status(500).json({ success: false, mensaje: 'Error al procesar la salida' });
  }
};
// Disponibilidad pública (sin login): solo conteos y tarifas, nunca placas
exports.obtenerDisponibilidad = async (req, res) => {
  try {
    const [config] = await db.query('SELECT capacidad_total FROM configuracion_parqueadero WHERE id = 1');
    const capacidadTotal = config[0] ? config[0].capacidad_total : 50;

    const [conteo] = await db.query("SELECT COUNT(*) AS total FROM registros_vehiculos WHERE estado = 'PARQUEADO'");
    const cuposOcupados = conteo[0].total;
    const cuposLibres = Math.max(0, capacidadTotal - cuposOcupados);

    const [tarifas] = await db.query(
      'SELECT tipo_vehiculo, tarifa_por_hora FROM tarifas WHERE id IN (SELECT MIN(id) FROM tarifas GROUP BY tipo_vehiculo) ORDER BY id'
    );

    res.json({ success: true, capacidadTotal, cuposOcupados, cuposLibres, tarifas });
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    res.status(500).json({ success: false, mensaje: 'Error al consultar la disponibilidad' });
  }
};

// Anular un registro finalizado (solo administrador). No se borra: se conserva el historial.
exports.anularRegistro = async (req, res) => {
  try {
    const { id } = req.params;
    const [resultado] = await db.query(
      "UPDATE registros_vehiculos SET anulado = 1 WHERE id = ? AND estado = 'FINALIZADO' AND anulado = 0",
      [id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Registro no encontrado, no finalizado o ya anulado' });
    }
    res.json({ success: true, mensaje: 'Registro anulado correctamente' });
  } catch (error) {
    console.error('Error al anular registro:', error);
    res.status(500).json({ success: false, mensaje: 'Error al anular el registro' });
  }
};
