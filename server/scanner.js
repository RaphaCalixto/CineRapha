import fs from 'fs';
import path from 'path';
import { parseMovieName } from './nameParser.js';
import { fetchTMDBMetadata } from './tmdb.js';
import { scanSeriesDirectory } from './seriesScanner.js';
import { fetchOmdbAnimationMovie } from './fetch_animation_movies.js';
import { SERIES_PRESETS } from './fetch_series_posters.js';
import { scanGDrive } from './gDriveScanner.js';
import { getGDrivePoster } from './fetch_gdrive_posters.js';
import { getDB, saveDB } from './db.js';

const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.m4v'];

// Guaranteed High-Definition HTTP 200 Poster Presets for E:\ movies
const E_DRIVE_PRESETS = [
  { key: 'alita battle angel', title: 'Alita: Battle Angel', release_year: '2019', poster_path: 'https://m.media-amazon.com/images/M/MV5BYmZhZGQzM2MtMWEyZC00YTU1LTk4YTQtMTg3ZjEzM2U1NTkxXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'across the spider-verse', title: 'Spider-Man: Across the Spider-Verse', release_year: '2023', category: 'disney', isAnimation: true, poster_path: 'https://m.media-amazon.com/images/M/MV5BNThiZjA3MjItZGY5Ni00ZmJhLWEwN2EtOTBlYTA4Y2E0M2ZmXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'into the spider-verse', title: 'Spider-Man: Into the Spider-Verse', release_year: '2018', category: 'disney', isAnimation: true, poster_path: 'https://m.media-amazon.com/images/M/MV5BMjMwNDkxMTgzOF5BMl5BanBnXkFtZTgwNTkwNTQ3NjM@._V1_SX300.jpg' },
  { key: 'hacksaw ridge', title: 'Hacksaw Ridge', release_year: '2016', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjQ1NjM3MTUxNV5BMl5BanBnXkFtZTgwMDc5MTY5OTE@._V1_QL75_UX380_CR0,12,380,562_.jpg' },
  { key: 'inglourious basterd', title: 'Inglourious Basterds', release_year: '2009', poster_path: 'https://m.media-amazon.com/images/M/MV5BODZhMWJlNjYtNDExNC00MTIzLTllM2ItOGQ2NGVjNDQ3MzkzXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'the dark knight rises', title: 'The Dark Knight Rises', release_year: '2012', poster_path: 'https://m.media-amazon.com/images/M/MV5BMTk4ODQzNDY3Ml5BMl5BanBnXkFtZTcwODA0NTM4Nw@@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'the dark knight', title: 'The Dark Knight', release_year: '2008', poster_path: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'captain america civil war', title: 'Captain America: Civil War', release_year: '2016', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjQ0MTgyNjAxMV5BMl5BanBnXkFtZTgwNjUzMDkyODE@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'captain america the first avenger', title: 'Captain America: The First Avenger', release_year: '2011', poster_path: 'https://m.media-amazon.com/images/M/MV5BNzUyM2YyY2MtNzNlMS00MWU5LTgxNjAtNzZlNmI2NjU2NDZlXkEyXkFqcGc@._V1_QL75_UY562_CR8,0,380,562_.jpg' },
  { key: 'captain america the winter soldier', title: 'Captain America: The Winter Soldier', release_year: '2014', poster_path: 'https://m.media-amazon.com/images/M/MV5BNWY1NjFmNDItZDhmOC00NjI1LWE0ZDItMTM0MjBjZThiOTQ2XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'black swan', title: 'Black Swan', release_year: '2010', poster_path: 'https://m.media-amazon.com/images/M/MV5BNzY2NzI4OTE5MF5BMl5BanBnXkFtZTcwMjMyNDY4Mw@@._V1_SX300.jpg' },
  { key: 'cisne negro', title: 'Black Swan', release_year: '2010', poster_path: 'https://m.media-amazon.com/images/M/MV5BNzY2NzI4OTE5MF5BMl5BanBnXkFtZTcwMjMyNDY4Mw@@._V1_SX300.jpg' },
  { key: 'fury', title: 'Fury', release_year: '2014', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjA4MDU0NTUyN15BMl5BanBnXkFtZTgwMzQxMzY4MjE@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'corações de ferro', title: 'Fury', release_year: '2014', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjA4MDU0NTUyN15BMl5BanBnXkFtZTgwMzQxMzY4MjE@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'extraordinário', title: 'Wonder', release_year: '2017', poster_path: 'https://m.media-amazon.com/images/M/MV5BYmFkYTlhNWUtMzliMS00ODIyLThlMmUtOGQ0N2RmOTg4YjJiXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'wonder', title: 'Wonder', release_year: '2017', poster_path: 'https://m.media-amazon.com/images/M/MV5BYmFkYTlhNWUtMzliMS00ODIyLThlMmUtOGQ0N2RmOTg4YjJiXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'clube da luta', title: 'Clube da Luta', release_year: '1999', poster_path: 'https://m.media-amazon.com/images/M/MV5BOTgyOGQ1NDItNGU3Ny00MjU3LTg2YWEtNmEyYjBiMjI1Y2M5XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg' },
  { key: 'creed.ii', title: 'Creed II', release_year: '2018', poster_path: 'https://m.media-amazon.com/images/M/MV5BMTBmYTg3YTItZjUzYi00MGU2LThiNDUtMDA3NjNmMTFiYzZkXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'creed', title: 'Creed: Nascido para Lutar', release_year: '2015', poster_path: 'https://m.media-amazon.com/images/M/MV5BNWM3NjY2ZDctMGZiYy00OGFlLThkMTktOTY2MDM2YjE2OTliXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'cruella', title: 'Cruella', release_year: '2021', poster_path: 'https://m.media-amazon.com/images/M/MV5BMWY5MjljNjctZjhjZS00MWY0LTgwYzUtZTJiYTVmMmJkM2E0XkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'deadpool & wolverine', title: 'Deadpool & Wolverine', release_year: '2024', poster_path: 'https://m.media-amazon.com/images/M/MV5BZTk5ODY0MmQtMzA3Ni00NGY1LThiYzItZThiNjFiNDM4MTM3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'mad max', title: 'Mad Max: Estrada da Fúria', release_year: '2015', poster_path: 'https://m.media-amazon.com/images/M/MV5BZDRkODJhOTgtOTc1OC00NTgzLTk4NjItNDgxZDY4YjlmNDY2XkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'malévola', title: 'Malévola', release_year: '2014', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjAwMzAzMzExOF5BMl5BanBnXkFtZTgwOTcwMDA5MTE@._V1_SX300.jpg' },
  { key: 'malevola', title: 'Malévola', release_year: '2014', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjAwMzAzMzExOF5BMl5BanBnXkFtZTgwOTcwMDA5MTE@._V1_SX300.jpg' },
  { key: 'lilo & stitch', title: 'Lilo & Stitch', release_year: '2025', poster_path: 'https://m.media-amazon.com/images/M/MV5BYmFmZjM1ZTEtYzQ5ZS00MTRmLTkzMDktYWMxNTg2NGE3YjY4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'once upon a time in... hollywood', title: 'Once Upon a Time in... Hollywood', release_year: '2019', poster_path: 'https://m.media-amazon.com/images/M/MV5BMzMzNmViNjYtN2ViNi00NDM3LWFlMmItNDYyMGIzY2EzZjE2XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'guardiões da galaxia vol.1', title: 'Guardiões da Galáxia Vol. 1', release_year: '2014', poster_path: 'https://m.media-amazon.com/images/M/MV5BM2ZmNjQ2MzAtNDlhNi00MmQyLWJhZDMtNmJiMjFlOWY4MzcxXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'guardiões da galáxia vol.1', title: 'Guardiões da Galáxia Vol. 1', release_year: '2014', poster_path: 'https://m.media-amazon.com/images/M/MV5BM2ZmNjQ2MzAtNDlhNi00MmQyLWJhZDMtNmJiMjFlOWY4MzcxXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'espetacular homem aranha 2', title: 'O Espetacular Homem-Aranha 2', release_year: '2014', poster_path: 'https://m.media-amazon.com/images/M/MV5BOTA5NDYxNTg0OV5BMl5BanBnXkFtZTgwODE5NzU1MTE@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'espetacular homem aranha', title: 'O Espetacular Homem-Aranha', release_year: '2012', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjMyOTM4MDMxNV5BMl5BanBnXkFtZTcwNjIyNzExOA@@._V1_QL75_UX380_CR0,1,380,562_.jpg' },
  { key: 'world war z', title: 'World War Z', release_year: '2013', poster_path: 'https://m.media-amazon.com/images/M/MV5BODg3ZTM2YWQtZDE5Ny00NGNiLTkzYjgtYWVlYjNkOTg5NDI1XkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'evil dead', title: 'A Morte do Demônio (Evil Dead)', release_year: '2013', poster_path: 'https://m.media-amazon.com/images/M/MV5BYjkwODM5ZWUtMjI2Ni00Y2RiLWJkNDYtZWQ2ZTRhMjI1N2FmXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'ford vs ferrari', title: 'Ford vs Ferrari', release_year: '2019', poster_path: 'https://m.media-amazon.com/images/M/MV5BOTBjNTEyNjYtYjdkNi00YzE5LTljYzUtZjVlYmYwZmJmZWYxXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'free guy', title: 'Free Guy: Assumindo o Controle', release_year: '2021', poster_path: 'https://m.media-amazon.com/images/M/MV5BN2I0MGMxYjUtZTZiMS00MzMxLTkzNWYtMDUyZmUwY2ViYTljXkEyXkFqcGc@._V1_QL75_UY562_CR5,0,380,562_.jpg' },
  { key: 'gigantes de aço', title: 'Gigantes de Aço', release_year: '2011', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjEzMzEzNjg0N15BMl5BanBnXkFtZTcwMzg4NDk0Ng@@._V1_SX300.jpg' },
  { key: 'guardians of the galaxy vol.3', title: 'Guardiões da Galáxia Vol. 3', release_year: '2023', poster_path: 'https://m.media-amazon.com/images/M/MV5BOTJhOTMxMmItZmE0Ny00MDc3LWEzOGEtOGFkMzY4MWYyZDQ0XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'guardiões da galaxia vol.2', title: 'Guardiões da Galáxia Vol. 2', release_year: '2017', poster_path: 'https://m.media-amazon.com/images/M/MV5BNWE5MGI3MDctMmU5Ni00YzI2LWEzMTQtZGIyZDA5MzQzNDBhXkEyXkFqcGc@._V1_QL75_UX380_CR0,1,380,562_.jpg' },
  { key: 'hachiko', title: 'Sempre ao Seu Lado (Hachiko)', release_year: '2009', poster_path: 'https://m.media-amazon.com/images/M/MV5BNTU5NjYyYTgtZGQ3My00MzRhLThjNGYtZmVjN2JjYjhkMjhhXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'hansel and gretel', title: 'João e Maria: Caçadores de Bruxas', release_year: '2013', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjA4MDQwODg2NV5BMl5BanBnXkFtZTcwNTc5ODc2OA@@._V1_SX300.jpg' },
  { key: 'historia.de.um.casamento', title: 'História de um Casamento', release_year: '2019', poster_path: 'https://m.media-amazon.com/images/M/MV5BNmE0OWJlM2MtNzhmMi00YmQyLTlmY2EtZmUzNzBiNGRlN2JkXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'espetacular homem aranha 2', title: 'O Espetacular Homem-Aranha 2', release_year: '2014', poster_path: 'https://m.media-amazon.com/images/M/MV5BOTA5NDYxNTg0OV5BMl5BanBnXkFtZTgwODE5NzU1MTE@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'sem volta para casa', title: 'Homem-Aranha: Sem Volta Para Casa', release_year: '2021', poster_path: 'https://m.media-amazon.com/images/M/MV5BMmFiZGZjMmEtMTA0Ni00MzA2LTljMTYtZGI2MGJmZWYzZTQ2XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg' },
  { key: 'jojo.rabbit', title: 'Jojo Rabbit', release_year: '2019', poster_path: 'https://m.media-amazon.com/images/M/MV5BYmFmNmUyMjYtZTFjNS00OWQyLThhZmMtMGZkYTQ3YjY0ZDQ1XkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'kill.bill.vol.1', title: 'Kill Bill: Vol. 1', release_year: '2003', poster_path: 'https://m.media-amazon.com/images/M/MV5BZmMyYzJlZmYtY2I3NC00NjAyLTkyZWItZjdjZDI1YTYyYTEwXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg' },
  { key: 'kill.bill.vol.2', title: 'Kill Bill: Vol. 2', release_year: '2004', poster_path: 'https://m.media-amazon.com/images/M/MV5BY2FiNzhiZTctNzU1Mi00NDkwLWExNDMtZTg0MjYyNzhkNWNkXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'kingsman - serviço secreto', title: 'Kingsman: Serviço Secreto', release_year: '2014', poster_path: 'https://m.media-amazon.com/images/M/MV5BODk1MTYwNTAtYmI5Zi00OWYyLWE0MzQtOWE4NDIxZmU2MjMwXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg' },
  { key: 'círculo.dourado', title: 'Kingsman: O Círculo Dourado', release_year: '2017', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjQ3OTgzMzY4NF5BMl5BanBnXkFtZTgwOTc4OTQyMzI@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'logan', title: 'Logan', release_year: '2017', poster_path: 'https://m.media-amazon.com/images/M/MV5BM2JjODdkMGMtNmY2YS00OGM2LThiY2YtZGYyNzE4Nzc2ODA0XkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'malévola', title: 'Malévola', release_year: '2014', poster_path: 'https://m.media-amazon.com/images/M/MV5BZTIyMGJlNmUtZmQxMi00ZDI5LWI0ZmEtNzU5MTNmZTFhODZiXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'viúva negra', title: 'Viúva Negra', release_year: '2021', poster_path: 'https://m.media-amazon.com/images/M/MV5BZTMyZTA0ZTItYjY3Yi00ODNjLWExYTgtYzgxZTk0NTg0Y2FlXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'viuva negra', title: 'Viúva Negra', release_year: '2021', poster_path: 'https://m.media-amazon.com/images/M/MV5BZTMyZTA0ZTItYjY3Yi00ODNjLWExYTgtYzgxZTk0NTg0Y2FlXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'troia', title: 'Tróia', release_year: '2004', poster_path: 'https://m.media-amazon.com/images/M/MV5BMTk5MzU1MDMwMF5BMl5BanBnXkFtZTcwNjczODMzMw@@._V1_SX300.jpg' },
  { key: 'star wars iii', title: 'Star Wars: Episódio III - A Vingança dos Sith', release_year: '2005', poster_path: 'https://m.media-amazon.com/images/M/MV5BNTc4MTc3NTQ5OF5BMl5BanBnXkFtZTcwOTg0NjI4NA@@._V1_SX300.jpg' },
  { key: 'star wars ii', title: 'Star Wars: Episódio II - Ataque dos Clones', release_year: '2002', poster_path: 'https://m.media-amazon.com/images/M/MV5BNTgxMjY2YzUtZmVmNC00YjAwLWJlODMtNDBhNzllNzIzMjgxXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'star wars i', title: 'Star Wars: Episódio I - A Ameaça Fantasma', release_year: '1999', poster_path: 'https://m.media-amazon.com/images/M/MV5BODVhNGIxOGItYWNlMi00YTA0LWI3NTctZmQxZGUwZDEyZWI4XkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'quarentena.2.', title: 'Quarentena 2', release_year: '2011', poster_path: 'https://m.media-amazon.com/images/M/MV5BNTk0YWJmNzktZDViMy00NThkLTg1NWQtOWY2MjY1MGJiZmFjXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'quarentena.2008', title: 'Quarentena', release_year: '2008', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjY0MDgwNTQ4OF5BMl5BanBnXkFtZTcwMzQzNjY3MQ@@._V1_SX300.jpg' },
  { key: 'quarentena', title: 'Quarentena', release_year: '2008', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjY0MDgwNTQ4OF5BMl5BanBnXkFtZTcwMzQzNjY3MQ@@._V1_SX300.jpg' },
  { key: 'saving.private.ryan', title: 'O Resgate do Soldado Ryan', release_year: '1998', poster_path: 'https://m.media-amazon.com/images/M/MV5BZGZhZGQ1ZWUtZTZjYS00MDJhLWFkYjctN2ZlYjE5NWYwZDM2XkEyXkFqcGc@._V1_QL75_UY562_CR1,0,380,562_.jpg' },
  { key: 'resgate do soldado ryan', title: 'O Resgate do Soldado Ryan', release_year: '1998', poster_path: 'https://m.media-amazon.com/images/M/MV5BZGZhZGQ1ZWUtZTZjYS00MDJhLWFkYjctN2ZlYjE5NWYwZDM2XkEyXkFqcGc@._V1_QL75_UY562_CR1,0,380,562_.jpg' },
  { key: 'lobo.de.wall.street', title: 'O Lobo de Wall Street', release_year: '2013', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'lobo de wall street', title: 'O Lobo de Wall Street', release_year: '2013', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'protocolo fantasma', title: 'Missão: Impossível - Protocolo Fantasma', release_year: '2011', poster_path: 'https://m.media-amazon.com/images/M/MV5BNzYwMTU4NDU3Nl5BMl5BanBnXkFtZTgwMDQ4NjA2MDE@._V1_SX300.jpg' },
  { key: 'lado bom da vida', title: 'O Lado Bom da Vida', release_year: '2012', poster_path: 'https://m.media-amazon.com/images/M/MV5BMTM2MTI5NzA3MF5BMl5BanBnXkFtZTcwODExNTc0OA@@._V1_SX300.jpg' },
  { key: 'menino.do.pijama.listrado', title: 'O Menino do Pijama Listrado', release_year: '2008', poster_path: 'https://m.media-amazon.com/images/M/MV5BMTMzMTc3MjA5NF5BMl5BanBnXkFtZTcwOTk3MDE5MQ@@._V1_SX300.jpg' },
  { key: 'menino do pijama listrado', title: 'O Menino do Pijama Listrado', release_year: '2008', poster_path: 'https://m.media-amazon.com/images/M/MV5BMTMzMTc3MjA5NF5BMl5BanBnXkFtZTcwOTk3MDE5MQ@@._V1_SX300.jpg' },
  { key: 'caçador.de.bruxas', title: 'O Último Caçador de Bruxas', release_year: '2015', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjM5Njk5MzYzM15BMl5BanBnXkFtZTgwNzM1Mjk4NjE@._V1_SX300.jpg' },
  { key: 'parasita', title: 'Parasita', release_year: '2019', poster_path: 'https://m.media-amazon.com/images/M/MV5BYjk1Y2U4MjQtY2ZiNS00OWQyLWI3MmYtZWUwNmRjYWRiNWNhXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'terras selvagens', title: 'Predador: Terras Selvagens (Prey)', release_year: '2022', poster_path: 'https://m.media-amazon.com/images/M/MV5BMWVjYTBlYjktODhjZS00OTUyLTg4MzctODI4MTkyNDE5YzY0XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'pulp fiction', title: 'Pulp Fiction: Tempo de Violência', release_year: '1994', poster_path: 'https://m.media-amazon.com/images/M/MV5BYTViYTE3ZGQtNDBlMC00ZTAyLTkyODMtZGRiZDg0MjA2YThkXkEyXkFqcGc@._V1_QL75_UY562_CR3,0,380,562_.jpg' },
  { key: 'speed racer', title: 'Speed Racer', release_year: '2008', poster_path: 'https://m.media-amazon.com/images/M/MV5BNzE3MWIxNzktYzQyMy00NGQ5LThmZTktM2ZkZjc0NWEzZTg5XkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'efeito.fallout', title: 'Missão: Impossível - Efeito Fallout', release_year: '2018', poster_path: 'https://m.media-amazon.com/images/M/MV5BZmUwZTg2YmMtMmZjOS00ZDYwLWI2ZDgtZDcyY2ZmMWMwZDdlXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'preço do amanhã', title: 'O Preço do Amanhã', release_year: '2011', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjA3NzI1ODc1MV5BMl5BanBnXkFtZTcwMzI5NjQwNg@@._V1_SX300.jpg' },
  { key: 'thor ragnarok', title: 'Thor: Ragnarok', release_year: '2017', poster_path: 'https://m.media-amazon.com/images/M/MV5BMjMyNDkzMzI1OF5BMl5BanBnXkFtZTgwODcxODg5MjI@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'titanic', title: 'Titanic', release_year: '1997', poster_path: 'https://m.media-amazon.com/images/M/MV5BYzYyN2FiZmUtYWYzMy00MzViLWJkZTMtOGY1ZjgzNWMwN2YxXkEyXkFqcGc@._V1_QL75_UX380_CR0,2,380,562_.jpg' },
  { key: 'top gun', title: 'Top Gun: Maverick', release_year: '2022', poster_path: 'https://m.media-amazon.com/images/M/MV5BMDBkZDNjMWEtOTdmMi00NmExLTg5MmMtNTFlYTJlNWY5YTdmXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'troia', title: 'Tróia', release_year: '2004', poster_path: 'https://m.media-amazon.com/images/M/MV5BMTQwMDk1MTg2N15BMl5BanBnXkFtZTcwMzc5MTk3Mw@@._V1_SX300.jpg' },
  { key: 'v for vendetta', title: 'V de Vingança', release_year: '2005', poster_path: 'https://m.media-amazon.com/images/M/MV5BOTI5ODc3NzExNV5BMl5BanBnXkFtZTcwNzYxNzQzMw@@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'age of ultron', title: 'Vingadores: Era de Ultron', release_year: '2015', poster_path: 'https://m.media-amazon.com/images/M/MV5BODBhYTg1NGQtNGVmNS00ZTdiLThjYTYtZDFkNzRiNTZmNDZjXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'endgame', title: 'Vingadores: Ultimato', release_year: '2019', poster_path: 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_SX300.jpg' },
  { key: 'os vingadores 4k', title: 'Os Vingadores', release_year: '2012', poster_path: 'https://m.media-amazon.com/images/M/MV5BNGE0YTVjNzUtNzJjOS00NGNlLTgxMzctZTY4YTE1Y2Y1ZTU4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { key: 'viúva negra', title: 'Viúva Negra', release_year: '2021', poster_path: 'https://m.media-amazon.com/images/M/MV5BNjRmNDI5MjMtMmViZC00OTNjLTgyZjItOWZmZDkzYzczMWExXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'watchmen', title: 'Watchmen: Os Observadores', release_year: '2009', poster_path: 'https://m.media-amazon.com/images/M/MV5BYmJiNTUwYWUtZDllNi00ODdjLWFmNTEtOTVlNmYxYTZhNzYzXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'zumbilandia', title: 'Zumbilândia', release_year: '2009', poster_path: 'https://m.media-amazon.com/images/M/MV5BMTU5MDg0NTQ1N15BMl5BanBnXkFtZTcwMjA4Mjg3Mg@@._V1_SX300.jpg' },
  { key: 'tropa de elite 2', title: 'Tropa de Elite 2', release_year: '2010', poster_path: 'https://m.media-amazon.com/images/M/MV5BZjU3Yzk3NzctYWNiNy00YWMzLThiOGItODc3NmEzODBkYjRmXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'tropa de elite', title: 'Tropa de Elite', release_year: '2007', poster_path: 'https://m.media-amazon.com/images/M/MV5BZjU3Yzk3NzctYWNiNy00YWMzLThiOGItODc3NmEzODBkYjRmXkEyXkFqcGc@._V1_SX300.jpg' },
  { key: 'à espera de um milagre', title: 'À Espera de um Milagre', release_year: '1999', poster_path: 'https://m.media-amazon.com/images/M/MV5BMTUxMzQyNjA5MF5BMl5BanBnXkFtZTYwOTU2NTY3._V1_QL75_UX380_CR0,0,380,562_.jpg' }
];

export async function scanMovies(customDirs = null) {
  const db = getDB();
  const scanDirs = customDirs || ['E:\\'];
  console.log(`[Scanner] Varrendo arquivos live-action em E:\\...`);

  const videoFiles = [];

  for (const dirPath of scanDirs) {
    if (!fs.existsSync(dirPath)) continue;
    try {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        if (item.toLowerCase().includes('animação') || item.toLowerCase().includes('animacao')) continue;
        if (item.toLowerCase().includes('vingadores.ultimato.2019.2160p')) continue; // Excluído a pedido do usuário
        
        const fullPath = path.join(dirPath, item);
        let stat;
        try { stat = fs.statSync(fullPath); } catch (e) { continue; }

        if (stat.isDirectory()) {
          try {
            const subItems = fs.readdirSync(fullPath);
            for (const subItem of subItems) {
              const ext = path.extname(subItem).toLowerCase();
              if (VIDEO_EXTENSIONS.includes(ext)) {
                videoFiles.push({
                  filePath: path.join(fullPath, subItem),
                  fileName: subItem,
                  dirName: item
                });
              }
            }
          } catch(e) {}
        } else {
          const ext = path.extname(item).toLowerCase();
          if (VIDEO_EXTENSIONS.includes(ext)) {
            videoFiles.push({
              filePath: fullPath,
              fileName: item,
              dirName: ''
            });
          }
        }
      }
    } catch (err) {
      console.error(`[Scanner] Erro ao ler diretório ${dirPath}:`, err.message);
    }
  }

  // Retain existing metadata map
  const existingMap = {};
  (db.movies || []).forEach(m => {
    if (m.filePath) existingMap[m.filePath.toLowerCase()] = m;
    if (m.fileName) existingMap[m.fileName.toLowerCase()] = m;
  });

  const updatedMovies = [];

  // 1. Process Live Action Movies from E:\
  for (const item of videoFiles) {
    const keyPath = item.filePath.toLowerCase();
    const keyName = item.fileName.toLowerCase();

    // ALWAYS parse from filename ONLY, ignoring directory name as requested
    const { title: parsedTitle, cleanTitle: parsedCleanTitle, year } = parseMovieName(item.fileName, '');
    const cleanTitle = parsedCleanTitle || parsedTitle || item.fileName;
    const searchKey = (cleanTitle + ' ' + item.fileName).toLowerCase();

    const preset = E_DRIVE_PRESETS.find(p => searchKey.includes(p.key));
    const existingObj = existingMap[keyPath] || existingMap[keyName];

    // Priority: 1. preset poster (if matches searchKey), 2. existing valid poster, 3. null
    const finalPoster = preset?.poster_path || ((existingObj && existingObj.poster_path && !existingObj.poster_path.includes('404')) ? existingObj.poster_path : null);

    const movieObj = {
      id: Buffer.from(item.filePath).toString('hex').slice(0, 16),
      filePath: item.filePath,
      fileName: item.fileName,
      cleanTitle: preset?.title || cleanTitle,
      title: preset?.title || existingObj?.title || cleanTitle,
      original_title: preset?.title || existingObj?.original_title || cleanTitle,
      overview: existingObj?.overview || 'Filme disponível no seu disco local (E:\\).',
      poster_path: finalPoster,
      poster_original: finalPoster,
      backdrop_path: finalPoster,
      release_year: preset?.release_year || existingObj?.release_year || year || '2020',
      vote_average: existingObj?.vote_average || 8.0,
      runtime: existingObj?.runtime || 120,
      genres: existingObj?.genres || ['Ação', 'Cinema'],
      cast: existingObj?.cast || [],
      category: preset?.category || existingObj?.category || 'movies',
      isAnimation: preset?.isAnimation || existingObj?.isAnimation || false,
      addedAt: existingObj?.addedAt || new Date().toISOString()
    };

    updatedMovies.push(movieObj);
  }

  // 2. Process Western Animations from F:\Animação Ocidental
  console.log(`[Scanner] Varrendo F:\\Animação Ocidental...`);
  const fSeriesResult = scanSeriesDirectory('F:\\Animação Ocidental');
  
  if (fSeriesResult?.animationMoviesList && fSeriesResult.animationMoviesList.length > 0) {
    for (const fItem of fSeriesResult.animationMoviesList) {
      const omdbData = await fetchOmdbAnimationMovie(fItem.fileName, fItem.fileName);
      const title = omdbData?.title || fItem.fileName.replace(/\.(mp4|mkv|avi|mov|wmv)$/i, '');
      const presetPoster = getGDrivePoster(title) || getGDrivePoster(fItem.fileName);
      const existingItem = (db.movies || []).find(m => m.filePath.toLowerCase() === fItem.filePath.toLowerCase() || m.title === title);
      const poster = existingItem?.poster_path || presetPoster || omdbData?.poster_path || null;
      
      const animMovieObj = {
        id: Buffer.from(fItem.filePath).toString('hex').slice(0, 16),
        filePath: fItem.filePath,
        fileName: fItem.fileName,
        cleanTitle: title,
        title: title,
        original_title: title,
        overview: existingItem?.overview || omdbData?.overview || 'Filme de animação ocidental.',
        poster_path: poster,
        poster_original: poster,
        backdrop_path: poster,
        release_year: existingItem?.release_year || omdbData?.release_year || '2020',
        vote_average: existingItem?.vote_average || omdbData?.vote_average || 7.5,
        runtime: existingItem?.runtime || 90,
        genres: existingItem?.genres || omdbData?.genres || ['Animação'],
        cast: existingItem?.cast || [],
        category: 'western_animation',
        isAnimation: true,
        addedAt: existingItem?.addedAt || new Date().toISOString()
      };
      
      if (!updatedMovies.some(m => m.filePath.toLowerCase() === fItem.filePath.toLowerCase())) {
        updatedMovies.push(animMovieObj);
      }
    }
  }

  // 3. Process G:\ Drive (ANIMES & Disney-Pixar-DreamWorks)
  console.log(`[Scanner] Varrendo G:\\ (Animes & Disney-Pixar-DreamWorks)...`);
  const gDriveResult = await scanGDrive('G:\\');
  
  if (gDriveResult?.animeMoviesList && gDriveResult.animeMoviesList.length > 0) {
    for (const aMovie of gDriveResult.animeMoviesList) {
      const rawName = aMovie.fileName.replace(/\.(mp4|mkv|avi|mov|wmv)$/i, '');
      const presetPoster = getGDrivePoster(aMovie.fileName) || getGDrivePoster(aMovie.filePath) || getGDrivePoster(rawName) || getGDrivePoster(aMovie.cleanTitle);
      const omdbData = !presetPoster ? await fetchOmdbAnimationMovie(aMovie.cleanTitle || rawName, aMovie.fileName) : null;
      const title = aMovie.cleanTitle || omdbData?.title || rawName;
      const existingItem = (db.movies || []).find(m => m.filePath.toLowerCase() === aMovie.filePath.toLowerCase() || m.title === title);
      const poster = existingItem?.poster_path || presetPoster || omdbData?.poster_path;
      
      const animeMovieObj = {
        id: Buffer.from(aMovie.filePath).toString('hex').slice(0, 16),
        filePath: aMovie.filePath,
        fileName: aMovie.fileName,
        cleanTitle: title,
        title: title,
        original_title: title,
        overview: existingItem?.overview || omdbData?.overview || `Filme de anime: ${title}`,
        poster_path: poster,
        poster_original: poster,
        backdrop_path: poster,
        release_year: existingItem?.release_year || omdbData?.release_year || '2020',
        vote_average: existingItem?.vote_average || omdbData?.vote_average || 8.2,
        runtime: existingItem?.runtime || 105,
        genres: existingItem?.genres || omdbData?.genres || ['Animação', 'Anime', 'Fantasia'],
        cast: existingItem?.cast || [],
        category: 'animes',
        isAnimation: true,
        addedAt: existingItem?.addedAt || new Date().toISOString()
      };
      
      if (!updatedMovies.some(m => m.filePath.toLowerCase() === aMovie.filePath.toLowerCase())) {
        updatedMovies.push(animeMovieObj);
      }
    }
  }

  if (gDriveResult?.disneyMoviesList && gDriveResult.disneyMoviesList.length > 0) {
    for (const dMovie of gDriveResult.disneyMoviesList) {
      const omdbData = await fetchOmdbAnimationMovie(dMovie.cleanTitle, dMovie.fileName);
      const title = dMovie.cleanTitle || omdbData?.title || dMovie.fileName;
      const existingItem = (db.movies || []).find(m => m.filePath.toLowerCase() === dMovie.filePath.toLowerCase() || m.title === title);
      const poster = existingItem?.poster_path || omdbData?.poster_path || getGDrivePoster(title);
      
      const disneyMovieObj = {
        id: Buffer.from(dMovie.filePath).toString('hex').slice(0, 16),
        filePath: dMovie.filePath,
        fileName: dMovie.fileName,
        cleanTitle: title,
        title: title,
        original_title: title,
        overview: existingItem?.overview || omdbData?.overview || `Animação Disney/Pixar/DreamWorks: ${title}`,
        poster_path: poster,
        poster_original: poster,
        backdrop_path: poster,
        release_year: existingItem?.release_year || omdbData?.release_year || '2020',
        vote_average: existingItem?.vote_average || omdbData?.vote_average || 8.0,
        runtime: existingItem?.runtime || 95,
        genres: existingItem?.genres || omdbData?.genres || ['Animação', 'Família'],
        cast: existingItem?.cast || [],
        category: 'disney',
        isAnimation: true,
        addedAt: existingItem?.addedAt || new Date().toISOString()
      };
      
      if (!updatedMovies.some(m => m.filePath.toLowerCase() === dMovie.filePath.toLowerCase())) {
        updatedMovies.push(disneyMovieObj);
      }
    }
  }

  // 4. Combine Series from F:\ & G:\
  const updatedSeries = [];
  
  function attachSeasonPosters(s) {
    const lowerTitle = s.title.toLowerCase();
    if (lowerTitle.includes('aang') || lowerTitle.includes('last airbender')) {
      s.season_posters = {
        '1': 'https://m.media-amazon.com/images/M/MV5BMDMwMThjYWYtY2Q2OS00OGM2LTlkODQtNDJlZTZmMjAyYmFhXkEyXkFqcGc@._V1_SX300.jpg',
        '2': 'https://www.planocritico.com/wp-content/uploads/2021/03/avatar-a-lenda-de-aang-2-temp-plano-critico.jpg',
        '3': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYmrbKQopleBxFiHs8UcXSs-wTD-zStMKDvuD1LpuE4zH--TDHjWWRh2o&s=10'
      };
    } else if (lowerTitle.includes('korra')) {
      s.season_posters = {
        '1': 'https://media.kitsu.app/anime/7927/poster_image/bb127b4947b541a180e487ec89bb241b.jpg',
        '2': 'https://media.kitsu.app/anime/7938/poster_image/1959025cfe430f06031986b0fcf572bc.jpg',
        '3': 'https://media.kitsu.app/anime/8077/poster_image/776bafbd00a4e5122c1fce210730fc72.jpg',
        '4': 'https://media.kitsu.app/anime/8706/poster_image/7cc88ddda2e225ab5b164024b1f01bf1.jpg'
      };
    } else if (lowerTitle.includes('castlevania')) {
      s.season_posters = {
        '1': 'https://m.media-amazon.com/images/M/MV5BMjAzMjU2MjYzMl5BMl5BanBnXkFtZTgwNTQ4Nzk1NjM@._V1_SX300.jpg',
        '2': 'https://sm.ign.com/t/ign_br/screenshot/default/castlevania-season2_qjgk.1200.jpg',
        '3': 'https://oyster.ignimgs.com/wordpress/stg.ign.com/2020/02/EP8zs7EVUAAgul2.jpg',
        '4': 'https://br.web.img2.acsta.net/pictures/21/05/10/23/24/5911982.jpg'
      };
    } else if (lowerTitle.includes('fog hill') || lowerTitle.includes('wu shan')) {
      s.season_posters = {
        '1': 'https://media.kitsu.app/anime/poster_images/41361/original.jpg',
        '2': 'https://media.kitsu.app/anime/45557/poster_image/876945957d27e6a2c8fea365529ed84e.jpg'
      };
    } else if (lowerTitle.includes('hibike')) {
      s.season_posters = {
        '1': 'https://media.kitsu.app/anime/poster_images/9980/original.jpg',
        '2': 'https://media.kitsu.app/anime/poster_images/11474/original.jpg',
        '3': 'https://media.kitsu.app/anime/42372/poster_image/64a74f22b2d86d8ecdd719ced0246fcd.png'
      };
    } else if (lowerTitle.includes('frieren')) {
      s.season_posters = {
        '1': 'https://media.kitsu.app/anime/46474/poster_image/99d7df09d8cb9360b1e02825372ce612.jpg',
        '2': 'https://media.kitsu.app/anime/49240/poster_image/127830b1fbf80dd13a604998ef10d12c.jpg'
      };
    } else if (lowerTitle.includes('apotecária') || lowerTitle.includes('apotecaria') || lowerTitle.includes('diário') || lowerTitle.includes('diario') || lowerTitle.includes('kusuriya')) {
      s.season_posters = {
        '1': 'https://media.kitsu.app/anime/47083/poster_image/1e25d26e74707ada861514620f630da8.jpg',
        '2': 'https://media.kitsu.app/anime/48649/poster_image/e5e0b9560d8236c57add65f086d5e2ef.jpg'
      };
    }
  }

  if (fSeriesResult?.seriesList && fSeriesResult.seriesList.length > 0) {
    fSeriesResult.seriesList.forEach(s => {
      s.category = 'western_series';
      attachSeasonPosters(s);
      if (!updatedSeries.some(existing => existing.id === s.id)) {
        updatedSeries.push(s);
      }
    });
  }

  if (gDriveResult?.animeSeriesList && gDriveResult.animeSeriesList.length > 0) {
    for (const s of gDriveResult.animeSeriesList) {
      s.category = 'animes';
      const presetPoster = getGDrivePoster(s.title);
      const omdbData = !presetPoster ? await fetchOmdbAnimationMovie(s.title, s.title) : null;
      const poster = presetPoster || omdbData?.poster_path;
      if (poster) {
        s.poster_path = poster;
        s.backdrop_path = poster;
      }

      attachSeasonPosters(s);

      if (!updatedSeries.some(existing => existing.id === s.id)) {
        updatedSeries.push(s);
      }
    }
  }

  // Save to Database
  db.movies = updatedMovies;
  db.series = updatedSeries;
  db.lastScan = new Date().toISOString();
  saveDB(db);

  console.log(`[Scanner] Varredura finalizada com sucesso! ${updatedMovies.length} filmes totais e ${updatedSeries.length} séries no catálogo.`);
  return { movies: updatedMovies, series: updatedSeries };
}
