/**
 * 🚨 MIDDLEWARE DE MANEJO DE ERRORES
 * 
 * Este middleware centraliza el manejo de errores de toda la aplicación.
 * Procesa diferentes tipos de errores y devuelve respuestas consistentes.
 * 
 * Tipos de errores manejados:
 * - Errores de validación de Mongoose
 * - Errores de duplicación (código 11000)
 * - Errores de casting de MongoDB
 * - Errores de autenticación (futuro)
 * - Errores internos del servidor
 */

const configuracion = require("../config/config");

/**
 * Middleware principal de manejo de errores
 * @param {Error} error - Error capturado
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let mensaje = "Error interno del servidor";
  let detalles = {};

  // 📝 Log del error para debugging
  console.error(`❌ Error en ${req.method} ${req.path}:`, error.message);
  
  // En desarrollo, mostrar stack trace completo
  if (configuracion.servidor.entorno === 'development') {
    console.error("Stack trace:", error.stack);
  }

  // 🔍 Identificar y manejar tipos específicos de errores
  
  // Error de validación de Mongoose
  if (error.name === "ValidationError") {
    statusCode = 400;
    mensaje = "Error de validación";
    detalles.errores = Object.values(error.errors).map((err) => ({
      campo: err.path,
      mensaje: err.message,
      valorRecibido: err.value
    }));
  }
  
  // Error de duplicación (clave única)
  else if (error.code === 11000) {
    statusCode = 409;
    mensaje = "Recurso duplicado";
    const campo = Object.keys(error.keyPattern)[0];
    detalles.mensaje = `Ya existe un registro con ese ${campo}`;
    detalles.campo = campo;
  }
  
  // Error de casting (ID inválido, etc.)
  else if (error.name === "CastError") {
    statusCode = 400;
    mensaje = "Formato de datos inválido";
    detalles.campo = error.path;
    detalles.valorRecibido = error.value;
    detalles.tipoEsperado = error.kind;
  }
  
  // Error de JSON malformado
  else if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    statusCode = 400;
    mensaje = "JSON malformado";
    detalles.descripcion = "El cuerpo de la solicitud contiene JSON inválido";
  }
  
  // Error personalizado con statusCode
  else if (error.statusCode) {
    statusCode = error.statusCode;
    mensaje = error.message;
  }
  
  // Error de autenticación (futuro)
  else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    mensaje = "Token inválido";
  }
  
  else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    mensaje = "Token expirado";
  }

  // 📊 Preparar respuesta de error
  const respuestaError = {
    error: true,
    mensaje,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    ...detalles
  };

  // En desarrollo, incluir información adicional
  if (configuracion.servidor.entorno === 'development') {
    respuestaError.stack = error.stack;
    respuestaError.errorCompleto = error.message;
  }

  // 📤 Enviar respuesta de error
  res.status(statusCode).json(respuestaError);
};

/**
 * 🚫 Middleware para rutas no encontradas (404)
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * 🔧 Función para crear errores personalizados
 * @param {string} mensaje - Mensaje del error
 * @param {number} statusCode - Código de estado HTTP
 * @returns {Error} Error personalizado
 */
const crearError = (mensaje, statusCode = 500) => {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
};

module.exports = {
  errorHandler,
  notFoundHandler,
  crearError
};