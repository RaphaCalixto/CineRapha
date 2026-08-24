import React, { useState } from 'react';
import { Film } from 'lucide-react';
import { getPosterUrl } from '../utils/posterHelper';

export default function MovieCard({ movie, onOpenDetails }) {
  const [imageError, setImageError] = useState(false);
  const rawPoster = movie.poster_path || movie.poster_original;
  const posterSrc = !imageError && getPosterUrl(rawPoster);

  return (
    <div
      onClick={() => onOpenDetails(movie)}
      className="group relative flex-none w-52 sm:w-60 md:w-68 lg:w-72 cursor-pointer transition-all duration-300 ease-out transform hover:scale-110 hover:z-50 hover:shadow-2xl origin-center"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#181818] rounded-2xl border border-white/10 shadow-lg">
        {posterSrc ? (
          <img
            src={posterSrc}
            alt={movie.title}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-neutral-800 via-neutral-900 to-black">
            <Film className="w-12 h-12 text-[#E50914] mb-3 opacity-80" />
            <span className="text-base font-extrabold text-white line-clamp-3 leading-snug">
              {movie.title}
            </span>
            {movie.release_year && (
              <span className="text-xs text-neutral-400 mt-2 font-medium">
                {movie.release_year}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Simple Clean Title below card */}
      <div className="pt-2 px-1">
        <h3 className="text-sm font-bold text-white truncate group-hover:text-[#E50914] transition-colors">
          {movie.title}
        </h3>
        {movie.release_year && (
          <span className="text-xs text-neutral-400 font-medium">
            {movie.release_year}
          </span>
        )}
      </div>
    </div>
  );
}
