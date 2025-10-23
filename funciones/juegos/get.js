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

    // Construir filtro dinámico
    let filtro = {};

    if (genero) {
      filtro.genero = new RegExp(genero, "i"); // Búsqueda insensible a mayúsculas
    }

    if (plataforma) {
      filtro.plataforma = new RegExp(plataforma, "i");
    }

    if (buscar) {
      filtro.titulo = new RegExp(buscar, "i");
    }

    // Ejecutar consulta
    let query = Juego.find(filtro);

    // Aplicar límite si existe
    if (limite) {
      query = query.limit(limite);
    }

    const juegos = await query.exec();

    // Transformar array al formato del frontend
    const juegosFormateados = transformarArrayAFrontend(juegos);

    // Retornar formato consistente - solo el array para compatibilidad con frontend
    res.json(juegosFormateados);
  } catch (error) {
    console.error("Error obteniendo juegos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  obtenerJuegoPorId,
  obtenerTodosLosJuegos,
};
