import React, { useState } from 'react';
import { Play, MonitorPlay, Info, Film } from 'lucide-react';
import { getPosterUrl } from '../utils/posterHelper';

export default function HeroBanner({ movie, onPlayWeb, onPlayNative, onOpenDetails }) {
  const [imageError, setImageError] = useState(false);

  if (!movie) {
    return (
      <div className="relative w-full h-[60vh] bg-gradient-to-br from-neutral-900 via-[#181818] to-black flex items-center justify-center text-center px-4">
        <div className="max-w-md">
          <Film className="w-16 h-16 text-[#E50914] mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-extrabold text-white mb-2">Bem-vindo ao CineRapha</h2>
        </div>
      </div>
    );
  }

  const rawBg = movie.backdrop_path || movie.poster_path || movie.poster_original;
  const rawPoster = movie.poster_path || movie.poster_original;
  const bgImage = !imageError && getPosterUrl(rawBg);
  const posterThumb = getPosterUrl(rawPoster);

  return (
    <div className="relative w-full min-h-[75vh] md:min-h-[82vh] overflow-hidden bg-black flex items-center justify-center px-4 sm:px-8 py-20">
      {/* Full Background Hero Image with Blur Overlay */}
      {bgImage ? (
        <img
          src={bgImage}
          alt={movie.title}
          onError={() => setImageError(true)}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.35] blur-[2px] scale-105 transition-all duration-700"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-[#1f1f1f] to-black" />
      )}

      {/* Dark Vignette & Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />

      {/* FLOATING CARD CONTAINER (Matching Image 1 Reference) */}
      <div className="relative z-20 w-full max-w-4xl bg-[#1e2028]/90 backdrop-blur-2xl border border-white/15 rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.85)] animate-fade-in flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
        
        {/* Left Column: Poster + DISCO LOCAL underneath */}
        <div className="flex flex-col items-center shrink-0">
          {posterThumb && (
            <img
              src={posterThumb}
              alt={movie.title}
              className="w-40 sm:w-48 md:w-52 aspect-[2/3] object-cover rounded-2xl border border-white/20 shadow-2xl transition-transform hover:scale-105"
            />
          )}
          <span className="text-[11px] font-black tracking-widest text-neutral-300 uppercase mt-3.5 text-center">
            DISCO LOCAL
          </span>
        </div>

        {/* Right Column: Title, Subtitle/Overview, Action Buttons & Info */}
        <div className="flex-1 text-left flex flex-col justify-between self-stretch pt-2">
          <div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-3">
              {movie.title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 font-medium leading-relaxed mb-6 line-clamp-3">
              {movie.overview || `Série animada ocidental: ${movie.title}`}
            </p>
          </div>

          <div>
            {/* Buttons Row (Rounded Pill Buttons matching Image 1) */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 mb-5">
              <button
                onClick={() => onPlayWeb(movie)}
                className="bg-[#E50914] hover:bg-[#b80710] active:scale-95 text-white font-bold px-6 sm:px-8 py-3.5 rounded-full flex items-center justify-center gap-2.5 text-sm sm:text-base shadow-lg shadow-[#E50914]/40 transition-all cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" />
                <span>Abrir no Navegador</span>
              </button>

              <button
                onClick={() => onPlayNative(movie)}
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/25 font-bold px-6 sm:px-8 py-3.5 rounded-full flex items-center justify-center gap-2.5 text-sm sm:text-base transition-all cursor-pointer whitespace-nowrap backdrop-blur-md"
              >
                <MonitorPlay className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                <span>Abrir no Windows</span>
              </button>
            </div>

            {/* Info (i) Icon Button */}
            <button
              onClick={() => onOpenDetails(movie)}
              className="p-2.5 rounded-full border border-white/25 text-neutral-300 hover:text-white hover:border-white transition-all cursor-pointer inline-flex items-center justify-center hover:scale-110"
              title="Mais Informações"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
