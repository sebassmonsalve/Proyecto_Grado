// public/js/publico.js
// Consulta periódica de disponibilidad para la pantalla pública
// ubicada en el punto de acceso del parqueadero. No requiere login.

const INTERVALO_ACTUALIZACION_MS = 15000; // 15 segundos

async function cargarDisponibilidad() {
  try {
    const respuesta = await fetch('/api/parqueadero/disponibilidad');
    const datos = await respuesta.json();

    document.getElementById('cuposLibres').textContent = datos.cuposLibres;
    document.getElementById('cuposOcupados').textContent = datos.cuposOcupados;

    const listaTarifas = document.getElementById('listaTarifas');
    if (listaTarifas && Array.isArray(datos.tarifas)) {
      listaTarifas.innerHTML = datos.tarifas
        .map(
          (t) =>
            `<div>${t.tipo_vehiculo}: $${Number(t.tarifa_por_hora).toLocaleString('es-CO')}/h</div>`
        )
        .join('');
    }

    const ahora = new Date();
    document.getElementById('ultimaActualizacion').textContent =
      `Última actualización: ${ahora.toLocaleTimeString('es-CO')}`;
  } catch (error) {
    document.getElementById('ultimaActualizacion').textContent =
      'No fue posible actualizar la información. Reintentando...';
  }
}

cargarDisponibilidad();
setInterval(cargarDisponibilidad, INTERVALO_ACTUALIZACION_MS);