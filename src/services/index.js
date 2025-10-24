/**
 * 🔧 ÍNDICE DE SERVICIOS
 * 
 * Este archivo centraliza la exportación de todos los servicios,
 * facilitando su importación en otras partes de la aplicación.
 * 
 * Servicios disponibles:
 * - juegoService: Gestión completa de juegos
 * - reseniaService: Gestión completa de reseñas
 * - estadisticasService: Análisis y reportes
 */

const juegoService = require('./juegoService');
const reseniaService = require('./reseniaService');
const estadisticasService = require('./estadisticasService');

module.exports = {
  juegoService,
  reseniaService,
  estadisticasService
};

// También exportar individualmente para compatibilidad
module.exports.JuegoService = juegoService;
module.exports.ReseniaService = reseniaService;
module.exports.EstadisticasService = estadisticasService;