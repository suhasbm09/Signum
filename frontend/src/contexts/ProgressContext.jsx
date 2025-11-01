import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import progressService from '../services/progressService';
import { 
  isModuleExcluded, 
  getTotalLearningModules,
  calculateProgressPercentage,
  calculateFinalExamScore,
  isFinalExamPassed,
  canUnlockCertification
} from '../config/courseConfig';

// Global toast function for use in contexts
let globalToast = null;

export const setGlobalToast = (toastFunction) => {
  globalToast = toastFunction;
};

export const getGlobalToast = () => globalToast;

const ProgressContext = createContext();

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

export const ProgressProvider = ({ children }) => {
  const [moduleProgress, setModuleProgress] = useState({});
  const [courseProgress, setCourseProgress] = useState({});
  const [quizAttempts, setQuizAttempts] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Get user ID from auth - CRITICAL: Must be unique per user
  const getUserId = () => {
    if (typeof window !== 'undefined' && window.currentUser) {
      // Use uid (Firebase UID) as the primary unique identifier
      // This ensures each user has their own separate progress
      const uid = window.currentUser.uid;
      const email = window.currentUser.email;
      
      if (!uid && !email) {
        console.error('❌ CRITICAL: No user ID found! User must be logged in.');
        return null; // Return null instead of throwing
      }
      
      return uid || email;
    }
    
    console.warn('⚠️ No currentUser found yet. User may still be loading...');
    return null; // Return null if user not ready yet
  };
  
  const userId = getUserId();
  
  // Skip all progress operations if userId is not available yet
  const isUserReady = userId !== null;
  
  // Helper function to check if a module should be excluded from progress calculation
  const isCertificationModule = (courseId, moduleId) => {
    // Use the scalable course config
    return isModuleExcluded(courseId, moduleId);
  };
  
  // Load progress from Firebase (NO localStorage fallback for sensitive data)
  const loadProgressFromFirebase = useCallback(async (courseId) => {
    if (!isUserReady) {
      console.warn('⚠️ User not ready yet, skipping progress load');
      return { modules: [], quizScore: null, completionPercentage: 0 };
    }
    
    try {
      setLoading(true);
      const progress = await progressService.getCourseProgress(userId, courseId);
      
      // Extract modules - include coding-challenge if coding is completed
      const modules = progress.modules_completed || [];
      const codingCompleted = progress.coding?.completed || false;
      
      // Ensure coding-challenge is in modules if coding is completed
      if (codingCompleted && !modules.includes('coding-challenge')) {
        modules.push('coding-challenge');
      }
      
      const progressData = {
        modules: modules,
        quizScore: progress.quiz?.best_score || null,
        codingScore: progress.coding?.best_score || null,
        codingCompleted: codingCompleted,
        completionPercentage: progress.completion_percentage || 0
      };
      
      // Update courseProgress state
      setCourseProgress(prev => ({
        ...prev,
        [courseId]: progressData
      }));
      
      return progressData;
    } catch (error) {
      console.error('Error loading progress from Firebase:', error);
      return { modules: [], quizScore: null, completionPercentage: 0 };
    } finally {
      setLoading(false);
    }
  }, [userId, isUserReady]);

  // Save progress to Firebase ONLY (removed localStorage)
  const syncToFirebase = useCallback(async (courseId, progress) => {
    if (!isUserReady) {
      console.warn('⚠️ User not ready yet, skipping progress sync');
      return;
    }
    
    try {
      // Only sync learning progress, not certifications
      const learningModules = progress.modules.filter(mod => !isCertificationModule(courseId, mod));
      
      await progressService.syncCourseProgress(
        userId,
        courseId,
        learningModules,
        progress.completionPercentage
      );
      
      console.log('✅ Progress synced to Firebase successfully');
    } catch (error) {
      console.error('❌ Failed to sync progress to Firebase:', error);
      // NO localStorage fallback - data must be in Firebase
      throw error;
    }
  }, [userId, isUserReady]);
  
  // Module completion - now fully Firebase-backed
  const markModuleComplete = useCallback(async (courseId, moduleId) => {
    const progressKey = `${courseId}_${moduleId}`;
    // Update local state
    setModuleProgress(prev => ({
      ...prev,
      [progressKey]: {
        completed: true,
        completedAt: new Date().toISOString()
      }
    }));

    try {
      // Load current progress from Firebase
      const currentProgress = await loadProgressFromFirebase(courseId);
      if (!currentProgress.modules.includes(moduleId)) {
        currentProgress.modules.push(moduleId);
        // Calculate completion percentage ONLY for learning modules (exclude quiz, coding, etc.)
        if (!isCertificationModule(courseId, moduleId)) {
          currentProgress.completionPercentage = calculateProgressPercentage(courseId, currentProgress.modules);
        }
        // Update local cache
        setCourseProgress(prev => ({
          ...prev,
          [courseId]: currentProgress
        }));
        // Sync to Firebase (NO localStorage)
        await syncToFirebase(courseId, currentProgress);
        console.log(`\u2705 Module ${moduleId} marked complete for ${courseId}`);
      }
    } catch (error) {
      // Use toast if available, otherwise console error
      if (globalToast) {
        globalToast('❌ Failed to save progress. Please check your connection and try again.', 'error');
      } else {
        console.error('Failed to save progress. Please check your connection and try again.');
      }
      console.error('Failed to mark module complete:', error);
    }
  }, [loadProgressFromFirebase, syncToFirebase]);
  
  // Getters - now pull from Firebase
  const isModuleCompleted = (courseId, moduleId) => {
    // Check both local state AND Firebase-loaded progress
    const progressKey = `${courseId}_${moduleId}`;
    const localCompleted = moduleProgress[progressKey]?.completed || false;
    
    // Also check if it's in the Firebase-loaded modules array
    const firebaseProgress = courseProgress[courseId];
    const firebaseCompleted = firebaseProgress?.modules?.includes(moduleId) || false;
    
    return localCompleted || firebaseCompleted;
  };
  
  const getCourseCompletionPercentage = (courseId) => {
    const progress = courseProgress[courseId];
    if (!progress) return 0;
    
    // Get learning progress (percentage of 6 modules complete)
    const learningProgress = progress.completionPercentage || 0;
    
    // Get final exam status
    const quizPassed = (progress.quizScore || 0) >= 85;
    const codingCompleted = progress.modules?.includes('coding-challenge') || false;
    
    // Calculate final exam contribution (0-100)
    let finalExamScore = 0;
    if (quizPassed) finalExamScore += 50;
    if (codingCompleted) finalExamScore += 50;
    
    // Overall: 70% learning + 30% final exam
    const overall = (learningProgress * 0.7) + (finalExamScore * 0.3);
    
    return Math.round(overall);
  };
  
  const getQuizScore = (courseId) => {
    const progress = courseProgress[courseId];
    return progress?.quizScore ? {
      score: progress.quizScore,
      passed: progress.quizScore >= 85
    } : null;
  };
  
  const getFinalExamScore = (courseId) => {
    const quizScore = getQuizScore(courseId)?.score || 0;
    const codingCompleted = isModuleCompleted(courseId, 'coding-challenge');
    
    // Simple calculation: quiz + coding (100 if complete, 0 if not)
    return Math.round((quizScore + (codingCompleted ? 100 : 0)) / 2);
  };
  
  const isFinalExamComplete = (courseId) => {
    const quizPassed = getQuizScore(courseId)?.passed || false;
    const codingCompleted = isModuleCompleted(courseId, 'coding-challenge');
    
    // Both must be complete
    return quizPassed && codingCompleted;
  };
  
  const canGetCertification = (courseId) => {
    const progress = courseProgress[courseId];
    if (!progress) return false;
    
    // Must complete all learning modules + pass final exam
    const learningComplete = progress.completionPercentage === 100;
    const finalExamComplete = isFinalExamComplete(courseId);
    
    return learningComplete && finalExamComplete;
  };

  // Save quiz score - Firebase only
  const saveQuizScore = useCallback(async (courseId, score) => {
    try {
      const currentProgress = await loadProgressFromFirebase(courseId);
      currentProgress.quizScore = score;
      
      // Update local cache
      setCourseProgress(prev => ({
        ...prev,
        [courseId]: currentProgress
      }));
      
      // Sync to Firebase
      await syncToFirebase(courseId, currentProgress);
    } catch (error) {
      console.error('Failed to save quiz score:', error);
      throw error;
    }
  }, [syncToFirebase, loadProgressFromFirebase]);

  // Initialize course progress from Firebase
  const initializeCourseProgress = useCallback(async (courseId) => {
    try {
      const progress = await loadProgressFromFirebase(courseId);
      setCourseProgress(prev => ({
        ...prev,
        [courseId]: progress
      }));
      
      // Also populate moduleProgress state for completed modules
      if (progress.modules && progress.modules.length > 0) {
        setModuleProgress(prev => {
          const updated = { ...prev };
          progress.modules.forEach(moduleId => {
            const progressKey = `${courseId}_${moduleId}`;
            updated[progressKey] = {
              completed: true,
              completedAt: new Date().toISOString()
            };
          });
          return updated;
        });
      }
    } catch (error) {
      console.error('Failed to initialize course progress:', error);
    }
  }, [loadProgressFromFirebase]);
  
  const value = {
    moduleProgress,
    courseProgress,
    loading,
    markModuleComplete,
    isModuleCompleted,
    getCourseCompletionPercentage,
    getQuizScore,
    getFinalExamScore,
    isFinalExamComplete,
    canGetCertification,
    saveQuizScore,
    initializeCourseProgress,
    isCertificationModule,
    loadProgressFromFirebase
  };
  
  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export default ProgressContext;