import React, { useRef, useEffect } from 'react';
import { X, MonitorPlay, AlertTriangle } from 'lucide-react';

export default function VideoPlayerModal({ movie, onClose, onPlayNative }) {
  const videoRef = useRef(null);

  if (!movie) return null;

  const streamUrl = `/api/stream?path=${encodeURIComponent(movie.filePath)}`;

  useEffect(() => {
    // Esc key listener to exit player
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between animate-fade-in">
      {/* Top Controls Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <span className="bg-[#E50914] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
            REPRODUZINDO
          </span>
          <h2 className="text-sm md:text-lg font-bold text-white truncate max-w-xl">
            {movie.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Switch to native player button */}
          <button
            onClick={() => {
              onClose();
              onPlayNative(movie);
            }}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg border border-white/20 transition-colors"
            title="Se o áudio ou legenda não funcionar no navegador, abra no Windows"
          >
            <MonitorPlay className="w-4 h-4 text-neutral-300" />
            <span className="hidden md:inline font-medium">Abrir no Player do Windows</span>
          </button>

          {/* Close Player */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
            title="Fechar Player (ESC)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main HTML5 Video Stream */}
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={streamUrl}
          controls
          autoPlay
          className="w-full h-full max-h-screen object-contain"
        >
          Seu navegador não suporta este formato de vídeo.
        </video>
      </div>

      {/* Bottom Hint Banner */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-60 hover:opacity-100 transition-opacity">
        <div className="bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[11px] text-neutral-300 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[#f5c518]" />
          <span>Dica: Para codecs MKV/AC3 com suporte total a surround, você também pode usar "Abrir no Windows".</span>
        </div>
      </div>
    </div>
  );
}
