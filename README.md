# 🎮 API de Biblioteca Personal de Videojuegos

Una API REST completa para gestionar tu biblioteca personal de videojuegos con sistema de reseñas integrado, desarrollada con Node.js, Express y MongoDB.

## 📋 Descripción del Proyecto

Este proyecto es un backend robusto que permite a los usuarios:
- **Gestionar su biblioteca de videojuegos** con información detallada
- **Escribir y gestionar reseñas** para cada juego
- **Obtener estadísticas** de su biblioteca personal
- **Buscar y filtrar** juegos por diferentes criterios

## 🚀 Características Principales

### 🎯 Gestión de Juegos
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- 🏷️ Categorización por género, plataforma y desarrollador
- ⏱️ Seguimiento de horas jugadas y estado de completado
- 📅 Control de fechas de creación y actualización
- 🔍 Búsqueda por texto y filtrado avanzado

### 📝 Sistema de Reseñas
- ✅ CRUD completo para reseñas
- ⭐ Sistema de calificación (1-5 estrellas)
- 🎯 Evaluación de dificultad percibida
- 👍 Sistema de recomendaciones
- 📊 Cálculo de promedios y estadísticas

### 🛡️ Seguridad y Validación
- ✅ Validación robusta de datos con Mongoose
- 🔒 Manejo de errores centralizado
- 🌐 CORS configurado para desarrollo y producción
- ⚡ Índices optimizados para consultas rápidas

## 🏗️ Arquitectura del Proyecto

```
src/
├── config/          # Configuración centralizada
│   ├── config.js    # Variables de entorno y configuración
│   └── database.js  # Configuración de MongoDB
├── controllers/     # Lógica de controladores
│   ├── juegoController.js
│   └── reseniaController.js
├── middleware/      # Middleware personalizado
│   ├── errorHandler.js
│   └── validacion.js
├── models/          # Modelos de datos (Mongoose)
│   ├── juego.js
│   └── resenia.js
├── routes/          # Definición de rutas
│   ├── juegos.js
│   └── resenias.js
├── services/        # Lógica de negocio
│   ├── estadisticasService.js
│   ├── juegoService.js
│   └── reseniaService.js
└── utils/           # Utilidades y transformadores
    └── transformer.js
```

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **CORS** - Manejo de políticas de origen cruzado
- **dotenv** - Gestión de variables de entorno

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 16+ instalado
- MongoDB 5+ instalado y ejecutándose
- Git para clonar el repositorio

### 1. Clonar el repositorio
```bash
git clone https://github.com/victoralvarez200505/ProyectoFinalBackEnd.git
cd ProyectoFinalBackEnd
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/videojuegos_db

# Servidor
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Seguridad (opcional)
JWT_SECRET=tu_clave_secreta_super_segura
LOG_LEVEL=info
```

### 4. Iniciar el servidor
```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📡 API Endpoints

### 🎮 Juegos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/juegos` | Obtener todos los juegos |
| `GET` | `/api/juegos/:id` | Obtener un juego específico |
| `POST` | `/api/juegos` | Crear un nuevo juego |
| `PUT` | `/api/juegos/:id` | Actualizar un juego |
| `DELETE` | `/api/juegos/:id` | Eliminar un juego |

### 📝 Reseñas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/resenias` | Obtener todas las reseñas |
| `GET` | `/api/resenias/:id` | Obtener una reseña específica |
| `GET` | `/api/resenias/juego/:juegoId` | Obtener reseñas de un juego |
| `POST` | `/api/resenias` | Crear una nueva reseña |
| `PUT` | `/api/resenias/:id` | Actualizar una reseña |
| `DELETE` | `/api/resenias/:id` | Eliminar una reseña |

### 🏥 Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Estado del servidor |

## 📊 Estructura de Datos

### Modelo de Juego
```json
{
  "_id": "ObjectId",
  "nombre": "The Legend of Zelda: Breath of the Wild",
  "año": 2017,
  "genero": "Aventura",
  "plataforma": "Nintendo Switch",
  "imagen": "https://example.com/zelda.jpg",
  "sinopsis": "Un mundo abierto lleno de aventuras...",
  "desarrollador": "Nintendo",
  "tienda": "Nintendo eShop",
  "completado": true,
  "horasJugadas": 120,
  "fechaCreacion": "2024-01-15T10:30:00Z",
  "fechaActualizacion": "2024-01-20T15:45:00Z"
}
```

### Modelo de Reseña
```json
{
  "_id": "ObjectId",
  "juegoId": "ObjectId",
  "contenido": "Excelente juego con mecánicas innovadoras...",
  "calificacion": 5,
  "autor": "Usuario123",
  "dificultad": "Normal",
  "recomendaria": true,
  "horasJugadas": 120,
  "tags": ["mundo-abierto", "aventura"],
  "likes": 15,
  "dislikes": 2,
  "fechaCreacion": "2024-01-16T14:20:00Z",
  "fechaActualizacion": "2024-01-16T14:20:00Z"
}
```

## 🔧 Scripts Disponibles

```bash
# Iniciar en desarrollo
npm run dev

# Iniciar en producción
npm start

# Ejecutar tests (cuando estén implementados)
npm test

# Limpiar base de datos (script personalizado)
powershell -ExecutionPolicy Bypass -File limpieza_backend.ps1
```

## 🎯 Ejemplos de Uso

### Crear un nuevo juego
```bash
curl -X POST http://localhost:3000/api/juegos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Cyberpunk 2077",
    "año": 2020,
    "genero": "Rol",
    "plataforma": "PC",
    "desarrollador": "CD Projekt RED",
    "completado": false,
    "horasJugadas": 25
  }'
```

### Crear una reseña
```bash
curl -X POST http://localhost:3000/api/resenias \
  -H "Content-Type: application/json" \
  -d '{
    "juegoId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "contenido": "Juego con mucho potencial pero con varios bugs",
    "calificacion": 3,
    "autor": "Gamer2024",
    "dificultad": "Normal",
    "recomendaria": false
  }'
```

## 🐛 Manejo de Errores

La API incluye un sistema robusto de manejo de errores:

- **400 Bad Request** - Datos de entrada inválidos
- **404 Not Found** - Recurso no encontrado
- **409 Conflict** - Conflicto (ej: juego duplicado)
- **500 Internal Server Error** - Error del servidor

Ejemplo de respuesta de error:
```json
{
  "error": "El nombre del juego es requerido",
  "status": 400
}
```

## 🚀 Características Avanzadas

### Índices Optimizados
- Búsqueda de texto completo en juegos y reseñas
- Índices compuestos para consultas complejas
- Optimización de rendimiento para grandes volúmenes de datos

### Validaciones Robustas
- Validación de URLs de imágenes
- Rangos de años válidos
- Límites de caracteres en textos
- Validación de tipos de datos

### Métodos Virtuales
- Formateo automático de horas jugadas
- Cálculo de tiempo transcurrido
- Representación visual de calificaciones

## 🤝 Contribuir

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `package.json` para más detalles.

## 👥 Autor

**Victor Alvarez** - [victoralvarez200505](https://github.com/victoralvarez200505)

## 🙏 Agradecimientos

- Comunidad de Node.js y Express
- Documentación de MongoDB y Mongoose
- Inspiración de plataformas como Steam y GOG

---

📝 **Nota**: Este README se actualiza constantemente. Para la información más reciente, consulta la documentación en el código fuente.