const Resenia = require("../../models/resenia");
const { validarObjectId } = require("../../utils/validation");

/**
 * Actualiza una reseña existente
 * @param {Object} req - Petición HTTP con datos actualizados de la reseña
 * @param {Object} res - Respuesta HTTP
 * @param {Function} next - Función para pasar al siguiente middleware
 */
const actualizarResenia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comentario, puntuacion, nombreUsuario } = req.body;

    // Validar que el ID sea válido
    if (!validarObjectId(id)) {
      return res.status(400).json({ error: "ID de reseña no válido" });
    }

    // Verificar que la reseña existe
    const reseniaExistente = await Resenia.findById(id);
    if (!reseniaExistente) {
      return res.status(404).json({ error: "Reseña no encontrada" });
    }

    // Construir objeto de actualización solo con campos proporcionados
    const actualizacion = {};
    
    if (comentario !== undefined) {
      actualizacion.comentario = comentario;
    }
    
    if (puntuacion !== undefined) {
      // Validar puntuación si se proporciona
      if (puntuacion < 1 || puntuacion > 5) {
        return res.status(400).json({
          error: "Puntuación inválida",
          detalles: ["La puntuación debe estar entre 1 y 5"]
        });
      }
      actualizacion.puntuacion = puntuacion;
    }
    
    if (nombreUsuario !== undefined) {
      actualizacion.nombreUsuario = nombreUsuario;
    }

    // Agregar fecha de modificación
    actualizacion.fechaModificacion = new Date();

    // Actualizar la reseña
    const reseniaActualizada = await Resenia.findByIdAndUpdate(
      id,
      actualizacion,
      { new: true, runValidators: true }
    ).populate('juegoId', 'titulo');

    if (!reseniaActualizada) {
      return res.status(404).json({ error: "Reseña no encontrada" });
    }

    res.json(reseniaActualizada);
  } catch (error) {
    console.error("Error actualizando reseña:", error);
    next(error);
  }
};

module.exports = {
  actualizarResenia,
};