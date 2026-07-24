'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollIntoViewProps {
  dependency: unknown;
}

export function ScrollIntoView({ dependency }: ScrollIntoViewProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isFirstTime, setIsFirstTime] = useState(true);

  useEffect(() => {
    elementRef.current?.scrollIntoView({
      behavior: isFirstTime ? 'auto' : 'smooth',
    });

    return () => {
      if (isFirstTime) setIsFirstTime(false);
    };
  }, [isFirstTime, dependency]);

  return <div ref={elementRef} />;
}
