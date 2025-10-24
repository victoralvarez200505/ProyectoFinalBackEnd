#!/usr/bin/env node

/**
 * 🎮 SCRIPT DE INSTALACIÓN Y CONFIGURACIÓN
 * 
 * Este script automatiza la instalación y configuración inicial del backend
 */

const fs = require('fs');
const path = require('path');

console.log('\n🎮 ===== CONFIGURACIÓN BACKEND VIDEOJUEGOS =====\n');

// Verificar si existe package.json
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: No se encontró package.json');
  console.log('📍 Asegúrate de estar en la carpeta backend del proyecto');
  process.exit(1);
}

// Verificar si existe .env
if (!fs.existsSync('.env')) {
  console.log('📝 Creando archivo .env...');
  
  const envContent = `# 🎮 Configuración del Backend - API de Videojuegos

# 🗄️ Base de Datos MongoDB
MONGODB_URI=mongodb://localhost:27017/videojuegos_db

# 🚀 Configuración del Servidor
PORT=3000
NODE_ENV=development

# 🔗 CORS - Frontend URL
CORS_ORIGIN=http://localhost:5173

# 🔐 Seguridad (futuro)
# JWT_SECRET=tu_clave_secreta_aqui

# 📝 Logs
LOG_LEVEL=info
`;

  try {
    fs.writeFileSync('.env', envContent);
    console.log('✅ Archivo .env creado exitosamente');
  } catch (error) {
    console.error('❌ Error creando .env:', error.message);
  }
} else {
  console.log('✅ Archivo .env ya existe');
}

// Verificar estructura de carpetas
const requiredDirs = ['src', 'src/config', 'src/controllers', 'src/routes', 'src/models', 'src/middleware', 'src/utils'];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`📁 Creando directorio: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('\n🚀 ===== INSTRUCCIONES DE USO =====\n');

console.log('1️⃣ Instalar dependencias:');
console.log('   npm install\n');

console.log('2️⃣ Iniciar MongoDB:');
console.log('   - MongoDB local: mongod');
console.log('   - O usar MongoDB Atlas (cloud)\n');

console.log('3️⃣ Ejecutar el servidor:');
console.log('   npm run dev     # Servidor reorganizado (recomendado)');
console.log('   npm start       # Servidor anterior (compatibilidad)\n');

console.log('4️⃣ Verificar funcionamiento:');
console.log('   http://localhost:3000/health\n');

console.log('📚 Para más información, consulta: README-ESTRUCTURA.md\n');

console.log('✅ Configuración completada!\n');