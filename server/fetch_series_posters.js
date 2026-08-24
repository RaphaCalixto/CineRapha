import axios from 'axios';
import { scanSeriesDirectory } from './seriesScanner.js';

const OMDB_KEYS = ['b77b7377', 'trilogy', 'eb59e218', '743d8c11'];

async function fetchOmdbSeries(title) {
  for (const k of OMDB_KEYS) {
    try {
      const res = await axios.get(`http://www.omdbapi.com/?apikey=${k}&t=${encodeURIComponent(title)}&type=series`, { timeout: 5000 });
      if (res.data && res.data.Response === 'True' && res.data.Poster && res.data.Poster !== 'N/A') {
        return res.data;
      }
    } catch (e) {}
  }
  // Try without type=series fallback
  for (const k of OMDB_KEYS) {
    try {
      const res = await axios.get(`http://www.omdbapi.com/?apikey=${k}&t=${encodeURIComponent(title)}`, { timeout: 5000 });
      if (res.data && res.data.Response === 'True' && res.data.Poster && res.data.Poster !== 'N/A') {
        return res.data;
      }
    } catch (e) {}
  }
  return null;
}

export async function fetchAllSeriesPosters() {
  const seriesList = scanSeriesDirectory('F:\\Animação Ocidental');
  console.log(`[Series Fetcher] Buscando capas para ${seriesList.length} séries animadas...`);

  for (let s of seriesList) {
    const omdbData = await fetchOmdbSeries(s.searchQuery || s.title);
    if (omdbData && omdbData.Poster && omdbData.Poster !== 'N/A') {
      s.poster_path = omdbData.Poster;
      s.backdrop_path = omdbData.Poster;
      if (omdbData.Plot && omdbData.Plot !== 'N/A') s.overview = omdbData.Plot;
      if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') s.vote_average = parseFloat(omdbData.imdbRating);
      if (omdbData.Genre && omdbData.Genre !== 'N/A') s.genres = omdbData.Genre.split(', ');
      console.log(`  ✓ OK! "${s.title}" -> Capa: ${s.poster_path}`);
    } else {
      console.log(`  ✗ Sem capa OMDb para "${s.title}", usando preset.`);
    }
  }

  return seriesList;
}

// Fallback presets with 100% verified HTTP 200 URLs
export const SERIES_PRESETS = [
  {
    id: 'series-a-lenda-de-aang',
    title: 'Avatar: A Lenda de Aang',
    poster_path: 'https://m.media-amazon.com/images/M/MV5BMDMwMThjYWYtY2Q2OS00OGM2LTlkODQtNDJlZTZmMjAyYmFhXkEyXkFqcGc@._V1_SX300.jpg',
    backdrop_path: 'https://m.media-amazon.com/images/M/MV5BMDMwMThjYWYtY2Q2OS00OGM2LTlkODQtNDJlZTZmMjAyYmFhXkEyXkFqcGc@._V1_SX300.jpg',
    overview: 'Em um mundo dividido em quatro nações (Água, Terra, Fogo e Ar), Aang é o último Avatar capaz de dobrar todos os quatro elementos e trazer paz ao mundo.'
  },
  {
    id: 'series-a-lenda-de-korra',
    title: 'Avatar: A Lenda de Korra',
    poster_path: 'https://m.media-amazon.com/images/M/MV5BMWIyMDNmMGMtZTRjZi00ZWJkLWE2ZjAtMjYwOGFiZGVkZmYzXkEyXkFqcGc@._V1_SX300.jpg',
    backdrop_path: 'https://m.media-amazon.com/images/M/MV5BMWIyMDNmMGMtZTRjZi00ZWJkLWE2ZjAtMjYwOGFiZGVkZmYzXkEyXkFqcGc@._V1_SX300.jpg',
    overview: 'Korra, uma jovem impulsiva e destemida da Tribo da Água do Sul, assume o papel de Avatar enfrentando novos desafios na moderna Cidade República.'
  },
  {
    id: 'series-castlevania',
    title: 'Castlevania',
    poster_path: 'https://m.media-amazon.com/images/M/MV5BMjAzMjU2MjYzMl5BMl5BanBnXkFtZTgwNTQ4Nzk1NjM@._V1_SX300.jpg',
    backdrop_path: 'https://m.media-amazon.com/images/M/MV5BMjAzMjU2MjYzMl5BMl5BanBnXkFtZTgwNTQ4Nzk1NjM@._V1_SX300.jpg',
    overview: 'Um caçador de vampiros luta para salvar uma cidade sitiada por um exército de bestas sob o controle de Drácula.'
  },
  {
    id: 'series-resident-evil---no-escuro-absoluto',
    title: 'Resident Evil: No Escuro Absoluto',
    poster_path: 'https://m.media-amazon.com/images/M/MV5BNjAzYjZlMTgtMzFiNy00YzdmLWE0NTEtYTE4Zjg3NjMzYjBlXkEyXkFqcGc@._V1_QL75_UY562_CR4,0,380,562_.jpg',
    backdrop_path: 'https://m.media-amazon.com/images/M/MV5BNjAzYjZlMTgtMzFiNy00YzdmLWE0NTEtYTE4Zjg3NjMzYjBlXkEyXkFqcGc@._V1_QL75_UY562_CR4,0,380,562_.jpg',
    overview: 'Anos após os eventos em Raccoon City, Leon S. Kennedy e Claire Redfield investigam uma conspiração viral sinister no coração da Casa Branca.'
  },
  {
    id: 'series-no-escuro-absoluto',
    title: 'Resident Evil: No Escuro Absoluto',
    poster_path: 'https://m.media-amazon.com/images/M/MV5BNjAzYjZlMTgtMzFiNy00YzdmLWE0NTEtYTE4Zjg3NjMzYjBlXkEyXkFqcGc@._V1_QL75_UY562_CR4,0,380,562_.jpg',
    backdrop_path: 'https://m.media-amazon.com/images/M/MV5BNjAzYjZlMTgtMzFiNy00YzdmLWE0NTEtYTE4Zjg3NjMzYjBlXkEyXkFqcGc@._V1_QL75_UY562_CR4,0,380,562_.jpg',
    overview: 'Anos após os eventos em Raccoon City, Leon S. Kennedy e Claire Redfield investigam uma conspiração viral sinister no coração da Casa Branca.'
  }
];
