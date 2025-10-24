/**
 * Utilidades de validación para datos de peticiones
 */

/**
 * Valida datos de juego
 * @param {Object} datos - Datos del juego a validar
 * @returns {Object} { valido: boolean, errores: string[] }
 */
const validarJuego = (datos) => {
  const errores = [];

  // Validar título
  if (
    !datos.titulo ||
    typeof datos.titulo !== "string" ||
    datos.titulo.trim() === ""
  ) {
    errores.push("El título es requerido y debe ser un texto válido");
  }

  // Validar género
  if (
    !datos.genero ||
    typeof datos.genero !== "string" ||
    datos.genero.trim() === ""
  ) {
    errores.push("El género es requerido");
  }

  // Validar plataforma
  if (
    !datos.plataforma ||
    typeof datos.plataforma !== "string" ||
    datos.plataforma.trim() === ""
  ) {
    errores.push("La plataforma es requerida");
  }

  // Validar año de lanzamiento (opcional pero si existe debe ser válido)
  if (
    datos.añoLanzamiento !== undefined &&
    datos.añoLanzamiento !== null &&
    datos.añoLanzamiento !== ""
  ) {
    const año = parseInt(datos.añoLanzamiento, 10);
    const añoActual = new Date().getFullYear();
    if (isNaN(año) || año < 1950 || año > añoActual + 5) {
      errores.push(
        `El año de lanzamiento debe estar entre 1950 y ${añoActual + 5}`
      );
    }
  }

  if (datos.tienda !== undefined && datos.tienda !== null) {
    if (typeof datos.tienda !== "string") {
      errores.push("La tienda debe ser un texto válido");
    }
  }

  return {
    valido: errores.length === 0,
    errores,
  };
};

/**
 * Valida datos de resenia
 * @param {Object} datos - Datos de la resenia a validar
 * @param {Object} opciones - Configuración de validación
 * @param {boolean} [opciones.parcial=false] - Indica si se permiten campos opcionales (PATCH/PUT parciales)
 * @returns {Object} { valido: boolean, errores: string[] }
 */
const validarResenia = (datos, { parcial = false } = {}) => {
  const errores = [];

  const camposEnviados = Object.keys(datos || {});

  if (!parcial && (!datos || camposEnviados.length === 0)) {
    errores.push("No se enviaron datos para la resenia");
    return { valido: false, errores };
  }

  if (parcial && camposEnviados.length === 0) {
    errores.push("No se enviaron campos para actualizar la resenia");
    return { valido: false, errores };
  }

  if (!parcial || camposEnviados.includes("juegoId")) {
    if (!datos.juegoId || typeof datos.juegoId !== "string") {
      errores.push("El juegoId es requerido");
    } else if (!validarObjectId(datos.juegoId)) {
      errores.push("El juegoId debe ser un ObjectId válido");
    }
  }

  if (!parcial || camposEnviados.includes("puntuacion")) {
    if (
      datos.puntuacion === undefined ||
      datos.puntuacion === null ||
      datos.puntuacion === ""
    ) {
      if (!parcial) {
        errores.push("La puntuación es requerida");
      }
    } else {
      const puntuacion = Number(datos.puntuacion);
      if (
        Number.isNaN(puntuacion) ||
        puntuacion < 1 ||
        puntuacion > 5 ||
        !Number.isInteger(puntuacion)
      ) {
        errores.push("La puntuación debe ser un número entero entre 1 y 5");
      }
    }
  }

  if (!parcial || camposEnviados.includes("textoResena")) {
    if (
      !datos.textoResena ||
      typeof datos.textoResena !== "string" ||
      datos.textoResena.trim().length < 10
    ) {
      errores.push("La resenia debe tener al menos 10 caracteres");
    }
  }

  if (!parcial || camposEnviados.includes("horasJugadas")) {
    if (
      datos.horasJugadas !== undefined &&
      datos.horasJugadas !== null &&
      datos.horasJugadas !== ""
    ) {
      const horas = Number(datos.horasJugadas);
      if (Number.isNaN(horas) || horas < 0) {
        errores.push("Las horas jugadas deben ser un número mayor o igual a 0");
      }
    }
  }

  if (!parcial || camposEnviados.includes("dificultad")) {
    if (!datos.dificultad || typeof datos.dificultad !== "string") {
      if (!parcial) {
        errores.push("La dificultad es requerida");
      }
    } else {
      const dificultadesPermitidas = [
        "Muy fácil",
        "Fácil",
        "Normal",
        "Difícil",
        "Muy difícil",
      ];
      if (!dificultadesPermitidas.includes(datos.dificultad)) {
        errores.push("La dificultad debe ser Fácil, Normal o Difícil");
      }
    }
  }

  if (!parcial || camposEnviados.includes("recomendaria")) {
    if (datos.recomendaria === undefined || datos.recomendaria === null) {
      if (!parcial) {
        errores.push("Debe indicarse si recomendarías el juego");
      }
    } else if (typeof datos.recomendaria !== "boolean") {
      errores.push("El campo recomendaria debe ser booleano");
    }
  }

  return {
    valido: errores.length === 0,
    errores,
  };
};

/**
 * Valida si un ID es un ObjectId válido de MongoDB
 * @param {string} id - ID a validar
 * @returns {boolean}
 */
const validarObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitiza y valida parámetros de consulta
 * @param {Object} consulta - Parámetros de consulta
 * @returns {Object} Consulta sanitizada
 */
const sanitizarConsulta = (consulta) => {
  const consultaSanitizada = {};

  if (consulta.limite) {
    const limite = parseInt(consulta.limite, 10);
    consultaSanitizada.limite =
      !isNaN(limite) && limite > 0 && limite <= 100 ? limite : 50;
  }

  if (consulta.genero) {
    consultaSanitizada.genero = consulta.genero.toString().trim();
  }

  if (consulta.plataforma) {
    consultaSanitizada.plataforma = consulta.plataforma.toString().trim();
  }

  if (consulta.buscar) {
    consultaSanitizada.buscar = consulta.buscar.toString().trim();
  }

  return consultaSanitizada;
};

module.exports = {
  validarJuego,
  validarResenia,
  validarObjectId,
  sanitizarConsulta,
};
