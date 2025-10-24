/**
 * 🎮 CONTROLADOR DE JUEGOS
 * 
 * Este archivo contiene toda la lógica de negocio para manejar juegos.
 * Ahora utiliza el servicio de juegos para separar responsabilidades.
 * 
 * Funcionalidades:
 * - Delegar operaciones al servicio
 * - Manejar respuestas HTTP
 * - Gestionar errores de manera consistente
 */

const juegoService = require("../services/juegoService");

/**
 * 📋 Obtener todos los juegos
 */
const obtenerTodosLosJuegos = async (req, res, next) => {
  try {
    console.log("🔍 Controlador: Obteniendo todos los juegos...");
    
    const resultado = await juegoService.obtenerTodos(req.query);
    
    // Para compatibilidad con frontend, devolver solo el array de juegos
    // si no se solicita paginación
    if (!req.query.pagina) {
      return res.json(resultado.juegos);
    }
    
    res.json(resultado);
  } catch (error) {
    console.error("❌ Error en controlador de juegos:", error);
    next(error);
  }
};

/**
 * 🎯 Obtener un juego específico por ID
 */
const obtenerJuegoPorId = async (req, res, next) => {
  try {
    console.log(`🔍 Controlador: Buscando juego con ID: ${req.params.id}`);
    
    const juego = await juegoService.obtenerPorId(req.params.id);
    res.json(juego);
  } catch (error) {
    console.error("❌ Error obteniendo juego por ID:", error);
    next(error);
  }
};

/**
 * ➕ Crear un nuevo juego
 */
const crearJuego = async (req, res, next) => {
  try {
    console.log("➕ Controlador: Creando nuevo juego:", req.body.nombre);
    
    const juego = await juegoService.crear(req.body);
    
    res.status(201).json({
      mensaje: "Juego creado exitosamente",
      juego
    });
  } catch (error) {
    console.error("❌ Error creando juego:", error);
    next(error);
  }
};

/**
 * ✏️ Actualizar un juego existente
 */
const actualizarJuego = async (req, res, next) => {
  try {
    console.log(`✏️ Controlador: Actualizando juego: ${req.params.id}`);
    
    const juego = await juegoService.actualizar(req.params.id, req.body);
    
    res.json({
      mensaje: "Juego actualizado exitosamente",
      juego
    });
  } catch (error) {
    console.error("❌ Error actualizando juego:", error);
    next(error);
  }
};

/**
 * 🗑️ Eliminar un juego
 */
const eliminarJuego = async (req, res, next) => {
  try {
    console.log(`🗑️ Controlador: Eliminando juego: ${req.params.id}`);
    
    const resultado = await juegoService.eliminar(req.params.id);
    res.json(resultado);
  } catch (error) {
    console.error("❌ Error eliminando juego:", error);
    next(error);
  }
};

/**
 * 📊 Obtener estadísticas de juegos
 */
const obtenerEstadisticas = async (req, res, next) => {
  try {
    console.log("📊 Controlador: Obteniendo estadísticas de juegos...");
    
    const estadisticas = await juegoService.obtenerEstadisticas();
    res.json(estadisticas);
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    next(error);
  }
};

module.exports = {
  obtenerTodosLosJuegos,
  obtenerJuegoPorId,
  crearJuego,
  actualizarJuego,
  eliminarJuego,
  obtenerEstadisticas
};