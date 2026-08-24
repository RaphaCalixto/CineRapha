import React, { useState } from 'react';
import { X, Play, Star, Clock, Calendar, Folder, Film, Tv, Edit3 } from 'lucide-react';
import { getPosterUrl } from '../utils/posterHelper';

export default function MovieModal({ movie, onClose, onPlayWeb, onPlayNative, onOpenMatch }) {
  const [imageError, setImageError] = useState(false);

  if (!movie) return null;

  const rawBg = movie.backdrop_path || movie.poster_path || movie.poster_original;
  const rawPoster = movie.poster_path || movie.poster_original;
  const bgImage = !imageError && getPosterUrl(rawBg);
  const posterThumb = getPosterUrl(rawPoster);

  // Studio / Category label formatting
  const getCategoryLabel = () => {
    if (movie.category === 'western_animation') return 'Animação Ocidental';
    if (movie.category === 'animes') return 'Anime';
    if (movie.genres?.includes('Disney') || movie.genres?.includes('Pixar') || movie.genres?.includes('DreamWorks')) return 'Disney/Pixar/DreamWorks';
    return 'Cinema / Produção Local';
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto"
    >
      {/* Modal Container Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-[#0c0d12] rounded-[28px] overflow-hidden shadow-2xl border border-white/10 my-auto animate-scale-up p-6 md:p-8"
      >
        {/* Full Card Background Image with Gradient Overlay */}
        {bgImage && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src={bgImage}
              alt={movie.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center opacity-25 filter blur-sm scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0c0d12]/95 via-[#0c0d12]/90 to-[#0c0d12]/80" />
          </div>
        )}

        {/* Close Button X */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-40 w-10 h-10 rounded-full bg-black/60 hover:bg-[#E50914] text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
          title="Fechar"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Top Hero Layout: Poster + Main Details */}
        <div className="relative z-10 flex flex-col md:flex-row items-stretch gap-6 md:gap-8">
          {/* Left Poster Card */}
          {posterThumb && (
            <div className="w-56 sm:w-64 md:w-72 lg:w-80 aspect-[2/3] rounded-2xl overflow-hidden border border-white/15 shadow-2xl shrink-0 bg-neutral-900 mx-auto md:mx-0">
              <img
                src={posterThumb}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Right Column Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1 text-left">
            <div>
              {/* Badge DISCO LOCAL */}
              <span className="inline-block bg-[#E50914] text-white text-[11px] font-black uppercase px-3 py-1 rounded-md tracking-wider mb-3 w-fit shadow-md">
                DISCO LOCAL
              </span>

              {/* Title */}
              <h1 className="brand-font text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md mb-4">
                {movie.title}
              </h1>

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-neutral-300 mb-4">
                {movie.vote_average > 0 && (
                  <div className="flex items-center gap-1.5 text-white">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                    <span>{(movie.vote_average || 8.0).toFixed(1).replace('.', ',')} / 10</span>
                  </div>
                )}
                {movie.release_year && (
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>{movie.release_year}</span>
                  </div>
                )}
                {movie.runtime > 0 && (
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                  </div>
                )}
                <span className="bg-[#00C853] text-white text-xs font-black px-2 py-0.5 rounded shadow-sm uppercase">
                  L
                </span>

                {/* Optional TMDB match button */}
                {onOpenMatch && (
                  <button
                    onClick={() => onOpenMatch(movie)}
                    className="ml-auto p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Corrigir capa e informações (TMDB)"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Overview / Synopsis */}
              <p className="text-neutral-300 text-sm md:text-base leading-relaxed font-normal line-clamp-4 max-w-2xl my-4">
                {movie.overview || 'Quando o novo carteiro Jesper é enviado para uma cidade gelada no norte, ele encontra Klaus, um fabricante de brinquedos recluso. Seus caminhos se cruzam e criam uma amizade que vai transformar uma cidade fria em um lugar alegre.'}
              </p>
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {/* Button 1: Assistir agora */}
              <button
                onClick={() => onPlayWeb(movie)}
                className="bg-gradient-to-r from-[#E50914] via-[#D00711] to-[#A8050D] hover:brightness-110 active:scale-95 text-white font-black py-4 px-6 rounded-2xl flex items-center gap-4 border border-red-500/40 shadow-xl shadow-[#E50914]/30 transition-all cursor-pointer group"
              >
                <Play className="w-8 h-8 fill-white text-white shrink-0 group-hover:scale-105 transition-transform" />
                <div className="text-left leading-tight">
                  <span className="block text-base sm:text-lg font-black text-white">Assistir agora</span>
                  <span className="block text-xs font-medium text-white/80">Reproduzir no navegador</span>
                </div>
              </button>

              {/* Button 2: Abrir no Windows */}
              <button
                onClick={() => onPlayNative(movie)}
                className="bg-white/10 hover:bg-white/15 active:scale-95 text-white font-black py-4 px-6 rounded-2xl flex items-center gap-4 backdrop-blur-md border border-white/20 shadow-xl transition-all cursor-pointer group"
              >
                <svg className="w-8 h-8 text-white fill-current shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                  <path d="M0 3.449L9.75 2.1v9.451H0zM10.5 1.95L24 0v11.4H10.5zM0 12.6h9.75v9.451L0 20.7zM10.5 12.6H24V24l-13.5-1.95z" />
                </svg>
                <div className="text-left leading-tight">
                  <span className="block text-base sm:text-lg font-black text-white">Abrir no Windows</span>
                  <span className="block text-xs font-medium text-neutral-300">Assistir no seu player local</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Lower Section: Footer Information Card */}
        <div className="relative z-10 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Section 1: GÊNEROS */}
          <div className="flex items-start gap-3">
            <Film className="w-6 h-6 text-[#E50914] shrink-0 mt-1" />
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">
                GÊNEROS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(movie.genres || ['Animação', 'Família']).map((g, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-white/10 text-neutral-200 text-xs font-bold px-3 py-1 rounded-full border border-white/10"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: ESTÚDIO / CATEGORIA */}
          <div className="flex items-start gap-3">
            <Tv className="w-6 h-6 text-[#E50914] shrink-0 mt-1" />
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">
                ESTÚDIO
              </span>
              <span className="text-xs sm:text-sm font-bold text-white block">
                {getCategoryLabel()}
              </span>
            </div>
          </div>

          {/* Section 3: ARQUIVO EM DISCO */}
          <div className="flex items-start gap-3 min-w-0">
            <Folder className="w-6 h-6 text-[#E50914] shrink-0 mt-1" />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">
                ARQUIVO EM DISCO
              </span>
              <code className="text-xs font-mono text-neutral-300 truncate block select-all">
                {movie.filePath}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
