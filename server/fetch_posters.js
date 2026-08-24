import axios from 'axios';
import fs from 'fs';

const OMDB_KEYS = ['b77b7377', 'trilogy', 'eb59e218', '743d8c11'];

// Check specific sequel keys FIRST before shorter base keys
const TITLE_MAP = [
  // Star Wars
  { key: 'star wars iii', term: 'Star Wars: Episode III - Revenge of the Sith' },
  { key: 'star wars ii', term: 'Star Wars: Episode II - Attack of the Clones' },
  { key: 'star wars i', term: 'Star Wars: Episode I - The Phantom Menace' },
  { key: 'vingança dos sith', term: 'Star Wars: Episode III - Revenge of the Sith' },
  { key: 'ataque dos clones', term: 'Star Wars: Episode II - Attack of the Clones' },
  { key: 'ameaça fantasma', term: 'Star Wars: Episode I - The Phantom Menace' },

  // Batman
  { key: 'cavaleiro das trevas ressurge', term: 'The Dark Knight Rises' },
  { key: 'cavaleiro das trevas', term: 'The Dark Knight' },
  { key: 'batman begins', term: 'Batman Begins' },

  // Homem Aranha
  { key: 'homem aranha 3', term: 'Spider-Man 3' },
  { key: 'homem-aranha 3', term: 'Spider-Man 3' },
  { key: 'homem aranha 2', term: 'Spider-Man 2' },
  { key: 'homem-aranha 2', term: 'Spider-Man 2' },
  { key: 'homem aranha', term: 'Spider-Man' },

  // Sequels
  { key: 'anjos da lei 2', term: '22 Jump Street' },
  { key: 'anjos da lei', term: '21 Jump Street' },
  { key: 'gente grande 2', term: 'Grown Ups 2' },
  { key: 'gente grande', term: 'Grown Ups' },
  { key: 'tropa de elite 2', term: 'Elite Squad: The Enemy Within' },
  { key: 'tropa de elite', term: 'Elite Squad' },
  { key: 'zumbilândia atire duas vezes', term: 'Zombieland: Double Tap' },
  { key: 'zumbilandia 2', term: 'Zombieland: Double Tap' },
  { key: 'zumbilandia', term: 'Zombieland' },
  { key: 'scooby doo 2', term: 'Scooby-Doo 2: Monsters Unleashed' },
  { key: 'scooby doo', term: 'Scooby-Doo' },

  // Others
  { key: 'bastardos inglórios', term: 'Inglourious Basterds' },
  { key: 'cidade de deus', term: 'City of God' },
  { key: 'cisne negro', term: 'Black Swan' },
  { key: 'clube da luta', term: 'Fight Club' },
  { key: 'django livre', term: 'Django Unchained' },
  { key: 'encontro marcado', term: 'Meet Joe Black' },
  { key: 'era uma vez em hollywood', term: 'Once Upon a Time in Hollywood' },
  { key: 'ford vs ferrari', term: 'Ford v Ferrari' },
  { key: 'forrest gump', term: 'Forrest Gump' },
  { key: 'guerra mundial z', term: 'World War Z' },
  { key: 'lilo & stitch', term: 'Lilo & Stitch' },
  { key: 'lili & stitch', term: 'Lilo & Stitch' },
  { key: 'mad max', term: 'Mad Max: Fury Road' },
  { key: 'michael', term: 'Michael' },
  { key: 'missão impossivel', term: 'Mission: Impossible - Ghost Protocol' },
  { key: 'o auto da compadecida', term: 'A Dog\'s Will' },
  { key: 'o curioso caso de benjamin button', term: 'The Curious Case of Benjamin Button' },
  { key: 'o resgate do soldado ryan', term: 'Saving Private Ryan' },
  { key: 'onde homens e um segredo', term: 'Ocean\'s Eleven' },
  { key: 'pulp fiction', term: 'Pulp Fiction' },
  { key: 'sr & sr smith', term: 'Mr. & Mrs. Smith' },
  { key: 'titanic', term: 'Titanic' },
  { key: 'top gun maverick', term: 'Top Gun: Maverick' },
  { key: 'v de vingança', term: 'V for Vendetta' },
  { key: 'à espera de um milagre', term: 'The Green Mile' }
];

function getSearchTerm(rawCleanTitle, fileName) {
  const lower = (rawCleanTitle + ' ' + (fileName || '')).toLowerCase();
  for (const entry of TITLE_MAP) {
    if (lower.includes(entry.key)) {
      return entry.term;
    }
  }
  return rawCleanTitle;
}

async function fetchOmdb(title) {
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

async function run() {
  const dbRaw = fs.readFileSync('server/library.json', 'utf-8');
  const db = JSON.parse(dbRaw);

  console.log(`Buscando capas com tradutor de sequências para ${db.movies.length} filmes...`);

  let count = 0;
  for (let m of db.movies) {
    const rawTitle = m.cleanTitle || m.title;
    const searchTerm = getSearchTerm(rawTitle, m.fileName);
    
    console.log(`Buscando: "${rawTitle}" (${m.fileName}) -> Termo: "${searchTerm}"`);
    const omdbData = await fetchOmdb(searchTerm);

    if (omdbData && omdbData.Poster && omdbData.Poster !== 'N/A') {
      m.poster_path = omdbData.Poster;
      m.poster_original = omdbData.Poster;
      m.backdrop_path = omdbData.Poster;
      if (omdbData.Title) m.title = omdbData.Title;
      if (omdbData.Plot && omdbData.Plot !== 'N/A') m.overview = omdbData.Plot;
      if (omdbData.Year) m.release_year = omdbData.Year;
      if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') m.vote_average = parseFloat(omdbData.imdbRating);
      if (omdbData.Genre && omdbData.Genre !== 'N/A') m.genres = omdbData.Genre.split(', ');
      if (omdbData.Actors && omdbData.Actors !== 'N/A') m.cast = omdbData.Actors.split(', ');
      count++;
      console.log(`  ✓ OK! Título: "${m.title}" | Capa: ${omdbData.Poster}`);
    } else {
      console.log(`  ✗ Sem capa para: "${searchTerm}"`);
    }
  }

  fs.writeFileSync('server/library.json', JSON.stringify(db, null, 2));
  console.log(`\n==================================================`);
  console.log(` ✅ ${count} de ${db.movies.length} capas atualizadas com sucesso!`);
  console.log(`==================================================`);
}

run();
