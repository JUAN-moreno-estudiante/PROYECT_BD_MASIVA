// backend/usuarios.js
const express = require("express");
const pool    = require("./db");   // tu instancia de Pool de pg
const router  = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: CRUD de usuarios y login
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id_usuario:
 *           type: integer
 *         nombre:
 *           type: string
 *         email:
 *           type: string
 *         contrasena:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     UsuarioInput:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *         email:
 *           type: string
 *         contrasena:
 *           type: string
 *       required:
 *         - nombre
 *         - email
 *         - contrasena
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Array de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioInput'
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 */
// GET  /api/usuarios
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// POST /api/usuarios
router.post("/", async (req, res) => {
  try {
    const { nombre, email, contrasena } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre,email,contrasena)
       VALUES ($1,$2,$3) RETURNING *`,
      [nombre, email, contrasena]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creando usuario:", err);
    if (err.code === "23505") {
      if (err.constraint === "usuarios_email_key") {
        return res.status(409).json({ error: "Ya existe un usuario con ese email" });
      }
      if (err.constraint === "usuarios_pkey") {
        return res.status(409).json({ error: "Conflicto de ID de usuario" });
      }
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *
 *   put:
 *     summary: Actualizar un usuario existente
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioInput'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *
 *   delete:
 *     summary: Eliminar un usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       204:
 *         description: Usuario eliminado
 */
// GET  /api/usuarios/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM usuarios WHERE id_usuario = $1",
      [id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// PUT  /api/usuarios/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, contrasena } = req.body;
    const { rows } = await pool.query(
      `UPDATE usuarios
         SET nombre=$1,email=$2,contrasena=$3, updated_at=now()
       WHERE id_usuario=$4
       RETURNING *`,
      [nombre, email, contrasena, id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// DELETE /api/usuarios/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM usuarios WHERE id_usuario = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

/**
 * @swagger
 * /api/usuarios/login:
 *   post:
 *     summary: Login de usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               contrasena:
 *                 type: string
 *             required:
 *               - email
 *               - contrasena
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Falta credenciales
 *       401:
 *         description: Credenciales inválidas
 */
// POST /api/usuarios/login
router.post("/login", async (req, res) => {
  const { email, contrasena } = req.body;

  if (!email || !contrasena) {
    return res.status(400).json({ error: "Faltan credenciales" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1 AND contrasena = $2",
      [email, contrasena]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    res.status(200).json({ message: "Login exitoso", user: result.rows[0] });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});

module.exports = router;