/**
 * Production-Safe Logger Utility
 * Logs only in development mode, silent in production
 * Prevents console clutter in user-facing application
 */

const IS_PRODUCTION = import.meta.env.PROD || import.meta.env.MODE === 'production';

// Only log errors in production, everything in development
const logger = {
  log: (...args) => {
    if (!IS_PRODUCTION) {
      console.log(...args);
    }
  },
  
  warn: (...args) => {
    if (!IS_PRODUCTION) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (!IS_PRODUCTION) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (!IS_PRODUCTION) {
      console.debug(...args);
    }
  },
  
  // Always log errors (sent to server monitoring in production)
  error: (...args) => {
    console.error(...args);
    
    // In production, could send to error tracking service
    if (IS_PRODUCTION) {
      // Future: send to Sentry, LogRocket, etc.
    }
  }
};

export default logger;
