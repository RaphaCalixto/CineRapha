import React, { useState } from 'react';
import { Tv, Sparkles } from 'lucide-react';
import { getPosterUrl } from '../utils/posterHelper';

export default function SeriesCard({ series, isAnime = false, onOpenDetails }) {
  const [imageError, setImageError] = useState(false);
  const rawPoster = series.poster_path || series.poster_original;
  const posterSrc = !imageError && getPosterUrl(rawPoster);

  const IconComponent = isAnime ? Sparkles : Tv;
  const tagLabel = isAnime ? 'ANIME' : 'SÉRIE';

  return (
    <div
      onClick={() => onOpenDetails(series)}
      className="group relative flex-none w-52 sm:w-60 md:w-68 lg:w-72 cursor-pointer transition-all duration-300 ease-out transform hover:scale-110 hover:z-50 hover:shadow-2xl origin-center"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#181818] rounded-2xl border border-white/10 shadow-lg">
        {posterSrc ? (
          <img
            src={posterSrc}
            alt={series.title}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-neutral-800 via-neutral-900 to-black">
            <IconComponent className="w-12 h-12 text-[#E50914] mb-3 opacity-80" />
            <span className="text-base font-extrabold text-white line-clamp-3 leading-snug">
              {series.title}
            </span>
          </div>
        )}

        <span className="absolute top-3 right-3 bg-[#E50914] text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase shadow-md z-10">
          {tagLabel}
        </span>
      </div>

      {/* Title & Season Count */}
      <div className="pt-2 px-1">
        <h3 className="text-sm font-bold text-white truncate group-hover:text-[#E50914] transition-colors">
          {series.title}
        </h3>
        <span className="text-xs text-neutral-400 font-medium">
          {Object.keys(series.seasons || {}).length} Temporada(s)
        </span>
      </div>
    </div>
  );
}
