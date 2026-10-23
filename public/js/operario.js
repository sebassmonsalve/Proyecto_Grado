// public/js/operario.js
// Registro de entradas/salidas de vehículos desde el panel del operario.

const formEntrada = document.getElementById('formEntrada');
const formSalida = document.getElementById('formSalida');

formEntrada.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const placa = document.getElementById('placaEntrada').value.trim();
  const tipo = document.getElementById('tipoVehiculo').value;

  const resultado = await llamarApi('/api/parqueadero/entrada', { placa, tipo });
  mostrarMensaje('mensajeEntrada', resultado.mensaje, resultado.ok ? 'exito' : 'error');
  if (resultado.ok) {
    formEntrada.reset();
    cargarDisponibilidad();
  }
});

formSalida.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const placa = document.getElementById('placaSalida').value.trim();

  const resultado = await llamarApi('/api/parqueadero/salida', { placa });
  const texto = resultado.ok
    ? `${resultado.mensaje} Tarifa cobrada: $${Number(resultado.tarifaCobrada).toLocaleString('es-CO')}`
    : resultado.mensaje;
  mostrarMensaje('mensajeSalida', texto, resultado.ok ? 'exito' : 'error');
  if (resultado.ok) {
    formSalida.reset();
    cargarDisponibilidad();
  }
});

async function llamarApi(url, cuerpo) {
  try {
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(cuerpo),
    });
    const datos = await respuesta.json();
    return { ok: respuesta.ok, ...datos };
  } catch (error) {
    return { ok: false, mensaje: 'Error de conexión con el servidor.' };
  }
}

async function cargarDisponibilidad() {
  try {
    const respuesta = await fetch('/api/parqueadero/disponibilidad');
    const datos = await respuesta.json();
    document.getElementById('cuposLibresOperario').textContent = datos.cuposLibres;
    document.getElementById('cuposOcupadosOperario').textContent = datos.cuposOcupados;
  } catch (error) {
    console.error('No fue posible cargar la disponibilidad.', error);
  }
}

function mostrarMensaje(idContenedor, texto, tipo) {
  document.getElementById(idContenedor).innerHTML = `<div class="mensaje ${tipo}">${texto}</div>`;
}

document.getElementById('btnCerrarSesion').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  window.location.href = 'login.html';
});

cargarDisponibilidad();