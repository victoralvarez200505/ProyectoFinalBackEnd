/**
 * Utilidades de transformación de datos para manejar diferencias de esquema entre frontend y backend
 */

/**
 * Transforma objeto de juego del frontend al formato del backend
 * @param {Object} juegoFrontend - Objeto juego del frontend
 * @returns {Object} Objeto juego compatible con backend
 */
const transformarABackend = (juegoFrontend) => {
  const juegoBackend = {
    titulo: juegoFrontend.nombre,
    añoLanzamiento: juegoFrontend.año,
    imagenPortada: juegoFrontend.imagen || "",
    descripcion: juegoFrontend.resena || "",
    genero: juegoFrontend.genero,
    plataforma: juegoFrontend.plataforma,
    tienda: juegoFrontend.tienda || "",
    desarrollador: juegoFrontend.desarrollador || "",
    completado:
      juegoFrontend.completado !== undefined ? juegoFrontend.completado : false,
    horasJugadas:
      juegoFrontend.horasJugadas !== undefined ? juegoFrontend.horasJugadas : 0,
  };

  // Solo eliminar valores undefined de campos opcionales
  // Mantener genero, plataforma y titulo aunque sean undefined para que la validación los detecte
  const resultado = {};
  Object.entries(juegoBackend).forEach(([clave, valor]) => {
    // Siempre incluir campos requeridos para validación
    if (clave === "titulo" || clave === "genero" || clave === "plataforma") {
      resultado[clave] = valor;
    } else if (valor !== undefined) {
      // Solo incluir campos opcionales si tienen valor
      resultado[clave] = valor;
    }
  });

  return resultado;
};

/**
 * Transforma objeto de juego del backend al formato del frontend
 * @param {Object} juegoBackend - Objeto juego de MongoDB
 * @returns {Object} Objeto juego compatible con frontend
 */
const transformarAFrontend = (juegoBackend) => {
  if (!juegoBackend) return null;

  return {
    id: juegoBackend._id.toString(),
    nombre: juegoBackend.titulo,
    año: juegoBackend.añoLanzamiento,
    imagen: juegoBackend.imagenPortada || "",
    resena: juegoBackend.descripcion || "",
    genero: juegoBackend.genero,
    plataforma: juegoBackend.plataforma,
    tienda: juegoBackend.tienda || "",
    desarrollador: juegoBackend.desarrollador || "",
    completado: Boolean(juegoBackend.completado),
    horasJugadas: juegoBackend.horasJugadas || 0,
    fechaCreacion: juegoBackend.fechaCreacion
      ? new Date(juegoBackend.fechaCreacion).toISOString()
      : null,
  };
};

/**
 * Transforma array de juegos del backend al formato del frontend
 * @param {Array} juegosBackend - Array de objetos juego de MongoDB
 * @returns {Array} Array de objetos juego compatibles con frontend
 */
const transformarArrayAFrontend = (juegosBackend) => {
  if (!Array.isArray(juegosBackend)) return [];
  return juegosBackend.map(transformarAFrontend).filter(Boolean);
};

/**
 * Transforma objeto de resenia del frontend al formato del backend
 * @param {Object} reseniaFrontend - Objeto resenia del frontend
 * @returns {Object} Objeto resenia compatible con backend
 */
const transformarReseniaABackend = (reseniaFrontend = {}) => {
  const reseniaBackend = {
    juegoId: reseniaFrontend.juegoId,
    puntuacion:
      reseniaFrontend.puntuacion !== undefined &&
      reseniaFrontend.puntuacion !== null
        ? Number(reseniaFrontend.puntuacion)
        : undefined,
    textoResena:
      typeof reseniaFrontend.texto === "string"
        ? reseniaFrontend.texto.trim()
        : undefined,
    horasJugadas:
      reseniaFrontend.horasJugadas !== undefined &&
      reseniaFrontend.horasJugadas !== null
        ? Number(reseniaFrontend.horasJugadas)
        : undefined,
    dificultad: reseniaFrontend.dificultad,
    recomendaria:
      reseniaFrontend.recomendaria !== undefined
        ? Boolean(reseniaFrontend.recomendaria)
        : undefined,
  };

  const resultado = {};
  Object.entries(reseniaBackend).forEach(([clave, valor]) => {
    if (valor !== undefined) {
      resultado[clave] = valor;
    }
  });

  return resultado;
};

/**
 * Transforma objeto de resenia del backend al formato del frontend
 * @param {Object} reseniaBackend - Objeto resenia de MongoDB
 * @returns {Object|null} Objeto resenia compatible con frontend
 */
const transformarReseniaAFrontend = (reseniaBackend) => {
  if (!reseniaBackend) return null;

  return {
    id: reseniaBackend._id.toString(),
    juegoId:
      typeof reseniaBackend.juegoId === "object" &&
      reseniaBackend.juegoId !== null
        ? reseniaBackend.juegoId.toString()
        : reseniaBackend.juegoId || "",
    puntuacion:
      reseniaBackend.puntuacion !== undefined &&
      reseniaBackend.puntuacion !== null
        ? Number(reseniaBackend.puntuacion)
        : null,
    texto: reseniaBackend.textoResena || "",
    horasJugadas:
      reseniaBackend.horasJugadas !== undefined &&
      reseniaBackend.horasJugadas !== null
        ? Number(reseniaBackend.horasJugadas)
        : null,
    dificultad: reseniaBackend.dificultad || "",
    recomendaria: Boolean(reseniaBackend.recomendaria),
    fechaCreacion: reseniaBackend.fechaCreacion
      ? new Date(reseniaBackend.fechaCreacion).toISOString()
      : null,
    fechaActualizacion: reseniaBackend.fechaActualizacion
      ? new Date(reseniaBackend.fechaActualizacion).toISOString()
      : null,
  };
};

/**
 * Transforma array de resenias del backend al formato del frontend
 * @param {Array} reseniasBackend - Array de resenias de MongoDB
 * @returns {Array} Array de resenias transformadas
 */
const transformarArrayReseniasAFrontend = (reseniasBackend) => {
  if (!Array.isArray(reseniasBackend)) return [];
  return reseniasBackend.map(transformarReseniaAFrontend).filter(Boolean);
};

module.exports = {
  transformarABackend,
  transformarAFrontend,
  transformarArrayAFrontend,
  transformarReseniaABackend,
  transformarReseniaAFrontend,
  transformarArrayReseniasAFrontend,
};
