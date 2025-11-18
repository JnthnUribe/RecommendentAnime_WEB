const express = require('express');
const router = express.Router();
const animeController = require('../controllers/animeController');
const authMiddleware = require('../middleware/authMiddleware'); // ¡Importamos nuestro guardia!

// ---- Rutas Protegidas ----
// Aplicamos el 'authMiddleware' a todas las rutas de animes.
// Esto FORZARÁ a que el usuario deba enviar un token válido
// para usar cualquiera de estas rutas.

// GET /api/animes
// Obtiene TODOS los animes guardados POR el usuario logueado
router.get('/', authMiddleware, animeController.getSavedAnimes);

// POST /api/animes
// Guarda un nuevo anime EN la lista del usuario logueado
router.post('/', authMiddleware, animeController.saveAnime);

// PUT /api/animes/:id
// Actualiza un anime específico (ej: rating, estado) DE la lista del usuario
router.put('/:id', authMiddleware, animeController.updateAnime);

// DELETE /api/animes/:id
// Elimina un anime específico DE la lista del usuario
router.delete('/:id', authMiddleware, animeController.deleteAnime);

module.exports = router;