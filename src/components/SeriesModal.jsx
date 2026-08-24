import React, { useState } from 'react';
import { X, Play, MonitorPlay, Star, Tv, ChevronDown } from 'lucide-react';
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

        {/* Backdrop Banner */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-neutral-900">
          {bgImage ? (
            <img
              src={bgImage}
              alt={series.title}
              className="w-full h-full object-cover object-center filter brightness-[0.65]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-black" />
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent" />

          {/* Series Header Info */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end gap-6 z-20">
            {posterThumb && (
              <img
                src={posterThumb}
                alt={series.title}
                className="w-32 sm:w-40 md:w-48 aspect-[2/3] object-cover rounded-2xl shadow-2xl border-2 border-white/20 shrink-0 hidden sm:block"
              />
            )}

            <div className="flex-1 min-w-0">
              <span className="inline-block bg-[#E50914] text-white text-[10px] sm:text-xs px-3 py-1 rounded-md font-black uppercase tracking-wider mb-2 shadow-md">
                SÉRIE ANIMADA
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight drop-shadow-lg mb-2">
                {series.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-neutral-300">
                {series.vote_average > 0 && (
                  <span className="flex items-center gap-1 bg-[#f5c518] text-black px-3 py-1 rounded-lg font-black">
                    <Star className="w-3.5 h-3.5 fill-black" />
                    {series.vote_average} / 10
                  </span>
                )}
                <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-lg text-white">
                  <Tv className="w-3.5 h-3.5 text-neutral-300" />
                  {seasonsKeys.length} Temporada(s)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Synopsis */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Sinopse da Série
            </h3>
            <p className="text-sm md:text-base text-neutral-200 leading-relaxed">
              {series.overview || 'Série de animação ocidental disponível no seu disco local.'}
            </p>
          </div>

          {/* Season Selector */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-white">Episódios</h3>
              <p className="text-xs text-neutral-400">
                Selecione a temporada desejada abaixo
              </p>
            </div>

            {/* CENTERED RED SEASON SELECTOR BUTTON */}
            <div className="relative shrink-0 flex items-center justify-center">
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="appearance-none bg-[#E50914] hover:bg-[#b80710] text-white font-extrabold text-sm sm:text-base rounded-2xl px-8 py-3.5 pr-12 text-center outline-none cursor-pointer w-full sm:w-auto shadow-xl shadow-[#E50914]/30 border border-red-500/50 transition-all min-w-[260px]"
              >
                {seasonsKeys.map((sKey) => (
                  <option key={sKey} value={sKey} className="bg-[#181818] text-white font-bold py-2 text-center">
                    {sKey}ª Temporada ({series.seasons[sKey]?.length || 0} episódios)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-white absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[3]" />
            </div>
          </div>

          {/* NETFLIX EPISODE CARDS LIST */}
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {currentEpisodes.map((ep, idx) => (
              <div
                key={idx}
                className="bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-md group"
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
                    className="relative w-28 sm:w-36 aspect-[16/9] rounded-xl overflow-hidden bg-neutral-800 border border-white/10 shrink-0 cursor-pointer group-hover:border-[#E50914] transition-colors"
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
                    className="bg-[#E50914] hover:bg-[#b80710] active:scale-95 text-white font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md cursor-pointer transition-all min-w-[130px] whitespace-nowrap"
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
