const pool = require('../config/db');

// Obtener todos los animes guardados
exports.getSavedAnimes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // POSTGRESQL: Usamos $1
    const result = await pool.query(
      'SELECT * FROM saved_animes WHERE user_id = $1 ORDER BY id DESC', 
      [userId]
    );

    // POSTGRESQL: Devolvemos result.rows
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al obtener animes.' });
  }
};

// Guardar un nuevo anime
exports.saveAnime = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mal_id, title, image_url, synopsis } = req.body;

    if (!mal_id || !title) {
      return res.status(400).json({ message: 'mal_id y title son requeridos.' });
    }

    // POSTGRESQL: Usamos $1...$5 Y agregamos "RETURNING id" al final
    // Esto es necesario porque Postgres no devuelve el ID automáticamente como MySQL
    const result = await pool.query(
      'INSERT INTO saved_animes (user_id, mal_id, title, image_url, synopsis) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [userId, mal_id, title, image_url || null, synopsis || null]
    );
    
    res.status(201).json({
      id: result.rows[0].id, // Así obtenemos el ID nuevo en Postgres
      user_id: userId,
      mal_id,
      title,
      image_url,
      synopsis
    });

  } catch (error) {
    // El código de error de duplicado en Postgres es '23505'
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Ya has guardado este anime.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al guardar el anime.' });
  }
};

// Actualizar un anime
exports.updateAnime = async (req, res) => {
  try {
    const userId = req.user.id;
    const animeId = req.params.id;
    const { user_status, user_rating, user_notes } = req.body;

    // POSTGRESQL: Sintaxis $1, $2...
    const result = await pool.query(
      'UPDATE saved_animes SET user_status = $1, user_rating = $2, user_notes = $3 WHERE id = $4 AND user_id = $5',
      [user_status, user_rating, user_notes, animeId, userId]
    );

    // En Postgres verificamos rowCount
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Anime no encontrado o no autorizado.' });
    }

    res.json({ message: 'Anime actualizado exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al actualizar el anime.' });
  }
};

// Eliminar un anime
exports.deleteAnime = async (req, res) => {
  try {
    const userId = req.user.id;
    const animeId = req.params.id;

    const result = await pool.query(
      'DELETE FROM saved_animes WHERE id = $1 AND user_id = $2',
      [animeId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Anime no encontrado o no autorizado.' });
    }

    res.json({ message: 'Anime eliminado exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al eliminar el anime.' });
  }
};