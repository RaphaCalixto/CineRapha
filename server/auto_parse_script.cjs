const fs = require('fs');
const path = require('path');
const axios = require('axios');

const db = JSON.parse(fs.readFileSync('server/library.json'));

function cleanFileName(fn) {
  let name = fn
    .replace(/\.(mp4|mkv|avi|mov|wmv|m4v)$/i, '')
    .replace(/\(.*?\)/g, '')
    .replace(/2160p|1080p|720p|4k|uhd|hdr|hdr10|dv|bluray|brrip|web-dl|web|remux|dual|dublado|legendado|multi-audio|5\.1|6ch|2\.0|x264|x265|hevc|h264|aac|flac|esub/gi, '')
    .replace(/www\.[^\s]+/gi, '')
    .replace(/comando\.to|bludv|wolverdonfilmes|lapumiafilm|totti9|luanharper|ramontpb|fg4ll4rd0|alan_680/gi, '')
    .replace(/\b(19|20)\d{2}\b/g, '')
    .replace(/[\._\-]+/g, ' ')
    .trim();
  return name;
}

async function fetchOMDb(cleanName) {
  if (!cleanName || cleanName.length < 2) return null;
  for (const k of ['trilogy', 'b9a5e69d']) {
    try {
      const r = await axios.get('http://www.omdbapi.com/?apikey=' + k + '&t=' + encodeURIComponent(cleanName), { timeout: 4000 });
      if (r.data && r.data.Title && r.data.Poster && r.data.Poster !== 'N/A') {
        return r.data;
      }
    } catch(e){}
  }
  return null;
}

async function run() {
  console.log('=== PROCESSANDO E ATUALIZANDO AS CAPAS DOS FILMES ===');
  let count = 0;
  for (let i = 0; i < db.movies.length; i++) {
    const m = db.movies[i];
    if (!m.fileName) continue;
    const clean = cleanFileName(m.fileName);
    
    const data = await fetchOMDb(clean);
    if (data) {
      m.title = data.Title;
      m.cleanTitle = data.Title;
      m.original_title = data.Title;
      m.poster_path = data.Poster;
      m.poster_original = data.Poster;
      m.backdrop_path = data.Poster;
      m.release_year = data.Year || m.release_year;
      m.overview = data.Plot !== 'N/A' ? data.Plot : m.overview;
      count++;
      console.log(`✓ [${i+1}/${db.movies.length}] ${data.Title} -> Capa: ${data.Poster}`);
    }
  }
  fs.writeFileSync('server/library.json', JSON.stringify(db, null, 2));
  console.log(`=== PROCESSO CONCLUÍDO! FILMES ATUALIZADOS COM CAPAS: ${count} / ${db.movies.length} ===`);
}

run();
