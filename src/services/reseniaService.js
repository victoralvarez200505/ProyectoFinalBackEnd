/**
 * 📝 SERVICIO DE RESEÑAS
 * 
 * Este servicio maneja toda la lógica de negocio relacionada con reseñas.
 * Proporciona funcionalidades avanzadas como estadísticas y análisis.
 * 
 * Funcionalidades:
 * - CRUD de reseñas
 * - Análisis de sentimientos
 * - Estadísticas por juego
 * - Recomendaciones
 * - Moderación de contenido
 */

const Resenia = require("../models/resenia");
const Juego = require("../models/juego");
const { transformarReseniaAFrontend, transformarArrayReseniasAFrontend } = require("../utils/transformer");

class ReseniaService {
  /**
   * 📋 Obtener todas las reseñas con filtros
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Promise<Object>} Reseñas y paginación
   */
  async obtenerTodas(filtros = {}) {
    try {
      const {
        juegoId,
        calificacion,
        autor,
        limite = 50,
        pagina = 1,
        ordenarPor = 'fechaCreacion',
        orden = 'desc'
      } = filtros;

      // Construir query
      let query = {};

      if (juegoId) query.juegoId = juegoId;
      if (calificacion) query.calificacion = parseInt(calificacion);
      if (autor) query.autor = new RegExp(autor, "i");

      // Configurar paginación
      const skip = (parseInt(pagina) - 1) * parseInt(limite);

      // Ejecutar consulta con populate
      const resenias = await Resenia.find(query)
        .populate('juegoId', 'nombre genero imagen')
        .sort({ [ordenarPor]: orden === 'asc' ? 1 : -1 })
        .limit(parseInt(limite))
        .skip(skip);

      const total = await Resenia.countDocuments(query);

      return {
        resenias: transformarArrayReseniasAFrontend(resenias),
        paginacion: {
          paginaActual: parseInt(pagina),
          totalPaginas: Math.ceil(total / parseInt(limite)),
          totalResenias: total,
          reseniasPorPagina: parseInt(limite)
        }
      };

    } catch (error) {
      throw new Error(`Error obteniendo reseñas: ${error.message}`);
    }
  }

  /**
   * 🎯 Obtener reseña por ID
   * @param {string} id - ID de la reseña
   * @returns {Promise<Object>} Reseña encontrada
   */
  async obtenerPorId(id) {
    try {
      const resenia = await Resenia.findById(id)
        .populate('juegoId', 'nombre genero imagen');

      if (!resenia) {
        throw new Error('Reseña no encontrada');
      }

      return transformarReseniaAFrontend(resenia);
    } catch (error) {
      throw new Error(`Error obteniendo reseña: ${error.message}`);
    }
  }

  /**
   * 🎮 Obtener reseñas de un juego específico
   * @param {string} juegoId - ID del juego
   * @param {Object} opciones - Opciones de consulta
   * @returns {Promise<Array>} Reseñas del juego
   */
  async obtenerPorJuego(juegoId, opciones = {}) {
    try {
      // Verificar que el juego existe
      const juegoExiste = await Juego.findById(juegoId);
      if (!juegoExiste) {
        throw new Error('Juego no encontrado');
      }

      const { limite = 20, ordenarPor = 'fechaCreacion' } = opciones;

      const resenias = await Resenia.find({ juegoId })
        .populate('juegoId', 'nombre genero')
        .sort({ [ordenarPor]: -1 })
        .limit(limite);

      return transformarArrayReseniasAFrontend(resenias);

    } catch (error) {
      throw new Error(`Error obteniendo reseñas por juego: ${error.message}`);
    }
  }

  /**
   * ➕ Crear nueva reseña
   * @param {Object} datosResenia - Datos de la reseña
   * @returns {Promise<Object>} Reseña creada
   */
  async crear(datosResenia) {
    try {
      const { juegoId, contenido, calificacion, autor } = datosResenia;

      // Verificar que el juego existe
      const juegoExiste = await Juego.findById(juegoId);
      if (!juegoExiste) {
        throw new Error('Juego no encontrado');
      }

      // Verificar si el autor ya tiene una reseña para este juego
      if (autor && autor !== 'Anónimo') {
        const reseniaExistente = await Resenia.findOne({ juegoId, autor });
        if (reseniaExistente) {
          throw new Error('Ya tienes una reseña para este juego');
        }
      }

      // Crear reseña
      const nuevaResenia = new Resenia({
        juegoId,
        contenido: contenido.trim(),
        calificacion,
        autor: autor || 'Anónimo',
        fechaCreacion: new Date()
      });

      const reseniaGuardada = await nuevaResenia.save();

      // Obtener la reseña completa con datos del juego
      const reseniaCompleta = await Resenia.findById(reseniaGuardada._id)
        .populate('juegoId', 'nombre genero');

      return transformarReseniaAFrontend(reseniaCompleta);

    } catch (error) {
      throw new Error(`Error creando reseña: ${error.message}`);
    }
  }

  /**
   * ✏️ Actualizar reseña
   * @param {string} id - ID de la reseña
   * @param {Object} datosActualizacion - Datos a actualizar
   * @returns {Promise<Object>} Reseña actualizada
   */
  async actualizar(id, datosActualizacion) {
    try {
      // Verificar que existe
      const reseniaExistente = await Resenia.findById(id);
      if (!reseniaExistente) {
        throw new Error('Reseña no encontrada');
      }

      // Si se cambia el juegoId, verificar que el nuevo juego existe
      if (datosActualizacion.juegoId && datosActualizacion.juegoId !== reseniaExistente.juegoId.toString()) {
        const juegoExiste = await Juego.findById(datosActualizacion.juegoId);
        if (!juegoExiste) {
          throw new Error('Juego no encontrado');
        }
      }

      // Actualizar
      const reseniaActualizada = await Resenia.findByIdAndUpdate(
        id,
        { ...datosActualizacion, fechaActualizacion: new Date() },
        { new: true, runValidators: true }
      ).populate('juegoId', 'nombre genero');

      return transformarReseniaAFrontend(reseniaActualizada);

    } catch (error) {
      throw new Error(`Error actualizando reseña: ${error.message}`);
    }
  }

  /**
   * 🗑️ Eliminar reseña
   * @param {string} id - ID de la reseña
   * @returns {Promise<Object>} Información de la reseña eliminada
   */
  async eliminar(id) {
    try {
      const reseniaEliminada = await Resenia.findByIdAndDelete(id);

      if (!reseniaEliminada) {
        throw new Error('Reseña no encontrada');
      }

      return {
        id: reseniaEliminada._id,
        juegoId: reseniaEliminada.juegoId,
        mensaje: 'Reseña eliminada exitosamente'
      };

    } catch (error) {
      throw new Error(`Error eliminando reseña: ${error.message}`);
    }
  }

  /**
   * 📊 Obtener estadísticas de reseñas para un juego
   * @param {string} juegoId - ID del juego
   * @returns {Promise<Object>} Estadísticas detalladas
   */
  async obtenerEstadisticasJuego(juegoId) {
    try {
      // Verificar que el juego existe
      const juego = await Juego.findById(juegoId);
      if (!juego) {
        throw new Error('Juego no encontrado');
      }

      // Estadísticas generales
      const estadisticasGenerales = await Resenia.aggregate([
        { $match: { juegoId: require('mongoose').Types.ObjectId(juegoId) } },
        {
          $group: {
            _id: null,
            totalResenias: { $sum: 1 },
            promedioCalificacion: { $avg: "$calificacion" },
            calificacionMaxima: { $max: "$calificacion" },
            calificacionMinima: { $min: "$calificacion" },
            totalHorasJugadas: { $sum: "$horasJugadas" },
            promedioHorasJugadas: { $avg: "$horasJugadas" }
          }
        }
      ]);

      // Distribución de calificaciones
      const distribucionCalificaciones = await Resenia.aggregate([
        { $match: { juegoId: require('mongoose').Types.ObjectId(juegoId) } },
        {
          $group: {
            _id: "$calificacion",
            cantidad: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Reseñas por dificultad
      const reseniasPorDificultad = await Resenia.aggregate([
        { $match: { juegoId: require('mongoose').Types.ObjectId(juegoId) } },
        {
          $group: {
            _id: "$dificultad",
            cantidad: { $sum: 1 },
            promedioCalificacion: { $avg: "$calificacion" }
          }
        }
      ]);

      // Recomendaciones
      const recomendaciones = await Resenia.aggregate([
        { $match: { juegoId: require('mongoose').Types.ObjectId(juegoId) } },
        {
          $group: {
            _id: "$recomendaria",
            cantidad: { $sum: 1 }
          }
        }
      ]);

      return {
        juego: {
          id: juego._id,
          nombre: juego.nombre,
          genero: juego.genero
        },
        estadisticas: estadisticasGenerales[0] || {
          totalResenias: 0,
          promedioCalificacion: 0,
          calificacionMaxima: 0,
          calificacionMinima: 0,
          totalHorasJugadas: 0,
          promedioHorasJugadas: 0
        },
        distribucionCalificaciones,
        reseniasPorDificultad,
        recomendaciones,
        fechaGeneracion: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Error obteniendo estadísticas: ${error.message}`);
    }
  }

  /**
   * ⭐ Obtener reseñas mejor calificadas
   * @param {Object} opciones - Opciones de consulta
   * @returns {Promise<Array>} Mejores reseñas
   */
  async obtenerMejoresResenias(opciones = {}) {
    try {
      const { limite = 10, calificacionMinima = 4 } = opciones;

      const resenias = await Resenia.find({ 
        calificacion: { $gte: calificacionMinima } 
      })
        .populate('juegoId', 'nombre genero imagen')
        .sort({ calificacion: -1, fechaCreacion: -1 })
        .limit(limite);

      return transformarArrayReseniasAFrontend(resenias);

    } catch (error) {
      throw new Error(`Error obteniendo mejores reseñas: ${error.message}`);
    }
  }

  /**
   * 🔍 Buscar reseñas por contenido
   * @param {string} termino - Término de búsqueda
   * @param {Object} opciones - Opciones de búsqueda
   * @returns {Promise<Array>} Resultados de búsqueda
   */
  async buscarPorContenido(termino, opciones = {}) {
    try {
      const { limite = 20 } = opciones;

      const resenias = await Resenia.find({
        $or: [
          { contenido: new RegExp(termino, "i") },
          { autor: new RegExp(termino, "i") }
        ]
      })
        .populate('juegoId', 'nombre genero')
        .sort({ fechaCreacion: -1 })
        .limit(limite);

      return transformarArrayReseniasAFrontend(resenias);

    } catch (error) {
      throw new Error(`Error buscando reseñas: ${error.message}`);
    }
  }

  /**
   * 👤 Obtener reseñas por autor
   * @param {string} autor - Nombre del autor
   * @returns {Promise<Array>} Reseñas del autor
   */
  async obtenerPorAutor(autor) {
    try {
      const resenias = await Resenia.find({ 
        autor: new RegExp(autor, "i") 
      })
        .populate('juegoId', 'nombre genero')
        .sort({ fechaCreacion: -1 });

      return transformarArrayReseniasAFrontend(resenias);

    } catch (error) {
      throw new Error(`Error obteniendo reseñas por autor: ${error.message}`);
    }
  }

  /**
   * 📈 Obtener tendencias de reseñas
   * @returns {Promise<Object>} Análisis de tendencias
   */
  async obtenerTendencias() {
    try {
      // Reseñas por mes
      const reseniasPorMes = await Resenia.aggregate([
        {
          $group: {
            _id: {
              año: { $year: "$fechaCreacion" },
              mes: { $month: "$fechaCreacion" }
            },
            cantidad: { $sum: 1 },
            promedioCalificacion: { $avg: "$calificacion" }
          }
        },
        { $sort: { "_id.año": -1, "_id.mes": -1 } },
        { $limit: 12 }
      ]);

      // Géneros más reseñados
      const generosMasResenados = await Resenia.aggregate([
        {
          $lookup: {
            from: "juegos",
            localField: "juegoId",
            foreignField: "_id",
            as: "juego"
          }
        },
        { $unwind: "$juego" },
        {
          $group: {
            _id: "$juego.genero",
            cantidadResenias: { $sum: 1 },
            promedioCalificacion: { $avg: "$calificacion" }
          }
        },
        { $sort: { cantidadResenias: -1 } }
      ]);

      return {
        reseniasPorMes,
        generosMasResenados,
        fechaAnalisis: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Error obteniendo tendencias: ${error.message}`);
    }
  }
}

module.exports = new ReseniaService();