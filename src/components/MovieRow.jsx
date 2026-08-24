import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

export default function MovieRow({ title, movies, onOpenDetails }) {
  const rowRef = useRef(null);

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

  // Ensure vertical mouse wheel scrolling is 100% fluid over horizontal carousels
  const handleWheel = (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
      window.scrollBy({ top: e.deltaY, behavior: 'auto' });
    }
  };

  return (
    <div className="relative mb-10 px-6 md:px-16 group">
      {/* Row Header */}
      {title && (
        <div className="flex items-center justify-between mb-4">
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
        {/* Scroll Left Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute -left-4 top-0 bottom-0 z-30 w-12 bg-black/80 hover:bg-[#E50914] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-r-2xl shadow-2xl cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Horizontal Movies Wrapper */}
        <div
          ref={rowRef}
          onWheel={handleWheel}
          className="flex items-center gap-6 overflow-x-auto no-scrollbar py-4 px-1 scroll-smooth overscroll-x-contain overscroll-y-auto"
          style={{ touchAction: 'pan-y' }}
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute -right-4 top-0 bottom-0 z-30 w-12 bg-black/80 hover:bg-[#E50914] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-l-2xl shadow-2xl cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
