import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import MovieRow from './components/MovieRow';
import MovieCard from './components/MovieCard';
import SeriesCard from './components/SeriesCard';
import MovieModal from './components/MovieModal';
import SeriesModal from './components/SeriesModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import MatchModal from './components/MatchModal';
import SettingsModal from './components/SettingsModal';
import PWAManager from './components/PWAManager';
import { getPosterUrl } from './utils/posterHelper';
import { RefreshCw, FolderOpen, CheckCircle2, Tv, Film, Sparkles, Heart, ServerOff } from 'lucide-react';
import initialLibrary from '../server/library.json';

const getInitialMovies = () => {
  try {
    const cached = localStorage.getItem('cinerapha_movies');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return initialLibrary.movies || [];
};

const getInitialSeries = () => {
  try {
    const cached = localStorage.getItem('cinerapha_series');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return initialLibrary.series || [];
};

export default function App() {
  const [movies, setMovies] = useState(getInitialMovies);
  const [series, setSeries] = useState(getInitialSeries);
  const [loading, setLoading] = useState(false);
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('inicio'); // 'inicio' | 'filmes' | 'animacoes' | 'animes' | 'disney'
  const [searchTerm, setSearchTerm] = useState('');
  const [scanStatus, setScanStatus] = useState({ isScanning: false, progress: 0, total: 0 });
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [playingWebMovie, setPlayingWebMovie] = useState(null);
  const [matchingMovie, setMatchingMovie] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Fetch Movies & Series Catalog
  const fetchCatalog = async () => {
    try {
      const [resMovies, resSeries] = await Promise.all([
        fetch('/api/movies'),
        fetch('/api/series')
      ]);
      if (resMovies.ok && resSeries.ok) {
        const dataMovies = await resMovies.json();
        const dataSeries = await resSeries.json();

        if (dataMovies.movies && dataMovies.movies.length > 0) {
          setMovies(dataMovies.movies);
          try { localStorage.setItem('cinerapha_movies', JSON.stringify(dataMovies.movies)); } catch (e) {}
        }
        if (dataSeries.series && dataSeries.series.length > 0) {
          setSeries(dataSeries.series);
          try { localStorage.setItem('cinerapha_series', JSON.stringify(dataSeries.series)); } catch (e) {}
        }
        setIsServerOnline(true);
      }
    } catch (err) {
      console.warn('[CineRapha] Servidor local indisponível. Exibindo catálogo em cache.', err);
      setIsServerOnline(false);
    }
  };

  useEffect(() => {
    fetchCatalog();

    // Poll scanner status every 2 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/scan/status');
        const data = await res.json();
        setScanStatus(data);
        if (data.isScanning) {
          fetchCatalog();
        }
      } catch (e) {
        // ignore network error
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Trigger manual disk scan
  const handleTriggerScan = async () => {
    try {
      await fetch('/api/scan', { method: 'POST' });
      showToast('Varredura de discos (E:\\, F:\\ e G:\\) iniciada!');
    } catch (err) {
      console.error('Erro ao iniciar varredura:', err);
    }
  };

  // Launch Native Windows Player
  const handlePlayNative = async (item) => {
    showToast(`Abrindo "${item.title}" no player do Windows...`);
    try {
      const res = await fetch('/api/play-native', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: item.filePath }),
      });
      const data = await res.json();
      if (!data.success) {
        showToast(`Erro ao abrir mídia: ${data.error}`);
      }
    } catch (err) {
      showToast(`Erro ao abrir no Windows: ${err.message}`);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Categorized Collections
  const liveActionMovies = useMemo(() => {
    return movies.filter(m => m.category !== 'disney' && (m.category === 'movies' || (!m.isAnimation && (!m.filePath || m.filePath.startsWith('E:')))));
  }, [movies]);

  const westernAnimationMovies = useMemo(() => {
    return movies.filter(m => m.category === 'western_animation' || (m.isAnimation && m.filePath && m.filePath.includes('Animação Ocidental')));
  }, [movies]);

  const animeMovies = useMemo(() => {
    return movies.filter(m => m.category === 'animes' || (m.filePath && m.filePath.includes('ANIMES')));
  }, [movies]);

  const animeSeries = useMemo(() => {
    return series.filter(s => s.category === 'animes' || (s.id && s.id.includes('anime')));
  }, [series]);

  const westernSeries = useMemo(() => {
    return series.filter(s => s.category === 'western_series' || !s.id || !s.id.includes('anime'));
  }, [series]);

  const disneyMovies = useMemo(() => {
    return movies.filter(m => m.category === 'disney' || (m.filePath && m.filePath.includes('Disney-Pixar-DreamWorks')));
  }, [movies]);

  // Combined Everything for Início
  const allCatalogMovies = useMemo(() => {
    return movies;
  }, [movies]);

  // Filtered Live Action Movies by Search
  const filteredLiveActionMovies = useMemo(() => {
    if (!searchTerm.trim()) return liveActionMovies;
    const q = searchTerm.toLowerCase().trim();
    return liveActionMovies.filter(m =>
      m.title.toLowerCase().includes(q) ||
      (m.original_title && m.original_title.toLowerCase().includes(q)) ||
      (m.overview && m.overview.toLowerCase().includes(q))
    );
  }, [liveActionMovies, searchTerm]);

  // Filtered Western Animation Movies by Search
  const filteredWesternAnimationMovies = useMemo(() => {
    if (!searchTerm.trim()) return westernAnimationMovies;
    const q = searchTerm.toLowerCase().trim();
    return westernAnimationMovies.filter(m =>
      m.title.toLowerCase().includes(q) ||
      (m.overview && m.overview.toLowerCase().includes(q))
    );
  }, [westernAnimationMovies, searchTerm]);

  // Filtered Anime Movies by Search
  const filteredAnimeMovies = useMemo(() => {
    if (!searchTerm.trim()) return animeMovies;
    const q = searchTerm.toLowerCase().trim();
    return animeMovies.filter(m =>
      m.title.toLowerCase().includes(q) ||
      (m.overview && m.overview.toLowerCase().includes(q))
    );
  }, [animeMovies, searchTerm]);

  // Filtered Anime Series by Search
  const filteredAnimeSeries = useMemo(() => {
    if (!searchTerm.trim()) return animeSeries;
    const q = searchTerm.toLowerCase().trim();
    return animeSeries.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.overview && s.overview.toLowerCase().includes(q))
    );
  }, [animeSeries, searchTerm]);

  // Filtered Disney Movies by Search
  const filteredDisneyMovies = useMemo(() => {
    if (!searchTerm.trim()) return disneyMovies;
    const q = searchTerm.toLowerCase().trim();
    return disneyMovies.filter(m =>
      m.title.toLowerCase().includes(q) ||
      (m.overview && m.overview.toLowerCase().includes(q))
    );
  }, [disneyMovies, searchTerm]);

  // Featured Hero Movie (Fixed on Avatar: A Lenda de Korra - Season 3 Banner)
  const featuredHeroMovie = useMemo(() => {
    const season3KorraBanner = 'https://media.kitsu.app/anime/8077/poster_image/776bafbd00a4e5122c1fce210730fc72.jpg';
    const korraSeries = series.find(s => s.title.toLowerCase().includes('korra'));
    if (korraSeries) {
      return {
        ...korraSeries,
        poster_path: season3KorraBanner,
        backdrop_path: season3KorraBanner,
        poster_original: season3KorraBanner,
        isSeries: true
      };
    }
    return {
      id: 'series-a-lenda-de-korra',
      title: 'Avatar: A Lenda de Korra',
      category: 'western_series',
      overview: 'Korra, uma jovem impulsiva e destemida da Tribo da Água do Sul, assume o papel de Avatar enfrentando novos desafios na moderna Cidade República.',
      poster_path: season3KorraBanner,
      backdrop_path: season3KorraBanner,
      vote_average: 8.5,
      release_year: '2012-2014',
      genres: ['Animação', 'Ação', 'Aventura', 'Fantasia'],
      isSeries: true
    };
  }, [series]);

  // Categorized Rows for Início
  const recentlyAdded = useMemo(() => {
    return [...allCatalogMovies].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
  }, [allCatalogMovies]);

  const topRated = useMemo(() => {
    return [...allCatalogMovies]
      .filter(m => m.vote_average > 0)
      .sort((a, b) => b.vote_average - a.vote_average);
  }, [allCatalogMovies]);

  return (
    <div className="min-h-screen bg-[#141414] text-white selection:bg-[#E50914] selection:text-white pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181818] border border-[#E50914]/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-[#E50914]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        scanStatus={scanStatus}
        onTriggerScan={handleTriggerScan}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isServerOnline={isServerOnline}
      />

      {/* Main Content Area */}
      {loading ? (
        <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
          <RefreshCw className="w-10 h-10 text-[#E50914] animate-spin" />
          <p className="text-sm font-semibold text-neutral-400">Carregando seu Netflix Pessoal...</p>
        </div>
      ) : (
        <main className="pt-0">
          {/* TAB 1: INÍCIO - UNIFIED CATALOG */}
          {activeTab === 'inicio' && !searchTerm && (
            <>
              <HeroBanner
                movie={featuredHeroMovie}
                onPlayWeb={(m) => {
                  if (m.isSeries || m.seasons) {
                    setSelectedSeries(m);
                  } else {
                    setPlayingWebMovie(m);
                  }
                }}
                onPlayNative={(m) => {
                  if (m.isSeries || m.seasons) {
                    setSelectedSeries(m);
                  } else {
                    handlePlayNative(m);
                  }
                }}
                onOpenDetails={(m) => {
                  if (m.isSeries || m.seasons) {
                    setSelectedSeries(m);
                  } else {
                    setSelectedMovie(m);
                  }
                }}
              />

              <div className="-mt-12 relative z-30 space-y-4">
                {/* 1. Animes Row on Início */}
                {animeSeries.length > 0 && (
                  <div className="px-8 sm:px-14 md:px-20 mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-[#E50914]" />
                      <span>⛩️ Séries de Anime em Destaque (G:\ANIMES)</span>
                    </h2>
                    <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                      {animeSeries.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => setSelectedSeries(s)}
                          className="group relative flex-none w-48 sm:w-56 md:w-60 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:z-50 origin-center"
                        >
                          <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#181818] rounded-2xl border border-white/10 shadow-lg">
                            {s.poster_path ? (
                              <img
                                src={getPosterUrl(s.poster_path)}
                                alt={s.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-neutral-800 to-black">
                                <Sparkles className="w-10 h-10 text-[#E50914] mb-2" />
                                <span className="text-sm font-extrabold text-white">{s.title}</span>
                              </div>
                            )}
                            <span className="absolute top-3 right-3 bg-[#E50914] text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase shadow-md">
                              ANIME
                            </span>
                          </div>
                          <div className="pt-2 px-1">
                            <h3 className="text-sm font-bold text-white truncate group-hover:text-[#E50914] transition-colors">
                              {s.title}
                            </h3>
                            <span className="text-xs text-neutral-400 font-medium">
                              {Object.keys(s.seasons || {}).length} Temporada(s)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <MovieRow
                  title="🏰 Disney, Pixar & DreamWorks (G:\)"
                  movies={disneyMovies}
                  onOpenDetails={(m) => setSelectedMovie(m)}
                />

                <MovieRow
                  title="🔥 Adicionados Recentes"
                  movies={recentlyAdded}
                  onOpenDetails={(m) => setSelectedMovie(m)}
                />

                <MovieRow
                  title="🧙‍♂️ Animações Ocidentais (F:\)"
                  movies={westernAnimationMovies}
                  onOpenDetails={(m) => setSelectedMovie(m)}
                />

                <MovieRow
                  title="⭐ Top Avaliados"
                  movies={topRated}
                  onOpenDetails={(m) => setSelectedMovie(m)}
                />

                <MovieRow
                  title="🍿 Filmes Live-Action (E:\)"
                  movies={liveActionMovies}
                  onOpenDetails={(m) => setSelectedMovie(m)}
                />
              </div>
            </>
          )}

          {/* TAB 2: FILMES - EXCLUSIVE TO E:\ DRIVE */}
          {(activeTab === 'filmes' || (searchTerm && filteredLiveActionMovies.length > 0)) && (
            <div
              className="px-8 sm:px-14 md:px-20 pb-24"
              style={{ paddingTop: '210px' }}
            >
              <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                <Film className="w-8 h-8 text-[#E50914]" />
                <h1 className="text-3xl font-black text-white">Filmes Live-Action (Disco E:\)</h1>
                <span className="text-sm font-bold px-3 py-1 rounded-full bg-white/10 text-neutral-300">
                  {filteredLiveActionMovies.length} Filmes
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                {filteredLiveActionMovies.map((movie) => (
                  <div key={movie.id} className="flex justify-center">
                    <MovieCard
                      movie={movie}
                      onOpenDetails={(m) => setSelectedMovie(m)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ANIMAÇÕES OCIDENTAIS - EXCLUSIVE TO F:\Animação Ocidental */}
          {(activeTab === 'animacoes' || (searchTerm && (westernSeries.length > 0 || filteredWesternAnimationMovies.length > 0))) && (
            <div
              className="px-8 sm:px-14 md:px-20 pb-24 space-y-12"
              style={{ paddingTop: '210px' }}
            >
              {/* 1. SECTION: SÉRIES ANIMADAS */}
              {westernSeries.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-3">
                    <Tv className="w-7 h-7 text-[#E50914]" />
                    <h2 className="text-2xl font-black text-white">Séries Animadas Ocidentais (F:\)</h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300">
                      {westernSeries.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                    {westernSeries.map((s) => (
                      <div key={s.id} className="flex justify-center">
                        <SeriesCard
                          series={s}
                          isAnime={false}
                          onOpenDetails={(ser) => setSelectedSeries(ser)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. SECTION: FILMES ANIMADOS OCIDENTAIS */}
              {filteredWesternAnimationMovies.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-3">
                    <Film className="w-7 h-7 text-[#E50914]" />
                    <h2 className="text-2xl font-black text-white">Filmes de Animação Ocidental</h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300">
                      {filteredWesternAnimationMovies.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                    {filteredWesternAnimationMovies.map((movie) => (
                      <div key={movie.id} className="flex justify-center">
                        <MovieCard
                          movie={movie}
                          onOpenDetails={(m) => setSelectedMovie(m)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ANIMES - EXCLUSIVE TO G:\ANIMES */}
          {activeTab === 'animes' && (
            <div
              className="px-8 sm:px-14 md:px-20 pb-24 space-y-12"
              style={{ paddingTop: '210px' }}
            >
              {/* SÉRIES DE ANIME */}
              {filteredAnimeSeries.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-3">
                    <Sparkles className="w-7 h-7 text-[#E50914]" />
                    <h2 className="text-2xl font-black text-white">Séries de Anime (Com Temporadas)</h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300">
                      {filteredAnimeSeries.length} Séries
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                    {filteredAnimeSeries.map((s) => (
                      <div key={s.id} className="flex justify-center">
                        <SeriesCard
                          series={s}
                          isAnime={true}
                          onOpenDetails={(ser) => setSelectedSeries(ser)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FILMES DE ANIME */}
              {filteredAnimeMovies.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-3">
                    <Film className="w-7 h-7 text-[#E50914]" />
                    <h2 className="text-2xl font-black text-white">Filmes de Anime</h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300">
                      {filteredAnimeMovies.length} Filmes
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                    {filteredAnimeMovies.map((movie) => (
                      <div key={movie.id} className="flex justify-center">
                        <MovieCard
                          movie={movie}
                          onOpenDetails={(m) => setSelectedMovie(m)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DISNEY / PIXAR / DREAMWORKS - EXCLUSIVE TO G:\Disney-Pixar-DreamWorks */}
          {activeTab === 'disney' && (
            <div
              className="px-8 sm:px-14 md:px-20 pb-24"
              style={{ paddingTop: '210px' }}
            >
              <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                <Heart className="w-8 h-8 text-[#E50914]" />
                <h1 className="text-3xl font-black text-white">Disney, Pixar & DreamWorks (Disco G:\)</h1>
                <span className="text-sm font-bold px-3 py-1 rounded-full bg-white/10 text-neutral-300">
                  {filteredDisneyMovies.length} Filmes de Animação
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                {filteredDisneyMovies.map((movie) => (
                  <div key={movie.id} className="flex justify-center">
                    <MovieCard
                      movie={movie}
                      onOpenDetails={(m) => setSelectedMovie(m)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {movies.length === 0 && series.length === 0 && (
            <div
              className="px-4 text-center max-w-md mx-auto py-12"
              style={{ paddingTop: '230px' }}
            >
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#E50914]">
                <FolderOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Nenhum título catalogado</h3>
              <p className="text-xs text-neutral-400 mb-6">
                Adicione suas pastas nos discos locais (<code className="text-neutral-200">E:\</code>, <code className="text-neutral-200">F:\</code> e <code className="text-neutral-200">G:\</code>) e clique no botão de escaneamento.
              </p>
              <button
                onClick={handleTriggerScan}
                className="btn-primary mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Escanear Discos Agora</span>
              </button>
            </div>
          )}
        </main>
      )}

      {/* Modals */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onPlayWeb={(m) => setPlayingWebMovie(m)}
          onPlayNative={handlePlayNative}
          onOpenMatch={(m) => {
            setSelectedMovie(null);
            setMatchingMovie(m);
          }}
        />
      )}

      {selectedSeries && (
        <SeriesModal
          series={selectedSeries}
          onClose={() => setSelectedSeries(null)}
          onPlayWeb={(ep) => setPlayingWebMovie(ep)}
          onPlayNative={handlePlayNative}
        />
      )}

      {playingWebMovie && (
        <VideoPlayerModal
          movie={playingWebMovie}
          onClose={() => setPlayingWebMovie(null)}
          onPlayNative={handlePlayNative}
        />
      )}

      {matchingMovie && (
        <MatchModal
          movie={matchingMovie}
          onClose={() => setMatchingMovie(null)}
          onMatchComplete={(updated) => {
            fetchCatalog();
            setSelectedMovie(updated);
          }}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          onScanTriggered={handleTriggerScan}
        />
      )}

      {/* PWA Registration, Auto-Update Toast & Install Banner */}
      <PWAManager />
    </div>
  );
}
