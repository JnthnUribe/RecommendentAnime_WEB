// --- CARGA DE .ENV (FORMA ROBUSTA) ---
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'No hay token, permiso denegado.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Formato de token inválido, permiso denegado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token no es válido.' });
  }
};