const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Registrar un nuevo usuario ---
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Por favor, introduce todos los campos.' });
    }

    // POSTGRESQL: Usamos $1, $2 en lugar de ?
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    // POSTGRESQL: Los resultados están en .rows
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ message: 'El email o nombre de usuario ya está en uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // POSTGRESQL: Usamos $1, $2, $3
    await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: '¡Usuario registrado exitosamente!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al registrar el usuario.' });
  }
};

// --- Iniciar Sesión ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, introduce email y contraseña.' });
    }

    // POSTGRESQL: Usamos $1
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    // POSTGRESQL: Verificamos result.rows
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const payload = {
      user: {
        id: user.id,
        username: user.username
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso.',
      token: token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al iniciar sesión.' });
  }
};