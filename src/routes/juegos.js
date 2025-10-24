/**
 * 🎮 RUTAS DE JUEGOS
 * 
 * Este archivo define todas las rutas relacionadas con la gestión de juegos.
 * Separa la definición de rutas de la lógica de negocio (controladores).
 * 
 * Rutas disponibles:
 * - GET /api/juegos - Obtener todos los juegos
 * - GET /api/juegos/:id - Obtener un juego por ID
 * - POST /api/juegos - Crear un nuevo juego
 * - PUT /api/juegos/:id - Actualizar un juego
 * - DELETE /api/juegos/:id - Eliminar un juego
 */

const express = require("express");
const router = express.Router();

// Importar controladores
const juegoController = require("../controllers/juegoController");

// Importar middleware de validación
const { validarJuego, validarId } = require("../middleware/validacion");

/**
 * 📋 RUTAS DE CONSULTA (GET)
 */

// GET /api/juegos - Obtener todos los juegos
router.get("/", juegoController.obtenerTodosLosJuegos);

// GET /api/juegos/:id - Obtener un juego específico
router.get("/:id", validarId, juegoController.obtenerJuegoPorId);

/**
 * ✏️ RUTAS DE MODIFICACIÓN
 */

// POST /api/juegos - Crear nuevo juego
router.post("/", validarJuego, juegoController.crearJuego);

// PUT /api/juegos/:id - Actualizar juego existente
router.put("/:id", validarId, validarJuego, juegoController.actualizarJuego);

// DELETE /api/juegos/:id - Eliminar juego
router.delete("/:id", validarId, juegoController.eliminarJuego);

/**
 * 📊 RUTAS DE ESTADÍSTICAS (futuras)
 */

// GET /api/juegos/stats/general - Estadísticas generales
// router.get("/stats/general", juegoController.obtenerEstadisticas);

// GET /api/juegos/genero/:genero - Juegos por género
// router.get("/genero/:genero", juegoController.obtenerPorGenero);

module.exports = router;