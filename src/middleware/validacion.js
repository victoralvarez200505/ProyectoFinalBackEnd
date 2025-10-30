/**
 * ✅ MIDDLEWARE DE VALIDACIÓN
 *
 * Este archivo contiene middleware para validar datos de entrada
 * antes de que lleguen a los controladores.
 *
 * Validaciones incluidas:
 * - Validación de IDs de MongoDB
 * - Validación de datos de juegos
 * - Validación de datos de reseñas
 * - Sanitización de datos de entrada
 */

const mongoose = require("mongoose");
const { crearError } = require("./errorHandler");

/**
 * 🆔 Validar que el ID sea un ObjectId válido de MongoDB
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const validarId = (req, res, next) => {
  const { id, juegoId } = req.params;
  const idAValidar = id || juegoId;

  if (!idAValidar) {
    return next(crearError("ID es requerido", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(idAValidar)) {
    return next(crearError(`ID inválido: ${idAValidar}`, 400));
  }

  next();
};

/**
 * 🎮 Validar datos de juego
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const validarJuego = (req, res, next) => {
  const { nombre, año, genero, plataforma, imagen, resena } = req.body;
  const errores = [];

  // Campos requeridos
  if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
    errores.push("Nombre es requerido y debe ser un texto válido");
  }

  if (
    !año ||
    !Number.isInteger(año) ||
    año < 1970 ||
    año > new Date().getFullYear() + 2
  ) {
    errores.push(
      `Año debe ser un número entero entre 1970 y ${
        new Date().getFullYear() + 2
      }`
    );
  }

  if (!genero || typeof genero !== "string" || genero.trim().length === 0) {
    errores.push("Género es requerido");
  }

  if (
    !plataforma ||
    typeof plataforma !== "string" ||
    plataforma.trim().length === 0
  ) {
    errores.push("Plataforma es requerida");
  }

  // Campos opcionales con validación
  if (imagen && typeof imagen !== "string") {
    errores.push("Imagen debe ser una URL válida");
  }

  if (resena && typeof resena !== "string") {
    errores.push("Reseña debe ser texto válido");
  }

  // Validaciones adicionales
  if (nombre && nombre.length > 100) {
    errores.push("Nombre no puede exceder 100 caracteres");
  }

  if (resena && resena.length > 1000) {
    errores.push("Reseña no puede exceder 1000 caracteres");
  }

  // Si hay errores, retornar error de validación
  if (errores.length > 0) {
    return next(
      crearError(`Errores de validación: ${errores.join(", ")}`, 400)
    );
  }

  // Sanitizar datos
  req.body = sanitizarJuego(req.body);
  next();
};

/**
 * 📝 Validar datos de reseña
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const validarResenia = (req, res, next) => {
  const { juegoId, contenido, calificacion, autor } = req.body;
  const errores = [];

  // Validar juegoId
  if (!juegoId) {
    errores.push("ID del juego es requerido");
  } else if (!mongoose.Types.ObjectId.isValid(juegoId)) {
    errores.push("ID del juego no es válido");
  }

  // Validar contenido
  if (
    !contenido ||
    typeof contenido !== "string" ||
    contenido.trim().length === 0
  ) {
    errores.push("Contenido de la reseña es requerido");
  } else if (contenido.length < 10) {
    errores.push("Contenido debe tener al menos 10 caracteres");
  } else if (contenido.length > 2000) {
    errores.push("Contenido no puede exceder 2000 caracteres");
  }

  // Validar calificación
  const califNum = Number(calificacion);
  if (calificacion === undefined || calificacion === null || isNaN(califNum)) {
    errores.push("Calificación es requerida");
  } else if (!Number.isInteger(califNum) || califNum < 1 || califNum > 5) {
    errores.push("Calificación debe ser un número entero entre 1 y 5");
  }

  // Validar autor (opcional)
  if (autor && (typeof autor !== "string" || autor.length > 50)) {
    errores.push("Autor debe ser texto válido de máximo 50 caracteres");
  }

  // Validar dificultad (opcional)
  const { dificultad, horasJugadas, recomendaria } = req.body;
  const dificultadesValidas = [
    "Muy fácil",
    "Fácil",
    "Normal",
    "Difícil",
    "Muy difícil",
  ];
  if (dificultad && !dificultadesValidas.includes(dificultad)) {
    errores.push("Dificultad no válida");
  }

  // Validar horasJugadas (opcional)
  if (horasJugadas !== undefined && horasJugadas !== null) {
    const horas = Number(horasJugadas);
    if (isNaN(horas) || horas < 0 || horas > 10000) {
      errores.push("Horas jugadas debe ser un número entre 0 y 10000");
    }
  }

  // Validar recomendaria (opcional, robusto para string "true"/"false")
  let recomendariaBool = recomendaria;
  if (typeof recomendaria === "string") {
    if (recomendaria.toLowerCase() === "true") recomendariaBool = true;
    else if (recomendaria.toLowerCase() === "false") recomendariaBool = false;
  }
  if (recomendaria !== undefined && typeof recomendariaBool !== "boolean") {
    errores.push("Recomendaria debe ser booleano");
  }
  // Actualizar el valor sanitizado para el resto del flujo
  req.body.recomendaria = recomendariaBool;

  // Si hay errores, retornar error de validación
  if (errores.length > 0) {
    console.log("🔴 Errores de validación:", errores);
    return next(
      crearError(`Errores de validación: ${errores.join(", ")}`, 400)
    );
  }

  // Sanitizar datos
  req.body = sanitizarResenia(req.body);
  next();
};

/**
 * 🧹 Sanitizar datos de juego
 * @param {Object} datos - Datos del juego a sanitizar
 * @returns {Object} Datos sanitizados
 */
const sanitizarJuego = (datos) => {
  const sanitizado = {};

  // Sanitizar campos de texto
  if (datos.nombre) sanitizado.nombre = datos.nombre.trim();
  if (datos.genero) sanitizado.genero = datos.genero.trim();
  if (datos.plataforma) sanitizado.plataforma = datos.plataforma.trim();
  if (datos.imagen) sanitizado.imagen = datos.imagen.trim();
  if (datos.resena) sanitizado.resena = datos.resena.trim();
  if (datos.desarrollador)
    sanitizado.desarrollador = datos.desarrollador.trim();
  if (datos.tienda) sanitizado.tienda = datos.tienda.trim();

  // Campos numéricos
  if (datos.año) sanitizado.año = parseInt(datos.año);
  if (datos.horasJugadas)
    sanitizado.horasJugadas = parseFloat(datos.horasJugadas);

  // Campos booleanos
  if (datos.completado !== undefined)
    sanitizado.completado = Boolean(datos.completado);

  return sanitizado;
};

/**
 * 🧹 Sanitizar datos de reseña
 * @param {Object} datos - Datos de la reseña a sanitizar
 * @returns {Object} Datos sanitizados
 */
const sanitizarResenia = (datos) => {
  const sanitizado = {};

  if (datos.juegoId) sanitizado.juegoId = datos.juegoId;
  if (datos.contenido) sanitizado.contenido = datos.contenido.trim();
  if (datos.calificacion !== undefined && datos.calificacion !== null)
    sanitizado.calificacion = parseInt(datos.calificacion);
  if (datos.autor) sanitizado.autor = datos.autor.trim();
  if (datos.dificultad) sanitizado.dificultad = datos.dificultad;
  if (datos.horasJugadas !== undefined && datos.horasJugadas !== null)
    sanitizado.horasJugadas = Number(datos.horasJugadas);
  if (datos.recomendaria !== undefined)
    sanitizado.recomendaria = Boolean(datos.recomendaria);

  return sanitizado;
};

/**
 * 🔢 Middleware para validar parámetros de paginación
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const validarPaginacion = (req, res, next) => {
  const { pagina = 1, limite = 10 } = req.query;

  const paginaNum = parseInt(pagina);
  const limiteNum = parseInt(limite);

  if (isNaN(paginaNum) || paginaNum < 1) {
    return next(crearError("Página debe ser un número mayor a 0", 400));
  }

  if (isNaN(limiteNum) || limiteNum < 1 || limiteNum > 100) {
    return next(crearError("Límite debe ser un número entre 1 y 100", 400));
  }

  req.paginacion = {
    pagina: paginaNum,
    limite: limiteNum,
    skip: (paginaNum - 1) * limiteNum,
  };

  next();
};

module.exports = {
  validarId,
  validarJuego,
  validarResenia,
  validarPaginacion,
  sanitizarJuego,
  sanitizarResenia,
};
