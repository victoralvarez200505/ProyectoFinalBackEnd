const Resenia = require("../../models/resenia");
const { validarObjectId } = require("../../utils/validation");

/**
 * Elimina una reseña específica
 * @param {Object} req - Petición HTTP con ID de la reseña
 * @param {Object} res - Respuesta HTTP
 * @param {Function} next - Función para pasar al siguiente middleware
 */
const eliminarResenia = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea válido
    if (!validarObjectId(id)) {
      return res.status(400).json({ error: "ID de reseña no válido" });
    }

    // Buscar y eliminar la reseña
    const reseniaEliminada = await Resenia.findByIdAndDelete(id);

    if (!reseniaEliminada) {
      return res.status(404).json({ error: "Reseña no encontrada" });
    }

    res.json({
      mensaje: "Reseña eliminada exitosamente",
      reseniaEliminada: {
        id: reseniaEliminada._id,
        comentario: reseniaEliminada.comentario,
        puntuacion: reseniaEliminada.puntuacion,
        nombreUsuario: reseniaEliminada.nombreUsuario
      }
    });
  } catch (error) {
    console.error("Error eliminando reseña:", error);
    next(error);
  }
};

module.exports = {
  eliminarResenia,
};