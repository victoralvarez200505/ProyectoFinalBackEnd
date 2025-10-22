const mongoose = require("mongoose");
const { Schema } = mongoose;

const reseniaSchema = new Schema({
  juegoId: { type: Schema.Types.ObjectId, ref: "Juego", required: true }, // Referencia al videojuego
  puntuacion: { type: Number, min: 1, max: 5 }, // 1-5 estrellas
  textoResena: { type: String, trim: true },
  horasJugadas: { type: Number, min: 0 },
  dificultad: {
    type: String,
    enum: ["Muy fácil", "Fácil", "Normal", "Difícil", "Muy difícil"],
    default: "Normal",
  }, // catálogo ampliado para reflejar las opciones del frontend
  recomendaria: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Resenia", reseniaSchema, "resenias");