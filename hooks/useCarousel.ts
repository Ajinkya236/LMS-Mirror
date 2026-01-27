import { useState, useEffect, useCallback } from 'react';

export const useCarousel = <T,>(items: T[], interval: number = 5000) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = useCallback(() => {
    if (items.length === 0) return;
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? items.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, items]);

  const goToNext = useCallback(() => {
    if (items.length === 0) return;
    const isLastSlide = currentIndex === items.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, items]);

  const goToSlide = (slideIndex: number) => {
    if (items.length === 0) return;
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    if (interval > 0 && items.length > 0) {
      const timer = setTimeout(() => {
        goToNext();
      }, interval);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, goToNext, interval, items.length]);

  return {
    currentIndex,
    goToPrevious,
    goToNext,
    goToSlide,
    currentItem: items.length > 0 ? items[currentIndex] : null,
  };
};