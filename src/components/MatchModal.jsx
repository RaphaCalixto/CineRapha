import React, { useState } from 'react';
import { X, Search, Check, Film, Loader2 } from 'lucide-react';

export default function MatchModal({ movie, onClose, onMatchComplete }) {
  const [query, setQuery] = useState(movie ? movie.cleanTitle || movie.title : '');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  if (!movie) return null;

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/search-tmdb?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError('Erro ao pesquisar no TMDB: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMovie = async (tmdbId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/movies/${movie.id}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId }),
      });
      const data = await res.json();
      if (data.success) {
        onMatchComplete(data.movie);
        onClose();
      } else {
        setError(data.error || 'Erro ao vincular filme');
      }
    } catch (err) {
      setError('Erro ao salvar vínculo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#181818] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-[#E50914]" />
              Corrigir Busca do TMDB
            </h3>
            <p className="text-xs text-neutral-400">
              Arquivo: <code className="text-neutral-300 font-mono">{movie.fileName}</code>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite o título correto do filme..."
              className="w-full bg-black/60 border border-white/15 focus:border-[#E50914] text-white text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pesquisar'}
          </button>
        </form>

        {error && (
          <div className="bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914] text-xs p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
          {results.length === 0 && !loading && (
            <p className="text-center text-xs text-neutral-500 py-8">
              Pesquise o nome do filme acima para ver as opções disponíveis no catálogo do TMDB.
            </p>
          )}

          {results.map((res) => (
            <div
              key={res.tmdb_id}
              className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 transition-colors cursor-pointer"
              onClick={() => handleSelectMovie(res.tmdb_id)}
            >
              {res.poster_path ? (
                <img
                  src={res.poster_path}
                  alt={res.title}
                  className="w-12 aspect-[2/3] object-cover rounded-md shrink-0"
                />
              ) : (
                <div className="w-12 aspect-[2/3] bg-neutral-800 rounded-md shrink-0 flex items-center justify-center">
                  <Film className="w-5 h-5 text-neutral-500" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{res.title}</h4>
                <div className="flex items-center gap-3 text-xs text-neutral-400 mt-0.5">
                  {res.release_year && <span>Ano: {res.release_year}</span>}
                  {res.vote_average > 0 && <span>Nota: {res.vote_average}</span>}
                </div>
                <p className="text-xs text-neutral-400 line-clamp-1 mt-1">{res.overview}</p>
              </div>

              <button className="p-2 rounded-lg bg-[#E50914] text-white hover:scale-105 transition-transform shrink-0">
                <Check className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
