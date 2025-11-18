const pool = require('../config/db'); // Importa la conexión a la DB
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Registrar un nuevo usuario ---
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validar que los datos llegaron
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Por favor, introduce todos los campos.' });
    }

    // 2. Revisar si el email o usuario ya existen
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'El email o nombre de usuario ya está en uso.' });
    }

    // 3. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Guardar el usuario en la DB
    await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // 5. Responder al frontend
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

    // 1. Validar entrada
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, introduce email y contraseña.' });
    }

    // 2. Buscar al usuario por email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas.' }); // (No seas específico por seguridad)
    }

    const user = users[0];

    // 3. Comparar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 4. Crear el JSON Web Token (JWT)
    const payload = {
      user: {
        id: user.id,
        username: user.username
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '3h' } // El token expira en 3 horas
    );

    // 5. Enviar el token al cliente
    res.json({
      message: 'Inicio de sesión exitoso.',
      token: token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al iniciar sesión.' });
  }
};