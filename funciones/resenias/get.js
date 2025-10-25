const mongoose = require("mongoose");
const Resenia = require("../../models/resenia");
const {
  validarObjectId,
  sanitizarConsulta,
} = require("../../utils/validation");

/**
 * Obtiene todas las reseñas con filtros opcionales
 * @param {Object} req - Petición HTTP
 * @param {Object} res - Respuesta HTTP
 */
const obtenerTodasLasResenias = async (req, res) => {
  try {
    // Sanitizar y validar parámetros de consulta
    const consultaSanitizada = sanitizarConsulta(req.query);
    const { limite, juegoId } = consultaSanitizada;

    // Construir filtro dinámico
    let filtro = {};

    if (juegoId) {
      if (!validarObjectId(juegoId)) {
        return res.status(400).json({ error: "ID de juego no válido" });
      }
      filtro.juegoId = juegoId;
    }

    // Ejecutar consulta
    let query = Resenia.find(filtro).populate('juegoId', 'titulo');

    // Aplicar límite si existe
    if (limite) {
      query = query.limit(limite);
    }

    const resenias = await query.exec();

    res.json(resenias);
  } catch (error) {
    console.error("Error obteniendo reseñas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Obtiene todas las reseñas de un juego específico
 * @param {Object} req - Petición HTTP
 * @param {Object} res - Respuesta HTTP
 */
const obtenerReseniasPorJuego = async (req, res) => {
  try {
    const { juegoId } = req.params;

    // Validar que el ID sea válido de MongoDB
    if (!validarObjectId(juegoId)) {
      return res.status(400).json({ error: "ID de juego no válido" });
    }

    const resenias = await Resenia.find({ juegoId }).populate('juegoId', 'titulo');

    res.json(resenias);
  } catch (error) {
    console.error("Error obteniendo reseñas por juego:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  obtenerTodasLasResenias,
  obtenerReseniasPorJuego,
};