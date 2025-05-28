// backend/docentes.js
const express = require("express");
const pool    = require("./db");   // tu instancia de Pool de pg
const router  = express.Router();

/**
 * @swagger
 * tags:
 *   name: Docentes
 *   description: CRUD de docentes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Docente:
 *       type: object
 *       properties:
 *         id_docentes:
 *           type: integer
 *         nombre_doc:
 *           type: string
 *         apellido_doc:
 *           type: string
 *         asignatura_doc:
 *           type: string
 *         salon_doc:
 *           type: integer
 *         pago_doc:
 *           type: boolean
 *         email_doc:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     DocenteInput:
 *       type: object
 *       properties:
 *         nombre_doc:
 *           type: string
 *         apellido_doc:
 *           type: string
 *         asignatura_doc:
 *           type: string
 *         salon_doc:
 *           type: integer
 *         pago_doc:
 *           type: boolean
 *         email_doc:
 *           type: string
 *       required:
 *         - nombre_doc
 *         - apellido_doc
 *         - asignatura_doc
 *         - email_doc
 */

/**
 * @swagger
 * /api/docentes:
 *   get:
 *     summary: Listar todos los docentes
 *     tags: [Docentes]
 *     responses:
 *       200:
 *         description: Array de docentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Docente'
 *   post:
 *     summary: Crear un nuevo docente
 *     tags: [Docentes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocenteInput'
 *     responses:
 *       201:
 *         description: Docente creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Docente'
 */
// 1) GET  /api/docentes → Obtener todos
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM docentes");
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener docentes:", err);
    res.status(500).json({ error: "Error al obtener docentes" });
  }
});

/**
 * @swagger
 * /api/docentes/{id}:
 *   get:
 *     summary: Obtener docente por ID
 *     tags: [Docentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del docente
 *     responses:
 *       200:
 *         description: Un docente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Docente'
 *   put:
 *     summary: Actualizar un docente existente
 *     tags: [Docentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del docente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocenteInput'
 *     responses:
 *       200:
 *         description: Docente actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Docente'
 *   delete:
 *     summary: Eliminar un docente por ID
 *     tags: [Docentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del docente
 *     responses:
 *       204:
 *         description: Docente eliminado
 */
// 2) GET  /api/docentes/:id → Obtener uno por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM docentes WHERE id_docentes = $1",
      [id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error("Error al obtener docente:", err);
    res.status(500).json({ error: "Error al obtener docente" });
  }
});

// 3) POST /api/docentes → Crear nuevo
router.post("/", async (req, res) => {
  try {
    const { nombre_doc, apellido_doc, asignatura_doc, salon_doc, pago_doc, email_doc } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO docentes 
         (nombre_doc, apellido_doc, asignatura_doc, salon_doc, pago_doc, email_doc)
       VALUES($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [nombre_doc, apellido_doc, asignatura_doc, salon_doc, pago_doc, email_doc]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error al crear docente:", err);
    res.status(500).json({ error: "Error al crear docente" });
  }
});

// 4) PUT  /api/docentes/:id → Actualizar existente
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_doc, apellido_doc, asignatura_doc, salon_doc, pago_doc, email_doc } = req.body;
    const { rows } = await pool.query(
      `UPDATE docentes
         SET nombre_doc     = $1,
             apellido_doc   = $2,
             asignatura_doc = $3,
             salon_doc      = $4,
             pago_doc       = $5,
             email_doc      = $6,
             updated_at     = now()
       WHERE id_docentes = $7
       RETURNING *`,
      [nombre_doc, apellido_doc, asignatura_doc, salon_doc, pago_doc, email_doc, id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error("Error al actualizar docente:", err);
    res.status(500).json({ error: "Error al actualizar docente" });
  }
});

// 5) DELETE /api/docentes/:id → Borrar por ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM docentes WHERE id_docentes = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Error al eliminar docente:", err);
    res.status(500).json({ error: "Error al eliminar docente" });
  }
});

module.exports = router;
