const pool = require('../config/db'); // Importa la conexión a la DB

// Obtener todos los animes guardados por el usuario
exports.getSavedAnimes = async (req, res) => {
  try {
    // Gracias al middleware, tenemos 'req.user.id'
    const userId = req.user.id; 
    
    const [animes] = await pool.query(
      'SELECT * FROM saved_animes WHERE user_id = ? ORDER BY id DESC', 
      [userId]
    );

    res.json(animes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al obtener animes.' });
  }
};

// Guardar un nuevo anime
exports.saveAnime = async (req, res) => {
  try {
    const userId = req.user.id;
    // Datos que vendrán del frontend (cuando el user guarda una recomendación)
    const { mal_id, title, image_url, synopsis } = req.body;

    // Validación simple
    if (!mal_id || !title) {
      return res.status(400).json({ message: 'mal_id y title son requeridos.' });
    }

    const [result] = await pool.query(
      'INSERT INTO saved_animes (user_id, mal_id, title, image_url, synopsis) VALUES (?, ?, ?, ?, ?)',
      [userId, mal_id, title, image_url || null, synopsis || null]
    );
    
    // Devolvemos el objeto recién creado
    res.status(201).json({
      id: result.insertId,
      user_id: userId,
      mal_id,
      title,
      image_url,
      synopsis
    });

  } catch (error) {
    // Manejo de error para duplicados (definimos un UNIQUE en la DB)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya has guardado este anime.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al guardar el anime.' });
  }
};

// Actualizar un anime (rating, estado, notas)
exports.updateAnime = async (req, res) => {
  try {
    const userId = req.user.id;
    const animeId = req.params.id; // El ID del anime EN NUESTRA DB (no el mal_id)
    const { user_status, user_rating, user_notes } = req.body;

    // Esta consulta es SEGURA: solo actualiza si el 'id' del anime
    // Y el 'user_id' coinciden. Un usuario no puede borrar el anime de otro.
    const [result] = await pool.query(
      'UPDATE saved_animes SET user_status = ?, user_rating = ?, user_notes = ? WHERE id = ? AND user_id = ?',
      [user_status, user_rating, user_notes, animeId, userId]
    );

    // affectedRows nos dice si algo se actualizó
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Anime no encontrado o no autorizado para este usuario.' });
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
    const animeId = req.params.id; // El ID del anime EN NUESTRA DB

    // Misma lógica de seguridad que en UPDATE
    const [result] = await pool.query(
      'DELETE FROM saved_animes WHERE id = ? AND user_id = ?',
      [animeId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Anime no encontrado o no autorizado para este usuario.' });
    }

    res.json({ message: 'Anime eliminado exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al eliminar el anime.' });
  }
};