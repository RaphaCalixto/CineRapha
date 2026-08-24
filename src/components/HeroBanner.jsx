import React, { useState } from 'react';
import { Play, MonitorPlay, Info, Star, Clock, Calendar, Film } from 'lucide-react';
import { getPosterUrl } from '../utils/posterHelper';

export default function HeroBanner({ movie, onPlayWeb, onPlayNative, onOpenDetails }) {
  const [imageError, setImageError] = useState(false);

  if (!movie) {
    return (
      <div className="relative w-full h-[65vh] bg-gradient-to-br from-neutral-900 via-[#181818] to-black flex items-center justify-center text-center px-4">
        <div className="max-w-md">
          <Film className="w-16 h-16 text-[#E50914] mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-extrabold text-white mb-2">Bem-vindo ao CineRapha</h2>
          <p className="text-neutral-400 text-sm">
            Varrendo seus filmes no disco local (E:\)...
          </p>
        </div>
      </div>
    );
  }

  const rawBg = movie.backdrop_path || movie.poster_path || movie.poster_original;
  const rawPoster = movie.poster_path || movie.poster_original;
  const bgImage = !imageError && getPosterUrl(rawBg);
  const posterThumb = getPosterUrl(rawPoster);

  return (
    <div className="relative w-full h-[80vh] md:h-[88vh] overflow-hidden bg-black flex items-end">
      {/* Background Hero Image */}
      {bgImage ? (
        <img
          src={bgImage}
          alt={movie.title}
          onError={() => setImageError(true)}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.6] scale-105 transition-all duration-700"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-[#1f1f1f] to-black" />
      )}

      {/* Hero Dark Gradient Overlays */}
      <div className="absolute inset-0 hero-side-gradient" />
      <div className="absolute inset-0 hero-gradient" />

      {/* Hero Content Container */}
      <div className="relative z-20 px-6 md:px-16 pb-16 max-w-6xl animate-fade-in flex flex-col md:flex-row items-start md:items-end gap-8 w-full">
        {/* Optional Poster Thumb */}
        {posterThumb && (
          <img
            src={posterThumb}
            alt={movie.title}
            className="w-44 md:w-56 aspect-[2/3] object-cover rounded-2xl shadow-2xl border-2 border-white/20 shrink-0 hidden sm:block hover:scale-105 transition-transform"
          />
        )}

        <div className="flex-1 min-w-0">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs md:text-sm font-bold">
            {movie.vote_average > 0 && (
              <span className="inline-flex items-center justify-center gap-1.5 bg-[#f5c518] text-black px-4 py-1.5 rounded-lg font-black shadow-lg shrink-0">
                <Star className="w-4 h-4 fill-black shrink-0" />
                <span>{movie.vote_average}</span>
              </span>
            )}
            {movie.release_year && (
              <span className="inline-flex items-center justify-center gap-1.5 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-lg text-white border border-white/15 shrink-0">
                <Calendar className="w-4 h-4 text-neutral-300 shrink-0" />
                <span>{movie.release_year}</span>
              </span>
            )}
            {movie.runtime > 0 && (
              <span className="inline-flex items-center justify-center gap-1.5 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-lg text-white border border-white/15 shrink-0">
                <Clock className="w-4 h-4 text-neutral-300 shrink-0" />
                <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
              </span>
            )}
            <span className="bg-[#E50914] text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-md shrink-0">
              DISCO LOCAL
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-3 tracking-tight drop-shadow-2xl">
            {movie.title}
          </h1>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <p className="text-sm md:text-base text-neutral-300 font-semibold mb-4">
              {movie.genres.join(' • ')}
            </p>
          )}

          {/* Synopsis */}
          <p className="text-sm md:text-base text-neutral-200 line-clamp-3 md:line-clamp-4 max-w-3xl mb-8 leading-relaxed font-normal drop-shadow">
            {movie.overview}
          </p>

          {/* LARGE HERO ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Play Web Button */}
            <button
              onClick={() => onPlayWeb(movie)}
              className="bg-[#E50914] hover:bg-[#b80710] active:scale-95 text-white font-black py-4 px-8 min-w-[230px] rounded-2xl flex items-center justify-center gap-3 text-base shadow-xl shadow-[#E50914]/40 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="w-5 h-5 fill-white shrink-0" />
              <span>Assistir no Navegador</span>
            </button>

            {/* Play Native Button */}
            <button
              onClick={() => onPlayNative(movie)}
              className="bg-white/20 hover:bg-white/30 active:scale-95 text-white font-black py-4 px-8 min-w-[210px] rounded-2xl flex items-center justify-center gap-3 text-base backdrop-blur-md border border-white/25 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <MonitorPlay className="w-5 h-5 text-white shrink-0" />
              <span>Abrir no Windows</span>
            </button>

            {/* Details Trigger */}
            <button
              onClick={() => onOpenDetails(movie)}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-105 cursor-pointer shrink-0"
              title="Mais Informações"
            >
              <Info className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
