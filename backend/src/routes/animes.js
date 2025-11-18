const express = require('express');
const router = express.Router();
const animeController = require('../controllers/animeController');

// --- IMPORTANTE: NO DEBE HABER NINGÚN 'authMiddleware' AQUÍ ---

// GET /api/animes
router.get('/', animeController.getSavedAnimes);

// POST /api/animes
router.post('/', animeController.saveAnime);

// PUT /api/animes/:id
router.put('/:id', animeController.updateAnime);

// DELETE /api/animes/:id
router.delete('/:id', animeController.deleteAnime);

module.exports = router;