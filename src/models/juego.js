/**
 * 🎮 MODELO DE JUEGO
 * 
 * Este archivo define el esquema de datos para los juegos en MongoDB.
 * Utiliza Mongoose para definir validaciones, tipos de datos y comportamientos.
 * 
 * Campos del modelo:
 * - nombre: Título del juego (requerido)
 * - año: Año de lanzamiento
 * - genero: Categoría del juego
 * - plataforma: Sistema donde se juega
 * - imagen: URL de la imagen del juego
 * - resena: Descripción o reseña personal
 * - desarrollador: Estudio que desarrolló el juego
 * - tienda: Plataforma donde se compró
 * - completado: Si el juego fue terminado
 * - horasJugadas: Tiempo invertido en el juego
 * - fechaCreacion: Cuándo se agregó a la biblioteca
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const juegoSchema = new Schema({
  // 📝 Información básica
  nombre: { 
    type: String, 
    required: [true, "El nombre del juego es requerido"],
    trim: true,
    maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    index: true // Índice para búsquedas rápidas
  },

  año: { 
    type: Number,
    required: [true, "El año de lanzamiento es requerido"],
    min: [1970, "El año debe ser mayor a 1970"],
    max: [new Date().getFullYear() + 2, "El año no puede ser muy futuro"],
    index: true
  },

  genero: { 
    type: String, 
    required: [true, "El género es requerido"],
    trim: true,
    enum: {
      values: ["Acción", "RPG", "Estrategia", "Deportes", "Carreras", "Aventura", "Terror", "Simulación", "Puzzle", "Plataformas"],
      message: "Género no válido"
    },
    index: true
  },

  plataforma: { 
    type: String, 
    required: [true, "La plataforma es requerida"],
    trim: true,
    index: true
  },

  // 🖼️ Multimedia
  imagen: { 
    type: String, 
    default: "",
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: "La URL de la imagen debe ser válida"
    }
  },

  // 📖 Contenido descriptivo
  resena: { 
    type: String, 
    default: "",
    trim: true,
    maxlength: [2000, "La reseña no puede exceder 2000 caracteres"]
  },

  desarrollador: { 
    type: String, 
    default: "",
    trim: true,
    maxlength: [100, "El desarrollador no puede exceder 100 caracteres"]
  },

  tienda: { 
    type: String, 
    default: "",
    trim: true,
    maxlength: [50, "La tienda no puede exceder 50 caracteres"]
  },

  // 🎯 Estado del juego
  completado: { 
    type: Boolean, 
    default: false,
    index: true
  },

  horasJugadas: { 
    type: Number, 
    default: 0, 
    min: [0, "Las horas jugadas no pueden ser negativas"],
    max: [10000, "Las horas jugadas parecen demasiado altas"]
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
  }
});

// 🔍 Índices compuestos para consultas optimizadas
juegoSchema.index({ genero: 1, plataforma: 1 });
juegoSchema.index({ completado: 1, fechaCreacion: -1 });
juegoSchema.index({ nombre: 'text', desarrollador: 'text' }); // Búsqueda de texto

// 🔄 Middleware pre-save para actualizar fechaActualizacion
juegoSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.fechaActualizacion = new Date();
  }
  next();
});

juegoSchema.pre('findOneAndUpdate', function(next) {
  this.set({ fechaActualizacion: new Date() });
  next();
});

// 📊 Métodos virtuales
juegoSchema.virtual('estaCompletado').get(function() {
  return this.completado;
});

juegoSchema.virtual('tiempoJugadoFormateado').get(function() {
  if (this.horasJugadas < 1) {
    return `${Math.round(this.horasJugadas * 60)} minutos`;
  }
  return `${this.horasJugadas} horas`;
});

// 🔧 Métodos del esquema
juegoSchema.methods.marcarComoCompletado = function() {
  this.completado = true;
  return this.save();
};

juegoSchema.methods.agregarHoras = function(horas) {
  this.horasJugadas += horas;
  return this.save();
};

// 📊 Métodos estáticos
juegoSchema.statics.obtenerPorGenero = function(genero) {
  return this.find({ genero: new RegExp(genero, 'i') });
};

juegoSchema.statics.obtenerCompletados = function() {
  return this.find({ completado: true });
};

juegoSchema.statics.obtenerEstadisticas = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalJuegos: { $sum: 1 },
        completados: { $sum: { $cond: ["$completado", 1, 0] } },
        horasTotales: { $sum: "$horasJugadas" },
        generoMasPopular: { $first: "$genero" }
      }
    }
  ]);
};

// ⚙️ Configuración del esquema
juegoSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

juegoSchema.set('toObject', { virtuals: true });

// 🏷️ Exportar modelo
module.exports = mongoose.model("Juego", juegoSchema, "juegos");