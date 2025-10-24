/**
 * 🔄 UTILIDADES DE TRANSFORMACIÓN
 * 
 * Este archivo maneja la transformación de datos entre el formato del frontend
 * y el formato del backend. Esto es necesario porque los esquemas pueden tener
 * nombres de campos diferentes entre ambas capas.
 * 
 * Transformaciones incluidas:
 * - Juegos: Frontend ↔ Backend
 * - Reseñas: Frontend ↔ Backend
 * - Arrays de datos
 * - Validación de datos transformados
 */

/**
 * 🎮 Transforma objeto de juego del frontend al formato del backend
 * @param {Object} juegoFrontend - Objeto juego del frontend
 * @returns {Object} Objeto juego compatible con backend
 */
const transformarABackend = (juegoFrontend) => {
  if (!juegoFrontend || typeof juegoFrontend !== 'object') {
    throw new Error('Datos de juego inválidos para transformar');
  }

  const juegoBackend = {
    // Mapeo de campos del frontend al backend
    nombre: juegoFrontend.nombre,
    año: juegoFrontend.año,
    imagen: juegoFrontend.imagen || "",
    resena: juegoFrontend.resena || "",
    genero: juegoFrontend.genero,
    plataforma: juegoFrontend.plataforma,
    tienda: juegoFrontend.tienda || "",
    desarrollador: juegoFrontend.desarrollador || "",
    completado: juegoFrontend.completado !== undefined ? Boolean(juegoFrontend.completado) : false,
    horasJugadas: juegoFrontend.horasJugadas !== undefined ? Number(juegoFrontend.horasJugadas) || 0 : 0,
  };

  // Limpiar campos undefined excepto los requeridos
  const resultado = {};
  Object.entries(juegoBackend).forEach(([clave, valor]) => {
    // Siempre incluir campos requeridos para validación
    if (['nombre', 'genero', 'plataforma', 'año'].includes(clave)) {
      resultado[clave] = valor;
    } else if (valor !== undefined && valor !== null) {
      // Solo incluir campos opcionales si tienen valor
      resultado[clave] = valor;
    }
  });

  return resultado;
};

/**
 * 🎮 Transforma objeto de juego del backend al formato del frontend
 * @param {Object} juegoBackend - Objeto juego de MongoDB
 * @returns {Object} Objeto juego compatible con frontend
 */
const transformarAFrontend = (juegoBackend) => {
  if (!juegoBackend) return null;

  try {
    return {
      id: juegoBackend._id ? juegoBackend._id.toString() : '',
      nombre: juegoBackend.nombre || juegoBackend.titulo || '', // Compatibilidad con esquema anterior
      año: juegoBackend.año || juegoBackend.añoLanzamiento || new Date().getFullYear(),
      imagen: juegoBackend.imagen || juegoBackend.imagenPortada || "",
      resena: juegoBackend.resena || juegoBackend.descripcion || "",
      genero: juegoBackend.genero || "",
      plataforma: juegoBackend.plataforma || "",
      tienda: juegoBackend.tienda || "",
      desarrollador: juegoBackend.desarrollador || "",
      completado: Boolean(juegoBackend.completado),
      horasJugadas: Number(juegoBackend.horasJugadas) || 0,
      fechaCreacion: juegoBackend.fechaCreacion 
        ? new Date(juegoBackend.fechaCreacion).toISOString()
        : null,
      fechaActualizacion: juegoBackend.fechaActualizacion
        ? new Date(juegoBackend.fechaActualizacion).toISOString()
        : null
    };
  } catch (error) {
    console.error('Error transformando juego a frontend:', error);
    return null;
  }
};

/**
 * 🎮 Transforma array de juegos del backend al formato del frontend
 * @param {Array} juegosBackend - Array de objetos juego de MongoDB
 * @returns {Array} Array de objetos juego compatibles con frontend
 */
const transformarArrayAFrontend = (juegosBackend) => {
  if (!Array.isArray(juegosBackend)) {
    console.warn('Se esperaba un array para transformar juegos');
    return [];
  }

  return juegosBackend
    .map(transformarAFrontend)
    .filter(juego => juego !== null);
};

/**
 * 📝 Transforma objeto de reseña del frontend al formato del backend
 * @param {Object} reseniaFrontend - Objeto reseña del frontend
 * @returns {Object} Objeto reseña compatible con backend
 */
const transformarReseniaABackend = (reseniaFrontend = {}) => {
  if (!reseniaFrontend || typeof reseniaFrontend !== 'object') {
    throw new Error('Datos de reseña inválidos para transformar');
  }

  const reseniaBackend = {
    juegoId: reseniaFrontend.juegoId,
    contenido: reseniaFrontend.contenido || reseniaFrontend.texto || reseniaFrontend.textoResena,
    calificacion: reseniaFrontend.calificacion || reseniaFrontend.puntuacion,
    autor: reseniaFrontend.autor || 'Anónimo',
    dificultad: reseniaFrontend.dificultad || 'Normal',
    recomendaria: reseniaFrontend.recomendaria !== undefined 
      ? Boolean(reseniaFrontend.recomendaria) 
      : true,
    horasJugadas: reseniaFrontend.horasJugadas ? Number(reseniaFrontend.horasJugadas) : 0
  };

  // Limpiar campos undefined
  const resultado = {};
  Object.entries(reseniaBackend).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      resultado[clave] = valor;
    }
  });

  return resultado;
};

/**
 * 📝 Transforma objeto de reseña del backend al formato del frontend
 * @param {Object} reseniaBackend - Objeto reseña de MongoDB
 * @returns {Object|null} Objeto reseña compatible con frontend
 */
const transformarReseniaAFrontend = (reseniaBackend) => {
  if (!reseniaBackend) return null;

  try {
    const resultado = {
      id: reseniaBackend._id ? reseniaBackend._id.toString() : '',
      juegoId: '',
      contenido: reseniaBackend.contenido || reseniaBackend.textoResena || '',
      calificacion: Number(reseniaBackend.calificacion || reseniaBackend.puntuacion) || 1,
      autor: reseniaBackend.autor || 'Anónimo',
      dificultad: reseniaBackend.dificultad || 'Normal',
      recomendaria: Boolean(reseniaBackend.recomendaria),
      horasJugadas: Number(reseniaBackend.horasJugadas) || 0,
      fechaCreacion: reseniaBackend.fechaCreacion 
        ? new Date(reseniaBackend.fechaCreacion).toISOString()
        : null,
      fechaActualizacion: reseniaBackend.fechaActualizacion
        ? new Date(reseniaBackend.fechaActualizacion).toISOString()
        : null
    };

    // Manejar juegoId que puede ser ObjectId o string o objeto poblado
    if (reseniaBackend.juegoId) {
      if (typeof reseniaBackend.juegoId === 'object' && reseniaBackend.juegoId._id) {
        // Objeto poblado con datos del juego
        resultado.juegoId = reseniaBackend.juegoId._id.toString();
        resultado.juegoNombre = reseniaBackend.juegoId.nombre || reseniaBackend.juegoId.titulo;
        resultado.juegoGenero = reseniaBackend.juegoId.genero;
      } else {
        // ObjectId simple
        resultado.juegoId = reseniaBackend.juegoId.toString();
      }
    }

    return resultado;
  } catch (error) {
    console.error('Error transformando reseña a frontend:', error);
    return null;
  }
};

/**
 * 📝 Transforma array de reseñas del backend al formato del frontend
 * @param {Array} reseniasBackend - Array de reseñas de MongoDB
 * @returns {Array} Array de reseñas transformadas
 */
const transformarArrayReseniasAFrontend = (reseniasBackend) => {
  if (!Array.isArray(reseniasBackend)) {
    console.warn('Se esperaba un array para transformar reseñas');
    return [];
  }

  return reseniasBackend
    .map(transformarReseniaAFrontend)
    .filter(resenia => resenia !== null);
};

/**
 * 🔍 Valida que un objeto tenga la estructura básica de juego
 * @param {Object} juego - Objeto a validar
 * @returns {boolean} True si es válido
 */
const validarEstructuraJuego = (juego) => {
  return juego && 
         typeof juego === 'object' &&
         typeof juego.nombre === 'string' &&
         typeof juego.genero === 'string' &&
         typeof juego.plataforma === 'string' &&
         typeof juego.año === 'number';
};

/**
 * 🔍 Valida que un objeto tenga la estructura básica de reseña
 * @param {Object} resenia - Objeto a validar
 * @returns {boolean} True si es válido
 */
const validarEstructuraResenia = (resenia) => {
  return resenia && 
         typeof resenia === 'object' &&
         typeof resenia.contenido === 'string' &&
         typeof resenia.calificacion === 'number' &&
         resenia.calificacion >= 1 &&
         resenia.calificacion <= 5;
};

/**
 * 🧹 Limpia y sanitiza campos de texto
 * @param {string} texto - Texto a limpiar
 * @returns {string} Texto limpio
 */
const limpiarTexto = (texto) => {
  if (typeof texto !== 'string') return '';
  return texto.trim().replace(/\s+/g, ' '); // Eliminar espacios extra
};

/**
 * 📊 Transforma datos para estadísticas
 * @param {Array} datos - Array de datos a procesar
 * @returns {Object} Estadísticas procesadas
 */
const transformarEstadisticas = (datos) => {
  if (!Array.isArray(datos)) return {};

  return {
    total: datos.length,
    ultimaActualizacion: new Date().toISOString(),
    procesados: datos.length
  };
};

module.exports = {
  // Funciones principales
  transformarABackend,
  transformarAFrontend,
  transformarArrayAFrontend,
  transformarReseniaABackend,
  transformarReseniaAFrontend,
  transformarArrayReseniasAFrontend,
  
  // Utilidades de validación
  validarEstructuraJuego,
  validarEstructuraResenia,
  limpiarTexto,
  transformarEstadisticas
};