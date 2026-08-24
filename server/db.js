import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'library.json');

const defaultData = {
  settings: {
    scanDirectories: ['E:\\', 'F:\\Animação Ocidental'],
    tmdbApiKey: '',
    autoScan: true,
  },
  movies: [],
  series: [],
  lastScan: null,
};

export function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      saveDB(defaultData);
      return defaultData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return {
      ...defaultData,
      ...data,
      settings: { ...defaultData.settings, ...(data.settings || {}) },
      movies: data.movies || [],
      series: data.series || [],
    };
  } catch (error) {
    console.error('[DB] Erro ao ler banco de dados local:', error.message);
    return defaultData;
  }
}

export function getDB() {
  return loadDB();
}

export function saveDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('[DB] Erro ao salvar banco de dados local:', error.message);
  }
}
