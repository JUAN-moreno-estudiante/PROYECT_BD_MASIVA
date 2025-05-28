// backend/asistencia.js
const express = require("express");
const pool    = require("./db");   // tu instancia de Pool de pg
const router  = express.Router();

/**
 * @swagger
 * tags:
 *   name: Asistencias
 *   description: CRUD de asistencias de estudiantes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Asistencia:
 *       type: object
 *       properties:
 *         id_asistencia:
 *           type: integer
 *         id_estudiante:
 *           type: integer
 *         fecha:
 *           type: string
 *           format: date-time
 *         estado:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     AsistenciaInput:
 *       type: object
 *       properties:
 *         id_estudiante:
 *           type: integer
 *         fecha:
 *           type: string
 *           format: date-time
 *         estado:
 *           type: string
 *       required:
 *         - id_estudiante
 *         - fecha
 *         - estado
 */

/**
 * @swagger
 * /api/asistencias:
 *   get:
 *     summary: Listar todas las asistencias
 *     tags: [Asistencias]
 *     responses:
 *       200:
 *         description: Array de asistencias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asistencia'
 *   post:
 *     summary: Crear una nueva asistencia
 *     tags: [Asistencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AsistenciaInput'
 *     responses:
 *       201:
 *         description: Asistencia creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asistencia'
 */
// 1) GET  /api/asistencias → Obtener todas las asistencias
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        a.id_asistencia,
        a.fecha,
        a.estado,
        e.id_estudiante,
        CONCAT(e.nombre_est, ' ', e.apellido_est) AS estudiante,
        e.salon_est AS salon,
        CONCAT(d.nombre_doc, ' ', d.apellido_doc) AS docente
      FROM asistencias a
      INNER JOIN estudiantes e ON a.id_estudiante = e.id_estudiante
      LEFT JOIN docentes d ON e.id_docentes = d.id_docentes
      ORDER BY a.id_asistencia DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener asistencias:", err.message);
    res.status(500).json({ error: "Error al obtener asistencias" });
  }
});


/**
 * @swagger
 * /api/asistencias/{id}:
 *   get:
 *     summary: Obtener una asistencia por ID
 *     tags: [Asistencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la asistencia
 *     responses:
 *       200:
 *         description: Una asistencia
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asistencia'
 *   put:
 *     summary: Actualizar una asistencia existente
 *     tags: [Asistencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la asistencia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AsistenciaInput'
 *     responses:
 *       200:
 *         description: Asistencia actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asistencia'
 *   delete:
 *     summary: Eliminar una asistencia por ID
 *     tags: [Asistencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la asistencia
 *     responses:
 *       204:
 *         description: Asistencia eliminada
 */
// 2) GET  /api/asistencias/:id → Obtener una asistencia por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM asistencias WHERE id_asistencia = $1",
      [id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error("Error al obtener asistencia:", err);
    res.status(500).json({ error: "Error al obtener asistencia" });
  }
});

// 3) POST /api/asistencias → Crear una nueva asistencia
router.post("/", async (req, res) => {
  try {
    const { id_estudiante, fecha, estado } = req.body;
    const result = await pool.query(
      `INSERT INTO asistencias (id_estudiante, fecha, estado)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id_estudiante, fecha, estado]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error al crear asistencia:", err);
    res.status(500).json({ error: "Error al crear asistencia" });
  }
});

// 4) PUT  /api/asistencias/:id → Actualizar una asistencia existente
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { id_estudiante, fecha, estado } = req.body;
    const { rows } = await pool.query(
      `UPDATE asistencias
         SET id_estudiante = $1,
             fecha         = $2,
             estado        = $3
       WHERE id_asistencia = $4
       RETURNING *`,
      [id_estudiante, fecha, estado, id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error("Error al actualizar asistencia:", err);
    res.status(500).json({ error: "Error al actualizar asistencia" });
  }
});

// 5) DELETE /api/asistencias/:id → Eliminar una asistencia por ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM asistencias WHERE id_asistencia = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Error al eliminar asistencia:", err);
    res.status(500).json({ error: "Error al eliminar asistencia" });
  }
});

module.exports = router;