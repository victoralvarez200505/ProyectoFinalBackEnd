/**
 * 📝 CONTROLADOR DE RESEÑAS
 *
 * Este archivo contiene toda la lógica de negocio para manejar reseñas.
 * Procesa las solicitudes HTTP y maneja la interacción con la base de datos.
 *
 * Funcionalidades:
 * - Obtener todas las reseñas
 * - Obtener reseñas de un juego específico
 * - Obtener una reseña por ID
 * - Crear nuevas reseñas
 * - Actualizar reseñas existentes
 * - Eliminar reseñas
 */

const Resenia = require("../models/resenia");
const Juego = require("../models/juego");
const {
  transformarArrayReseniasAFrontend,
  transformarReseniaAFrontend,
} = require("../utils/transformer");
const { crearError } = require("../middleware/errorHandler");

/**
 * 📋 Obtener todas las reseñas
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const obtenerTodasLasResenias = async (req, res, next) => {
  try {
    console.log("🔍 Obteniendo todas las reseñas...");

    const {
      limite,
      juegoId,
      calificacion,
      ordenarPor = "fechaCreacion",
      orden = "desc",
    } = req.query;

    // Construir filtro
    let filtro = {};

    if (juegoId) {
      filtro.juegoId = juegoId;
    }

    if (calificacion) {
      filtro.calificacion = parseInt(calificacion);
    }

    // Construir consulta con populate para obtener datos del juego
    let query = Resenia.find(filtro).populate("juegoId", "nombre genero");

    // Aplicar ordenamiento
    const ordenamientoValido = ["fechaCreacion", "calificacion", "autor"];
    if (ordenamientoValido.includes(ordenarPor)) {
      const direccion = orden === "asc" ? 1 : -1;
      query = query.sort({ [ordenarPor]: direccion });
    }

    // Aplicar límite
    if (limite && !isNaN(limite) && limite > 0) {
      query = query.limit(parseInt(limite));
    }

    const resenias = await query.exec();
    console.log(`✅ Encontradas ${resenias.length} reseñas`);

    // Transformar al formato del frontend
    const reseniasFormateadas = transformarArrayReseniasAFrontend(resenias);
    res.json(reseniasFormateadas);
  } catch (error) {
    console.error("❌ Error obteniendo reseñas:", error);
    next(error);
  }
};

/**
 * 🎯 Obtener reseñas de un juego específico
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const obtenerReseniasPorJuego = async (req, res, next) => {
  try {
    const { juegoId } = req.params;
    console.log(`🔍 Obteniendo reseñas del juego: ${juegoId}`);

    // Verificar que el juego existe
    const juegoExiste = await Juego.findById(juegoId);
    if (!juegoExiste) {
      return next(crearError("Juego no encontrado", 404));
    }

    const resenias = await Resenia.find({ juegoId })
      .populate("juegoId", "nombre")
      .sort({ fechaCreacion: -1 });

    console.log(`✅ Encontradas ${resenias.length} reseñas para el juego`);

    const reseniasFormateadas = transformarArrayReseniasAFrontend(resenias);
    res.json(reseniasFormateadas);
  } catch (error) {
    console.error("❌ Error obteniendo reseñas por juego:", error);
    next(error);
  }
};

/**
 * 🎯 Obtener una reseña específica por ID
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const obtenerReseniaPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando reseña con ID: ${id}`);

    const reseniaEncontrada = await Resenia.findById(id).populate(
      "juegoId",
      "nombre genero"
    );

    if (!reseniaEncontrada) {
      console.log(`❌ Reseña no encontrada: ${id}`);
      return next(crearError("Reseña no encontrada", 404));
    }

    console.log(`✅ Reseña encontrada`);

    const reseniaFormateada = transformarReseniaAFrontend(reseniaEncontrada);
    res.json(reseniaFormateada);
  } catch (error) {
    console.error("❌ Error obteniendo reseña por ID:", error);
    next(error);
  }
};

/**
 * ➕ Crear una nueva reseña
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const crearResenia = async (req, res, next) => {
  console.log("🚩 Handler crearResenia alcanzado");
  try {
    const {
      juegoId,
      contenido,
      calificacion,
      autor,
      dificultad,
      horasJugadas,
      recomendaria,
    } = req.body;
    console.log(`➕ Creando reseña para juego: ${juegoId}`);
    console.log("📦 Body recibido:", req.body);

    // Verificar que el juego existe
    const juegoExiste = await Juego.findById(juegoId);
    if (!juegoExiste) {
      return next(crearError("Juego no encontrado", 404));
    }

    // Crear nueva reseña (incluyendo dificultad, horasJugadas y recomendaria)
    const nuevaResenia = new Resenia({
      juegoId,
      contenido,
      calificacion,
      autor: autor || "Anónimo",
      dificultad,
      horasJugadas,
      recomendaria,
      fechaCreacion: new Date(),
    });

    const reseniaGuardada = await nuevaResenia.save();

    // Obtener la reseña con datos del juego populados
    const reseniaCompleta = await Resenia.findById(
      reseniaGuardada._id
    ).populate("juegoId", "nombre genero");

    console.log(`✅ Reseña creada exitosamente`);

    const reseniaFormateada = transformarReseniaAFrontend(reseniaCompleta);
    res.status(201).json({
      mensaje: "Reseña creada exitosamente",
      resenia: reseniaFormateada,
    });
  } catch (error) {
    console.error("❌ Error creando reseña (stack):", error && error.stack);
    if (error && error.errors) {
      Object.values(error.errors).forEach((e) => {
        console.error("❌ Error de validación:", e.message);
      });
    }
    if (error && error.message) {
      console.error("❌ Error mensaje:", error.message);
    }
    console.error("❌ Error creando reseña (obj):", error);
    next(error);
  }
};

/**
 * ✏️ Actualizar una reseña existente
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const actualizarResenia = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`✏️ Actualizando reseña: ${id}`);

    // Verificar si la reseña existe
    const reseniaExistente = await Resenia.findById(id);
    if (!reseniaExistente) {
      return next(crearError("Reseña no encontrada", 404));
    }

    // Si se cambia el juegoId, verificar que el nuevo juego existe
    if (
      req.body.juegoId &&
      req.body.juegoId !== reseniaExistente.juegoId.toString()
    ) {
      const juegoExiste = await Juego.findById(req.body.juegoId);
      if (!juegoExiste) {
        return next(crearError("Juego no encontrado", 404));
      }
    }

    // Actualizar reseña
    const reseniaActualizada = await Resenia.findByIdAndUpdate(
      id,
      { ...req.body, fechaActualizacion: new Date() },
      { new: true, runValidators: true }
    ).populate("juegoId", "nombre genero");

    console.log(`✅ Reseña actualizada`);

    const reseniaFormateada = transformarReseniaAFrontend(reseniaActualizada);
    res.json({
      mensaje: "Reseña actualizada exitosamente",
      resenia: reseniaFormateada,
    });
  } catch (error) {
    console.error("❌ Error actualizando reseña:", error);
    next(error);
  }
};

/**
 * 🗑️ Eliminar una reseña
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const eliminarResenia = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando reseña: ${id}`);

    const reseniaEliminada = await Resenia.findByIdAndDelete(id);

    if (!reseniaEliminada) {
      return next(crearError("Reseña no encontrada", 404));
    }

    console.log(`✅ Reseña eliminada`);

    res.json({
      mensaje: "Reseña eliminada exitosamente",
      resenia: {
        id: reseniaEliminada._id,
        juegoId: reseniaEliminada.juegoId,
      },
    });
  } catch (error) {
    console.error("❌ Error eliminando reseña:", error);
    next(error);
  }
};

/**
 * 📊 Obtener estadísticas de reseñas para un juego
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const obtenerEstadisticasJuego = async (req, res, next) => {
  try {
    const { juegoId } = req.params;
    console.log(`📊 Obteniendo estadísticas de reseñas para juego: ${juegoId}`);

    const estadisticas = await Resenia.aggregate([
      { $match: { juegoId: require("mongoose").Types.ObjectId(juegoId) } },
      {
        $group: {
          _id: null,
          totalResenias: { $sum: 1 },
          promedioCalificacion: { $avg: "$calificacion" },
          calificacionMaxima: { $max: "$calificacion" },
          calificacionMinima: { $min: "$calificacion" },
        },
      },
    ]);

    const distribucionCalificaciones = await Resenia.aggregate([
      { $match: { juegoId: require("mongoose").Types.ObjectId(juegoId) } },
      {
        $group: {
          _id: "$calificacion",
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      estadisticas: estadisticas[0] || {
        totalResenias: 0,
        promedioCalificacion: 0,
        calificacionMaxima: 0,
        calificacionMinima: 0,
      },
      distribucion: distribucionCalificaciones,
    });
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    next(error);
  }
};

module.exports = {
  obtenerTodasLasResenias,
  obtenerReseniasPorJuego,
  obtenerReseniaPorId,
  crearResenia,
  actualizarResenia,
  eliminarResenia,
  obtenerEstadisticasJuego,
};
