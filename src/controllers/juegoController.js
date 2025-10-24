/**
 * 🎮 CONTROLADOR DE JUEGOS
 * 
 * Este archivo contiene toda la lógica de negocio para manejar juegos.
 * Procesa las solicitudes HTTP y maneja la interacción con la base de datos.
 * 
 * Funcionalidades:
 * - Obtener todos los juegos con filtros
 * - Obtener un juego específico por ID
 * - Crear nuevos juegos
 * - Actualizar juegos existentes
 * - Eliminar juegos
 */

const Juego = require("../models/juego");
const { transformarAFrontend, transformarArrayAFrontend } = require("../utils/transformer");
const { crearError } = require("../middleware/errorHandler");

/**
 * 📋 Obtener todos los juegos
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const obtenerTodosLosJuegos = async (req, res, next) => {
  try {
    console.log("🔍 Obteniendo todos los juegos...");

    // Obtener parámetros de consulta
    const { 
      limite, 
      genero, 
      plataforma, 
      buscar, 
      completado,
      ordenarPor = 'fechaCreacion',
      orden = 'desc'
    } = req.query;

    // Construir filtro dinámico
    let filtro = {};

    if (genero) {
      filtro.genero = new RegExp(genero, "i");
    }

    if (plataforma) {
      filtro.plataforma = new RegExp(plataforma, "i");
    }

    if (completado !== undefined) {
      filtro.completado = completado === 'true';
    }

    if (buscar) {
      filtro.$or = [
        { nombre: new RegExp(buscar, "i") },
        { desarrollador: new RegExp(buscar, "i") },
        { tienda: new RegExp(buscar, "i") }
      ];
    }

    // Construir consulta
    let query = Juego.find(filtro);

    // Aplicar ordenamiento
    const ordenamientoValido = ['nombre', 'año', 'fechaCreacion', 'genero', 'plataforma'];
    if (ordenamientoValido.includes(ordenarPor)) {
      const direccion = orden === 'asc' ? 1 : -1;
      query = query.sort({ [ordenarPor]: direccion });
    }

    // Aplicar límite
    if (limite && !isNaN(limite) && limite > 0) {
      query = query.limit(parseInt(limite));
    }

    // Ejecutar consulta
    const juegos = await query.exec();

    console.log(`✅ Encontrados ${juegos.length} juegos`);

    // Transformar al formato del frontend
    const juegosFormateados = transformarArrayAFrontend(juegos);

    res.json(juegosFormateados);

  } catch (error) {
    console.error("❌ Error obteniendo juegos:", error);
    next(error);
  }
};

/**
 * 🎯 Obtener un juego específico por ID
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const obtenerJuegoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando juego con ID: ${id}`);

    const juegoEncontrado = await Juego.findById(id);

    if (!juegoEncontrado) {
      console.log(`❌ Juego no encontrado: ${id}`);
      return next(crearError("Juego no encontrado", 404));
    }

    console.log(`✅ Juego encontrado: ${juegoEncontrado.nombre}`);

    // Transformar al formato del frontend
    const juegoFormateado = transformarAFrontend(juegoEncontrado);
    res.json(juegoFormateado);

  } catch (error) {
    console.error("❌ Error obteniendo juego por ID:", error);
    next(error);
  }
};

/**
 * ➕ Crear un nuevo juego
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const crearJuego = async (req, res, next) => {
  try {
    console.log("➕ Creando nuevo juego:", req.body.nombre);

    // Verificar si ya existe un juego con el mismo nombre
    const juegoExistente = await Juego.findOne({ 
      nombre: new RegExp(`^${req.body.nombre}$`, 'i') 
    });

    if (juegoExistente) {
      return next(crearError("Ya existe un juego con ese nombre", 409));
    }

    // Crear nuevo juego
    const nuevoJuego = new Juego({
      ...req.body,
      fechaCreacion: new Date()
    });

    const juegoGuardado = await nuevoJuego.save();
    console.log(`✅ Juego creado exitosamente: ${juegoGuardado.nombre}`);

    // Transformar y responder
    const juegoFormateado = transformarAFrontend(juegoGuardado);
    res.status(201).json({
      mensaje: "Juego creado exitosamente",
      juego: juegoFormateado
    });

  } catch (error) {
    console.error("❌ Error creando juego:", error);
    next(error);
  }
};

/**
 * ✏️ Actualizar un juego existente
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const actualizarJuego = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`✏️ Actualizando juego: ${id}`);

    // Verificar si el juego existe
    const juegoExistente = await Juego.findById(id);
    if (!juegoExistente) {
      return next(crearError("Juego no encontrado", 404));
    }

    // Si se cambia el nombre, verificar que no exista otro juego con ese nombre
    if (req.body.nombre && req.body.nombre !== juegoExistente.nombre) {
      const nombreDuplicado = await Juego.findOne({ 
        nombre: new RegExp(`^${req.body.nombre}$`, 'i'),
        _id: { $ne: id }
      });

      if (nombreDuplicado) {
        return next(crearError("Ya existe otro juego con ese nombre", 409));
      }
    }

    // Actualizar juego
    const juegoActualizado = await Juego.findByIdAndUpdate(
      id,
      { ...req.body, fechaActualizacion: new Date() },
      { new: true, runValidators: true }
    );

    console.log(`✅ Juego actualizado: ${juegoActualizado.nombre}`);

    // Transformar y responder
    const juegoFormateado = transformarAFrontend(juegoActualizado);
    res.json({
      mensaje: "Juego actualizado exitosamente",
      juego: juegoFormateado
    });

  } catch (error) {
    console.error("❌ Error actualizando juego:", error);
    next(error);
  }
};

/**
 * 🗑️ Eliminar un juego
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const eliminarJuego = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando juego: ${id}`);

    const juegoEliminado = await Juego.findByIdAndDelete(id);

    if (!juegoEliminado) {
      return next(crearError("Juego no encontrado", 404));
    }

    console.log(`✅ Juego eliminado: ${juegoEliminado.nombre}`);

    res.json({
      mensaje: "Juego eliminado exitosamente",
      juego: {
        id: juegoEliminado._id,
        nombre: juegoEliminado.nombre
      }
    });

  } catch (error) {
    console.error("❌ Error eliminando juego:", error);
    next(error);
  }
};

/**
 * 📊 Obtener estadísticas de juegos (futuro)
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const obtenerEstadisticas = async (req, res, next) => {
  try {
    console.log("📊 Obteniendo estadísticas de juegos...");

    const estadisticas = await Juego.aggregate([
      {
        $group: {
          _id: null,
          totalJuegos: { $sum: 1 },
          juegsCompletados: { $sum: { $cond: ["$completado", 1, 0] } },
          horasTotales: { $sum: "$horasJugadas" },
          añoMasAntiguo: { $min: "$año" },
          añoMasReciente: { $max: "$año" }
        }
      },
      {
        $project: {
          _id: 0,
          totalJuegos: 1,
          juegsCompletados: 1,
          juegosPendientes: { $subtract: ["$totalJuegos", "$juegsCompletados"] },
          horasTotales: 1,
          añoMasAntiguo: 1,
          añoMasReciente: 1
        }
      }
    ]);

    const estadisticasPorGenero = await Juego.aggregate([
      {
        $group: {
          _id: "$genero",
          cantidad: { $sum: 1 },
          completados: { $sum: { $cond: ["$completado", 1, 0] } }
        }
      },
      {
        $sort: { cantidad: -1 }
      }
    ]);

    res.json({
      general: estadisticas[0] || {},
      porGenero: estadisticasPorGenero
    });

  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    next(error);
  }
};

module.exports = {
  obtenerTodosLosJuegos,
  obtenerJuegoPorId,
  crearJuego,
  actualizarJuego,
  eliminarJuego,
  obtenerEstadisticas
};