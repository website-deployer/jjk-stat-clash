import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  FCP: number;
  LCP: number;
  FID: number;
  CLS: number;
  TTFB: number;
  memoryUsage?: number;
}

interface PerformanceReport {
  timestamp: number;
  metrics: PerformanceMetrics;
}

/**
 * Performance Monitoring Hook
 * 
 * Tracks Web Vitals and memory usage for performance analysis.
 * 
 * Usage:
 * ```tsx
 * const { metrics, report } = usePerformanceMonitoring();
 * ```
 */
export function usePerformanceMonitoring() {
  const metricsRef = useRef<PerformanceMetrics>({
    FCP: 0,
    LCP: 0,
    FID: 0,
    CLS: 0,
    TTFB: 0,
  });

  const reportRef = useRef<PerformanceReport[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.name) {
          case 'first-contentful-paint':
            metricsRef.current.FCP = entry.startTime;
            break;
          case 'largest-contentful-paint':
            metricsRef.current.LCP = entry.startTime;
            break;
          case 'first-input-delay':
            metricsRef.current.FID = (entry as any).processingStart - entry.startTime;
            break;
          case 'cumulative-layout-shift':
            metricsRef.current.CLS = (entry as any).value;
            break;
          case 'navigation':
            metricsRef.current.TTFB = (entry as any).responseStart - (entry as any).fetchStart;
            break;
        }
      }
    });

    // Observe performance entries
    observer.observe({ entryTypes: ['paint', 'layout-shift', 'largest-contentful-paint', 'first-input', 'navigation'] });

    // Monitor memory usage
    const memoryInterval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        metricsRef.current.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // MB
      }
    }, 5000);

    // Report metrics
    const reportMetrics = () => {
      const report: PerformanceReport = {
        timestamp: Date.now(),
        metrics: { ...metricsRef.current },
      };
      reportRef.current.push(report);

      // Log to console
      console.log('📊 Performance Metrics:', report);

      // Send to analytics (if available)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'performance_metrics', report);
      }
    };

    // Report every 30 seconds or on page unload
    const reportInterval = setInterval(reportMetrics, 30000);

    const handleBeforeUnload = () => {
      reportMetrics();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      observer.disconnect();
      clearInterval(memoryInterval);
      clearInterval(reportInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return {
    metrics: metricsRef.current,
    report: reportRef.current,
  };
}

/**
 * Performance Budget Checker
 * 
 * Checks if performance metrics are within acceptable limits.
 * 
 * @param metrics - Performance metrics to check
 * @param budget - Performance budget (optional)
 * @returns Whether metrics are within budget
 */
export function checkPerformanceBudget(
  metrics: PerformanceMetrics,
  budget?: {
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
    TTFB?: number;
  }
): boolean {
  const limits = {
    FCP: 1800, // 1.8s
    LCP: 2500, // 2.5s
    FID: 100, // 100ms
    CLS: 0.1, // 0.1
    TTFB: 800, // 800ms
    ...budget,
  };

  const isWithinBudget =
    metrics.FCP <= limits.FCP! &&
    metrics.LCP <= limits.LCP! &&
    metrics.FID <= limits.FID! &&
    metrics.CLS <= limits.CLS! &&
    metrics.TTFB <= limits.TTFB!;

  if (!isWithinBudget) {
    console.warn('⚠️ Performance budget exceeded:', {
      FCP: `${metrics.FCP}ms (limit: ${limits.FCP}ms)`,
      LCP: `${metrics.LCP}ms (limit: ${limits.LCP}ms)`,
      FID: `${metrics.FID}ms (limit: ${limits.FID}ms)`,
      CLS: metrics.CLS.toFixed(3) + ` (limit: ${limits.CLS})`,
      TTFB: `${metrics.TTFB}ms (limit: ${limits.TTFB}ms)`,
    });
  }

  return isWithinBudget;
}