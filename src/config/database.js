/**
 * 🗄️ CONFIGURACIÓN DE BASE DE DATOS
 * 
 * Este archivo maneja la conexión a MongoDB usando Mongoose.
 * 
 * Funcionalidades:
 * - Conexión a MongoDB Atlas o local
 * - Configuración de opciones de conexión
 * - Manejo de errores de conexión
 * - Logs informativos de estado
 */

const mongoose = require("mongoose");
const configuracion = require("./config");

/**
 * Conecta a la base de datos MongoDB
 * @returns {Promise<void>}
 */
const conectarDB = async () => {
  try {
    console.log("🔄 Conectando a MongoDB...");
    
    // Opciones de conexión para optimizar la conexión
    const opciones = {
      // Usa el nuevo parser de URL de MongoDB
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
      // Configuraciones para producción
      maxPoolSize: 10, // Mantener hasta 10 conexiones socket
      serverSelectionTimeoutMS: 5000, // Mantener intentando enviar operaciones por 5 segundos
      socketTimeoutMS: 45000, // Cerrar sockets después de 45 segundos de inactividad
      bufferMaxEntries: 0, // Deshabilitar el almacenamiento en buffer de mongoose
    };

    // Realizar la conexión
    await mongoose.connect(configuracion.mongodb.uri, opciones);
    
    console.log("🍃 MongoDB conectado exitosamente");
    console.log(`📍 Base de datos: ${mongoose.connection.name}`);
    console.log(`🏠 Host: ${mongoose.connection.host}`);
    
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:");
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Código: ${error.code || 'N/A'}`);
    
    // En desarrollo, mostrar más detalles del error
    if (configuracion.servidor.entorno === 'development') {
      console.error("   Stack completo:", error.stack);
    }
    
    // Salir del proceso si no se puede conectar a la base de datos
    process.exit(1);
  }
};

/**
 * Eventos de conexión de MongoDB
 */
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de conexión MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose desconectado de MongoDB');
});

/**
 * Manejar el cierre graceful de la aplicación
 */
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 Conexión MongoDB cerrada debido a terminación de aplicación');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cerrando conexión MongoDB:', error);
    process.exit(1);
  }
});

module.exports = conectarDB;