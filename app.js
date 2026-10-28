const formulario = document.getElementById("formulario");
const campoTexto = document.getElementById("texto");
const campoCategoria = document.getElementById("categoria");
const botonAgregar = document.getElementById("agregar");
const botonDeshacer = document.getElementById("deshacer");
const botonBorrarTodas = document.getElementById("borrar-todas");
const estado = document.getElementById("estado");
const mensaje = document.getElementById("mensaje");
const lista = document.getElementById("lista");
const vacio = document.getElementById("vacio");
const contador = document.getElementById("contador");

const CATEGORIAS = ["Estudio", "Personal", "Trabajo"];
let notas = cargar();
let copiaParaDeshacer = null;
let temporizador = null;

function cargar() {
  try {
    return JSON.parse(localStorage.getItem("notas")) || [];
  } catch (e) {
    return [];
  }
}

function guardar() {
  try {
    localStorage.setItem("notas", JSON.stringify(notas));
  } catch (e) { /* sin almacenamiento: la app sigue funcionando */ }
}

function mostrarMensaje(texto, tipo, conDeshacer) {
  clearTimeout(temporizador);
  mensaje.textContent = texto;
  estado.className = "mensaje " + tipo;
  botonDeshacer.hidden = !conDeshacer;
  if (conDeshacer) {
    temporizador = setTimeout(function () {
      botonDeshacer.hidden = true;
      copiaParaDeshacer = null;
    }, 8000);
  }
}

// Prevención de errores: el botón solo se activa si hay texto
function actualizarBoton() {
  botonAgregar.disabled = campoTexto.value.trim() === "";
}

function dibujar() {
  lista.innerHTML = "";
  contador.textContent = notas.length;
  vacio.hidden = notas.length > 0;
  botonBorrarTodas.hidden = notas.length === 0;

  CATEGORIAS.forEach(function (cat) {
    const deEstaCategoria = notas.filter(function (n) { return n.categoria === cat; });
    if (deEstaCategoria.length === 0) return;

    const titulo = document.createElement("h3");
    titulo.textContent = cat + " (" + deEstaCategoria.length + ")";
    const ul = document.createElement("ul");

    deEstaCategoria.forEach(function (nota) {
      const li = document.createElement("li");
      const texto = document.createElement("span");
      texto.textContent = nota.texto;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "boton-eliminar";
      btn.textContent = "Eliminar";
      btn.setAttribute("aria-label", "Eliminar nota: " + nota.texto);
      btn.addEventListener("click", function () { eliminar(nota.id); });
      li.append(texto, btn);
      ul.appendChild(li);
    });

    lista.append(titulo, ul);
  });
}

function eliminar(id) {
  copiaParaDeshacer = notas.slice();
  notas = notas.filter(function (n) { return n.id !== id; });
  guardar();
  dibujar();
  mostrarMensaje("Nota eliminada.", "info", true);
  campoTexto.focus();
}

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();
  const texto = campoTexto.value.trim();
  if (texto === "") return;

  notas.push({ id: Date.now(), texto: texto, categoria: campoCategoria.value });
  guardar();
  dibujar();
  formulario.reset();
  actualizarBoton();
  campoTexto.focus();
  mostrarMensaje("Nota agregada en " + campoCategoria.value + ".", "exito", false);
});

botonBorrarTodas.addEventListener("click", function () {
  if (!confirm("¿Seguro que quieres borrar las " + notas.length + " notas?")) {
    mostrarMensaje("Cancelado. No se borró ninguna nota.", "info", false);
    return;
  }
  copiaParaDeshacer = notas.slice();
  notas = [];
  guardar();
  dibujar();
  mostrarMensaje("Todas las notas fueron borradas.", "info", true);
  campoTexto.focus();
});

botonDeshacer.addEventListener("click", function () {
  if (!copiaParaDeshacer) return;
  notas = copiaParaDeshacer;
  copiaParaDeshacer = null;
  guardar();
  dibujar();
  mostrarMensaje("Notas restauradas.", "exito", false);
  campoTexto.focus();
});

campoTexto.addEventListener("input", actualizarBoton);

dibujar();
actualizarBoton();