// backend/index.js
const express      = require('express');
const cors         = require('cors');
const swaggerUi    = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

// Routers
const usuariosRouter     = require('./usuarios');
const seguimientosRouter = require('./seguimientos');
const registrosRouter    = require('./registros');
const pagosRouter        = require('./pagos');
const estudiantesRouter  = require('./estudiantes');
const docentesRouter     = require('./docentes');
const asistenciaRouter   = require('./asistencia');

const app = express();

// 1) CORS para permitir tu frontend en React (puerto 3000)
app.use(cors({ origin: 'http://localhost:3000' }));
// 2) Para parsear JSON en los bodies
app.use(express.json());

// 3) Endpoint de prueba (ping)
app.get('/ping', (_req, res) => {
  res.send('pong');
});

// 4) Configuración de Swagger
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Mi Proyecto',
    version: '1.0.0',
    description:
      'Documentación de usuarios, seguimientos, registros, pagos, estudiantes, docentes y asistencia.',
  },
  servers: [{ url: 'http://localhost:5000', description: 'Servidor local' }],
};

const swaggerOptions = {
  swaggerDefinition,
  // Lee JSDoc en **todos** los .js de esta carpeta:
  apis: [__dirname + '/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// 5) Montamos Swagger UI en /api-docs
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);
console.log('🛠 Swagger UI montado en /api-docs');

// 6) Rutas de la API
app.use('/api/usuarios',     usuariosRouter);
app.use('/api/seguimientos', seguimientosRouter);
app.use('/api/registros',    registrosRouter);
app.use('/api/pagos',        pagosRouter);
app.use('/api/estudiantes',  estudiantesRouter);
app.use('/api/docentes',     docentesRouter);
app.use('/api/asistencia',   asistenciaRouter);

// 7) Endpoint raíz de verificación rápida
app.get('/', (_req, res) => {
  res.send('🚀 API backend corriendo correctamente');
});

// 8) Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

