// src/swagger.js
const swaggerJSDoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Mi Proyecto', 
      version: '1.0.0',
      description: 'Documentación de los endpoints de seguimiento, asistencias, pagos, registros, etc.'
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Servidor local' }
    ]
  },
  // Busca JSDoc en los archivos de rutas
  apis: ['./src/routes/*.js'] 
}

module.exports = swaggerJSDoc(options)
