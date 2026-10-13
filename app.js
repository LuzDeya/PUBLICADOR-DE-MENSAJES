// ===== Configuración =====
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// URLs usadas solo para demostrar errores
const URLS_PRUEBA = {
  normal: API_URL,
  http: 'https://jsonplaceholder.typicode.com/posts-inexistente', // devuelve 404
  conexion: 'https://dominio-que-no-existe.invalid/posts'          // falla la conexión
};

// ===== Referencias al DOM (se obtienen una sola vez) =====
const formulario = document.getElementById('formPublicacion');
const inputTitulo = document.getElementById('titulo');
const inputContenido = document.getElementById('contenido');
const selectModo = document.getElementById('modoPrueba');
const botonPublicar = document.getElementById('btnPublicar');
const cajaMensaje = document.getElementById('mensaje');
const seccionResultado = document.getElementById('resultado');
const resId = document.getElementById('resId');
const resTitulo = document.getElementById('resTitulo');
const resContenido = document.getElementById('resContenido');
const resUsuario = document.getElementById('resUsuario');

// ===== Funciones de interfaz =====

// Muestra un mensaje de estado. textContent evita inyección de HTML.
function mostrarMensaje(texto, tipo) {
  cajaMensaje.textContent = texto;
  cajaMensaje.className = `mensaje ${tipo}`;
}

// Activa o desactiva el estado de carga del botón
function establecerCarga(cargando) {
  botonPublicar.disabled = cargando;
  botonPublicar.textContent = cargando ? 'Publicando...' : 'Publicar';
}

// Pinta en el DOM los datos devueltos por la API (de forma segura)
function mostrarResultado(publicacion) {
  resId.textContent = publicacion.id;
  resTitulo.textContent = publicacion.title;
  resContenido.textContent = publicacion.body;
  resUsuario.textContent = publicacion.userId;
  seccionResultado.classList.remove('oculto');
}

function ocultarResultado() {
  seccionResultado.classList.add('oculto');
}

// ===== Validación =====

// Devuelve un mensaje de error o null si los datos son válidos.
// trim() elimina espacios, así se rechazan campos con solo espacios.
function validarDatos(titulo, contenido) {
  if (titulo.trim() === '') {
    return 'El título es obligatorio y no puede contener solo espacios.';
  }
  if (contenido.trim() === '') {
    return 'El contenido es obligatorio y no puede contener solo espacios.';
  }
  return null;
}

// ===== Petición HTTP =====

// Envía la publicación con POST y devuelve el JSON de la respuesta.
async function enviarPublicacion(publicacion, url) {
  let response;

  // 1. Error de conexión: fetch rechaza la promesa (sin red, dominio inválido, CORS)
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(publicacion)
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
  }

  // 2. Error HTTP: fetch NO rechaza ante 404 o 500, por eso se revisa response.ok
  if (!response.ok) {
    throw new Error(`El servidor respondió con un error (HTTP ${response.status}).`);
  }

  // 3. Error al interpretar JSON
  try {
    return await response.json();
  } catch (error) {
    throw new Error('La respuesta del servidor no tiene un formato JSON válido.');
  }
}

// ===== Evento principal =====
formulario.addEventListener('submit', async (event) => {
  event.preventDefault(); // evita que la página se recargue

  // Evita envíos repetidos si ya hay una petición en curso
  if (botonPublicar.disabled) return;

  const titulo = inputTitulo.value;
  const contenido = inputContenido.value;

  const errorValidacion = validarDatos(titulo, contenido);
  if (errorValidacion) {
    ocultarResultado();
    mostrarMensaje(errorValidacion, 'error');
    return; // no se realiza la petición
  }

  const publicacion = {
    title: titulo.trim(),
    body: contenido.trim(),
    userId: 1
  };

  const url = URLS_PRUEBA[selectModo.value];

  establecerCarga(true);
  ocultarResultado();
  mostrarMensaje('Enviando publicación...', 'cargando');

  try {
    const datos = await enviarPublicacion(publicacion, url);
    mostrarResultado(datos);
    mostrarMensaje('¡Publicación enviada correctamente!', 'exito');
    formulario.reset();
  } catch (error) {
    console.error(error);
    mostrarMensaje(error.message, 'error');
  } finally {
    // Se ejecuta siempre: con éxito o con error, el botón vuelve a habilitarse
    establecerCarga(false);
  }
});
