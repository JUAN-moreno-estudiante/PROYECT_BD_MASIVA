// backend/pagos.js
const express = require("express");
const pool    = require("./db"); // tu instancia de Pool de pg
const router  = express.Router();

/**
 * @swagger
 * tags:
 *   name: Pagos
 *   description: Operaciones sobre pagos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Pago:
 *       type: object
 *       properties:
 *         id_pago:
 *           type: integer
 *         id_docente:
 *           type: integer
 *         monto:
 *           type: number
 *         fecha_pago:
 *           type: string
 *           format: date
 *         estado:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     PagoInput:
 *       type: object
 *       properties:
 *         id_docente:
 *           type: integer
 *         monto:
 *           type: number
 *         fecha_pago:
 *           type: string
 *           format: date
 *         estado:
 *           type: string
 *       required:
 *         - id_docente
 *         - monto
 *         - fecha_pago
 *         - estado
 */

/**
 * @swagger
 * /api/pagos:
 *   get:
 *     summary: Listar todos los pagos
 *     tags: [Pagos]
 *     responses:
 *       200:
 *         description: Array de pagos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pago'
 *   post:
 *     summary: Crear un nuevo pago
 *     tags: [Pagos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PagoInput'
 *     responses:
 *       201:
 *         description: Pago creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pago'
 */
// 1) Obtener todos → GET  /api/pagos
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM pagos");
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener pagos:", err);
    res.status(500).json({ error: "Error al obtener pagos" });
  }
});

/**
 * @swagger
 * /api/pagos/{id}:
 *   get:
 *     summary: Obtener un pago por ID
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pago
 *     responses:
 *       200:
 *         description: Un pago
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pago'
 *   put:
 *     summary: Actualizar un pago existente
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pago
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PagoInput'
 *     responses:
 *       200:
 *         description: Pago actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pago'
 *   delete:
 *     summary: Eliminar un pago por ID
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pago
 *     responses:
 *       204:
 *         description: Pago eliminado
 */
// 2) Obtener por id → GET  /api/pagos/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM pagos WHERE id_pago = $1",
      [id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error("Error al obtener pago:", err);
    res.status(500).json({ error: "Error al obtener pago" });
  }
});

// 3) Crear → POST /api/pagos
router.post("/", async (req, res) => {
  try {
    const { id_docente, monto, fecha_pago, estado } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO pagos (id_docente, monto, fecha_pago, estado)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id_docente, monto, fecha_pago, estado]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error al crear pago:", err);
    res.status(500).json({ error: "Error al crear pago" });
  }
});

// 4) Actualizar → PUT /api/pagos/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { id_docente, monto, fecha_pago, estado } = req.body;
    const { rows } = await pool.query(
      `UPDATE pagos
         SET id_docente=$1,
             monto     =$2,
             fecha_pago=$3,
             estado    =$4,
             updated_at=now()
       WHERE id_pago = $5
       RETURNING *`,
      [id_docente, monto, fecha_pago, estado, id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error("Error al actualizar pago:", err);
    res.status(500).json({ error: "Error al actualizar pago" });
  }
});

// 5) Borrar → DELETE /api/pagos/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM pagos WHERE id_pago = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Error al eliminar pago:", err);
    res.status(500).json({ error: "Error al eliminar pago" });
  }
});

module.exports = router;
