const Juego = require("../../models/juego");
const {
  transformarABackend,
  transformarAFrontend,
} = require("../../utils/transformer");
const { validarJuego } = require("../../utils/validation");

/**
 * Registra un nuevo juego en la base de datos
 * @param {Object} req - Petición HTTP con datos del juego
 * @param {Object} res - Respuesta HTTP
 * @param {Function} next - Función para pasar al siguiente middleware
 */
const crearJuego = async (req, res, next) => {
  try {
    // Debug: Ver qué datos llegan del frontend
    console.log("📥 Datos recibidos del frontend:", req.body);

    // Transformar datos del frontend al formato del backend
    const datosBackend = transformarABackend(req.body);
    console.log("🔄 Datos transformados al backend:", datosBackend);

    // Validar los datos
    const validacion = validarJuego(datosBackend);
    console.log("✅ Resultado de validación:", validacion);
    if (!validacion.valido) {
      return res.status(400).json({
        error: "Datos de validación incorrectos",
        detalles: validacion.errores,
      });
    }

    // Crear nueva instancia del modelo
    const nuevoJuego = new Juego({
      ...datosBackend,
      fechaCreacion: new Date(),
    });

    // Guardar en la base de datos
    const juegoGuardado = await nuevoJuego.save();

    // Transformar de vuelta al formato del frontend
    const juegoFormateado = transformarAFrontend(juegoGuardado);

    res.status(201).json(juegoFormateado);
  } catch (error) {
    console.error("Error registrando juego:", error);
    next(error);
  }
};
