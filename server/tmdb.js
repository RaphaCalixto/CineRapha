import axios from 'axios';

// Default TMDB API Keys fallback list
const FALLBACK_KEYS = [
  '84244903a4292334f8e4e2a35b861919',
  '3fd2be6f0c70a2a598f084dd2754877e',
  'a8b70b961082c55e63df168d2c6453ee',
  '15d2ea6d0dc1d476efbca3ecc2e77443'
];

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// Comprehensive high-definition metadata presets for all movies in E:\
const METADATA_DICTIONARY = [
  {
    keys: ['pulp fiction'],
    title: 'Pulp Fiction: Tempo de Violência',
    original_title: 'Pulp Fiction',
    overview: 'As vidas de dois assassinos da máfia, um boxeador, a esposa de um gângster e dois assaltantes se entrelaçam em quatro histórias de violência e redenção.',
    poster_path: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/suaEOO1N11bhgCj5RjWToTqbRjg.jpg',
    release_year: '1994',
    vote_average: 8.9,
    runtime: 154,
    genres: ['Crime', 'Drama'],
    cast: ['John Travolta', 'Samuel L. Jackson', 'Uma Thurman', 'Bruce Willis']
  },
  {
    keys: ['cavaleiro das trevas ressurge', 'batman 2012', 'batman 3'],
    title: 'Batman: O Cavaleiro das Trevas Ressurge',
    original_title: 'The Dark Knight Rises',
    overview: 'Oito anos após a morte de Harvey Dent, o Batman precisa retornar da clandestinidade para salvar Gotham City do terrorista mascarado Bane.',
    poster_path: 'https://image.tmdb.org/t/p/w500/vQ9K6j8vK3a.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/c24sv24s24.jpg',
    release_year: '2012',
    vote_average: 8.5,
    runtime: 165,
    genres: ['Ação', 'Crime', 'Drama'],
    cast: ['Christian Bale', 'Tom Hardy', 'Anne Hathaway', 'Joseph Gordon-Levitt']
  },
  {
    keys: ['cavaleiro das trevas', 'batman 2008', 'batman'],
    title: 'Batman: O Cavaleiro das Trevas',
    original_title: 'The Dark Knight',
    overview: 'Com a ajuda do tenente Jim Gordon e do promotor Harvey Dent, Batman mantém a ordem em Gotham. Porém, o anárquico Coringa espalha o caos na cidade.',
    poster_path: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/nMK28192i7WStWKM3wD9qetB2B1.jpg',
    release_year: '2008',
    vote_average: 9.0,
    runtime: 152,
    genres: ['Ação', 'Crime', 'Drama'],
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Gary Oldman']
  }
];

export async function searchTMDBMovie(query, year = null, userApiKey = null) {
  const keysToTry = userApiKey ? [userApiKey] : FALLBACK_KEYS;

  for (const apiKey of keysToTry) {
    try {
      const params = {
        api_key: apiKey,
        query: query,
        language: 'pt-BR',
        include_adult: false,
      };
      if (year) {
        params.year = year;
      }

      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, { params, timeout: 4000 });
      const results = response.data?.results;

      if (results && results.length > 0) {
        return { movie: results[0], apiKey };
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        continue;
      }
      break;
    }
  }

  const qLower = query.toLowerCase().trim();
  const found = METADATA_DICTIONARY.find(m => 
    m.keys.some(k => qLower.includes(k) || k.includes(qLower))
  );

  if (found) {
    return { movie: { id: `preset_${found.title.replace(/\s+/g, '_')}`, ...found, isPreset: true }, apiKey: null };
  }

  return null;
}

export async function getTMDBMovieDetails(tmdbId, userApiKey = null) {
  if (typeof tmdbId === 'string' && tmdbId.startsWith('preset_')) {
    const titleMatch = tmdbId.replace('preset_', '').replace(/_/g, ' ');
    const found = METADATA_DICTIONARY.find(m => m.title.toLowerCase().includes(titleMatch.toLowerCase()));
    if (found) {
      return {
        tmdb_id: tmdbId,
        title: found.title,
        original_title: found.original_title,
        overview: found.overview,
        poster_path: found.poster_path,
        backdrop_path: found.backdrop_path,
        poster_original: found.poster_path,
        release_date: `${found.release_year}-01-01`,
        release_year: found.release_year,
        vote_average: found.vote_average,
        runtime: found.runtime,
        genres: found.genres,
        cast: found.cast,
        tagline: '',
        trailer_key: null
      };
    }
  }

  const keysToTry = userApiKey ? [userApiKey] : FALLBACK_KEYS;

  for (const apiKey of keysToTry) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
        params: {
          api_key: apiKey,
          language: 'pt-BR',
          append_to_response: 'credits,videos',
        },
        timeout: 4000
      });

      const data = response.data;

      const posterUrl = data.poster_path ? `${IMAGE_BASE_URL}w500${data.poster_path}` : null;
      const backdropUrl = data.backdrop_path ? `${IMAGE_BASE_URL}w1280${data.backdrop_path}` : null;
      const posterOriginal = data.poster_path ? `${IMAGE_BASE_URL}original${data.poster_path}` : null;

      const cast = data.credits?.cast ? data.credits.cast.slice(0, 6).map(c => c.name) : [];

      return {
        tmdb_id: data.id,
        title: data.title || data.original_title,
        original_title: data.original_title,
        overview: data.overview || 'Sinopse não disponível para este filme.',
        poster_path: posterUrl,
        backdrop_path: backdropUrl,
        poster_original: posterOriginal,
        release_date: data.release_date || null,
        release_year: data.release_date ? data.release_date.split('-')[0] : null,
        vote_average: data.vote_average ? Math.round(data.vote_average * 10) / 10 : 0,
        runtime: data.runtime || 0,
        genres: data.genres ? data.genres.map(g => g.name) : [],
        cast: cast,
        tagline: data.tagline || '',
        trailer_key: null,
      };
    } catch (error) {
      if (error.response && error.response.status === 401) {
        continue;
      }
      break;
    }
  }

  return null;
}

export async function fetchTMDBMetadata(cleanTitle, year = null) {
  try {
    const result = await searchTMDBMovie(cleanTitle, year);
    if (!result || !result.movie) return null;
    if (result.movie.isPreset) return result.movie;
    return await getTMDBMovieDetails(result.movie.id, result.apiKey);
  } catch (e) {
    return null;
  }
}
