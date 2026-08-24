import React, { useState } from 'react';
import { X, Play, MonitorPlay, Star, Clock, Calendar, Folder, Film, Tv, ChevronDown } from 'lucide-react';
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

  // Category label formatting
  const getCategoryLabel = () => {
    if (series.category === 'animes') return 'Anime';
    return 'Série Animada Ocidental';
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
              alt={series.title}
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

        {/* Top Hero Layout: Poster + Main Series Details */}
        <div className="relative z-10 flex flex-col md:flex-row items-stretch gap-6 md:gap-8">
          {/* Left Poster Card */}
          {posterThumb && (
            <div className="w-56 sm:w-64 md:w-72 lg:w-80 aspect-[2/3] rounded-2xl overflow-hidden border border-white/15 shadow-2xl shrink-0 bg-neutral-900 mx-auto md:mx-0">
              <img
                src={posterThumb}
                alt={series.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Right Column Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1 text-left">
            <div>
              {/* Badge DISCO LOCAL / SÉRIE */}
              <span className="inline-block bg-[#E50914] text-white text-[11px] font-black uppercase px-3 py-1 rounded-md tracking-wider mb-3 w-fit shadow-md">
                DISCO LOCAL
              </span>

              {/* Title */}
              <h1 className="brand-font text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md mb-4">
                {series.title}
              </h1>

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-neutral-300 mb-4">
                {series.vote_average > 0 && (
                  <div className="flex items-center gap-1.5 text-white">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                    <span>{(series.vote_average || 8.2).toFixed(1).replace('.', ',')} / 10</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <Tv className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>{seasonsKeys.length} Temporada(s)</span>
                </div>
                <span className="bg-[#00C853] text-white text-xs font-black px-2 py-0.5 rounded shadow-sm uppercase">
                  L
                </span>
              </div>

              {/* Overview / Synopsis */}
              <p className="text-neutral-300 text-sm md:text-base leading-relaxed font-normal line-clamp-3 my-4">
                {series.overview || 'Série animada disponível no seu disco local. Selecione abaixo a temporada e o episódio para assistir.'}
              </p>
            </div>

            {/* Season Selector Bar */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/40 p-3.5 rounded-2xl border border-white/10">
              <span className="text-sm font-black text-white uppercase tracking-wider">
                Selecione a Temporada
              </span>

              <div className="relative shrink-0 w-full sm:w-auto">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="appearance-none bg-[#E50914] hover:bg-[#b80710] text-white font-extrabold text-sm sm:text-base rounded-xl px-6 py-2.5 pr-10 text-center outline-none cursor-pointer w-full sm:w-auto shadow-lg shadow-[#E50914]/30 border border-red-500/50 transition-all min-w-[240px]"
                >
                  {seasonsKeys.map((sKey) => (
                    <option key={sKey} value={sKey} className="bg-[#0c0d12] text-white font-bold py-2 text-center">
                      {sKey}ª Temporada ({series.seasons[sKey]?.length || 0} episódios)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-5 h-5 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none stroke-[3]" />
              </div>
            </div>
          </div>
        </div>

        {/* EPISODES LIST SECTION */}
        <div className="relative z-10 mt-6 space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {currentEpisodes.map((ep, idx) => (
            <div
              key={idx}
              className="bg-black/50 hover:bg-white/5 border border-white/10 rounded-2xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-md group text-left"
            >
              {/* Index + Details */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <span className="text-xl font-black text-neutral-400 group-hover:text-white w-6 text-center shrink-0">
                  {ep.episode}
                </span>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug truncate">
                    {ep.title}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5 font-mono">
                    {ep.fileName}
                  </p>
                </div>
              </div>

              {/* EPISODE DUAL ACTION BUTTONS */}
              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <button
                  onClick={() => onPlayWeb({ title: `${series.title} - S${ep.season}E${ep.episode}`, filePath: ep.filePath })}
                  className="bg-gradient-to-r from-[#E50914] to-[#B20710] hover:brightness-110 active:scale-95 text-white font-black px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs shadow-md cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4 fill-white shrink-0" />
                  <span>Assistir agora</span>
                </button>

                <button
                  onClick={() => onPlayNative({ title: `${series.title} - S${ep.season}E${ep.episode}`, filePath: ep.filePath })}
                  className="bg-white/10 hover:bg-white/15 active:scale-95 text-white font-black px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs backdrop-blur-md border border-white/15 cursor-pointer transition-all"
                >
                  <svg className="w-4 h-4 text-white fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M0 3.449L9.75 2.1v9.451H0zM10.5 1.95L24 0v11.4H10.5zM0 12.6h9.75v9.451L0 20.7zM10.5 12.6H24V24l-13.5-1.95z" />
                  </svg>
                  <span>Windows</span>
                </button>
              </div>
            </div>
          ))}
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
                {['Animação', 'Ação', 'Fantasia'].map((g, idx) => (
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
                CATEGORIA
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
                PASTA EM DISCO
              </span>
              <code className="text-xs font-mono text-neutral-300 truncate block select-all">
                {currentEpisodes[0]?.filePath || series.title}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
