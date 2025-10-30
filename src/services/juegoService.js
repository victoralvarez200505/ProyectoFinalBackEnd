/**
 * 🎮 SERVICIO DE JUEGOS
 *
 * Este servicio encapsula toda la lógica de negocio relacionada con juegos.
 * Proporciona una capa de abstracción entre los controladores y los modelos.
 *
 * Funcionalidades:
 * - Operaciones CRUD optimizadas
 * - Búsquedas avanzadas
 * - Validaciones de negocio
 * - Estadísticas y reportes
 * - Cache de consultas frecuentes
 */

const Juego = require("../models/juego");
const {
  transformarAFrontend,
  transformarArrayAFrontend,
} = require("../utils/transformer");

class JuegoService {
  /**
   * 📋 Obtener todos los juegos con filtros avanzados
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Promise<Array>} Lista de juegos
   */
  async obtenerTodos(filtros = {}) {
    try {
      const {
        genero,
        plataforma,
        completado,
        buscar,
        añoDesde,
        añoHasta,
        limite = 100,
        pagina = 1,
        ordenarPor = "fechaCreacion",
        orden = "desc",
      } = filtros;

      // Construir query de MongoDB
      let query = {};

      // Filtros básicos
      if (genero) query.genero = new RegExp(genero, "i");
      if (plataforma) query.plataforma = new RegExp(plataforma, "i");
      if (completado !== undefined) query.completado = completado === "true";

      // Filtro de años
      if (añoDesde || añoHasta) {
        query.año = {};
        if (añoDesde) query.año.$gte = parseInt(añoDesde);
        if (añoHasta) query.año.$lte = parseInt(añoHasta);
      }

      // Búsqueda de texto
      if (buscar) {
        query.$or = [
          { nombre: new RegExp(buscar, "i") },
          { desarrollador: new RegExp(buscar, "i") },
          { tienda: new RegExp(buscar, "i") },
          { sinopsis: new RegExp(buscar, "i") },
        ];
      }

      // Configurar paginación
      const skip = (parseInt(pagina) - 1) * parseInt(limite);

      // Ejecutar consulta
      const juegos = await Juego.find(query)
        .sort({ [ordenarPor]: orden === "asc" ? 1 : -1 })
        .limit(parseInt(limite))
        .skip(skip);

      // Obtener total para paginación
      const total = await Juego.countDocuments(query);

      return {
        juegos: transformarArrayAFrontend(juegos),
        paginacion: {
          paginaActual: parseInt(pagina),
          totalPaginas: Math.ceil(total / parseInt(limite)),
          totalJuegos: total,
          juegosPorPagina: parseInt(limite),
        },
      };
    } catch (error) {
      throw new Error(`Error obteniendo juegos: ${error.message}`);
    }
  }

  /**
   * 🎯 Obtener juego por ID
   * @param {string} id - ID del juego
   * @returns {Promise<Object>} Juego encontrado
   */
  async obtenerPorId(id) {
    try {
      const juego = await Juego.findById(id);
      if (!juego) {
        throw new Error("Juego no encontrado");
      }
      return transformarAFrontend(juego);
    } catch (error) {
      throw new Error(`Error obteniendo juego: ${error.message}`);
    }
  }

  /**
   * ➕ Crear nuevo juego
   * @param {Object} datosJuego - Datos del juego
   * @returns {Promise<Object>} Juego creado
   */
  async crear(datosJuego) {
    try {
      // Verificar duplicados por nombre
      const existente = await Juego.findOne({
        nombre: new RegExp(`^${datosJuego.nombre}$`, "i"),
      });

      if (existente) {
        throw new Error("Ya existe un juego con ese nombre");
      }

      // Crear juego
      const nuevoJuego = new Juego({
        ...datosJuego,
        fechaCreacion: new Date(),
      });

      const juegoGuardado = await nuevoJuego.save();
      return transformarAFrontend(juegoGuardado);
    } catch (error) {
      throw new Error(`Error creando juego: ${error.message}`);
    }
  }

  /**
   * ✏️ Actualizar juego
   * @param {string} id - ID del juego
   * @param {Object} datosActualizacion - Datos a actualizar
   * @returns {Promise<Object>} Juego actualizado
   */
  async actualizar(id, datosActualizacion) {
    try {
      // Verificar que existe
      const juegoExistente = await Juego.findById(id);
      if (!juegoExistente) {
        throw new Error("Juego no encontrado");
      }

      // Verificar duplicados si se cambia el nombre
      if (
        datosActualizacion.nombre &&
        datosActualizacion.nombre !== juegoExistente.nombre
      ) {
        const duplicado = await Juego.findOne({
          nombre: new RegExp(`^${datosActualizacion.nombre}$`, "i"),
          _id: { $ne: id },
        });

        if (duplicado) {
          throw new Error("Ya existe otro juego con ese nombre");
        }
      }

      // Actualizar
      const juegoActualizado = await Juego.findByIdAndUpdate(
        id,
        { ...datosActualizacion, fechaActualizacion: new Date() },
        { new: true, runValidators: true }
      );

      return transformarAFrontend(juegoActualizado);
    } catch (error) {
      throw new Error(`Error actualizando juego: ${error.message}`);
    }
  }

  /**
   * 🗑️ Eliminar juego
   * @param {string} id - ID del juego
   * @returns {Promise<Object>} Información del juego eliminado
   */
  async eliminar(id) {
    try {
      const juegoEliminado = await Juego.findByIdAndDelete(id);

      if (!juegoEliminado) {
        throw new Error("Juego no encontrado");
      }

      return {
        id: juegoEliminado._id,
        nombre: juegoEliminado.nombre,
        mensaje: "Juego eliminado exitosamente",
      };
    } catch (error) {
      throw new Error(`Error eliminando juego: ${error.message}`);
    }
  }

  /**
   * 📊 Obtener estadísticas de juegos
   * @returns {Promise<Object>} Estadísticas completas
   */
  async obtenerEstadisticas() {
    try {
      // Estadísticas generales
      const estadisticasGenerales = await Juego.aggregate([
        {
          $group: {
            _id: null,
            totalJuegos: { $sum: 1 },
            juegsCompletados: { $sum: { $cond: ["$completado", 1, 0] } },
            horasTotales: { $sum: "$horasJugadas" },
            añoMasAntiguo: { $min: "$año" },
            añoMasReciente: { $max: "$año" },
            promedioHoras: { $avg: "$horasJugadas" },
          },
        },
      ]);

      // Estadísticas por género
      const estadisticasPorGenero = await Juego.aggregate([
        {
          $group: {
            _id: "$genero",
            cantidad: { $sum: 1 },
            completados: { $sum: { $cond: ["$completado", 1, 0] } },
            horasTotales: { $sum: "$horasJugadas" },
            promedioHoras: { $avg: "$horasJugadas" },
          },
        },
        { $sort: { cantidad: -1 } },
      ]);

      // Estadísticas por plataforma
      const estadisticasPorPlataforma = await Juego.aggregate([
        {
          $group: {
            _id: "$plataforma",
            cantidad: { $sum: 1 },
            completados: { $sum: { $cond: ["$completado", 1, 0] } },
          },
        },
        { $sort: { cantidad: -1 } },
      ]);

      // Top 10 juegos más jugados
      const juegosMasJugados = await Juego.find({ horasJugadas: { $gt: 0 } })
        .sort({ horasJugadas: -1 })
        .limit(10)
        .select("nombre horasJugadas genero completado");

      return {
        general: estadisticasGenerales[0] || {},
        porGenero: estadisticasPorGenero,
        porPlataforma: estadisticasPorPlataforma,
        juegosMasJugados: transformarArrayAFrontend(juegosMasJugados),
        fechaGeneracion: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas: ${error.message}`);
    }
  }

  /**
   * 🔍 Búsqueda avanzada de juegos
   * @param {string} termino - Término de búsqueda
   * @param {Object} opciones - Opciones de búsqueda
   * @returns {Promise<Array>} Resultados de búsqueda
   */
  async buscarAvanzado(termino, opciones = {}) {
    try {
      const { limite = 20, incluirCompletados = true } = opciones;

      let query = {
        $or: [
          { nombre: new RegExp(termino, "i") },
          { desarrollador: new RegExp(termino, "i") },
          { tienda: new RegExp(termino, "i") },
          { resena: new RegExp(termino, "i") },
          { genero: new RegExp(termino, "i") },
          { plataforma: new RegExp(termino, "i") },
        ],
      };

      if (!incluirCompletados) {
        query.completado = false;
      }

      const resultados = await Juego.find(query)
        .limit(limite)
        .sort({ nombre: 1 });

      return transformarArrayAFrontend(resultados);
    } catch (error) {
      throw new Error(`Error en búsqueda avanzada: ${error.message}`);
    }
  }

  /**
   * 🎯 Obtener juegos por género
   * @param {string} genero - Género a buscar
   * @returns {Promise<Array>} Juegos del género
   */
  async obtenerPorGenero(genero) {
    try {
      const juegos = await Juego.find({
        genero: new RegExp(genero, "i"),
      }).sort({ nombre: 1 });

      return transformarArrayAFrontend(juegos);
    } catch (error) {
      throw new Error(`Error obteniendo juegos por género: ${error.message}`);
    }
  }

  /**
   * 🏆 Obtener juegos completados
   * @returns {Promise<Array>} Juegos completados
   */
  async obtenerCompletados() {
    try {
      const juegos = await Juego.find({ completado: true }).sort({
        fechaCreacion: -1,
      });

      return transformarArrayAFrontend(juegos);
    } catch (error) {
      throw new Error(`Error obteniendo juegos completados: ${error.message}`);
    }
  }

  /**
   * ⏱️ Obtener juegos pendientes
   * @returns {Promise<Array>} Juegos pendientes
   */
  async obtenerPendientes() {
    try {
      const juegos = await Juego.find({ completado: false }).sort({
        fechaCreacion: -1,
      });

      return transformarArrayAFrontend(juegos);
    } catch (error) {
      throw new Error(`Error obteniendo juegos pendientes: ${error.message}`);
    }
  }
}

module.exports = new JuegoService();
