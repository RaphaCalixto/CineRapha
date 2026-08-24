import axios from 'axios';

const OMDB_KEYS = ['b77b7377', 'trilogy', 'eb59e218', '743d8c11'];

// Translation mapping for animation movies in F:\Animação Ocidental
const ANIMATION_TITLE_MAP = [
  // Avatar 2026 Animated Movie
  {
    key: 'avatar aang',
    term: 'Aang: The Last Airbender (2026)',
    preset: {
      title: 'Avatar Aang: O Último Mestre do Ar (2026)',
      poster_path: 'https://m.media-amazon.com/images/M/MV5BMDMwMThjYWYtY2Q2OS00OGM2LTlkODQtNDJlZTZmMjAyYmFhXkEyXkFqcGc@._V1_SX300.jpg',
      backdrop_path: 'https://m.media-amazon.com/images/M/MV5BMDMwMThjYWYtY2Q2OS00OGM2LTlkODQtNDJlZTZmMjAyYmFhXkEyXkFqcGc@._V1_SX300.jpg',
      overview: 'Filme de animação em longa-metragem da Paramount e Avatar Studios focado nas aventuras de Aang e seus amigos adultos.',
      vote_average: 8.5,
      release_year: '2026',
      genres: ['Animação', 'Ação', 'Aventura']
    }
  },

  // Scooby Doo Movies
  {
    key: 'bruxa',
    term: 'Scooby-Doo and the Witch\'s Ghost',
    preset: {
      title: 'Scooby-Doo! e o Fantasma da Bruxa',
      poster_path: 'https://m.media-amazon.com/images/M/MV5BYWM3YmY1YjEtOTA3YS00Y2E0LWI4ZjQtODhiMTNhZTNiM2VkXkEyXkFqcGdeQXVyNDgyODgxNjE@._V1_SX300.jpg',
      backdrop_path: 'https://m.media-amazon.com/images/M/MV5BYWM3YmY1YjEtOTA3YS00Y2E0LWI4ZjQtODhiMTNhZTNiM2VkXkEyXkFqcGdeQXVyNDgyODgxNjE@._V1_SX300.jpg',
      overview: 'Scooby e a turma viajam até a Nova Inglaterra para investigar o fantasma de uma ancestral bruxa.',
      vote_average: 7.4,
      release_year: '1999',
      genres: ['Animação', 'Comédia', 'Mistério']
    }
  },
  {
    key: 'múmia',
    term: 'Scooby-Doo! in Where\'s My Mummy?',
    preset: {
      title: 'Scooby-Doo! Onde Está a Minha Múmia?',
      poster_path: 'https://m.media-amazon.com/images/M/MV5BY2M0NmQzMjYtNDg3Yi00NzQyLThkY2UtMWU1ZGJlNWQ0YmIzXkEyXkFqcGdeQXVyNDQ5MDYzMTk@._V1_SX300.jpg',
      backdrop_path: 'https://m.media-amazon.com/images/M/MV5BY2M0NmQzMjYtNDg3Yi00NzQyLThkY2UtMWU1ZGJlNWQ0YmIzXkEyXkFqcGdeQXVyNDQ5MDYzMTk@._V1_SX300.jpg',
      overview: 'Velma está no Egito decifrando o enigma da Esfinge quando descobre uma tumba amaldiçoada.',
      vote_average: 6.9,
      release_year: '2005',
      genres: ['Animação', 'Comédia', 'Mistério']
    }
  },
  {
    key: 'vampiro',
    term: 'Scooby-Doo! and the Legend of the Vampire',
    preset: {
      title: 'Scooby-Doo! e a Lenda do Vampiro',
      poster_path: 'https://m.media-amazon.com/images/M/MV5BZTZkY2U1YWMtMTkwNC00M2Q0LTgxMmMtMjg3YWEyMzQ1MzVhXkEyXkFqcGdeQXVyNDgyODgxNjE@._V1_SX300.jpg',
      backdrop_path: 'https://m.media-amazon.com/images/M/MV5BZTZkY2U1YWMtMTkwNC00M2Q0LTgxMmMtMjg3YWEyMzQ1MzVhXkEyXkFqcGdeQXVyNDgyODgxNjE@._V1_SX300.jpg',
      overview: 'De férias na Austrália, Scooby e a Mistério S/A investigam o desaparecimento de bandas em um festival de rock por um lendário vampiro.',
      vote_average: 6.7,
      release_year: '2003',
      genres: ['Animação', 'Comédia', 'Mistério']
    }
  },
  {
    key: 'zumbis',
    term: 'Scooby-Doo! Return to Zombie Island',
    preset: {
      title: 'Scooby-Doo! De Volta à Ilha dos Zumbis',
      poster_path: 'https://m.media-amazon.com/images/M/MV5BYmJlYjU0MWQtYTRkMi00ODAwLWFkZGUtNGRkNzJjMzIzNWU0XkEyXkFqcGdeQXVyNTgyNTA4MjM@._V1_SX300.jpg',
      backdrop_path: 'https://m.media-amazon.com/images/M/MV5BYmJlYjU0MWQtYTRkMi00ODAwLWFkZGUtNGRkNzJjMzIzNWU0XkEyXkFqcGdeQXVyNTgyNTA4MjM@._V1_SX300.jpg',
      overview: 'Scooby-Doo e a turma saem da aposentadoria para investigar uma misteriosa ilha onde zumbis famintos despertam novamente.',
      vote_average: 5.8,
      release_year: '2019',
      genres: ['Animação', 'Comédia', 'Mistério']
    }
  },
  {
    key: 'chase',
    term: 'Scooby-Doo and the Cyber Chase',
    preset: {
      title: 'Scooby-Doo! e a Caçada Virtual',
      poster_path: 'https://m.media-amazon.com/images/M/MV5BNDJlMWQ3YjAtOGFiOS00N2IxLThmYTUtYzZiOTFmZDc4NzFiXkEyXkFqcGdeQXVyNDQ5MDYzMTk@._V1_SX300.jpg',
      backdrop_path: 'https://m.media-amazon.com/images/M/MV5BNDJlMWQ3YjAtOGFiOS00N2IxLThmYTUtYzZiOTFmZDc4NzFiXkEyXkFqcGdeQXVyNDQ5MDYzMTk@._V1_SX300.jpg',
      overview: 'Scooby e sua turma entram em um videogame onde precisam enfrentar o temível Vírus Phantom.',
      vote_average: 7.0,
      release_year: '2001',
      genres: ['Animação', 'Comédia', 'Ficção Científica']
    }
  },

  // DC Comics & Teen Titans
  { key: 'contrato de judas', term: 'Teen Titans: The Judas Contract', year: '2017' },
  { key: 'jovens titãs o contrato de judas', term: 'Teen Titans: The Judas Contract', year: '2017' },
  { key: 'a morte do superman', term: 'The Death of Superman', year: '2018' },
  { key: 'a morte e o retorno do superman', term: 'Reign of the Supermen', year: '2019' },
  { key: 'o reino do superman', term: 'Reign of the Supermen', year: '2019' },
  { key: 'batman - a piada mortal', term: 'Batman: The Killing Joke', year: '2016' },
  { key: 'a piada mortal', term: 'Batman: The Killing Joke', year: '2016' },
  { key: 'batman - sangue ruim', term: 'Batman: Bad Blood', year: '2016' },
  { key: 'sangue ruim', term: 'Batman: Bad Blood', year: '2016' },
  { key: 'batman do futuro', term: 'Batman Beyond: Return of the Joker', year: '2000' },
  { key: 'retorno do coringa', term: 'Batman Beyond: Return of the Joker', year: '2000' },
  { key: 'batman e superman - darkseid', term: 'Superman/Batman: Apocalypse', year: '2010' },
  { key: 'batman vs robin', term: 'Batman vs. Robin', year: '2015' },
  { key: 'ponto de ignição', term: 'Justice League: The Flashpoint Paradox', year: '2013' },
  { key: 'liga da justiça - guerra', term: 'Justice League: War', year: '2014' },
  { key: 'guerra de apokolips', term: 'Justice League Dark: Apokolips War', year: '2020' },
  { key: 'liga da justiça sombria', term: 'Justice League Dark', year: '2017' },
  { key: 'liga da justiça vs jovens titães', term: 'Justice League vs. Teen Titans', year: '2016' },
  { key: 'trono de atlântida', term: 'Justice League: Throne of Atlantis', year: '2015' },
  { key: 'o filho do batman', term: 'Son of Batman', year: '2014' },

  // More Scooby Doo
  { key: 'abominavel', term: 'Chill Out, Scooby-Doo!', year: '2007' },
  { key: 'aliens', term: 'Scooby-Doo and the Alien Invaders', year: '2000' },
  { key: 'aloha', term: 'Aloha, Scooby-Doo!', year: '2005' },
  { key: 'fantasmossauro', term: 'Scooby-Doo! Legend of the Phantosaur', year: '2011' },
  { key: 'piratas', term: 'Scooby-Doo! Pirates Ahoy!', year: '2006' },

  // Resident Evil Movies
  { key: 'ilha da morte', term: 'Resident Evil: Death Island', year: '2023' },
  { key: 'a vingança', term: 'Resident Evil: Vendetta', year: '2017' },

  // Simpsons & Tom and Jerry
  { key: 'os simpsons', term: 'The Simpsons Movie', year: '2007' },
  { key: 'tom e jerry', term: 'Tom and Jerry: The Movie', year: '1992' }
];

export async function fetchOmdbAnimationMovie(cleanTitle, fileName) {
  const lower = (cleanTitle + ' ' + (fileName || '')).toLowerCase();

  for (const entry of ANIMATION_TITLE_MAP) {
    if (lower.includes(entry.key)) {
      if (entry.preset) {
        return entry.preset;
      }
      const searchTerm = entry.term;
      const searchYear = entry.year;

      for (const k of OMDB_KEYS) {
        try {
          const url = `http://www.omdbapi.com/?apikey=${k}&t=${encodeURIComponent(searchTerm)}${searchYear ? '&y=' + searchYear : ''}`;
          const res = await axios.get(url, { timeout: 4000 });
          if (res.data && res.data.Response === 'True' && res.data.Poster && res.data.Poster !== 'N/A') {
            return {
              title: res.data.Title || searchTerm,
              poster_path: res.data.Poster,
              backdrop_path: res.data.Poster,
              overview: res.data.Plot && res.data.Plot !== 'N/A' ? res.data.Plot : 'Filme de animação ocidental.',
              vote_average: res.data.imdbRating && res.data.imdbRating !== 'N/A' ? parseFloat(res.data.imdbRating) : 7.5,
              release_year: res.data.Year || searchYear || null,
              genres: res.data.Genre && res.data.Genre !== 'N/A' ? res.data.Genre.split(', ') : ['Animação']
            };
          }
        } catch (e) {}
      }
    }
  }

  return null;
}
