import { useEffect, useCallback, useRef } from 'react';
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

// Web Vitals reporting
export function reportWebVitals(onPerfEntry?: (metric: any) => void): void {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getLCP(onPerfEntry);
    getFCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return function executedFunction(...args: Parameters<T>): ReturnType<T> {
    if (!inThrottle) {
      lastResult = func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
}

// Memoization utility
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return function memoized(...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  } as T;
}

// Intersection Observer hook
export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  const ref = useRef<HTMLElement | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const setRef = useCallback((node: HTMLElement | null) => {
    if (ref.current) {
      // Cleanup previous observer
      const observer = new IntersectionObserver(() => {});
      observer.disconnect();
    }

    if (node) {
      ref.current = node;
      const observer = new IntersectionObserver(entries => {
        callbackRef.current(entries);
      }, options);

      observer.observe(node);

      return () => {
        observer.disconnect();
      };
    }
  }, [options]);

  return setRef;
}

// Request Animation Frame hook
export function useRAF(callback: () => void, deps: any[] = []) {
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      if (time - lastTime > 16) { // ~60fps
        callback();
        lastTime = time;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, deps);
}

// Idle Callback hook
export function useIdleCallback(callback: () => void, timeout?: number) {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(callback, { timeout });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(callback, 1);
      return () => clearTimeout(id);
    }
  }, [callback, timeout]);
}

// Memory leak prevention
export function useMemoryCleanup(cleanup: () => void) {
  useEffect(() => {
    return () => {
      cleanup();
      if ('gc' in window) {
        (window as any).gc();
      }
    };
  }, [cleanup]);
}