import { useCallback, useMemo, useRef, useEffect, useState } from "react";

// Memoization utility for expensive computations
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

// Debounce hook for search/input
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for event handlers
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef<number>(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

// Memoized object comparison
export function useDeepMemo<T>(value: T): T {
  const ref = useRef<T>(value);
  
  if (!deepEqual(ref.current, value)) {
    ref.current = value;
  }
  
  return ref.current;
}

// Simple deep equality check
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (let key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  
  return false;
}

// Optimized list rendering
export function useVirtualization(items: any[], itemHeight: number, containerHeight: number) {
  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const overscan = 5; // Render extra items for smooth scrolling
    
    return {
      visibleCount: Math.min(visibleCount + overscan * 2, items.length),
      itemHeight,
      totalHeight: items.length * itemHeight,
    };
  }, [items.length, itemHeight, containerHeight]);
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      if (endTime - startTime > 16) { // Longer than 1 frame
        console.warn(`${componentName} render took ${endTime - startTime}ms`);
      }
    };
  });
}