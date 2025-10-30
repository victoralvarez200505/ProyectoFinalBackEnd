const Juego = require("../../src/models/juego");
const {
  transformarABackend,
  transformarAFrontend,
} = require("../../utils/transformer");
const { validarObjectId, validarJuego } = require("../../utils/validation");

/**
 * Actualiza un juego existente
 * @param {Object} req - Petición HTTP con datos actualizados del juego
 * @param {Object} res - Respuesta HTTP
 * @param {Function} next - Función para pasar al siguiente middleware
 */
const actualizarJuego = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!validarObjectId(id)) {
      return res.status(400).json({ error: "ID no válido" });
    }

    // Transformar datos del frontend al formato del backend
    const datosBackend = transformarABackend(req.body);

    // Validar los datos
    const validacion = validarJuego(datosBackend);
    if (!validacion.valido) {
      return res.status(400).json({
        error: "Datos de validación incorrectos",
        detalles: validacion.errores,
      });
    }

    // Buscar y actualizar
    const juegoActualizado = await Juego.findByIdAndUpdate(id, datosBackend, {
      new: true, // Retorna el documento actualizado
      runValidators: true, // Ejecuta las validaciones del schema
    });

    if (!juegoActualizado) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }

    // Transformar de vuelta al formato del frontend
    const juegoFormateado = transformarAFrontend(juegoActualizado);

    res.json(juegoFormateado);
  } catch (error) {
    console.error("Error actualizando juego:", error);
    next(error);
  }
};

module.exports = {
  actualizarJuego,
};
