/**
 * API Configuration - Central API endpoint definitions
 */

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    VERIFY_TOKEN: '/auth/verify-firebase-token',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    COURSES: '/auth/courses',
    ENROLL: '/auth/courses/enroll',
    PROFILE: '/auth/profile',
    WALLET: '/auth/phantom-wallet',
    DELETE_ACCOUNT: '/auth/account',
  },
  
  // Progress endpoints
  PROGRESS: {
    GET: (courseId) => `/progress/${courseId}`,
    SYNC: (courseId) => `/progress/${courseId}/sync`,
    CERT_STATUS: (courseId) => `/progress/${courseId}/certification-status`,
  },
  
  // Assessment endpoints
  ASSESSMENT: {
    // Quiz (NEW - Server-side scoring)
    QUIZ_START: (courseId) => `/assessment/${courseId}/quiz/start`,
    QUIZ_SUBMIT: (courseId) => `/assessment/${courseId}/quiz/submit`,
    QUIZ_SESSION_STATUS: (courseId, sessionId) => `/assessment/${courseId}/quiz/session/${sessionId}/status`,
    QUIZ_ATTEMPTS: (courseId) => `/assessment/${courseId}/quiz/attempts`,
    
    // Quiz (LEGACY)
    QUIZ: (courseId, quizId) => `/assessment/${courseId}/quiz/${quizId}`,
    QUIZ_SUBMIT_LEGACY: (courseId, quizId) => `/assessment/${courseId}/quiz/${quizId}/submit`,
    
    // Coding
    CODING_START: (courseId) => `/assessment/${courseId}/coding/start`,
    CODING_SESSION_STATUS: (courseId, sessionId) => `/assessment/${courseId}/coding/session/${sessionId}/status`,
    CODING_RUN: (courseId) => `/assessment/${courseId}/coding/run`,
    CODING_SUBMIT: (courseId) => `/assessment/${courseId}/coding/submit`,
    CODING_SUBMISSIONS: (courseId) => `/assessment/${courseId}/coding/submissions`,
    
    // Anti-cheat
    ANTI_CHEAT_REPORT: (courseId) => `/assessment/${courseId}/anti-cheat/report`,
    ANTI_CHEAT_STATUS: (courseId) => `/assessment/${courseId}/anti-cheat/status`,
    ANTI_CHEAT_CLEAR: (courseId) => `/assessment/${courseId}/anti-cheat/clear`,
  },
  
  // Certification endpoints
  CERTIFICATION: {
    MINT: (courseId) => `/certification/${courseId}/mint`,
    SAVE: (courseId) => `/certification/${courseId}/save`,
    STATUS: (courseId) => `/certification/${courseId}/status`,
    DELETE: (courseId) => `/certification/${courseId}/delete`,
  },
  
  // AI endpoints
  AI: {
    CHAT: '/ai/chat',
    STATUS: '/ai/status',
  },
  
  // Health check
  HEALTH: '/health',
};

// Helper to build full URL
export const buildUrl = (endpoint, params = {}) => {
  const url = new URL(endpoint, API_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
};
