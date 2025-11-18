const axios = require('axios');

// URL base de la API de Jikan v4
const JIKAN_API_BASE_URL = 'https://api.jikan.moe/v4/anime';

exports.getRecommendation = async (req, res) => {
  try {
    // 1. Recibimos los filtros desde el body (vendrán de Angular)
    // Ej: { genres: [1, 27], score: 8, type: 'tv' }
    const { genres, score, type, status } = req.body;

    // 2. Construimos los parámetros de búsqueda para Jikan
    const queryParams = new URLSearchParams();

    if (genres && genres.length > 0) {
      queryParams.append('genres', genres.join(',')); // Jikan usa comas para 'o'
    }
    if (score) {
      queryParams.append('min_score', score); // Puntuación mínima
    }
    if (type) {
      queryParams.append('type', type);
    }
    if (status) {
      queryParams.append('status', status);
    }

    // Parámetros extra para mejorar la búsqueda
    queryParams.append('order_by', 'score');  // Ordenar por las más votadas
    queryParams.append('sort', 'desc');      // De mayor a menor
    queryParams.append('limit', 25);         // Traer 25 para tener de dónde elegir

    // 3. Construimos la URL final
    const jikanUrl = `${JIKAN_API_BASE_URL}?${queryParams.toString()}`;

    // 4. Hacemos la petición a la API de Jikan
    console.log(`Buscando en Jikan: ${jikanUrl}`); // Útil para debugging
    const response = await axios.get(jikanUrl);

    // 5. Procesamos la respuesta
    const animes = response.data.data; // Jikan v4 envuelve todo en un objeto 'data'

    if (!animes || animes.length === 0) {
      return res.status(404).json({ message: 'No se encontraron animes con esos filtros.' });
    }

    // 6. ¡El truco! Elegimos uno al azar de la lista obtenida
    const randomIndex = Math.floor(Math.random() * animes.length);
    const randomAnime = animes[randomIndex];

    // 7. Formateamos la respuesta para que sea limpia y fácil de usar en Angular
    // (Esto es una buena práctica)
    const recommendation = {
      mal_id: randomAnime.mal_id,
      title: randomAnime.title,
      image_url: randomAnime.images.jpg.large_image_url,
      synopsis: randomAnime.synopsis,
      score: randomAnime.score,
      genres: randomAnime.genres.map(g => g.name),
      type: randomAnime.type,
      episodes: randomAnime.episodes
    };

    // 8. Enviamos la recomendación al frontend
    res.json(recommendation);

  } catch (error) {
    console.error('Error al contactar la API de Jikan:', error.message);
    res.status(500).json({ message: 'Error en el servidor al buscar recomendación.' });
  }
};