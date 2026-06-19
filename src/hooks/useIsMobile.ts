import { useEffect, useState } from 'react';

/**
 * Tracks whether the viewport is below the given breakpoint (default 768px,
 * matching Tailwind's `md`). Used where a responsive decision can't be made in
 * CSS alone — e.g. sizing SVG chart labels that have no media-query hook.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const query = `(max-width: ${breakpoint - 1}px)`;
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent): void => {
      setIsMobile(event.matches);
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [query]);

  return isMobile;
}
