/**
 * 📝 RUTAS DE RESEÑAS
 * 
 * Este archivo define todas las rutas relacionadas con la gestión de reseñas.
 * Maneja las operaciones CRUD para las reseñas de los juegos.
 * 
 * Rutas disponibles:
 * - GET /api/resenias - Obtener todas las reseñas
 * - GET /api/resenias/:id - Obtener una reseña por ID
 * - GET /api/resenias/juego/:juegoId - Obtener reseñas de un juego específico
 * - POST /api/resenias - Crear una nueva reseña
 * - PUT /api/resenias/:id - Actualizar una reseña
 * - DELETE /api/resenias/:id - Eliminar una reseña
 */

const express = require("express");
const router = express.Router();

// Importar controladores
const reseniaController = require("../controllers/reseniaController");

// Importar middleware de validación
const { validarResenia, validarId } = require("../middleware/validacion");

/**
 * 📋 RUTAS DE CONSULTA (GET)
 */

// GET /api/resenias - Obtener todas las reseñas
router.get("/", reseniaController.obtenerTodasLasResenias);

// GET /api/resenias/:id - Obtener una reseña específica
router.get("/:id", validarId, reseniaController.obtenerReseniaPorId);

// GET /api/resenias/juego/:juegoId - Obtener reseñas de un juego específico
router.get("/juego/:juegoId", validarId, reseniaController.obtenerReseniasPorJuego);

/**
 * ✏️ RUTAS DE MODIFICACIÓN
 */

// POST /api/resenias - Crear nueva reseña
router.post("/", validarResenia, reseniaController.crearResenia);

// PUT /api/resenias/:id - Actualizar reseña existente
router.put("/:id", validarId, validarResenia, reseniaController.actualizarResenia);

// DELETE /api/resenias/:id - Eliminar reseña
router.delete("/:id", validarId, reseniaController.eliminarResenia);

/**
 * 📊 RUTAS DE ESTADÍSTICAS (futuras)
 */

// GET /api/resenias/stats/promedio/:juegoId - Promedio de calificaciones
// router.get("/stats/promedio/:juegoId", reseniaController.obtenerPromedioCalificaciones);

// GET /api/resenias/usuario/:usuarioId - Reseñas de un usuario específico
// router.get("/usuario/:usuarioId", reseniaController.obtenerReseniasPorUsuario);

module.exports = router;