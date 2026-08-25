import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

export default function MovieRow({ title, movies, onOpenDetails }) {
  const rowRef = useRef(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const [hasDragged, setHasDragged] = useState(false);

  if (!movies || movies.length === 0) return null;

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.8;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleWheel = (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
      window.scrollBy({ top: e.deltaY, behavior: 'auto' });
    }
  };

  // Mouse Drag-to-Scroll Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only primary left mouse button
    isMouseDown.current = true;
    startX.current = e.pageX - rowRef.current.offsetLeft;
    scrollLeftPos.current = rowRef.current.scrollLeft;
    setHasDragged(false);
  };

  const handleMouseLeave = () => {
    isMouseDown.current = false;
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown.current) return;
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.6; // Scroll speed multiplier
    if (Math.abs(walk) > 6) {
      setHasDragged(true);
    }
    rowRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  const handleCardClick = (movie) => {
    if (!hasDragged) {
      onOpenDetails(movie);
    }
  };

  return (
    <div className="relative mb-20 sm:mb-24 px-6 md:px-16 group">
      {/* Row Header */}
      {title && (
        <div className="flex items-center justify-between mb-10 sm:mb-12">
          <div className="flex items-center gap-3">
            <h2 className="brand-font text-xl md:text-2xl font-black text-white tracking-wide">
              {title}
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/5">
              {movies.length}
            </span>
          </div>
        </div>
      )}

      {/* Row Carousel Container */}
      <div className="relative">
        {/* Scroll Left Button - Larger & Highly Visible */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute -left-6 md:-left-8 top-0 bottom-0 z-30 w-16 md:w-20 bg-black/90 hover:bg-[#E50914] text-white flex items-center justify-center opacity-80 md:opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-r-2xl shadow-2xl cursor-pointer hover:scale-105 active:scale-95 border-r border-y border-white/10"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-10 h-10 md:w-14 md:h-14 stroke-[2.5]" />
        </button>

        {/* Horizontal Movies Wrapper with Drag-to-Scroll */}
        <div
          ref={rowRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex items-center gap-6 overflow-x-auto no-scrollbar py-4 px-1 select-none cursor-grab active:cursor-grabbing overscroll-x-contain overscroll-y-auto"
          style={{ touchAction: 'pan-y' }}
        >
          {movies.map((movie) => (
            <div key={movie.id} onClick={() => handleCardClick(movie)}>
              <MovieCard
                movie={movie}
                onOpenDetails={() => {}}
              />
            </div>
          ))}
        </div>

        {/* Scroll Right Button - Larger & Highly Visible */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute -right-6 md:-right-8 top-0 bottom-0 z-30 w-16 md:w-20 bg-black/90 hover:bg-[#E50914] text-white flex items-center justify-center opacity-80 md:opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-l-2xl shadow-2xl cursor-pointer hover:scale-105 active:scale-95 border-l border-y border-white/10"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-10 h-10 md:w-14 md:h-14 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
