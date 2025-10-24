/**
 * 📝 MODELO DE RESEÑA
 * 
 * Este archivo define el esquema de datos para las reseñas en MongoDB.
 * Las reseñas están vinculadas a los juegos y contienen opiniones detalladas.
 * 
 * Campos del modelo:
 * - juegoId: Referencia al juego reseñado
 * - contenido: Texto de la reseña
 * - calificacion: Puntuación del 1 al 5
 * - autor: Nombre del autor (opcional)
 * - dificultad: Nivel de dificultad percibida
 * - recomendaria: Si recomendaría el juego
 * - fechaCreacion: Cuándo se escribió la reseña
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const reseniaSchema = new Schema({
  // 🎮 Referencia al juego
  juegoId: { 
    type: Schema.Types.ObjectId, 
    ref: "Juego", 
    required: [true, "La referencia al juego es requerida"],
    index: true
  },

  // 📝 Contenido de la reseña
  contenido: { 
    type: String, 
    required: [true, "El contenido de la reseña es requerido"],
    trim: true,
    minlength: [10, "La reseña debe tener al menos 10 caracteres"],
    maxlength: [2000, "La reseña no puede exceder 2000 caracteres"]
  },

  // ⭐ Calificación
  calificacion: { 
    type: Number, 
    required: [true, "La calificación es requerida"],
    min: [1, "La calificación mínima es 1"],
    max: [5, "La calificación máxima es 5"],
    validate: {
      validator: Number.isInteger,
      message: "La calificación debe ser un número entero"
    },
    index: true
  },

  // 👤 Autor
  autor: { 
    type: String, 
    default: "Anónimo",
    trim: true,
    maxlength: [50, "El nombre del autor no puede exceder 50 caracteres"]
  },

  // 🎯 Dificultad percibida
  dificultad: {
    type: String,
    enum: {
      values: ["Muy fácil", "Fácil", "Normal", "Difícil", "Muy difícil"],
      message: "Dificultad no válida"
    },
    default: "Normal"
  },

  // 👍 Recomendación
  recomendaria: { 
    type: Boolean, 
    default: true 
  },

  // ⏱️ Tiempo jugado antes de la reseña
  horasJugadas: { 
    type: Number, 
    min: [0, "Las horas jugadas no pueden ser negativas"],
    max: [10000, "Las horas jugadas parecen demasiado altas"],
    default: 0
  },

  // 📅 Metadatos temporales
  fechaCreacion: { 
    type: Date, 
    default: Date.now,
    index: true
  },

  fechaActualizacion: { 
    type: Date, 
    default: Date.now
  },

  // 🏷️ Tags adicionales (futuro)
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, "Cada tag no puede exceder 20 caracteres"]
  }],

  // 👍👎 Sistema de likes (futuro)
  likes: {
    type: Number,
    default: 0,
    min: 0
  },

  dislikes: {
    type: Number,
    default: 0,
    min: 0
  }
});

// 🔍 Índices compuestos para consultas optimizadas
reseniaSchema.index({ juegoId: 1, fechaCreacion: -1 });
reseniaSchema.index({ calificacion: 1, fechaCreacion: -1 });
reseniaSchema.index({ autor: 1, fechaCreacion: -1 });

// Índice de texto para búsquedas
reseniaSchema.index({ contenido: 'text', autor: 'text' });

// 🔄 Middleware pre-save para actualizar fechaActualizacion
reseniaSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.fechaActualizacion = new Date();
  }
  next();
});

reseniaSchema.pre('findOneAndUpdate', function(next) {
  this.set({ fechaActualizacion: new Date() });
  next();
});

// 📊 Métodos virtuales
reseniaSchema.virtual('calificacionEstrellas').get(function() {
  return '⭐'.repeat(this.calificacion) + '☆'.repeat(5 - this.calificacion);
});

reseniaSchema.virtual('resumenCorto').get(function() {
  return this.contenido.length > 100 
    ? this.contenido.substring(0, 100) + '...' 
    : this.contenido;
});

reseniaSchema.virtual('tiempoTranscurrido').get(function() {
  const ahora = new Date();
  const diferencia = ahora - this.fechaCreacion;
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Ayer';
  if (dias < 7) return `Hace ${dias} días`;
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
  if (dias < 365) return `Hace ${Math.floor(dias / 30)} meses`;
  return `Hace ${Math.floor(dias / 365)} años`;
});

// 🔧 Métodos del esquema
reseniaSchema.methods.actualizarCalificacion = function(nuevaCalificacion) {
  this.calificacion = nuevaCalificacion;
  return this.save();
};

reseniaSchema.methods.agregarLike = function() {
  this.likes += 1;
  return this.save();
};

reseniaSchema.methods.agregarDislike = function() {
  this.dislikes += 1;
  return this.save();
};

// 📊 Métodos estáticos
reseniaSchema.statics.obtenerPorJuego = function(juegoId) {
  return this.find({ juegoId }).populate('juegoId', 'nombre genero');
};

reseniaSchema.statics.obtenerPromedioCalificacion = function(juegoId) {
  return this.aggregate([
    { $match: { juegoId: mongoose.Types.ObjectId(juegoId) } },
    {
      $group: {
        _id: null,
        promedio: { $avg: "$calificacion" },
        total: { $sum: 1 }
      }
    }
  ]);
};

reseniaSchema.statics.obtenerMejoresResenias = function(limite = 10) {
  return this.find()
    .sort({ likes: -1, fechaCreacion: -1 })
    .limit(limite)
    .populate('juegoId', 'nombre');
};

// ⚙️ Configuración del esquema
reseniaSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

reseniaSchema.set('toObject', { virtuals: true });

// 🏷️ Exportar modelo
module.exports = mongoose.model("Resenia", reseniaSchema, "resenias");