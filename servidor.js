// servidor.js
const express = require("express");
const mongoose = require("mongoose");
const configuracion = require("./src/config/config");

// Importar funciones de juegos
const {
  obtenerJuegoPorId,
  obtenerTodosLosJuegos,
} = require("./funciones/juegos/get");
const { crearJuego } = require("./funciones/juegos/post");
const { actualizarJuego } = require("./funciones/juegos/put");
const { eliminarJuego } = require("./funciones/juegos/delete");

// Importar funciones de resenias
const {
  obtenerReseniasPorJuego,
  obtenerTodasLasResenias,
} = require("./funciones/resenias/get");
const { crearResenia } = require("./funciones/resenias/post");
const { actualizarResenia } = require("./funciones/resenias/put");
const { eliminarResenia } = require("./funciones/resenias/delete");

const cors = require("cors");
const aplicacion = express();

// Configuración CORS desde variables de entorno
aplicacion.use(cors(configuracion.cors));

// Middleware para parsear JSON
aplicacion.use(express.json());

const URI_MONGODB = configuracion.mongodb.uri;

/**
 * Conecta a la base de datos MongoDB
 */
const conectarDB = async () => {
  try {
    await mongoose.connect(URI_MONGODB);
    console.log("🍃 MongoDB conectado exitosamente");
  } catch (error) {
    console.error("❌ Error conectando MongoDB:", error.message);
    process.exit(1);
  }
};

// Llamar función de conexión
conectarDB();

/**
 * Middleware para manejar errores de MongoDB
 */
aplicacion.use((error, req, res, next) => {
  if (error.name === "ValidationError") {
    const errores = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({ error: errores });
  }
  if (error.code === 11000) {
    return res.status(409).json({ error: "Ese Juego ya está registrado" });
  }
  res.status(500).json({ error: "Error interno del servidor" });
});

// ==================== RUTAS PARA JUEGOS ====================
aplicacion.get("/api/juegos/:id", obtenerJuegoPorId);
aplicacion.get("/api/juegos", obtenerTodosLosJuegos);
aplicacion.post("/api/juegos", crearJuego);
aplicacion.put("/api/juegos/:id", actualizarJuego);
aplicacion.delete("/api/juegos/:id", eliminarJuego);

// ==================== RUTAS PARA RESENIAS ====================
aplicacion.get("/api/resenias", obtenerTodasLasResenias);
aplicacion.get("/api/resenias/juego/:juegoId", obtenerReseniasPorJuego);
aplicacion.post("/api/resenias", crearResenia);
aplicacion.put("/api/resenias/:id", actualizarResenia);
aplicacion.delete("/api/resenias/:id", eliminarResenia);

// ==================== SALUD DEL SERVIDOR ====================
aplicacion.get("/health", (req, res) => {
  res.json({
    estado: "ok",
    entorno: configuracion.servidor.entorno,
    marcaTiempo: new Date().toISOString(),
  });
});

// ==================== INICIAR SERVIDOR ====================
aplicacion.listen(configuracion.servidor.puerto, () => {
  console.log(
    `🎮 API de Videojuegos en http://localhost:${configuracion.servidor.puerto}`
  );
  console.log(`📝 Entorno: ${configuracion.servidor.entorno}`);
  console.log(`🔗 CORS habilitado para: ${configuracion.cors.origin}`);
});
