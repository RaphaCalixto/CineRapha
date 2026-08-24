import fs from 'fs';
import path from 'path';

const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.m4v'];

// Official OMDb/TMDB title translation mapping for Anime & Disney movies
const G_DRIVE_TITLE_MAP = [
  // Anime Series & Movies
  { key: 'frieren', title: 'Frieren e a Jornada para o Além', search: 'Frieren: Beyond Journey\'s End' },
  { key: 'death parade', title: 'Death Parade', search: 'Death Parade' },
  { key: 'fog hill', title: 'Fog Hill of Five Elements', search: 'Fog Hill of Five Elements' },
  { key: 'hibike', title: 'Hibike! Euphonium', search: 'Sound! Euphonium' },
  { key: 'houseki no kuni', title: 'Houseki no Kuni (Land of the Lustrous)', search: 'Land of the Lustrous' },
  { key: 'kill la kill', title: 'KILL la KILL', search: 'Kill la Kill' },
  { key: 'kyoukai no kanata', title: 'Kyoukai no Kanata (Beyond the Boundary)', search: 'Beyond the Boundary' },
  { key: 'lord of mysteries', title: 'Lord of Mysteries', search: 'Lord of Mysteries' },
  { key: 'mine fujiko', title: 'Lupin III: A Mulher Chamada Fujiko Mine', search: 'Lupin the Third: The Woman Called Fujiko Mine' },
  { key: 'monster', title: 'Monster', search: 'Monster' },
  { key: 'apotecária', title: 'O Diário de uma Apotecária', search: 'The Apothecary Diaries' },
  { key: 'pokémon', title: 'Pokémon', search: 'Pokémon' },
  { key: 'sora yori', title: 'A Place Further Than the Universe', search: 'A Place Further Than the Universe' },
  { key: 'gurren lagann', title: 'Tengen Toppa Gurren Lagann', search: 'Gurren Lagann' },
  { key: 'violet evergarden', title: 'Violet Evergarden', search: 'Violet Evergarden' },
  { key: 'chihiro', title: 'A Viagem de Chihiro', search: 'Spirited Away' },
  { key: 'castelo animado', title: 'O Castelo Animado', search: 'Howl\'s Moving Castle' },
  { key: 'vagalumes', title: 'O Túmulo dos Vagalumes', search: 'Grave of the Fireflies' },
  { key: 'mononoke', title: 'Princesa Mononoke', search: 'Princess Mononoke' },
  { key: 'koe no katachi', title: 'Koe no Katachi (A Silent Voice)', search: 'A Silent Voice' },
  { key: 'perfect blue', title: 'Perfect Blue', search: 'Perfect Blue' },
  { key: 'redline', title: 'Redline', search: 'Redline' },
  { key: 'ghost in the shell', title: 'Ghost in the Shell: O Fantasma do Futuro', search: 'Ghost in the Shell' },
  { key: 'cagliostro', title: 'Lupin III: O Castelo de Cagliostro', search: 'The Castle of Cagliostro' },
  { key: 'white snake', title: 'A Lenda da Serpente Branca', search: 'White Snake' },
  { key: 'wolf children', title: 'Crianças Lobo (Wolf Children)', search: 'Wolf Children' },
  { key: 'guerra dos deuses', title: 'A Guerra dos Deuses', search: 'New Gods: Yang Jian' },
  { key: 'capitão harlock', title: 'Capitão Harlock: Pirata do Espaço', search: 'Harlock: Space Pirate' },
  { key: 'children of the sea', title: 'Children of the Sea', search: 'Children of the Sea' },
  { key: 'deep sea', title: 'Deep Sea', search: 'Deep Sea' },
  { key: 'dragon quest', title: 'Dragon Quest: Your Story', search: 'Dragon Quest: Your Story' },
  { key: 'gantz', title: 'Gantz: O', search: 'Gantz: O' },
  { key: 'liz and the blue bird', title: 'Liz and the Blue Bird', search: 'Liz and the Blue Bird' },
  { key: 'lupin the first', title: 'Lupin III: The First', search: 'Lupin III: The First' },
  { key: 'mirai', title: 'Mirai no Mirai', search: 'Mirai' },
  { key: 'nezha', title: 'Nezha', search: 'Ne Zha' },
  { key: 'sayonara', title: 'Sayonara no Asa ni Yakusoku no Hana wo Kazarou', search: 'Maquia: When the Promised Flower Blooms' },
  { key: 'when marnie was there', title: 'As Memórias de Marnie', search: 'When Marnie Was There' },

  // Disney / Pixar / DreamWorks
  { key: 'casa monstro', title: 'A Casa Monstro', search: 'Monster House' },
  { key: 'era do gelo 2', title: 'A Era do Gelo 2', search: 'Ice Age: The Meltdown' },
  { key: 'era do gelo 3', title: 'A Era do Gelo 3', search: 'Ice Age: Dawn of the Dinosaurs' },
  { key: 'era do gelo', title: 'A Era do Gelo', search: 'Ice Age' },
  { key: 'fera do mar', title: 'A Fera do Mar', search: 'The Sea Beast' },
  { key: 'onda do imperador', title: 'A Nova Onda do Imperador', search: 'The Emperor\'s New Groove' },
  { key: 'princesa e o sapo', title: 'A Princesa e o Sapo', search: 'The Princess and the Frog' },
  { key: 'atlantis', title: 'Atlantis: O Reino Perdido', search: 'Atlantis: The Lost Empire' },
  { key: 'bob esponja', title: 'Bob Esponja: O Filme', search: 'The SpongeBob SquarePants Movie' },
  { key: 'carros 1', title: 'Carros', search: 'Cars' },
  { key: 'carros 3', title: 'Carros 3', search: 'Cars 3' },
  { key: 'coraline', title: 'Coraline e o Mundo Secreto', search: 'Coraline' },
  { key: 'divertida mente 2', title: 'Divertida Mente 2', search: 'Inside Out 2' },
  { key: 'divertida mente', title: 'Divertida Mente', search: 'Inside Out' },
  { key: 'elementos', title: 'Elementos', search: 'Elemental' },
  { key: 'encanto', title: 'Encanto', search: 'Encanto' },
  { key: 'enrolados', title: 'Enrolados', search: 'Tangled' },
  { key: 'frozen', title: 'Frozen: Uma Aventura Congelante', search: 'Frozen' },
  { key: 'gato de botas 2', title: 'Gato de Botas 2: O Último Pedido', search: 'Puss in Boots: The Last Wish' },
  { key: 'gato de botas', title: 'Gato de Botas', search: 'Puss in Boots' },
  { key: 'happy feet 2', title: 'Happy Feet 2: O Mumble Leva Jeito', search: 'Happy Feet Two' },
  { key: 'happy feet', title: 'Happy Feet: O Pingüim', search: 'Happy Feet' },
  { key: 'hotel transilvânia', title: 'Hotel Transilvânia', search: 'Hotel Transylvania' },
  { key: 'hercules', title: 'Hércules', search: 'Hercules' },
  { key: 'klaus', title: 'Klaus', search: 'Klaus' },
  { key: 'kung fu panda 2', title: 'Kung Fu Panda 2', search: 'Kung Fu Panda 2' },
  { key: 'kung fu panda 3', title: 'Kung Fu Panda 3', search: 'Kung Fu Panda 3' },
  { key: 'kung fu panda', title: 'Kung Fu Panda', search: 'Kung Fu Panda' },
  { key: 'gahoole', title: 'A Lenda dos Guardiões', search: 'Legend of the Guardians: The Owls of Ga\'Hoole' },
  { key: 'lilo & stitch 2002', title: 'Lilo & Stitch', search: 'Lilo & Stitch' },
  { key: 'lilo & stitch (2002)', title: 'Lilo & Stitch', search: 'Lilo & Stitch' },
  { key: 'lilo & stitch 2', title: 'Lilo & Stitch 2: Stitch Deu Defeito', search: 'Lilo & Stitch 2: Stitch Has a Glitch' },
  { key: 'lilo & stitch', title: 'Lilo & Stitch', search: 'Lilo & Stitch' },
  { key: 'luca', title: 'Luca', search: 'Luca' },
  { key: 'mario 2', title: 'Super Mario Bros. 2', search: 'The Super Mario Bros. Movie' },
  { key: 'super mario', title: 'Super Mario Bros. O Filme', search: 'The Super Mario Bros. Movie' },
  { key: 'meu malvado favorito', title: 'Meu Malvado Favorito', search: 'Despicable Me' },
  { key: 'monstros s.a', title: 'Monstros S.A.', search: 'Monsters, Inc.' },
  { key: 'universidade monstros', title: 'Universidade Monstros', search: 'Monsters University' },
  { key: 'mulan', title: 'Mulan', search: 'Mulan' },
  { key: 'caldeirão mágico', title: 'O Caldeirão Mágico', search: 'The Black Cauldron' },
  { key: 'caminho para el dorado', title: 'O Caminho para El Dorado', search: 'The Road to El Dorado' },
  { key: 'corcunda de notre dames 2', title: 'O Corcunda de Notre Dame 2', search: 'The Hunchback of Notre Dame II' },
  { key: 'corcunda de notre dame 2', title: 'O Corcunda de Notre Dame II', search: 'The Hunchback of Notre Dame II' },
  { key: 'corcunda de notre dame', title: 'O Corcunda de Notre Dame', search: 'The Hunchback of Notre Dame' },
  { key: 'gigante de ferro', title: 'O Gigante de Ferro', search: 'The Iron Giant' },
  { key: 'operação big hero', title: 'Operação Big Hero', search: 'Big Hero 6' },
  { key: 'os incríveis 2', title: 'Os Incríveis 2', search: 'Incredibles 2' },
  { key: 'os incríveis', title: 'Os Incríveis', search: 'The Incredibles' },
  { key: 'pinóquio', title: 'Pinóquio', search: 'Pinocchio' },
  { key: 'procurando nemo', title: 'Procurando Nemo', search: 'Finding Nemo' },
  { key: 'rango', title: 'Rango', search: 'Rango' },
  { key: 'ratatouille', title: 'Ratatouille', search: 'Ratatouille' },
  { key: 'raya', title: 'Raya e o Último Dragão', search: 'Raya and the Last Dragon' },
  { key: 'rio', title: 'Rio', search: 'Rio' },
  { key: 'shrek 2', title: 'Shrek 2', search: 'Shrek 2' },
  { key: 'shrek 3', title: 'Shrek Terceiro', search: 'Shrek the Third' },
  { key: 'shrek pra sempre', title: 'Shrek Para Sempre', search: 'Shrek Forever After' },
  { key: 'shrek', title: 'Shrek', search: 'Shrek' },
  { key: 'tintin', title: 'As Aventuras de Tintim', search: 'The Adventures of Tintin' },
  { key: 'tico e teco', title: 'Tico e Teco: Defensores da Lei', search: 'Chip \'n Dale: Rescue Rangers' },
  { key: 'toy story 1', title: 'Toy Story', search: 'Toy Story' },
  { key: 'toy story 2', title: 'Toy Story 2', search: 'Toy Story 2' },
  { key: 'toy story 3', title: 'Toy Story 3', search: 'Toy Story 3' },
  { key: 'toy story 4', title: 'Toy Story 4', search: 'Toy Story 4' },
  { key: 'up altas aventuras', title: 'Up: Altas Aventuras', search: 'Up' },
  { key: 'valente', title: 'Valente', search: 'Brave' },
  { key: 'wifi ralph', title: 'WiFi Ralph: Quebrando a Internet', search: 'Ralph Breaks the Internet' },
  { key: 'zootopia 2', title: 'Zootopia 2', search: 'Zootopia 2' },
  { key: 'zootopia', title: 'Zootopia: Essa Cidade é o Bicho', search: 'Zootopia' }
];

export function parseAnimeEpisodeNumber(fileName, index) {
  // Strip CRC32 hex hashes like [C6A6D6E4] and codec brackets to prevent false matches
  const cleanName = fileName
    .replace(/\[[A-F0-9]{8}\]/gi, '')
    .replace(/\(.*?\)/g, '');

  const matchSeason = cleanName.match(/S\d+\s*E?(\d{1,3})\b/i);
  if (matchSeason) return parseInt(matchSeason[1], 10);

  const matchEp = cleanName.match(/(?:E|Ep|\s+-\s+)\s*(\d{1,3})\b/i);
  if (matchEp) return parseInt(matchEp[1], 10);

  const matchBrackets = cleanName.match(/\[(\d{1,3})\]/);
  if (matchBrackets) return parseInt(matchBrackets[1], 10);

  const matchDigits = cleanName.match(/\b(\d{1,3})\b/);
  if (matchDigits) return parseInt(matchDigits[1], 10);

  return index + 1;
}

export function scanGDrive(gRootDir = 'G:\\') {
  if (!fs.existsSync(gRootDir)) {
    return { animeSeriesList: [], animeMoviesList: [], disneyMoviesList: [] };
  }

  const animeSeriesList = [];
  const animeMoviesList = [];
  const disneyMoviesList = [];

  // 1. Scan G:\ANIMES
  const animesDir = path.join(gRootDir, 'ANIMES');
  if (fs.existsSync(animesDir)) {
    const items = fs.readdirSync(animesDir);
    items.forEach(item => {
      const full = path.join(animesDir, item);
      try {
        const st = fs.statSync(full);
        if (st.isDirectory()) {
          const videoFiles = [];
          function walkSub(d) {
            const sub = fs.readdirSync(d);
            sub.forEach(f => {
              const fFull = path.join(d, f);
              const fSt = fs.statSync(fFull);
              if (fSt.isDirectory()) walkSub(fFull);
              else if (VIDEO_EXTENSIONS.includes(path.extname(f).toLowerCase())) {
                videoFiles.push({ filePath: fFull, fileName: f, relDir: path.relative(full, d) });
              }
            });
          }
          walkSub(full);

          const isMovieFolder = ['pokémon', 'pokemon', 'white snake', 'nezha'].some(k => item.toLowerCase().includes(k));

          if (isMovieFolder) {
            // All files in Pokémon, White Snake and Nezha are Movies!
            videoFiles.forEach(vf => {
              const fLower = vf.fileName.toLowerCase();
              let cleanTitle = vf.fileName.replace(/\.(mp4|mkv|avi|mov|wmv)$/i, '');

              // Custom title cleaning for Pokémon movies
              if (fLower.includes('hoopa') || fLower.includes('hoppa')) {
                cleanTitle = 'Pokémon o Filme: Hoopa e o Duelo Lendário (2015)';
              } else if (fLower.includes('darkrai')) {
                cleanTitle = 'Pokémon 10: O Pesadelo de Darkrai';
              } else if (fLower.includes('viajantes')) {
                cleanTitle = 'Pokémon 4: Viajantes do Tempo';
              } else if (fLower.includes('latios') || fLower.includes('latias')) {
                cleanTitle = 'Pokémon 5: Heróis - Latios e Latias';
              } else if (fLower.includes('jirachi')) {
                cleanTitle = 'Pokémon 6: Jirachi - Realizador de Desejos';
              } else if (fLower.includes('alma gêmea') || fLower.includes('alma gemea')) {
                cleanTitle = 'Pokémon 7: Alma Gêmea';
              } else if (fLower.includes('lucário') || fLower.includes('lucario')) {
                cleanTitle = 'Pokémon 8: Lucario e o Mistério de Mew';
              } else if (fLower.includes('evolução') || fLower.includes('evolucao')) {
                cleanTitle = 'Pokémon: Mewtwo Contra-Ataca - Evolução';
              } else if (fLower.includes('victini') || fLower.includes('zekron')) {
                cleanTitle = 'Pokémon o Filme: Victini e Zekrom';
              } else if (fLower.includes('2000')) {
                cleanTitle = 'Pokémon 2000: O Poder de Um';
              } else if (fLower.includes('first movie')) {
                cleanTitle = 'Pokémon: O Filme - Mewtwo Contra-Ataca (1998)';
              } else if (fLower.includes('renascer') || fLower.includes('zha 2')) {
                cleanTitle = 'Ne Zha 2: O Renascer da Alma (2025)';
              } else if (fLower.includes('nezha.mkv')) {
                cleanTitle = 'Ne Zha (2019)';
              } else if (fLower.includes('afloat')) {
                cleanTitle = 'A Lenda da Serpente Branca 3: Afloat';
              } else if (fLower.includes('serpente 2')) {
                cleanTitle = 'A Lenda da Serpente Branca 2 (Green Snake)';
              } else if (fLower.includes('white snake.mkv') || fLower.includes('white snake')) {
                cleanTitle = 'A Lenda da Serpente Branca (White Snake)';
              }

              animeMoviesList.push({
                filePath: vf.filePath,
                fileName: vf.fileName,
                dirName: item,
                cleanTitle: cleanTitle,
                category: 'animes'
              });
            });
          } else {
            // Check for standalone movies inside series folder (e.g. Violet Evergarden Gaiden and The Movie)
            const movieFiles = [];
            const episodeFiles = [];

            videoFiles.forEach(vf => {
              const fLower = vf.fileName.toLowerCase();
              if (fLower.includes('gaiden') || fLower.includes('the movie') || fLower.includes('o filme')) {
                movieFiles.push(vf);
              } else {
                episodeFiles.push(vf);
              }
            });

            // Process standalone movies extracted from series folder
            movieFiles.forEach(vf => {
              const fLower = vf.fileName.toLowerCase();
              let cleanTitle = item;
              if (fLower.includes('gaiden')) {
                cleanTitle = 'Violet Evergarden: Eternidade e a Boneca de Automemória (Gaiden)';
              } else if (fLower.includes('the movie') || fLower.includes('o filme')) {
                cleanTitle = 'Violet Evergarden: O Filme (2020)';
              }

              animeMoviesList.push({
                filePath: vf.filePath,
                fileName: vf.fileName,
                dirName: item,
                cleanTitle: cleanTitle,
                category: 'animes'
              });
            });

            const KNOWN_SERIES_KEYS = ['frieren', 'death parade', 'fog hill', 'hibike', 'houseki no kuni', 'kill la kill', 'kyoukai no kanata', 'lord of mysteries', 'mine fujiko', 'monster', 'apotecária', 'sora yori', 'gurren lagann', 'violet evergarden'];
            const isTVSeries = KNOWN_SERIES_KEYS.some(k => item.toLowerCase().includes(k)) || episodeFiles.length >= 3;

            if (isTVSeries && episodeFiles.length > 0) {
              const seriesId = 'series-anime-' + item.toLowerCase().replace(/[^a-z0-9]/g, '-');
              const mapInfo = G_DRIVE_TITLE_MAP.find(m => item.toLowerCase().includes(m.key)) || {};

              const seriesObj = {
                id: seriesId,
                type: 'anime_series',
                category: 'animes',
                title: mapInfo.title || item,
                searchQuery: mapInfo.search || item,
                poster_path: null,
                backdrop_path: null,
                overview: `Série de anime: ${mapInfo.title || item}`,
                seasons: {}
              };

              episodeFiles.forEach((vf, idx) => {
                let seasonNum = 1;
                const sMatch = vf.relDir.match(/(\d{1,2})ª?\s*Temporada/i) || vf.fileName.match(/S0?(\d{1,2})/i);
                if (sMatch) seasonNum = parseInt(sMatch[1], 10);

                const epNum = parseAnimeEpisodeNumber(vf.fileName, idx);
                const sKey = String(seasonNum);

                if (!seriesObj.seasons[sKey]) seriesObj.seasons[sKey] = [];

                seriesObj.seasons[sKey].push({
                  season: seasonNum,
                  episode: epNum,
                  title: `Episódio ${epNum < 10 ? '0' + epNum : epNum}`,
                  fileName: vf.fileName,
                  filePath: vf.filePath
                });
              });

              Object.keys(seriesObj.seasons).forEach(sk => {
                seriesObj.seasons[sk].sort((a, b) => a.episode - b.episode);
              });

              animeSeriesList.push(seriesObj);
            } else {
              // Standalone Anime Movie files from single-file folders
              episodeFiles.forEach(vf => {
                const mapInfo = G_DRIVE_TITLE_MAP.find(m => item.toLowerCase().includes(m.key) || vf.fileName.toLowerCase().includes(m.key)) || {};
                animeMoviesList.push({
                  filePath: vf.filePath,
                  fileName: vf.fileName,
                  dirName: item,
                  cleanTitle: mapInfo.title || item,
                  category: 'animes'
                });
              });
            }
          }
        }
      } catch (e) {}
    });
  }

  // 2. Scan G:\Disney-Pixar-DreamWorks
  const disneyDir = path.join(gRootDir, 'Disney-Pixar-DreamWorks');
  if (fs.existsSync(disneyDir)) {
    const items = fs.readdirSync(disneyDir);
    items.forEach(item => {
      const full = path.join(disneyDir, item);
      try {
        const st = fs.statSync(full);
        if (st.isDirectory()) {
          const sub = fs.readdirSync(full);
          sub.forEach(f => {
            const fFull = path.join(full, f);
            if (VIDEO_EXTENSIONS.includes(path.extname(f).toLowerCase())) {
              const mapInfo = G_DRIVE_TITLE_MAP.find(m => item.toLowerCase().includes(m.key) || f.toLowerCase().includes(m.key)) || {};
              disneyMoviesList.push({
                filePath: fFull,
                fileName: f,
                dirName: item,
                cleanTitle: mapInfo.title || item,
                category: 'disney'
              });
            }
          });
        }
      } catch (e) {}
    });
  }

  return { animeSeriesList, animeMoviesList, disneyMoviesList };
}
