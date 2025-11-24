/**
 * CompletionTracker Component
 * Wraps learning content and tracks completion with flexible timing
 */

import { useState, useEffect, useRef } from 'react';
import { useProgress } from '../contexts/ProgressContext';

function CompletionTracker({ courseId, moduleId, children, contentLength = 'medium' }) {
  const { markModuleComplete, isModuleCompleted } = useProgress();
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [canComplete, setCanComplete] = useState(false);
  const timerRef = useRef(null);
  const contentRef = useRef(null);

  // Dynamic timer based on content length
  // SURVEY MODE: Reduced to 5 seconds for quick testing
  const getRequiredTime = () => {
    const lengthMap = {
      short: 5,     // Quick read
      medium: 5,    // Quick read
      long: 5,      // Quick read
      'x-long': 5   // Quick read
    };
    return lengthMap[contentLength] || 5;
  };

  const requiredTime = getRequiredTime();

  // Estimate reading time (SURVEY MODE: Quick completion)
  const getEstimatedReadTime = () => {
    const timeMap = {
      short: '<1',
      medium: '<1',
      long: '<1',
      'x-long': '<1'
    };
    return timeMap[contentLength] || '<1';
  };

  // Check if already completed
  useEffect(() => {
    const checkCompletion = async () => {
      const completed = isModuleCompleted(courseId, moduleId);
      setIsCompleted(completed);
      if (completed) {
        setCanComplete(true);
        // Stop timer if already completed
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    };
    
    checkCompletion();
  }, [courseId, moduleId, isModuleCompleted]);

  // Timer logic
  useEffect(() => {
    if (isCompleted) return;

    timerRef.current = setInterval(() => {
      setTimeSpent(prev => {
        const newTime = prev + 1;
        if (newTime >= requiredTime) {
          setCanComplete(true);
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [requiredTime, isCompleted]);

  const handleComplete = () => {
    if (canComplete && !isCompleted) {
      markModuleComplete(courseId, moduleId);
      setIsCompleted(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return Math.min((timeSpent / requiredTime) * 100, 100);
  };

  return (
    <div ref={contentRef} className="relative">
      {/* Content */}
      <div className="w-full mx-auto">
        {children}
      </div>

      {/* Completion Section */}
      <div className="w-full mx-auto mt-12 mb-8">
        <div className="border-t border-emerald-500/30 pt-8">
          
          {/* Complete Button */}
          <button
            onClick={handleComplete}
            disabled={!canComplete || isCompleted}
            className={`w-full font-quantico-bold py-4 px-8 rounded-xl transition-all duration-300 ${
              isCompleted
                ? 'bg-emerald-700/30 text-emerald-600 border-2 border-emerald-700/50 cursor-default'
                : canComplete
                ? 'bg-gradient-to-r from-emerald-500/80 to-green-500/80 hover:from-emerald-500 hover:to-green-500 text-gray-100 border-2 border-emerald-400/60 hover:border-emerald-300 shadow-lg hover:shadow-emerald-500/50 transform hover:scale-105'
                : 'bg-gray-600/30 text-gray-500 border-2 border-gray-600/30 cursor-not-allowed'
            }`}
          >
            {isCompleted ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Module Completed
              </span>
            ) : canComplete ? (
              <span className="flex items-center justify-center gap-2">
                ✅ Mark as Complete
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Please read the content... ({requiredTime - timeSpent}s)
              </span>
            )}
          </button>

          {/* Helper Text */}
          {!isCompleted && !canComplete && (
            <p className="text-center text-gray-500 text-xs mt-3">
              Button activates in {requiredTime - timeSpent} seconds. Feel free to scroll through the content.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompletionTracker;
