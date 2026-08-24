import React, { useState } from 'react';
import { X, Play, Star, Clock, Calendar, Folder, Edit3, Film, Tv } from 'lucide-react';
import { getPosterUrl } from '../utils/posterHelper';

// Custom Windows Icon SVG matching the reference design
const WindowsIcon = ({ className = "w-7 h-7" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 3.449L9.75 2.1v9.451H0m10.95-9.6L24 0v11.4H10.95M0 12.6h9.75v9.451L0 20.699M10.95 12.6H24V24l-13.05-1.8" />
  </svg>
);

export default function MovieModal({ movie, onClose, onPlayWeb, onPlayNative, onOpenMatch }) {
  const [imageError, setImageError] = useState(false);

  if (!movie) return null;

  const rawBg = movie.backdrop_path || movie.poster_path || movie.poster_original;
  const rawPoster = movie.poster_path || movie.poster_original;
  const bgImage = !imageError && getPosterUrl(rawBg);
  const posterThumb = getPosterUrl(rawPoster);

  // Studio / Category label mapping
  const categoryLabel = movie.category === 'western_animation' 
    ? 'Animação Ocidental' 
    : movie.category === 'animes' 
    ? 'Animes & Animações' 
    : 'Disney / Pixar / DreamWorks';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto"
    >
      {/* Main Modal Container Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-[#0b0b0b] rounded-[28px] md:rounded-[36px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/10 my-auto animate-scale-up text-white"
      >
        {/* Close Button (Top Right Floating Glass Circle) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-40 w-11 h-11 rounded-full bg-black/60 hover:bg-[#E50914] text-white flex items-center justify-center transition-all duration-300 border border-white/20 shadow-2xl cursor-pointer hover:scale-105 active:scale-95"
          title="Fechar"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* TMDB Fix Match Button (Top Right Next to Close) */}
        {onOpenMatch && (
          <button
            onClick={() => onOpenMatch(movie)}
            className="absolute top-5 right-18 z-40 h-11 px-4 rounded-full bg-black/60 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center gap-2 text-xs font-bold transition-all duration-300 border border-white/20 shadow-2xl cursor-pointer"
            title="Corrigir capa e informações no TMDB"
          >
            <Edit3 className="w-4 h-4 text-[#E50914]" />
            <span className="hidden sm:inline">Corrigir TMDB</span>
          </button>
        )}

        {/* Full Modal Background Backdrop Image with Gradient Overlays */}
        <div className="relative w-full overflow-hidden p-6 sm:p-8 md:p-10 lg:p-12">
          {bgImage && (
            <div className="absolute inset-0 z-0">
              <img
                src={bgImage}
                alt={movie.title}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-center filter brightness-[0.55] scale-105"
              />
              {/* Radial & Linear Gradient Overlays for High Contrast & Cinematic Feel */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0b]/90 to-[#0b0b0b]/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/40 to-transparent" />
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
            </div>
          )}

          {/* Main Top Grid: Left Large Poster | Right Full Movie Details */}
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-10">
            {/* Left Column: Large Highlighted Poster */}
            {posterThumb && (
              <div className="shrink-0 w-56 sm:w-64 md:w-72 lg:w-80 aspect-[2/3] rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/15 bg-neutral-900 group">
                <img
                  src={posterThumb}
                  alt={movie.title}
                  draggable="false"
                  className="w-full h-full object-cover select-none"
                />
              </div>
            )}

            {/* Right Column: Title, Metadata, Overview & Large Buttons */}
            <div className="flex-1 min-w-0 flex flex-col justify-center text-center md:text-left my-auto space-y-4">
              <div>
                {/* Source Badge - Wider & Bold */}
                <div className="mb-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="inline-block bg-[#E50914] text-white text-xs font-black px-6 py-1.5 rounded-lg uppercase tracking-widest shadow-md">
                    DISCO LOCAL
                  </span>
                </div>

                {/* Main Movie Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-md mb-4 brand-font">
                  {movie.title}
                </h1>

                {/* Original Title (if different) */}
                {movie.original_title && movie.original_title !== movie.title && (
                  <p className="text-xs sm:text-sm text-neutral-400 mb-4 italic font-medium">
                    Título Original: {movie.original_title}
                  </p>
                )}

                {/* Metadata Line: Rating, Year, Duration, Classification */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-sm font-extrabold text-neutral-200">
                  {/* Rating */}
                  {movie.vote_average > 0 && (
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>{movie.vote_average.toFixed(1).replace('.', ',')} / 10</span>
                    </div>
                  )}

                  {/* Release Year */}
                  {movie.release_year && (
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
                      <Calendar className="w-4 h-4 text-neutral-300" />
                      <span>{movie.release_year}</span>
                    </div>
                  )}

                  {/* Runtime */}
                  {movie.runtime > 0 && (
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
                      <Clock className="w-4 h-4 text-neutral-300" />
                      <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                    </div>
                  )}

                  {/* Age Classification Badge (Livre) */}
                  <span className="bg-[#00c853] text-white font-black text-xs px-2.5 py-1 rounded-md shadow-md">
                    L
                  </span>
                </div>

                {/* Movie Synopsis */}
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal line-clamp-4 md:line-clamp-5 mb-8 max-w-2xl">
                  {movie.overview || 'Nenhuma sinopse disponível para este filme no momento.'}
                </p>
              </div>

              {/* MAIN ACTION BUTTONS: Big & Wide Side-by-Side */}
              <div className="flex flex-col sm:flex-row items-stretch gap-4 pt-2">
                {/* Button 1: Assistir agora (Web Browser Player) */}
                <button
                  onClick={() => onPlayWeb(movie)}
                  className="flex-1 bg-gradient-to-r from-[#E50914] to-[#B20710] hover:from-[#f6121d] hover:to-[#c80812] active:scale-[0.98] text-white p-4 sm:p-5 rounded-2xl flex items-center justify-center sm:justify-start gap-4 shadow-xl shadow-[#E50914]/30 border border-red-500/30 transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center shrink-0 transition-colors">
                    <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
                  </div>
                  <div className="text-left">
                    <span className="text-base sm:text-lg font-black text-white leading-tight block tracking-wide">
                      Assistir agora
                    </span>
                    <span className="text-xs text-white/80 font-medium block mt-0.5">
                      Reproduzir no navegador
                    </span>
                  </div>
                </button>

                {/* Button 2: Abrir no Windows (Local Media Player) */}
                <button
                  onClick={() => onPlayNative(movie)}
                  className="flex-1 bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white p-4 sm:p-5 rounded-2xl flex items-center justify-center sm:justify-start gap-4 backdrop-blur-md border border-white/20 shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors">
                    <WindowsIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="text-base sm:text-lg font-black text-white leading-tight block tracking-wide">
                      Abrir no Windows
                    </span>
                    <span className="text-xs text-neutral-300 font-medium block mt-0.5">
                      Assistir no seu player local
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 7: Bottom Secondary Information Bar */}
          <div className="relative z-10 mt-10 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
              {/* Col 1: GÊNEROS */}
              <div className="flex items-start gap-3.5 pt-4 md:pt-0">
                <div className="p-2.5 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 shrink-0">
                  <Film className="w-6 h-6 text-[#E50914]" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">
                    GÊNEROS
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres && movie.genres.length > 0 ? (
                      movie.genres.map((g, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-neutral-200 border border-white/10"
                        >
                          {g}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-300 font-medium">Animação · Geral</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Col 2: ESTÚDIO / CATEGORIA */}
              <div className="flex items-start gap-3.5 pt-4 md:pt-0 md:pl-6">
                <div className="p-2.5 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 shrink-0">
                  <Tv className="w-6 h-6 text-[#E50914]" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">
                    ESTÚDIO
                  </span>
                  <span className="text-sm font-bold text-neutral-200 block">
                    {categoryLabel}
                  </span>
                </div>
              </div>

              {/* Col 3: ARQUIVO EM DISCO */}
              <div className="flex items-start gap-3.5 pt-4 md:pt-0 md:pl-6 min-w-0">
                <div className="p-2.5 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 shrink-0">
                  <Folder className="w-6 h-6 text-[#E50914]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">
                    ARQUIVO EM DISCO
                  </span>
                  <code className="text-xs text-neutral-300 font-mono block truncate select-all bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                    {movie.filePath}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
