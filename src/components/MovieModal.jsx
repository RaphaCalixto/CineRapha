import React, { useState } from 'react';
import { X, Play, MonitorPlay, Star, Clock, Calendar, Folder, Edit3 } from 'lucide-react';
import { getPosterUrl } from '../utils/posterHelper';

export default function MovieModal({ movie, onClose, onPlayWeb, onPlayNative, onOpenMatch }) {
  const [imageError, setImageError] = useState(false);

  if (!movie) return null;

  const rawBg = movie.backdrop_path || movie.poster_path || movie.poster_original;
  const rawPoster = movie.poster_path || movie.poster_original;
  const bgImage = !imageError && getPosterUrl(rawBg);
  const posterThumb = getPosterUrl(rawPoster);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      {/* Modal Container Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#181818] rounded-3xl overflow-hidden shadow-2xl border border-white/10 my-auto animate-scale-up"
      >
        {/* Close Button X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/70 hover:bg-[#E50914] text-white transition-colors border border-white/20 cursor-pointer shadow-lg"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Backdrop Banner */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-neutral-900">
          {bgImage ? (
            <img
              src={bgImage}
              alt={movie.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center filter brightness-[0.7]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-black" />
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent" />

          {/* Floating Poster & Info */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end gap-6 z-20">
            {posterThumb && (
              <img
                src={posterThumb}
                alt={movie.title}
                className="w-32 sm:w-40 md:w-48 aspect-[2/3] object-cover rounded-2xl shadow-2xl border-2 border-white/20 shrink-0 hidden sm:block"
              />
            )}

            <div className="flex-1 min-w-0">
              <span className="inline-block bg-[#E50914] text-white text-[10px] sm:text-xs px-3 py-1 rounded-md font-black uppercase tracking-wider mb-2">
                DISCO LOCAL
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight drop-shadow-lg mb-3">
                {movie.title}
              </h2>

              {movie.original_title && movie.original_title !== movie.title && (
                <p className="text-xs text-neutral-400 mb-3 italic">
                  Título Original: {movie.original_title}
                </p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-neutral-300">
                {movie.vote_average > 0 && (
                  <span className="inline-flex items-center justify-center gap-1.5 bg-[#f5c518] text-black px-4 py-2 rounded-xl font-black shadow-md shrink-0">
                    <Star className="w-4 h-4 fill-black shrink-0" />
                    <span>{movie.vote_average} / 10</span>
                  </span>
                )}
                {movie.release_year && (
                  <span className="inline-flex items-center justify-center gap-1.5 bg-white/15 backdrop-blur-md px-4 py-2 rounded-xl text-white border border-white/15 shrink-0">
                    <Calendar className="w-4 h-4 text-neutral-300 shrink-0" />
                    <span>{movie.release_year}</span>
                  </span>
                )}
                {movie.runtime > 0 && (
                  <span className="inline-flex items-center justify-center gap-1.5 bg-white/15 backdrop-blur-md px-4 py-2 rounded-xl text-white border border-white/15 shrink-0">
                    <Clock className="w-4 h-4 text-neutral-300 shrink-0" />
                    <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body Info & Actions */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onPlayWeb(movie)}
              className="bg-[#E50914] hover:bg-[#b80710] active:scale-95 text-white font-black py-4 px-8 min-w-[240px] rounded-2xl flex items-center justify-center gap-3 text-base shadow-xl shadow-[#E50914]/40 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="w-5 h-5 fill-white shrink-0" />
              <span>Assistir no Navegador</span>
            </button>

            <button
              onClick={() => onPlayNative(movie)}
              className="bg-white/20 hover:bg-white/30 active:scale-95 text-white font-black py-4 px-8 min-w-[220px] rounded-2xl flex items-center justify-center gap-3 text-base backdrop-blur-md border border-white/25 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <MonitorPlay className="w-5 h-5 text-white shrink-0" />
              <span>Abrir no Windows</span>
            </button>

            <button
              onClick={() => onOpenMatch(movie)}
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer ml-auto shrink-0"
              title="Corrigir capa e informações no TMDB"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Corrigir Título (TMDB)</span>
            </button>
          </div>

          {/* Synopsis */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Sinopse
            </h3>
            <p className="text-sm md:text-base text-neutral-200 leading-relaxed">
              {movie.overview || 'Nenhuma sinopse disponível para este filme.'}
            </p>
          </div>

          {/* Metadata Grid (Cast & Genres) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            {movie.genres && movie.genres.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  Gêneros
                </h4>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((g, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1 rounded-md bg-white/5 text-neutral-300 border border-white/10 font-medium"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.cast && movie.cast.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  Elenco Principal
                </h4>
                <p className="text-xs text-neutral-300 leading-normal font-medium">
                  {movie.cast.slice(0, 5).join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Disk File Path Information */}
          <div className="pt-4 border-t border-white/10 bg-white/5 p-4 rounded-2xl flex items-center gap-3">
            <Folder className="w-5 h-5 text-[#E50914] shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Caminho do Arquivo em Disco:
              </span>
              <code className="text-xs text-neutral-300 font-mono truncate block select-all">
                {movie.filePath}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
