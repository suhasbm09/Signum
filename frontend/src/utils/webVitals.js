/**
 * Web Vitals Tracking
 * Monitors Core Web Vitals (LCP, FID, CLS) and other performance metrics
 */

// Dynamic import for web-vitals library
const getWebVitals = async () => {
  try {
    // Import web-vitals dynamically to reduce initial bundle size
    const { onCLS, onFID, onFCP, onLCP, onTTFB } = await import('web-vitals');
    return { onCLS, onFID, onFCP, onLCP, onTTFB };
  } catch (error) {
    console.warn('Web Vitals library not available:', error);
    return null;
  }
};

/**
 * Send metric to analytics
 * @param {Object} metric - Web vital metric object
 */
function sendToAnalytics(metric) {
  const { name, value, rating, delta, id } = metric;
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Web Vital: ${name}`, {
      value: Math.round(value),
      rating,
      delta: Math.round(delta),
      id
    });
  }
  
  // TODO: Send to analytics service (Google Analytics, Plausible, etc.)
  // Example for Google Analytics 4:
  // if (window.gtag) {
  //   window.gtag('event', name, {
  //     event_category: 'Web Vitals',
  //     value: Math.round(value),
  //     event_label: id,
  //     non_interaction: true,
  //   });
  // }
  
  // Example for custom analytics endpoint:
  // fetch('/api/analytics/web-vitals', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ name, value, rating, delta, id }),
  //   keepalive: true
  // });
}

/**
 * Get rating color for console display
 */
function getRatingColor(rating) {
  switch (rating) {
    case 'good':
      return '#10b981'; // emerald
    case 'needs-improvement':
      return '#f59e0b'; // yellow
    case 'poor':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
}

/**
 * Initialize Web Vitals tracking
 */
export async function initWebVitals() {
  const vitals = await getWebVitals();
  
  if (!vitals) {
    console.warn('⚠️ Web Vitals tracking not available');
    return;
  }
  
  const { onCLS, onFID, onFCP, onLCP, onTTFB } = vitals;
  
  // Track Cumulative Layout Shift (CLS)
  // Good: < 0.1, Needs Improvement: 0.1-0.25, Poor: > 0.25
  onCLS(sendToAnalytics);
  
  // Track First Input Delay (FID)
  // Good: < 100ms, Needs Improvement: 100-300ms, Poor: > 300ms
  onFID(sendToAnalytics);
  
  // Track First Contentful Paint (FCP)
  // Good: < 1.8s, Needs Improvement: 1.8-3s, Poor: > 3s
  onFCP(sendToAnalytics);
  
  // Track Largest Contentful Paint (LCP)
  // Good: < 2.5s, Needs Improvement: 2.5-4s, Poor: > 4s
  onLCP(sendToAnalytics);
  
  // Track Time to First Byte (TTFB)
  // Good: < 800ms, Needs Improvement: 800-1800ms, Poor: > 1800ms
  onTTFB(sendToAnalytics);
  
  console.log('✅ Web Vitals tracking initialized');
}

/**
 * Get Web Vitals summary for display
 */
export async function getWebVitalsSummary() {
  const vitals = await getWebVitals();
  
  if (!vitals) {
    return null;
  }
  
  const metrics = {};
  
  const { onCLS, onFID, onFCP, onLCP, onTTFB } = vitals;
  
  return new Promise((resolve) => {
    let count = 0;
    const total = 5;
    
    const checkComplete = () => {
      count++;
      if (count === total) {
        resolve(metrics);
      }
    };
    
    onCLS((metric) => {
      metrics.CLS = metric;
      checkComplete();
    });
    
    onFID((metric) => {
      metrics.FID = metric;
      checkComplete();
    });
    
    onFCP((metric) => {
      metrics.FCP = metric;
      checkComplete();
    });
    
    onLCP((metric) => {
      metrics.LCP = metric;
      checkComplete();
    });
    
    onTTFB((metric) => {
      metrics.TTFB = metric;
      checkComplete();
    });
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(metrics), 5000);
  });
}

export default initWebVitals;
