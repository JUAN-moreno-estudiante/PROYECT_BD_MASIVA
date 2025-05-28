// backend/estudiantes.js
const express = require("express");
const pool    = require("./db");    // tu instancia de Pool de pg
const router  = express.Router();

/**
 * @swagger
 * tags:
 *   name: Estudiantes
 *   description: CRUD de estudiantes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Estudiante:
 *       type: object
 *       properties:
 *         id_estudiante:
 *           type: integer
 *         nombre_est:
 *           type: string
 *         apellido_est:
 *           type: string
 *         salon_est:
 *           type: integer
 *         id_docentes:
 *           type: integer
 *         id_reg:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     EstudianteInput:
 *       type: object
 *       properties:
 *         nombre_est:
 *           type: string
 *         apellido_est:
 *           type: string
 *         salon_est:
 *           type: integer
 *         id_docentes:
 *           type: integer
 *         id_reg:
 *           type: integer
 *       required:
 *         - nombre_est
 *         - apellido_est
 */

/**
 * @swagger
 * /api/estudiantes:
 *   get:
 *     summary: Obtener todos los estudiantes
 *     tags: [Estudiantes]
 *     responses:
 *       200:
 *         description: Array de estudiantes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Estudiante'
 *   post:
 *     summary: Crear un nuevo estudiante
 *     tags: [Estudiantes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EstudianteInput'
 *     responses:
 *       201:
 *         description: Estudiante creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estudiante'
 */
// 1) GET  /api/estudiantes → Obtener todos
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM estudiantes");
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener estudiantes:", err);
    res.status(500).json({ error: "Error al obtener estudiantes" });
  }
});

/**
 * @swagger
 * /api/estudiantes/{id}:
 *   get:
 *     summary: Obtener estudiante por ID
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del estudiante
 *     responses:
 *       200:
 *         description: Un estudiante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estudiante'
 *   put:
 *     summary: Actualizar un estudiante existente
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del estudiante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EstudianteInput'
 *     responses:
 *       200:
 *         description: Estudiante actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estudiante'
 *   delete:
 *     summary: Eliminar un estudiante por ID
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del estudiante
 *     responses:
 *       204:
 *         description: Estudiante eliminado
 */
// 2) GET  /api/estudiantes/:id → Obtener 1 por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM estudiantes WHERE id_estudiante = $1",
      [id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error("Error al obtener estudiante:", err);
    res.status(500).json({ error: "Error al obtener estudiante" });
  }
});

// 3) POST /api/estudiantes → Crear uno nuevo
router.post("/", async (req, res) => {
  try {
    const { nombre_est, apellido_est, salon_est, id_docentes, id_reg } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO estudiantes
         (nombre_est, apellido_est, salon_est, id_docentes, id_reg)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre_est, apellido_est, salon_est, id_docentes, id_reg]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error al crear estudiante:", err);
    res.status(500).json({ error: "Error al crear estudiante" });
  }
});

// 4) PUT  /api/estudiantes/:id → Actualizar por ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_est, apellido_est, salon_est, id_docentes, id_reg } = req.body;
    const { rows } = await pool.query(
      `UPDATE estudiantes
         SET nombre_est   = $1,
             apellido_est = $2,
             salon_est    = $3,
             id_docentes  = $4,
             id_reg       = $5,
             updated_at   = now()
       WHERE id_estudiante = $6
       RETURNING *`,
      [nombre_est, apellido_est, salon_est, id_docentes, id_reg, id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error("Error al actualizar estudiante:", err);
    res.status(500).json({ error: "Error al actualizar estudiante" });
  }
});

// 5) DELETE /api/estudiantes/:id → Borrar por ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM estudiantes WHERE id_estudiante = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Error al eliminar estudiante:", err);
    res.status(500).json({ error: "Error al eliminar estudiante" });
  }
});

module.exports = router;