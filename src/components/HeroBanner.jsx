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
    <div className="relative w-full h-[80vh] md:h-[88vh] overflow-hidden bg-black flex items-end justify-start px-6 md:px-16 pb-12 md:pb-16">
      {/* Background Hero Image */}
      {bgImage ? (
        <img
          src={bgImage}
          alt={movie.title}
          onError={() => setImageError(true)}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.55] scale-105 transition-all duration-700"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-[#1f1f1f] to-black" />
      )}

      {/* Hero Dark Gradient Overlays */}
      <div className="absolute inset-0 hero-side-gradient" />
      <div className="absolute inset-0 hero-gradient" />

      {/* FLOATING CARD CONTAINER (Positioned on the Left Side) */}
      <div className="relative z-20 w-full max-w-3xl lg:max-w-4xl bg-[#1c1e24]/85 backdrop-blur-2xl border border-white/15 rounded-[32px] p-6 sm:p-8 md:p-9 shadow-[0_30px_70px_rgba(0,0,0,0.85)] animate-fade-in flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        
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
            {/* Buttons Row (Expanded width and height matching user request) */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-5 mb-5">
              <button
                onClick={() => onPlayWeb(movie)}
                className="bg-gradient-to-r from-[#E50914] to-[#B20710] hover:from-[#f6121d] hover:to-[#c80812] text-white px-7 sm:px-9 py-4 rounded-2xl flex items-center gap-4 shadow-xl shadow-[#E50914]/40 border border-red-500/40 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap min-w-[240px] sm:min-w-[265px]"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                </div>
                <div className="text-left pr-2">
                  <span className="block font-extrabold text-white text-base leading-tight">Assistir agora</span>
                  <span className="block text-xs text-white/80 font-normal mt-0.5">Reproduzir no navegador</span>
                </div>
              </button>

              <button
                onClick={() => onPlayNative(movie)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-7 sm:px-9 py-4 rounded-2xl flex items-center gap-4 backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap min-w-[240px] sm:min-w-[265px]"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <MonitorPlay className="w-5 h-5 text-white" />
                </div>
                <div className="text-left pr-2">
                  <span className="block font-extrabold text-white text-base leading-tight">Abrir no Windows</span>
                  <span className="block text-xs text-neutral-300 font-normal mt-0.5">Assistir no seu player local</span>
                </div>
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
