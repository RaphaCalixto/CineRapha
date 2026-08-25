import React, { useState, useEffect } from 'react';
import { Film, Settings, RefreshCw, X, FolderSearch, ServerOff } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  scanStatus,
  onTriggerScan,
  onOpenSettings,
  isServerOnline = true
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 sm:px-12 md:px-16 py-5 flex items-center justify-between ${
        scrolled
          ? 'bg-[#141414]/98 backdrop-blur-xl shadow-2xl border-b border-white/10'
          : 'bg-gradient-to-b from-black/98 via-black/85 to-transparent'
      }`}
    >
      {/* Brand & Horizontal Nav Links */}
      <div className="flex items-center gap-8 sm:gap-12" style={{ marginTop: '14px', marginLeft: '20px' }}>
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          onClick={() => {
            setActiveTab('inicio');
            setSearchTerm('');
          }}
        >
          <div className="w-11 h-11 rounded-2xl bg-[#E50914] flex items-center justify-center shadow-2xl shadow-[#E50914]/50 group-hover:scale-105 transition-transform">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="brand-font text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-white via-neutral-200 to-[#E50914] bg-clip-text text-transparent block leading-none">
              CINERAPHA
            </span>
            <span className="block text-[9px] font-black tracking-widest text-[#E50914] mt-1 uppercase">
              Netflix Pessoal
            </span>
          </div>
        </div>

        {/* Horizontal Nav Links */}
        <nav className="flex items-center gap-5 sm:gap-7 text-sm sm:text-base font-bold pt-1">
          <button
            onClick={() => {
              setActiveTab('inicio');
              setSearchTerm('');
            }}
            className={`transition-colors cursor-pointer py-1 relative whitespace-nowrap ${
              activeTab === 'inicio' && !searchTerm
                ? 'text-white font-black'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Início
            {activeTab === 'inicio' && !searchTerm && (
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#E50914] rounded-full animate-fade-in" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('filmes');
              setSearchTerm('');
            }}
            className={`transition-colors cursor-pointer py-1 relative whitespace-nowrap ${
              activeTab === 'filmes' && !searchTerm
                ? 'text-white font-black'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Filmes
            {activeTab === 'filmes' && !searchTerm && (
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#E50914] rounded-full animate-fade-in" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('animacoes');
              setSearchTerm('');
            }}
            className={`transition-colors cursor-pointer py-1 relative whitespace-nowrap ${
              activeTab === 'animacoes' && !searchTerm
                ? 'text-white font-black'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Animações Ocidentais
            {activeTab === 'animacoes' && !searchTerm && (
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#E50914] rounded-full animate-fade-in" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('animes');
              setSearchTerm('');
            }}
            className={`transition-colors cursor-pointer py-1 relative whitespace-nowrap ${
              activeTab === 'animes' && !searchTerm
                ? 'text-white font-black'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Animes
            {activeTab === 'animes' && !searchTerm && (
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#E50914] rounded-full animate-fade-in" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('disney');
              setSearchTerm('');
            }}
            className={`transition-colors cursor-pointer py-1 relative whitespace-nowrap ${
              activeTab === 'disney' && !searchTerm
                ? 'text-white font-black'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Disney / Pixar / DreamWorks
            {activeTab === 'disney' && !searchTerm && (
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#E50914] rounded-full animate-fade-in" />
            )}
          </button>
        </nav>
      </div>

      {/* Right Tools */}
      <div className="flex items-center gap-3" style={{ marginTop: '14px', marginRight: '20px' }}>
        {/* Search Input */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Buscar filmes, animes, Disney..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black/90 border border-white/25 focus:border-[#E50914] text-white text-xs sm:text-sm rounded-full px-5 py-2.5 w-44 sm:w-60 md:w-72 focus:w-80 transition-all outline-none placeholder:text-neutral-400 font-medium shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Server Offline Warning Badge */}
        {!isServerOnline && (
          <div
            title="O servidor Express local não foi detectado. O catálogo está sendo exibido via cache offline."
            className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs px-4 py-2.5 rounded-full font-bold shrink-0 animate-pulse"
          >
            <ServerOff className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline">Servidor Offline (Modo Cache)</span>
          </div>
        )}

        {/* Scanner Status Badge */}
        {scanStatus?.isScanning ? (
          <div className="flex items-center gap-2 bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914] text-xs px-4 py-2.5 rounded-full animate-pulse-slow shrink-0">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline font-bold">
              Varrendo ({scanStatus.progress}/{scanStatus.total})
            </span>
          </div>
        ) : (
          <button
            onClick={onTriggerScan}
            title="Escanear filmes e animações no disco local"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2.5 rounded-full border border-white/20 transition-all cursor-pointer shrink-0"
          >
            <FolderSearch className="w-4 h-4 text-[#E50914]" />
            <span className="hidden sm:inline font-bold">Escanear Disco</span>
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Configurações"
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer shrink-0"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
