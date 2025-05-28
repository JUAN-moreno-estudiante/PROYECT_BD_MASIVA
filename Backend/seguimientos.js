// backend/seguimientos.js


/**
 * @swagger
 * tags:
 *   name: Seguimientos
 *   description: Operaciones sobre seguimientos de leads
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Seguimiento:
 *       type: object
 *       properties:
 *         id_seg:
 *           type: integer
 *         id_reg:
 *           type: integer
 *         fecha:
 *           type: string
 *           format: date-time
 *         estado:
 *           type: string
 *         notas:
 *           type: string
 *         id_usuario:
 *           type: integer
 *     SeguimientoInput:
 *       type: object
 *       properties:
 *         id_reg:
 *           type: integer
 *         fecha:
 *           type: string
 *           format: date-time
 *         estado:
 *           type: string
 *         notas:
 *           type: string
 *         id_usuario:
 *           type: integer
 *       required:
 *         - id_reg
 *         - estado
 *         - id_usuario
 */

/**
 * @swagger
 * /api/seguimientos:
 *   get:
 *     summary: Lista todos los seguimientos
 *     tags: [Seguimientos]
 *     responses:
 *       200:
 *         description: Array de seguimientos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Seguimiento'
 *   post:
 *     summary: Crear un nuevo seguimiento
 *     tags: [Seguimientos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeguimientoInput'
 *     responses:
 *       201:
 *         description: Seguimiento creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seguimiento'
 */
// --- Backend: seguimientos.js (Express) ---
// --- Backend: seguimientos.js (Express) ---
const express = require('express');
const router = express.Router();
const pool = require('./db');

// Lista fija de motivos válidos según el ENUM en Supabase
const motivosValidos = [
  '1RA LLAMADA',
  '2DA LLAMADA',
  '3RA LLAMADA',
  'ENVIO DE WHATSAPP',
  'CANCELACIÓN DE REGISTRO'
];

// GET /api/seguimientos - Todos los seguimientos
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM seguimientos ORDER BY id_seg ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener seguimientos:', error);
    res.status(500).json({ error: 'Error al obtener seguimientos' });
  }
});
// GET /api/seguimientos/joinRegistros - JOIN con registros para traer medio_reg
router.get('/joinRegistros', async (_req, res) => {
  try {
    const query = `
      SELECT s.*, r.medio_reg
      FROM seguimientos s
      JOIN registros r ON s.id_reg = r.id_reg
      ORDER BY s.fecha DESC, s.hora DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al hacer JOIN en seguimientos:', error);
    res.status(500).json({ error: 'Error al obtener los seguimientos con registros' });
  }
});


// GET /api/seguimientos/registro/:id - Seguimientos por id_reg
router.get('/registro/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM seguimientos WHERE id_reg = $1 ORDER BY fecha DESC, hora DESC',
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener seguimientos por registro:', error);
    res.status(500).json({ error: 'Error al obtener seguimientos del registro' });
  }
});

// POST /api/seguimientos - Crear seguimiento
router.post('/', async (req, res) => {
  const { id_reg, fecha, hora, motivo, notas, estado, id_usuario } = req.body;
   console.log('BODY RECIBIDO:', req.body);

  // Validación de campos requeridos
  if (!id_reg || !fecha || !hora || !motivo || !estado || !id_usuario) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const motivosValidos = [
    '1RA LLAMADA',
    '2DA LLAMADA',
    '3RA LLAMADA',
    'ENVIO DE WHATSAPP',
    'CANCELACIÓN DE REGISTRO'
  ];

  const estadosValidos = [
    'EN SEGUIMIENTO',
    'CERRADO',
    'PENDIENTE',
    'FINALIZADO'
  ];

  if (!motivosValidos.includes(motivo)) {
    return res.status(400).json({ error: 'Motivo no válido' });
  }

  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  try {
    const query = `
      INSERT INTO seguimientos (id_reg, fecha, hora, motivo, notas, estado, id_usuario)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [id_reg, fecha, hora, motivo, notas, estado, id_usuario];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error al agregar seguimiento:', error.message);
    res.status(500).json({ error: 'No se pudo agregar el seguimiento' });
  }
});



module.exports = router;


/**
 * @swagger
 * /api/seguimientos/{id}:
 *   get:
 *     summary: Obtener seguimiento por ID
 *     tags: [Seguimientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del seguimiento
 *     responses:
 *       200:
 *         description: Un seguimiento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seguimiento'
 *   put:
 *     summary: Actualizar un seguimiento existente
 *     tags: [Seguimientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del seguimiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeguimientoInput'
 *     responses:
 *       200:
 *         description: Seguimiento actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seguimiento'
 *   delete:
 *     summary: Eliminar un seguimiento por ID
 *     tags: [Seguimientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del seguimiento
 *     responses:
 *       204:
 *         description: Seguimiento eliminado
 */



