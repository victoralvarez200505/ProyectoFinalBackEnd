const mongoose = require("mongoose");
const { Schema } = mongoose;

const juegoSchema = new Schema({
  titulo: { type: String, required: true, trim: true },
  genero: { type: String, required: true, trim: true }, // "Acción", "RPG", "Estrategia", etc.
  plataforma: { type: String, required: true, trim: true }, // "PC", "PlayStation", "Xbox", etc.
  tienda: { type: String, default: "", trim: true },
  añoLanzamiento: { type: Number },
  desarrollador: { type: String, default: "", trim: true },
  imagenPortada: { type: String, default: "" }, // URL de la imagen
  descripcion: { type: String, default: "" },
  completado: { type: Boolean, default: false },
  horasJugadas: { type: Number, default: 0, min: 0 }, // Horas jugadas en el juego
  fechaCreacion: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Juego", juegoSchema, "juegos");