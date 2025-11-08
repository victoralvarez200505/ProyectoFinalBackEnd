const mongoose = require("mongoose");
const Juego = require("../../models/juego");
const {
  transformarAFrontend,
  transformarArrayAFrontend,
} = require("../../utils/transformer");
const {
  validarObjectId,
  sanitizarConsulta,
} = require("../../utils/validation");

/**
 * Obtiene un juego específico por su ID
 * @param {Object} req - Petición HTTP
 * @param {Object} res - Respuesta HTTP
 */
const obtenerJuegoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea válido de MongoDB
    if (!validarObjectId(id)) {
      return res.status(400).json({ error: "ID no válido" });
    }

    const juegoEncontrado = await Juego.findById(id);

    if (!juegoEncontrado) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }

    // Transformar al formato del frontend
    const juegoFormateado = transformarAFrontend(juegoEncontrado);
    res.json(juegoFormateado);
  } catch (error) {
    console.error("Error obteniendo juego:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Obtiene todos los juegos con filtros opcionales
 * @param {Object} req - Petición HTTP
 * @param {Object} res - Respuesta HTTP
 */
const obtenerTodosLosJuegos = async (req, res) => {
  try {
    // Sanitizar y validar parámetros de consulta
    const consultaSanitizada = sanitizarConsulta(req.query);
    const { limite, genero, plataforma, buscar } = consultaSanitizada;
    // ...resto del código...
  } catch (error) {
    console.error("Error obteniendo juegos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
