// public/js/admin.js
// Lógica del panel de administrador: disponibilidad y reportes
// de ingresos diarios. El módulo predictivo se conecta aquí
// cuando esté implementado en la Fase 3.

async function cargarDisponibilidad() {
  try {
    const respuesta = await fetch('/api/parqueadero/disponibilidad');
    const datos = await respuesta.json();
    document.getElementById('cuposLibresAdmin').textContent = datos.cuposLibres;
    document.getElementById('cuposOcupadosAdmin').textContent = datos.cuposOcupados;
    document.getElementById('tarifaHoraAdmin').textContent = `$${Number(datos.tarifaHora).toLocaleString('es-CO')}`;
  } catch (error) {
    console.error('No fue posible cargar la disponibilidad.', error);
  }
}

async function cargarReporteIngresos() {
  const cuerpoTabla = document.getElementById('tablaIngresos');
  try {
    const respuesta = await fetch('/api/parqueadero/reportes/ingresos-diarios', {
      credentials: 'include',
    });

    if (!respuesta.ok) {
      cuerpoTabla.innerHTML = '<tr><td colspan="3">No autorizado o sin datos aún.</td></tr>';
      return;
    }

    const filas = await respuesta.json();

    if (!filas.length) {
      cuerpoTabla.innerHTML = '<tr><td colspan="3">Aún no hay registros de salidas finalizadas.</td></tr>';
      return;
    }

    cuerpoTabla.innerHTML = filas
      .map(
        (fila) => `
        <tr>
          <td>${new Date(fila.fecha).toLocaleDateString('es-CO')}</td>
          <td>${fila.vehiculos_atendidos}</td>
          <td>$${Number(fila.total_ingresos).toLocaleString('es-CO')}</td>
        </tr>`
      )
      .join('');
  } catch (error) {
    cuerpoTabla.innerHTML = '<tr><td colspan="3">Error al cargar el reporte.</td></tr>';
  }
}

document.getElementById('btnCerrarSesion').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  window.location.href = 'login.html';
});

cargarDisponibilidad();
cargarReporteIngresos();