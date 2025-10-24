/**
 * ⚙️ CONFIGURACIÓN PRINCIPAL DEL SERVIDOR
 * 
 * Este archivo centraliza toda la configuración de la aplicación.
 * Carga variables de entorno y establece valores por defecto.
 * 
 * Variables de entorno soportadas:
 * - MONGODB_URI: URL de conexión a MongoDB
 * - PORT: Puerto del servidor
 * - NODE_ENV: Entorno de ejecución (development/production)
 * - CORS_ORIGIN: Origen permitido para CORS
 * - JWT_SECRET: Secreto para tokens JWT (futuro)
 */

require("dotenv").config();

const configuracion = {
  // 🗄️ Configuración de MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/videojuegos_db",
    opciones: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },

  // 🚀 Configuración del servidor
  servidor: {
    puerto: parseInt(process.env.PORT, 10) || 3000,
    entorno: process.env.NODE_ENV || "development",
    nombre: "API Videojuegos",
    version: "1.0.0"
  },

  // 🔗 Configuración CORS
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173", // Puerto por defecto de Vite
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  },

  // 🔐 Configuración de seguridad (para futuras implementaciones)
  seguridad: {
    jwtSecret: process.env.JWT_SECRET || "clave_secreta_temporal",
    bcryptRounds: 12,
    rateLimitRequests: 100, // Requests por ventana de tiempo
    rateLimitWindow: 15 * 60 * 1000, // 15 minutos
  },

  // 📝 Configuración de logs
  logs: {
    nivel: process.env.LOG_LEVEL || "info",
    archivo: process.env.LOG_FILE || false,
  }
};

/**
 * 🔍 Validación de configuración
 * 
 * Verifica que las variables de entorno críticas estén configuradas
 * y muestra advertencias para las que falten.
 */
const validarConfiguracion = () => {
  const requeridas = [];
  const recomendadas = ["MONGODB_URI", "CORS_ORIGIN"];
  
  // Verificar variables requeridas
  const faltantesRequeridas = requeridas.filter((clave) => !process.env[clave]);
  if (faltantesRequeridas.length > 0) {
    console.error(`❌ Variables de entorno REQUERIDAS faltantes: ${faltantesRequeridas.join(", ")}`);
    process.exit(1);
  }

  // Verificar variables recomendadas
  const faltantesRecomendadas = recomendadas.filter((clave) => !process.env[clave]);
  if (faltantesRecomendadas.length > 0) {
    console.warn(`⚠️  Variables de entorno RECOMENDADAS faltantes: ${faltantesRecomendadas.join(", ")}`);
    console.warn("⚠️  Usando valores por defecto. Considera crear un archivo .env");
  }

  // Mostrar configuración en desarrollo
  if (configuracion.servidor.entorno === 'development') {
    console.log("\n📋 Configuración cargada:");
    console.log(`   🏠 Puerto: ${configuracion.servidor.puerto}`);
    console.log(`   🌍 Entorno: ${configuracion.servidor.entorno}`);
    console.log(`   🗄️  MongoDB: ${configuracion.mongodb.uri.replace(/\/\/.*@/, '//***:***@')}`); // Ocultar credenciales
    console.log(`   🔗 CORS: ${configuracion.cors.origin}`);
  }
};

/**
 * 📊 Obtener información del entorno
 */
const obtenerInfoEntorno = () => {
  return {
    esDesarrollo: configuracion.servidor.entorno === 'development',
    esProduccion: configuracion.servidor.entorno === 'production',
    esPruebas: configuracion.servidor.entorno === 'test',
  };
};

// Ejecutar validación al cargar el módulo
validarConfiguracion();

module.exports = {
  ...configuracion,
  validarConfiguracion,
  obtenerInfoEntorno
};