const Juego = require("../../models/juego");
const { validarObjectId } = require("../../utils/validation");

/**
 * Elimina un juego de la base de datos
 * @param {Object} req - Petición HTTP con ID del juego a eliminar
 * @param {Object} res - Respuesta HTTP
 */
const eliminarJuego = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!validarObjectId(id)) {
      return res.status(400).json({ error: "ID no válido" });
    }

    // Eliminar permanentemente el juego
    const juegoEliminado = await Juego.findByIdAndDelete(id);

    if (!juegoEliminado) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }

    // Retornar respuesta de éxito simple (frontend espera void)
    res.status(204).send();
  } catch (error) {
    console.error("Error eliminando juego:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  eliminarJuego,
};
