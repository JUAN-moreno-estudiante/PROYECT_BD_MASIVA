const express = require("express");
const pool = require("./db");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Registros
 *   description: CRUD de registros (leads)
 */

// Obtener todos los registros
// backend/registros.js
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM registros ORDER BY id_reg ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener registros:', error);
    res.status(500).json({ error: 'Error al obtener registros' });
  }
});


// Obtener un registro por número de celular
// registros.js
router.get("/cel/:celular", async (req, res) => {
  try {
    const { celular } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM registros WHERE cel_reg = $1",
      [celular]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error("Error al buscar registro por celular:", err);
    res.status(500).json({ error: "Error al buscar registro por celular" });
  }
});

// Obtener un registro por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM registros WHERE id_reg = $1",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Registro no encontrado" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error al obtener registro por ID:", err);
    res.status(500).json({ error: "Error al obtener registro" });
  }
});

// Crear nuevo registro
router.post("/", async (req, res) => {
  try {
    const {
      nombre_reg,
      apellido_reg,
      cel_reg,
      medio_reg,
      fecha_reg,
      curso_reg,
      num_interesados,
      tip_lead
    } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO registros
         (nombre_reg, apellido_reg, cel_reg, medio_reg, fecha_reg, curso_reg, num_interesados, tip_lead)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        nombre_reg,
        apellido_reg,
        cel_reg,
        medio_reg,
        fecha_reg,
        curso_reg,
        num_interesados,
        tip_lead
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error al crear registro:", err);
    res.status(500).json({ error: "Error al crear registro" });
  }
});

// Actualizar un registro existente
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre_reg,
      apellido_reg,
      cel_reg,
      medio_reg,
      fecha_reg,
      curso_reg,
      num_interesados,
      tip_lead
    } = req.body;

    const { rows } = await pool.query(
      `UPDATE registros SET
         nombre_reg = $1,
         apellido_reg = $2,
         cel_reg = $3,
         medio_reg = $4,
         fecha_reg = $5,
         curso_reg = $6,
         num_interesados = $7,
         tip_lead = $8,
         updated_at = now()
       WHERE id_reg = $9
       RETURNING *`,
      [
        nombre_reg,
        apellido_reg,
        cel_reg,
        medio_reg,
        fecha_reg,
        curso_reg,
        num_interesados,
        tip_lead,
        id
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Registro no encontrado para actualizar" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error al actualizar registro:", err);
    res.status(500).json({ error: "Error al actualizar registro" });
  }
});

// Eliminar un registro
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM registros WHERE id_reg = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Registro no encontrado para eliminar" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("Error al eliminar registro:", err);
    res.status(500).json({ error: "Error al eliminar registro" });
  }
});

module.exports = router;
