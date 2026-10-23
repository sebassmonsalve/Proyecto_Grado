// public/js/auth.js
// Lógica del formulario de inicio de sesión.

const formLogin = document.getElementById('formLogin');
const mensajeLogin = document.getElementById('mensajeLogin');

formLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const correo = document.getElementById('correo').value.trim();
  const password = document.getElementById('password').value;

  try {
    const respuesta = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ correo, password }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mostrarMensaje(datos.mensaje || 'No fue posible iniciar sesión.', 'error');
      return;
    }

    // Redirige según el rol recibido.
    if (datos.usuario.rol === 'ADMINISTRADOR') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'operario.html';
    }
  } catch (error) {
    mostrarMensaje('Error de conexión con el servidor.', 'error');
  }
});

function mostrarMensaje(texto, tipo) {
  mensajeLogin.innerHTML = `<div class="mensaje ${tipo}">${texto}</div>`;
}