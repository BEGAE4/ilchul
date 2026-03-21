'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';
import styles from './styles.module.scss';

interface ScrollCarouselProps {
  children: ReactNode;
  gap?: number;
  className?: string;
  slidesToShow?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  dotsPosition?: 'overlay' | 'below';
}

export function ScrollCarousel({
  children,
  gap = 12,
  className = '',
  slidesToShow,
  autoPlay = false,
  autoPlayInterval = 3500,
  showDots = false,
  dotsPosition = 'below',
}: ScrollCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const childCount = Array.isArray(children) ? children.length : 1;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!autoPlay || childCount <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % childCount;
        scrollToIndex(next);
        return next;
      });
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlay, autoPlayInterval, childCount]);

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const width = container.offsetWidth;
    container.scrollTo({ left: index * width, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const width = container.offsetWidth;
    if (width > 0) {
      const newIndex = Math.round(container.scrollLeft / width);
      setCurrentIndex(newIndex);
    }
  };

  const containerStyle: React.CSSProperties = {
    gap: `${gap}px`,
    ...(slidesToShow
      ? { scrollSnapType: 'x mandatory' }
      : {}),
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={`${styles.carousel} ${className}`}
        style={containerStyle}
        onScroll={handleScroll}
      >
        {Array.isArray(children)
          ? children.map((child, i) => (
              <div
                key={i}
                style={
                  slidesToShow
                    ? { minWidth: `${100 / slidesToShow}%`, scrollSnapAlign: 'start' }
                    : autoPlay
                    ? { minWidth: '100%', scrollSnapAlign: 'start' }
                    : undefined
                }
              >
                {child}
              </div>
            ))
          : children}
      </div>

      {showDots && childCount > 1 && (
        <div
          className={`flex justify-center gap-1.5 ${
            dotsPosition === 'overlay'
              ? 'absolute bottom-4 left-0 right-0 z-10'
              : 'mt-3'
          }`}
        >
          {Array.from({ length: childCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                scrollToIndex(i);
                setCurrentIndex(i);
              }}
              className={`rounded-full transition-all ${
                i === currentIndex
                  ? 'w-5 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
