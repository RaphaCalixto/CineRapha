import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import chokidar from 'chokidar';
import { getDB, loadDB } from './db.js';
import { scanMovies } from './scanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Serve static build in production if needed
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Initial DB load
loadDB();

// Global Scan status state
let scanState = {
  isScanning: false,
  progress: 0,
  total: 0
};

// GET /api/movies - Return all scanned movies
app.get('/api/movies', (req, res) => {
  const db = getDB();
  res.json({
    count: db.movies?.length || 0,
    movies: db.movies || [],
    lastScan: db.lastScan
  });
});

// GET /api/series - Return all scanned animated series
app.get('/api/series', (req, res) => {
  const db = getDB();
  res.json({
    count: db.series?.length || 0,
    series: db.series || [],
    lastScan: db.lastScan
  });
});

// GET /api/poster-proxy - Stream external image through backend to bypass browser CORS / hotlink restrictions
app.get('/api/poster-proxy', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('URL missing');
  try {
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      timeout: 8000
    });
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    response.data.pipe(res);
  } catch (err) {
    res.status(404).send('Image not found');
  }
});

// GET /api/scan/status - Check ongoing scan progress
app.get('/api/scan/status', (req, res) => {
  res.json(scanState);
});

// POST /api/scan - Trigger manual disk scan
app.post('/api/scan', async (req, res) => {
  if (scanState.isScanning) {
    return res.json({ message: 'Varredura já está em andamento.', scanState });
  }

  scanState.isScanning = true;
  scanState.progress = 0;
  scanState.total = 0;

  res.json({ message: 'Varredura iniciada em segundo plano.' });

  try {
    const result = await scanMovies();
    scanState.total = (result.movies?.length || 0) + (result.series?.length || 0);
    scanState.progress = scanState.total;
  } catch (err) {
    console.error('[Scanner Error]', err);
  } finally {
    scanState.isScanning = false;
  }
});

// GET /api/stream - Stream local video file with Range HTTP support
app.get('/api/stream', (req, res) => {
  const filePath = req.query.path;

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arquivo de vídeo não encontrado no disco local.' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const ext = path.extname(filePath).toLowerCase();
  let contentType = 'video/mp4';
  if (ext === '.mkv') contentType = 'video/x-matroska';
  else if (ext === '.avi') contentType = 'video/x-msvideo';
  else if (ext === '.mov') contentType = 'video/quicktime';
  else if (ext === '.webm') contentType = 'video/webm';

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      return res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
    }

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// POST /api/play-native - Open video file in default Windows Media Player / VLC / MPV
app.post('/api/play-native', (req, res) => {
  const { filePath } = req.body;

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'Caminho do arquivo não encontrado no disco.' });
  }

  console.log(`[Native Launcher] Abrindo vídeo no Windows: "${filePath}"`);
  
  const cmd = `cmd /c start "" "${filePath}"`;
  exec(cmd, (err) => {
    if (err) {
      console.error('[Native Launcher Error]', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'Vídeo aberto com sucesso no Windows.' });
  });
});

// POST /api/match - Manual metadata match override
app.post('/api/match', async (req, res) => {
  const { movieId, searchTitle } = req.body;
  const db = getDB();
  const movie = db.movies.find(m => m.id === movieId);

  if (!movie) {
    return res.status(404).json({ error: 'Filme não encontrado no banco.' });
  }

  try {
    const { fetchTMDBMetadata } = await import('./tmdb.js');
    const tmdbData = await fetchTMDBMetadata(searchTitle);

    if (tmdbData) {
      movie.title = tmdbData.title || searchTitle;
      movie.original_title = tmdbData.original_title || searchTitle;
      movie.overview = tmdbData.overview || movie.overview;
      movie.poster_path = tmdbData.poster_path || movie.poster_path;
      movie.poster_original = tmdbData.poster_original || movie.poster_original;
      movie.backdrop_path = tmdbData.backdrop_path || movie.backdrop_path;
      movie.vote_average = tmdbData.vote_average || movie.vote_average;
      movie.genres = tmdbData.genres || movie.genres;
      movie.cast = tmdbData.cast || movie.cast;
      saveDB(db);
    }
    res.json({ success: true, movie });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Setup Chokidar Disk Watchers for E:\ and F:\Animação Ocidental
function setupWatcher() {
  const db = getDB();
  const watchDirs = db.settings?.scanDirectories || ['E:\\', 'F:\\Animação Ocidental'];

  console.log('[Watcher] Monitorando diretórios para novos filmes e séries:', watchDirs);

  const watcher = chokidar.watch(watchDirs, {
    ignored: [
      /(^|[\/\\])\../,
      /System Volume Information/i,
      /\$RECYCLE\.BIN/i
    ],
    persistent: true,
    depth: 4,
    ignoreInitial: true
  });

  watcher.on('error', error => {
    // Suppress system permission errors gracefully
  });

  let debounceTimer = null;
  const triggerAutoScan = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log('[Watcher] Alteração detectada no disco! Executando auto-scan...');
      scanMovies();
    }, 5000);
  };

  watcher
    .on('add', path => {
      console.log(`[Watcher] Novo arquivo adicionado: ${path}`);
      triggerAutoScan();
    })
    .on('unlink', path => {
      console.log(`[Watcher] Arquivo removido do disco: ${path}`);
      triggerAutoScan();
    });
}

// Start Server and Initial Scan
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(` 🎬 CineRapha Server rodando na porta ${PORT}`);
  console.log(` http://localhost:${PORT}`);
  console.log(`====================================================`);

  // Initial Scan in Background
  scanMovies().then(() => {
    setupWatcher();
  });
});
