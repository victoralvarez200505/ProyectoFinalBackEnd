/**
 * 📊 SERVICIO DE ESTADÍSTICAS
 * 
 * Este servicio se encarga de generar reportes y análisis estadísticos
 * avanzados de toda la biblioteca de videojuegos.
 * 
 * Funcionalidades:
 * - Dashboard de estadísticas generales
 * - Análisis de tendencias
 * - Reportes personalizados
 * - Métricas de uso
 * - Comparativas y rankings
 */

const Juego = require("../models/juego");
const Resenia = require("../models/resenia");

class EstadisticasService {
  /**
   * 📈 Obtener dashboard completo de estadísticas
   * @returns {Promise<Object>} Dashboard con todas las métricas
   */
  async obtenerDashboard() {
    try {
      // Ejecutar todas las consultas en paralelo para mejor rendimiento
      const [
        estadisticasJuegos,
        estadisticasResenias,
        distribucionGeneros,
        distribucionPlataformas,
        tendenciasCreacion,
        juegosMasJugados,
        mejoresCalificados
      ] = await Promise.all([
        this.obtenerEstadisticasJuegos(),
        this.obtenerEstadisticasResenias(),
        this.obtenerDistribucionGeneros(),
        this.obtenerDistribucionPlataformas(),
        this.obtenerTendenciasCreacion(),
        this.obtenerJuegosMasJugados(),
        this.obtenerMejoresCalificados()
      ]);

      return {
        resumen: {
          ...estadisticasJuegos,
          ...estadisticasResenias
        },
        distribuciones: {
          generos: distribucionGeneros,
          plataformas: distribucionPlataformas
        },
        tendencias: tendenciasCreacion,
        rankings: {
          masJugados: juegosMasJugados,
          mejoresCalificados: mejoresCalificados
        },
        fechaGeneracion: new Date().toISOString(),
        version: "1.0"
      };

    } catch (error) {
      throw new Error(`Error generando dashboard: ${error.message}`);
    }
  }

  /**
   * 🎮 Estadísticas generales de juegos
   * @returns {Promise<Object>} Métricas de juegos
   */
  async obtenerEstadisticasJuegos() {
    try {
      const estadisticas = await Juego.aggregate([
        {
          $group: {
            _id: null,
            totalJuegos: { $sum: 1 },
            juegsCompletados: { $sum: { $cond: ["$completado", 1, 0] } },
            horasTotales: { $sum: "$horasJugadas" },
            promedioHoras: { $avg: "$horasJugadas" },
            añoMasAntiguo: { $min: "$año" },
            añoMasReciente: { $max: "$año" },
            juegsConImagen: { $sum: { $cond: [{ $ne: ["$imagen", ""] }, 1, 0] } }
          }
        },
        {
          $project: {
            _id: 0,
            totalJuegos: 1,
            juegsCompletados: 1,
            juegosPendientes: { $subtract: ["$totalJuegos", "$juegsCompletados"] },
            horasTotales: { $round: ["$horasTotales", 1] },
            promedioHoras: { $round: ["$promedioHoras", 1] },
            añoMasAntiguo: 1,
            añoMasReciente: 1,
            porcentajeCompletado: {
              $round: [
                { $multiply: [{ $divide: ["$juegsCompletados", "$totalJuegos"] }, 100] },
                1
              ]
            },
            porcentajeConImagen: {
              $round: [
                { $multiply: [{ $divide: ["$juegsConImagen", "$totalJuegos"] }, 100] },
                1
              ]
            }
          }
        }
      ]);

      return estadisticas[0] || {
        totalJuegos: 0,
        juegsCompletados: 0,
        juegosPendientes: 0,
        horasTotales: 0,
        promedioHoras: 0,
        porcentajeCompletado: 0
      };

    } catch (error) {
      throw new Error(`Error obteniendo estadísticas de juegos: ${error.message}`);
    }
  }

  /**
   * 📝 Estadísticas generales de reseñas
   * @returns {Promise<Object>} Métricas de reseñas
   */
  async obtenerEstadisticasResenias() {
    try {
      const estadisticas = await Resenia.aggregate([
        {
          $group: {
            _id: null,
            totalResenias: { $sum: 1 },
            promedioCalificacion: { $avg: "$calificacion" },
            calificacionMaxima: { $max: "$calificacion" },
            calificacionMinima: { $min: "$calificacion" },
            recomendaciones: { $sum: { $cond: ["$recomendaria", 1, 0] } }
          }
        },
        {
          $project: {
            _id: 0,
            totalResenias: 1,
            promedioCalificacion: { $round: ["$promedioCalificacion", 2] },
            calificacionMaxima: 1,
            calificacionMinima: 1,
            recomendaciones: 1,
            porcentajeRecomendacion: {
              $round: [
                { $multiply: [{ $divide: ["$recomendaciones", "$totalResenias"] }, 100] },
                1
              ]
            }
          }
        }
      ]);

      return estadisticas[0] || {
        totalResenias: 0,
        promedioCalificacion: 0,
        porcentajeRecomendacion: 0
      };

    } catch (error) {
      throw new Error(`Error obteniendo estadísticas de reseñas: ${error.message}`);
    }
  }

  /**
   * 🎭 Distribución por géneros
   * @returns {Promise<Array>} Estadísticas por género
   */
  async obtenerDistribucionGeneros() {
    try {
      return await Juego.aggregate([
        {
          $group: {
            _id: "$genero",
            cantidad: { $sum: 1 },
            completados: { $sum: { $cond: ["$completado", 1, 0] } },
            horasTotales: { $sum: "$horasJugadas" },
            promedioHoras: { $avg: "$horasJugadas" }
          }
        },
        {
          $project: {
            genero: "$_id",
            cantidad: 1,
            completados: 1,
            pendientes: { $subtract: ["$cantidad", "$completados"] },
            horasTotales: { $round: ["$horasTotales", 1] },
            promedioHoras: { $round: ["$promedioHoras", 1] },
            porcentajeCompletado: {
              $round: [
                { $multiply: [{ $divide: ["$completados", "$cantidad"] }, 100] },
                1
              ]
            }
          }
        },
        { $sort: { cantidad: -1 } }
      ]);

    } catch (error) {
      throw new Error(`Error obteniendo distribución por géneros: ${error.message}`);
    }
  }

  /**
   * 🖥️ Distribución por plataformas
   * @returns {Promise<Array>} Estadísticas por plataforma
   */
  async obtenerDistribucionPlataformas() {
    try {
      return await Juego.aggregate([
        {
          $group: {
            _id: "$plataforma",
            cantidad: { $sum: 1 },
            completados: { $sum: { $cond: ["$completado", 1, 0] } },
            horasTotales: { $sum: "$horasJugadas" }
          }
        },
        {
          $project: {
            plataforma: "$_id",
            cantidad: 1,
            completados: 1,
            pendientes: { $subtract: ["$cantidad", "$completados"] },
            horasTotales: { $round: ["$horasTotales", 1] },
            porcentajeCompletado: {
              $round: [
                { $multiply: [{ $divide: ["$completados", "$cantidad"] }, 100] },
                1
              ]
            }
          }
        },
        { $sort: { cantidad: -1 } }
      ]);

    } catch (error) {
      throw new Error(`Error obteniendo distribución por plataformas: ${error.message}`);
    }
  }

  /**
   * 📅 Tendencias de creación de juegos
   * @returns {Promise<Array>} Datos para gráfico de tendencias
   */
  async obtenerTendenciasCreacion() {
    try {
      return await Juego.aggregate([
        {
          $group: {
            _id: {
              año: { $year: "$fechaCreacion" },
              mes: { $month: "$fechaCreacion" }
            },
            juegsAgregados: { $sum: 1 },
            juegsCompletados: { $sum: { $cond: ["$completado", 1, 0] } }
          }
        },
        {
          $project: {
            fecha: {
              $dateFromParts: {
                year: "$_id.año",
                month: "$_id.mes",
                day: 1
              }
            },
            juegsAgregados: 1,
            juegsCompletados: 1
          }
        },
        { $sort: { fecha: -1 } },
        { $limit: 12 }
      ]);

    } catch (error) {
      throw new Error(`Error obteniendo tendencias: ${error.message}`);
    }
  }

  /**
   * ⏱️ Juegos más jugados
   * @param {number} limite - Número de juegos a retornar
   * @returns {Promise<Array>} Top juegos por horas
   */
  async obtenerJuegosMasJugados(limite = 10) {
    try {
      return await Juego.find({ horasJugadas: { $gt: 0 } })
        .select('nombre genero plataforma horasJugadas completado imagen')
        .sort({ horasJugadas: -1 })
        .limit(limite)
        .lean();

    } catch (error) {
      throw new Error(`Error obteniendo juegos más jugados: ${error.message}`);
    }
  }

  /**
   * ⭐ Juegos mejor calificados
   * @param {number} limite - Número de juegos a retornar
   * @returns {Promise<Array>} Top juegos por calificación
   */
  async obtenerMejoresCalificados(limite = 10) {
    try {
      return await Resenia.aggregate([
        {
          $group: {
            _id: "$juegoId",
            promedioCalificacion: { $avg: "$calificacion" },
            totalResenias: { $sum: 1 }
          }
        },
        {
          $match: {
            totalResenias: { $gte: 1 } // Al menos 1 reseña
          }
        },
        {
          $lookup: {
            from: "juegos",
            localField: "_id",
            foreignField: "_id",
            as: "juego"
          }
        },
        { $unwind: "$juego" },
        {
          $project: {
            nombre: "$juego.nombre",
            genero: "$juego.genero",
            plataforma: "$juego.plataforma",
            imagen: "$juego.imagen",
            promedioCalificacion: { $round: ["$promedioCalificacion", 2] },
            totalResenias: 1
          }
        },
        { $sort: { promedioCalificacion: -1, totalResenias: -1 } },
        { $limit: limite }
      ]);

    } catch (error) {
      throw new Error(`Error obteniendo mejores calificados: ${error.message}`);
    }
  }

  /**
   * 📊 Comparativa entre géneros
   * @returns {Promise<Object>} Análisis comparativo
   */
  async obtenerComparativaGeneros() {
    try {
      const comparativa = await Juego.aggregate([
        {
          $group: {
            _id: "$genero",
            cantidad: { $sum: 1 },
            horasPromedio: { $avg: "$horasJugadas" },
            porcentajeCompletado: {
              $avg: { $cond: ["$completado", 100, 0] }
            }
          }
        },
        {
          $project: {
            genero: "$_id",
            cantidad: 1,
            horasPromedio: { $round: ["$horasPromedio", 1] },
            porcentajeCompletado: { $round: ["$porcentajeCompletado", 1] }
          }
        },
        { $sort: { cantidad: -1 } }
      ]);

      // Encontrar el género más popular, más jugado, etc.
      const masPopular = comparativa[0];
      const masJugado = comparativa.reduce((prev, current) => 
        (prev.horasPromedio > current.horasPromedio) ? prev : current
      );
      const masCompletado = comparativa.reduce((prev, current) => 
        (prev.porcentajeCompletado > current.porcentajeCompletado) ? prev : current
      );

      return {
        comparativa,
        destacados: {
          masPopular: masPopular?.genero,
          masJugado: masJugado?.genero,
          masCompletado: masCompletado?.genero
        }
      };

    } catch (error) {
      throw new Error(`Error en comparativa de géneros: ${error.message}`);
    }
  }

  /**
   * 📈 Métricas de progreso
   * @returns {Promise<Object>} Métricas de progreso personal
   */
  async obtenerMetricasProgreso() {
    try {
      const ahora = new Date();
      const hace30Dias = new Date(ahora.getTime() - (30 * 24 * 60 * 60 * 1000));
      const hace7Dias = new Date(ahora.getTime() - (7 * 24 * 60 * 60 * 1000));

      const [progresoUltimos30Dias, progresoUltimos7Dias] = await Promise.all([
        Juego.aggregate([
          {
            $match: {
              $or: [
                { fechaCreacion: { $gte: hace30Dias } },
                { fechaActualizacion: { $gte: hace30Dias } }
              ]
            }
          },
          {
            $group: {
              _id: null,
              juegsAgregados: { $sum: { $cond: [{ $gte: ["$fechaCreacion", hace30Dias] }, 1, 0] } },
              juegsCompletados: { $sum: { $cond: [{ $and: ["$completado", { $gte: ["$fechaActualizacion", hace30Dias] }] }, 1, 0] } }
            }
          }
        ]),
        Juego.aggregate([
          {
            $match: {
              $or: [
                { fechaCreacion: { $gte: hace7Dias } },
                { fechaActualizacion: { $gte: hace7Dias } }
              ]
            }
          },
          {
            $group: {
              _id: null,
              juegsAgregados: { $sum: { $cond: [{ $gte: ["$fechaCreacion", hace7Dias] }, 1, 0] } },
              juegsCompletados: { $sum: { $cond: [{ $and: ["$completado", { $gte: ["$fechaActualizacion", hace7Dias] }] }, 1, 0] } }
            }
          }
        ])
      ]);

      return {
        ultimos30Dias: progresoUltimos30Dias[0] || { juegsAgregados: 0, juegsCompletados: 0 },
        ultimos7Dias: progresoUltimos7Dias[0] || { juegsAgregados: 0, juegsCompletados: 0 },
        fechaAnalisis: ahora.toISOString()
      };

    } catch (error) {
      throw new Error(`Error obteniendo métricas de progreso: ${error.message}`);
    }
  }
}

module.exports = new EstadisticasService();