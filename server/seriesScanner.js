import fs from 'fs';
import path from 'path';

// List of strictly defined SERIES (with seasons/episodes)
const ALLOWED_SERIES = [
  { key: 'a lenda de aang', title: 'Avatar: A Lenda de Aang', search: 'Avatar: The Last Airbender', poster_path: 'https://m.media-amazon.com/images/M/MV5BMDMwMThjYWYtY2Q2OS00OGM2LTlkODQtNDJlZTZmMjAyYmFhXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'a lenda de korra', title: 'Avatar: A Lenda de Korra', search: 'The Legend of Korra', poster_path: 'https://m.media-amazon.com/images/M/MV5BMWIyMDNmMGMtZTRjZi00ZWJkLWE2ZjAtMjYwOGFiZGVkZmYzXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'castlevania', title: 'Castlevania', search: 'Castlevania', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjAzMjU2MjYzMl5BMl5BanBnXkFtZTgwNTQ4Nzk1NjM@._V1_SX300.jpg' },
  { key: 'resident evil - no escuro absoluto', title: 'Resident Evil: No Escuro Absoluto', search: 'Resident Evil: Infinite Darkness', poster_path: 'https://m.media-amazon.com/images/M/MV5BNjAzYjZlMTgtMzFiNy00YzdmLWE0NTEtYTE4Zjg3NjMzYjBlXkEyXkFqcGc@._V1_QL75_UY562_CR4,0,380,562_.jpg' },
  { key: 'no escuro absoluto', title: 'Resident Evil: No Escuro Absoluto', search: 'Resident Evil: Infinite Darkness', poster_path: 'https://m.media-amazon.com/images/M/MV5BNjAzYjZlMTgtMzFiNy00YzdmLWE0NTEtYTE4Zjg3NjMzYjBlXkEyXkFqcGc@._V1_QL75_UY562_CR4,0,380,562_.jpg' }
];

export function isAllowedSeriesFolder(relPath) {
  const lower = relPath.toLowerCase();
  return ALLOWED_SERIES.some(s => lower.includes(s.key));
}

export function scanSeriesDirectory(rootDir = 'F:\\Animação Ocidental') {
  if (!fs.existsSync(rootDir)) {
    console.log(`[Series Scanner] Diretório ${rootDir} não encontrado.`);
    return { seriesList: [], animationMoviesList: [] };
  }

  const seriesMap = {};
  const animationMoviesList = [];

  function walk(dir) {
    let list;
    try {
      list = fs.readdirSync(dir);
    } catch (e) {
      return;
    }

    for (const file of list) {
      const filePath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(filePath);
      } catch (e) {
        continue;
      }

      if (stat.isDirectory()) {
        walk(filePath);
      } else if (/\.(mp4|mkv|avi|mov|wmv|m4v)$/i.test(file)) {
        const relPath = path.relative(rootDir, filePath);
        const lowerRel = relPath.toLowerCase();

        // Check if file belongs to one of the 4 allowed SERIES
        const matchedSeries = ALLOWED_SERIES.find(s => lowerRel.includes(s.key));

        // Exception: Avatar O Filme 2026 is a movie, not series episode!
        if (matchedSeries && !lowerRel.includes('o filme 2026')) {
          processEpisodeFile(filePath, matchedSeries, seriesMap, relPath, file);
        } else {
          // It is a standalone Animated Movie!
          animationMoviesList.push({
            filePath,
            fileName: file,
            dirName: path.basename(path.dirname(filePath))
          });
        }
      }
    }
  }

  walk(rootDir);

  return {
    seriesList: Object.values(seriesMap),
    animationMoviesList
  };
}

function processEpisodeFile(filePath, matchedSeries, seriesMap, relPath, fileName) {
  const seriesId = 'series-' + matchedSeries.key.replace(/[^a-z0-9]/g, '-');

  if (!seriesMap[seriesId]) {
    seriesMap[seriesId] = {
      id: seriesId,
      type: 'series',
      title: matchedSeries.title,
      searchQuery: matchedSeries.search,
      poster_path: matchedSeries.poster_path || null,
      backdrop_path: matchedSeries.poster_path || null,
      overview: `Série animada ocidental: ${matchedSeries.title}`,
      seasons: {}
    };
  }

  let seasonNum = 1;
  let episodeNum = 1;

  // Check for S01E02 or S01.E02 pattern
  const sMatch = fileName.match(/S(\d{1,2})[._\s]*E(\d{1,2})/i);
  if (sMatch) {
    seasonNum = parseInt(sMatch[1], 10);
    episodeNum = parseInt(sMatch[2], 10);
  } else {
    // Check folder path for Temporada (e.g. 1ª Temporada Completa)
    const seasonFolderMatch = relPath.match(/(\d{1,2})ª?\s*Temporada/i);
    if (seasonFolderMatch) {
      seasonNum = parseInt(seasonFolderMatch[1], 10);
    }
    // Check filename for episode number (e.g. E01, Ep 01, Episodio 01)
    const epMatch = fileName.match(/(?:E|Ep|Epis[oó]dio)[._\s]*(\d{1,3})/i);
    if (epMatch) {
      episodeNum = parseInt(epMatch[1], 10);
    }
  }

  const seasonKey = String(seasonNum);
  if (!seriesMap[seriesId].seasons[seasonKey]) {
    seriesMap[seriesId].seasons[seasonKey] = [];
  }

  const epTitle = `Episódio ${episodeNum < 10 ? '0' + episodeNum : episodeNum}`;

  const existing = seriesMap[seriesId].seasons[seasonKey].find(ep => ep.filePath === filePath);
  if (!existing) {
    seriesMap[seriesId].seasons[seasonKey].push({
      season: seasonNum,
      episode: episodeNum,
      title: epTitle,
      fileName: fileName,
      filePath: filePath
    });
  }
}
