'use client';

import { useEffect, useRef } from 'react';

interface ScrollIntoViewProps {
  dependency: unknown;
}

export function ScrollIntoView({ dependency }: ScrollIntoViewProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      elementRef.current?.scrollIntoView({
        behavior: 'auto',
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [dependency]);

  return <div ref={elementRef} />;
}
