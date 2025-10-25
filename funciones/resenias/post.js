const Resenia = require("../../models/resenia");
const Juego = require("../../models/juego");
const { validarObjectId } = require("../../utils/validation");

/**
 * Crea una nueva reseña para un juego
 * @param {Object} req - Petición HTTP con datos de la reseña
 * @param {Object} res - Respuesta HTTP
 * @param {Function} next - Función para pasar al siguiente middleware
 */
const crearResenia = async (req, res, next) => {
  try {
    const { juegoId, comentario, puntuacion, nombreUsuario } = req.body;

    // Validar que el ID del juego sea válido
    if (!validarObjectId(juegoId)) {
      return res.status(400).json({ error: "ID de juego no válido" });
    }

    // Verificar que el juego existe
    const juegoExiste = await Juego.findById(juegoId);
    if (!juegoExiste) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }

    // Validar datos requeridos
    if (!comentario || !puntuacion || !nombreUsuario) {
      return res.status(400).json({
        error: "Faltan datos requeridos",
        detalles: ["comentario", "puntuacion", "nombreUsuario son requeridos"]
      });
    }

    // Validar puntuación (debe estar entre 1 y 5)
    if (puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({
        error: "Puntuación inválida",
        detalles: ["La puntuación debe estar entre 1 y 5"]
      });
    }

    // Crear nueva reseña
    const nuevaResenia = new Resenia({
      juegoId,
      comentario,
      puntuacion,
      nombreUsuario,
      fechaCreacion: new Date(),
    });

    // Guardar en la base de datos
    const reseniaGuardada = await nuevaResenia.save();
    
    // Poblar la referencia al juego antes de devolver
    await reseniaGuardada.populate('juegoId', 'titulo');

    res.status(201).json(reseniaGuardada);
  } catch (error) {
    console.error("Error creando reseña:", error);
    next(error);
  }
};

module.exports = {
  crearResenia,
};