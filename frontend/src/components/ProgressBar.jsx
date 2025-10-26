import React from 'react';
import { useProgress } from '../contexts/ProgressContext';

const ProgressBar = ({ courseId, className = "" }) => {
  const { getCourseCompletionPercentage, getQuizScore, isModuleCompleted, getFinalExamScore } = useProgress();
  
  const completionPercentage = getCourseCompletionPercentage(courseId);
  const quizScore = getQuizScore(courseId);
  const codingCompleted = isModuleCompleted(courseId, 'coding-challenge');
  const finalExamScore = getFinalExamScore(courseId);
  
  return (
    <div className={`bg-black/30 border border-emerald-500/20 rounded-xl p-4 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-emerald-300 font-quantico-bold text-sm">Overall Progress</span>
        <span className="text-gray-100 font-quantico-bold text-sm">{Math.round(completionPercentage)}%</span>
      </div>
      
      <div className="w-full bg-black/40 rounded-full h-3 mb-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-emerald-500 to-green-400 h-3 rounded-full transition-all duration-500 ease-out shadow-lg shadow-emerald-500/50"
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      
      {/* Final Exam Status */}
      {(quizScore || codingCompleted) && (
        <div className="space-y-2 text-xs">
          <div className="border-t border-emerald-500/20 pt-2">
            <div className="text-gray-400 font-quantico-bold mb-1">Final Exam Status:</div>
            
            {quizScore && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">• Quiz (50%):</span>
                <span className={`font-quantico-bold ${quizScore.score >= 85 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {Math.round(quizScore.score)}% {quizScore.passed && '✓'}
                </span>
              </div>
            )}
            
            {codingCompleted && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">• Coding (50%):</span>
                <span className="font-quantico-bold text-emerald-400">
                  Complete ✓
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {completionPercentage === 100 && (
        <div className="mt-2 text-center">
          <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/40 rounded-lg py-1 px-2">
            <span className="text-emerald-300 text-xs font-quantico-bold">🎉 Course Complete!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;