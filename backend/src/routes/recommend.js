const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommendController');

// POST /api/recommend
// Usamos POST para poder enviar el JSON de filtros en el body
router.post('/', recommendController.getRecommendation);

module.exports = router;