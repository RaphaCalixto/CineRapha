import React, { useState } from 'react';
import { X, Play, MonitorPlay, Star, Tv, ChevronDown, Film, Folder } from 'lucide-react';
import { getPosterUrl } from '../utils/posterHelper';

export default function SeriesModal({ series, onClose, onPlayWeb, onPlayNative }) {
  if (!series) return null;

  const seasonsKeys = Object.keys(series.seasons || {}).sort((a, b) => parseInt(a) - parseInt(b));
  const [selectedSeason, setSelectedSeason] = useState(seasonsKeys[0] || '1');

  const currentEpisodes = series.seasons[selectedSeason] || [];

  const seasonPoster = series.season_posters?.[selectedSeason] || series.poster_path;
  const rawBg = seasonPoster || series.backdrop_path || series.poster_path;
  const rawPoster = seasonPoster || series.poster_path;
  const bgImage = getPosterUrl(rawBg);
  const posterThumb = getPosterUrl(rawPoster);

  const isAnime = series.category === 'animes';

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

        {/* Full Modal Background Backdrop Image with Gradient Overlays */}
        <div className="relative w-full overflow-hidden p-6 sm:p-8 md:p-10 lg:p-12">
          {bgImage && (
            <div className="absolute inset-0 z-0">
              <img
                src={bgImage}
                alt={series.title}
                className="w-full h-full object-cover object-center filter brightness-[0.55] scale-105"
              />
              {/* Radial & Linear Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0b]/90 to-[#0b0b0b]/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/40 to-transparent" />
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
            </div>
          )}

          {/* Main Top Grid: Left Large Season Poster | Right Series Details */}
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-10">
            {/* Left Column: Large Highlighted Poster */}
            {posterThumb && (
              <div className="shrink-0 w-56 sm:w-64 md:w-72 lg:w-80 aspect-[2/3] rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/15 bg-neutral-900 group">
                <img
                  src={posterThumb}
                  alt={series.title}
                  draggable="false"
                  className="w-full h-full object-cover select-none"
                />
              </div>
            )}

            {/* Right Column: Title, Badges, Synopsis & Season Dropdown */}
            <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch text-center md:text-left">
              <div>
                {/* Source Badge - Increased width & generous padding */}
                <div className="mb-4 flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="inline-flex items-center justify-center bg-[#E50914] text-white text-xs font-black px-6 py-1.5 rounded-lg uppercase tracking-widest shadow-lg min-w-[140px]">
                    {isAnime ? 'ANIME' : 'SÉRIE ANIMADA'}
                  </span>
                </div>

                {/* Series Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-md mb-4 brand-font">
                  {series.title}
                </h1>

                {/* Metadata Line */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-sm font-extrabold text-neutral-200">
                  {series.vote_average > 0 && (
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>{series.vote_average.toFixed(1).replace('.', ',')} / 10</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
                    <Tv className="w-4 h-4 text-neutral-300" />
                    <span>{seasonsKeys.length} Temporada(s)</span>
                  </div>

                  <span className="bg-[#00c853] text-white font-black text-xs px-2.5 py-1 rounded-md shadow-md">
                    L
                  </span>
                </div>

                {/* Series Synopsis */}
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal line-clamp-4 mb-8 max-w-2xl">
                  {series.overview || 'Série de animação disponível no seu disco local.'}
                </p>
              </div>

              {/* Season Selector Dropdown Bar */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">Episódios</h3>
                  <p className="text-xs text-neutral-400">
                    Selecione a temporada desejada abaixo
                  </p>
                </div>

                {/* CENTERED RED SEASON SELECTOR BUTTON */}
                <div className="relative shrink-0 flex items-center justify-center w-full sm:w-auto">
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className="appearance-none bg-gradient-to-r from-[#E50914] to-[#B20710] hover:from-[#f6121d] hover:to-[#c80812] text-white font-black text-sm sm:text-base rounded-2xl px-8 py-3.5 pr-12 text-center outline-none cursor-pointer w-full sm:w-auto shadow-xl shadow-[#E50914]/30 border border-red-500/50 transition-all min-w-[260px]"
                  >
                    {seasonsKeys.map((sKey) => (
                      <option key={sKey} value={sKey} className="bg-[#121212] text-white font-bold py-2 text-center">
                        {sKey}ª Temporada ({series.seasons[sKey]?.length || 0} episódios)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-white absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[3]" />
                </div>
              </div>
            </div>
          </div>

          {/* NETFLIX EPISODE CARDS LIST */}
          <div className="relative z-10 mt-8 space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {currentEpisodes.map((ep, idx) => (
              <div
                key={idx}
                className="bg-[#141414]/90 hover:bg-[#1f1f1f] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-md group"
              >
                {/* Left Section: Index Number + Scene Thumbnail + Details */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Big Episode Number */}
                  <span className="text-xl sm:text-2xl font-black text-neutral-400 group-hover:text-white w-6 text-center shrink-0">
                    {ep.episode}
                  </span>

                  {/* Scene Thumbnail Frame */}
                  <div
                    onClick={() => onPlayWeb({ title: `${series.title} - S${ep.season}E${ep.episode}`, filePath: ep.filePath })}
                    className="relative w-28 sm:w-36 aspect-[16/9] rounded-xl overflow-hidden bg-neutral-800 border border-white/10 shrink-0 cursor-pointer group-hover:border-[#E50914] transition-colors shadow-md"
                  >
                    {bgImage ? (
                      <img
                        src={bgImage}
                        alt={ep.title}
                        className="w-full h-full object-cover filter brightness-[0.75] group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-black flex items-center justify-center">
                        <Tv className="w-6 h-6 text-neutral-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-7 h-7 fill-white text-white filter drop-shadow-md" />
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug truncate">
                      {ep.title}
                    </h4>
                    <p className="text-xs text-neutral-400 line-clamp-1 mt-1 font-mono">
                      {ep.fileName}
                    </p>
                  </div>
                </div>

                {/* EPISODE ACTION BUTTONS */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => onPlayWeb({ title: `${series.title} - S${ep.season}E${ep.episode}`, filePath: ep.filePath })}
                    className="bg-gradient-to-r from-[#E50914] to-[#B20710] hover:from-[#f6121d] hover:to-[#c80812] active:scale-95 text-white font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md shadow-[#E50914]/20 cursor-pointer transition-all min-w-[130px] whitespace-nowrap"
                  >
                    <Play className="w-4 h-4 fill-white shrink-0" />
                    <span>Navegador</span>
                  </button>

                  <button
                    onClick={() => onPlayNative({ title: `${series.title} - S${ep.season}E${ep.episode}`, filePath: ep.filePath })}
                    className="bg-white/15 hover:bg-white/25 active:scale-95 text-white font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-xs backdrop-blur-md border border-white/20 cursor-pointer transition-all min-w-[125px] whitespace-nowrap"
                  >
                    <MonitorPlay className="w-4 h-4 text-white shrink-0" />
                    <span>Windows</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
