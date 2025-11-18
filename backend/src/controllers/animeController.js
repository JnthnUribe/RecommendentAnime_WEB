const pool = require('../config/db');

// --- USUARIO POR DEFECTO (Para modo público) ---
const DEFAULT_USER_ID = 1;

// Obtener animes
exports.getSavedAnimes = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM saved_animes WHERE user_id = $1 ORDER BY id DESC', 
      [DEFAULT_USER_ID]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener animes.' });
  }
};

// Guardar anime
exports.saveAnime = async (req, res) => {
  try {
    const { mal_id, title, image_url, synopsis } = req.body;

    if (!mal_id || !title) {
      return res.status(400).json({ message: 'Faltan datos.' });
    }

    const result = await pool.query(
      'INSERT INTO saved_animes (user_id, mal_id, title, image_url, synopsis) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [DEFAULT_USER_ID, mal_id, title, image_url || null, synopsis || null]
    );
    
    res.status(201).json({
      id: result.rows[0].id,
      user_id: DEFAULT_USER_ID,
      mal_id,
      title,
      image_url,
      synopsis
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Ya has guardado este anime.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Error al guardar.' });
  }
};

// Actualizar anime
exports.updateAnime = async (req, res) => {
  try {
    const animeId = req.params.id;
    const { user_status, user_rating, user_notes } = req.body;

    const result = await pool.query(
      'UPDATE saved_animes SET user_status = $1, user_rating = $2, user_notes = $3 WHERE id = $4 AND user_id = $5',
      [user_status, user_rating, user_notes, animeId, DEFAULT_USER_ID]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Anime no encontrado.' });
    }

    res.json({ message: 'Actualizado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar.' });
  }
};

// Eliminar anime
exports.deleteAnime = async (req, res) => {
  try {
    const animeId = req.params.id;

    const result = await pool.query(
      'DELETE FROM saved_animes WHERE id = $1 AND user_id = $2',
      [animeId, DEFAULT_USER_ID]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Anime no encontrado.' });
    }

    res.json({ message: 'Eliminado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar.' });
  }
};