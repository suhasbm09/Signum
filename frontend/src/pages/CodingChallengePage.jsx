import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useToast } from '../components/Toast';
import { useProgress } from '../contexts/ProgressContext';

// Code templates for different languages - MOVED OUTSIDE COMPONENT
const codeTemplates = {
  python: `# Write your code here
def factorial(n):
    # Your implementation
    pass

# Test your code
if __name__ == "__main__":
    n = int(input())
    result = factorial(n)
    print(result)`,
  
  java: `import java.util.Scanner;

public class Solution {
    public static long factorial(int n) {
        // Your implementation
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long result = factorial(n);
        System.out.println(result);
    }
}`,
  
  cpp: `#include <iostream>
using namespace std;

long long factorial(int n) {
    // Your implementation
    return 0;
}

int main() {
    int n;
    cin >> n;
    long long result = factorial(n);
    cout << result << endl;
    return 0;
}`,
  
  c: `#include <stdio.h>

long long factorial(int n) {
    // Your implementation
    return 0;
}

int main() {
    int n;
    scanf("%d", &n);
    long long result = factorial(n);
    printf("%lld\\n", result);
    return 0;
}`
};

const CodingChallengePage = ({ courseId, user, onNavigate }) => {
  const { showToast } = useToast();
  const { loadProgressFromFirebase } = useProgress();
  
  // Challenge state
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [savedSubmission, setSavedSubmission] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState(codeTemplates['python']);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Anti-cheat state
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [pasteAttempts, setPasteAttempts] = useState(0);
  const [warnings, setWarnings] = useState([]);
  
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  // Monaco language mapping
  const monacoLanguageMap = {
    python: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c'
  };

  // Problem statement
  const problem = {
    title: "Factorial of a Number",
    difficulty: "Easy",
    description: `Calculate the factorial of a given number n.

The factorial of a non-negative integer n is the product of all positive integers less than or equal to n.

For example:
- factorial(5) = 5 × 4 × 3 × 2 × 1 = 120
- factorial(0) = 1
- factorial(1) = 1

You can implement this using any method (iterative, recursive, etc.)`,
    
    input: "A single integer n (0 ≤ n ≤ 20)",
    output: "The factorial of n",
    
    examples: [
      { input: "5", output: "120" },
      { input: "0", output: "1" },
      { input: "10", output: "3628800" }
    ],
    
    constraints: [
      "0 ≤ n ≤ 20",
      "Time Complexity: O(n) or better",
      "Space Complexity: O(1) for iterative, O(n) for recursive"
    ]
  };

  // Reset state when user or courseId changes
  useEffect(() => {
    // Reset all state when navigating to a different user/course
    setChallengeStarted(false);
    setHasAttempted(false);
    setSavedSubmission(null);
    setShowResults(false);
    setScore(null);
    setTestResults(null);
    setOutput('');
    setTabSwitchCount(0);
    setCopyAttempts(0);
    setPasteAttempts(0);
    setWarnings([]);
    setCode(codeTemplates['python']);
    setSelectedLanguage('python');
  }, [user?.uid, courseId]);

  useEffect(() => {
    // Check if user has already attempted this challenge
    const checkPreviousAttempt = async () => {
      if (!user?.uid) return; // Don't check if no user
      
      try {
        const token = user?.token || 'temp_token_123';
        const response = await fetch(`http://localhost:8000/api/coding-challenge/progress/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (data.success && data.completed) {
          setHasAttempted(true);
          setSavedSubmission({
            code: data.code,
            score: data.score,
            language: data.language,
            test_results: data.test_results
          });
        }
      } catch (err) {
        console.error('Failed to check previous attempt:', err);
      }
    };
    
    checkPreviousAttempt();
  }, [courseId, user]);

  const startChallenge = () => {
    setChallengeStarted(true);
    enterFullscreen();
  };

  const startTryAgain = () => {
    // Reset everything for new attempt
    setCode(codeTemplates[selectedLanguage]);
    setScore(null);
    setTestResults(null);
    setOutput('');
    setTabSwitchCount(0);
    setCopyAttempts(0);
    setPasteAttempts(0);
    setWarnings([]);
    setChallengeStarted(true);
    enterFullscreen();
  };

  const viewReview = () => {
    // Load saved submission for review
    if (savedSubmission) {
      setCode(savedSubmission.code);
      setScore(savedSubmission.score);
      setSelectedLanguage(savedSubmission.language);
      
      // Show review output
      let reviewOutput = `\n═══════════════════════════════════════════════\n`;
      reviewOutput += `          PREVIOUS SUBMISSION REVIEW\n`;
      reviewOutput += `═══════════════════════════════════════════════\n\n`;
      reviewOutput += `Score: ${Math.round(savedSubmission.score)}%\n\n`;
      reviewOutput += `This is your saved submission. You can review the code\n`;
      reviewOutput += `or click "Try Again" to attempt a new submission.\n`;
      setOutput(reviewOutput);
    }
    setChallengeStarted(true);
    enterFullscreen();
  };

  // Anti-cheat event listeners
  useEffect(() => {
    if (!challengeStarted) return;
    
    // ANTI-CHEAT: Track tab switches
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        showToast('⚠️ Tab switch detected!', 'warning');
      }
    };
    
    // ANTI-CHEAT: Detect fullscreen exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        showToast('⚠️ Please stay in fullscreen mode', 'warning');
        setTimeout(() => {
          enterFullscreen();
        }, 1000);
      }
    };
    
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [challengeStarted]);

  const enterFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  const addWarning = (message) => {
    setWarnings(prev => [...prev, { message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const handleRunCode = async () => {
    setOutput('Running code...');
    
    try {
      const response = await fetch('http://localhost:8000/api/coding-challenge/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
          problem_id: 'factorial'
        })
      });
      
      const data = await response.json();
      setOutput(data.output || data.error || 'No output');
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setOutput('Evaluating your solution...\n\nRunning test cases...');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8000/api/coding-challenge/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user?.uid || user?.email || 'user_123',
          course_id: courseId,
          code,
          language: selectedLanguage,
          problem_id: 'factorial',
          anti_cheat_data: {
            tab_switches: tabSwitchCount,
            copy_attempts: copyAttempts,
            paste_attempts: pasteAttempts,
            warnings: warnings
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setScore(data.score);
        setTestResults(data.test_results);
        
        // Create clean output message
        const passedTests = data.test_results.filter(t => t.passed).length;
        const totalTests = data.test_results.length;
        const allPassed = passedTests === totalTests;
        
        let outputMessage = `\n═══════════════════════════════════════════════\n`;
        outputMessage += `          EVALUATION COMPLETE\n`;
        outputMessage += `═══════════════════════════════════════════════\n\n`;
        
        // Test Results
        if (allPassed) {
          outputMessage += `✅ ALL TEST CASES PASSED! (${passedTests}/${totalTests})\n\n`;
        } else {
          outputMessage += `⚠️  Test Cases: ${passedTests}/${totalTests} passed\n\n`;
          outputMessage += `Failed test cases:\n`;
          data.test_results.forEach(test => {
            if (!test.passed) {
              outputMessage += `  • Test ${test.test_case}: Expected "${test.expected_output}", got "${test.actual_output}"\n`;
            }
          });
          outputMessage += `\n`;
        }
        
        // Complexity Analysis
        outputMessage += `⏱️  Time Complexity: ${data.time_complexity_analysis.detected_time_complexity}\n`;
        outputMessage += `💾 Space Complexity: ${data.time_complexity_analysis.detected_space_complexity}\n\n`;
        
        // Anti-cheat penalty
        if (data.anti_cheat_penalty > 0) {
          outputMessage += `⚠️  Anti-cheat penalty: -${data.anti_cheat_penalty}%\n`;
          outputMessage += `   (Tab switches: ${tabSwitchCount}, Copy: ${copyAttempts}, Paste: ${pasteAttempts})\n\n`;
        }
        
        // Final Score
        outputMessage += `═══════════════════════════════════════════════\n`;
        outputMessage += `          FINAL SCORE: ${Math.round(data.score)}%\n`;
        outputMessage += `═══════════════════════════════════════════════\n\n`;
        
        if (data.score >= 90) {
          outputMessage += `🌟 Excellent work! Outstanding performance!\n`;
        } else if (data.score >= 70) {
          outputMessage += `👍 Good job! You passed the challenge!\n`;
        } else if (data.score >= 50) {
          outputMessage += `📚 Keep practicing! Review the solutions and try again.\n`;
        } else {
          outputMessage += `💪 Don't give up! Study the problem and retry.\n`;
        }
        
        setOutput(outputMessage);
        
        // Backend already added 'coding-challenge' to modules_completed array
        // Just reload progress from Firebase to update UI
        try {
          await loadProgressFromFirebase(courseId);
          console.log('✅ Coding challenge progress reloaded from Firebase');
          console.log('📊 Progress bar should now show 100%');
        } catch (err) {
          console.error('❌ Failed to reload progress:', err);
        }
        
        // Exit fullscreen and show results page (like quiz)
        exitFullscreen();
        setShowResults(true);
        setChallengeStarted(false);
        
        // Show success toast
        if (allPassed) {
          showToast(`🎉 Perfect! All test cases passed! Score: ${Math.round(data.score)}%`, 'success');
        } else if (data.score >= 70) {
          showToast(`✅ Good job! Score: ${Math.round(data.score)}%`, 'success');
        }
        
      } else {
        setOutput(`❌ Evaluation failed: ${data.message || 'Unknown error'}`);
        showToast('❌ Evaluation failed. Check output for details.', 'error');
      }
    } catch (error) {
      setOutput(`❌ Error: ${error.message}\n\nPlease check your internet connection and try again.`);
      showToast('❌ Failed to submit code. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // START PAGE - Similar to Quiz
  if (!challengeStarted) {
    return (
      <div ref={containerRef} className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-quantico-bold text-gray-100 mb-6">
            Coding Challenge
          </h1>
          
          <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-quantico-bold text-emerald-300 mb-4 flex items-center justify-center">
              <span className="mr-3">💻</span>
              {problem.title}
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              Solve the coding challenge to complete your final exam.
            </p>
            <span className="px-3 py-1 rounded-lg text-xs font-quantico-bold bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/40 text-emerald-300">
              {problem.difficulty}
            </span>
          </div>

          <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-quantico-bold text-emerald-300 mb-3">Challenge Information</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>Problem: <span className="text-gray-100 font-quantico-bold">{problem.title}</span></p>
              <p>Languages: <span className="text-gray-100">Python, Java, C++, C</span></p>
              <p>Test Cases: <span className="text-gray-100">Multiple hidden test cases</span></p>
              <p>Environment: <span className="text-gray-100">Fullscreen with anti-cheat</span></p>
            </div>
          </div>

          {/* Previous Attempt Status */}
          {hasAttempted && savedSubmission && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-quantico-bold text-yellow-300 mb-3">Previous Attempt</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Score: <span className="text-yellow-400 font-quantico-bold">{Math.round(savedSubmission.score)}%</span></p>
                <p>Language: <span className="text-gray-100">{savedSubmission.language?.toUpperCase()}</span></p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {hasAttempted ? (
              <>
                <button
                  onClick={viewReview}
                  className="w-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 hover:border-cyan-400/60 text-cyan-200 font-quantico-bold py-4 px-8 rounded-xl transition-all duration-300"
                >
                  📝 Review Previous Code
                </button>
                <button
                  onClick={startTryAgain}
                  className="w-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/40 hover:border-yellow-400/60 text-yellow-200 font-quantico-bold py-4 px-8 rounded-xl transition-all duration-300"
                >
                  🔄 Try Again (New Attempt)
                </button>
              </>
            ) : (
              <button
                onClick={startChallenge}
                className="w-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/40 hover:border-yellow-400/60 text-yellow-200 font-quantico-bold py-4 px-8 rounded-xl transition-all duration-300"
              >
                Start Challenge
              </button>
            )}
            
            <button
              onClick={() => onNavigate('course', { courseId })}
              className="w-full bg-gradient-to-r from-gray-600/20 to-gray-700/20 hover:from-gray-600/30 hover:to-gray-700/30 border border-gray-500/40 hover:border-gray-400/60 text-gray-200 font-quantico-bold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Back to Course
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Your code will be evaluated against multiple test cases. Anti-cheat monitoring is active.
          </p>
        </div>
      </div>
    );
  }

  // RESULTS PAGE - Similar to Quiz
  if (showResults) {
    const passedTests = testResults?.filter(t => t.passed).length || 0;
    const totalTests = testResults?.length || 0;
    const allPassed = passedTests === totalTests;

    return (
      <div ref={containerRef} className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-black/50 to-green-900/10 border border-emerald-600/30 rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{allPassed ? '🎉' : '📊'}</div>
              <h2 className="text-3xl font-quantico-bold text-emerald-400 mb-2">
                Challenge Complete!
              </h2>
              <p className="text-gray-300">Your solution has been evaluated</p>
            </div>

            {/* Score Card */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-6 mb-6">
              <div className="text-center">
                <div className="text-5xl font-quantico-bold text-yellow-400 mb-2">
                  {Math.round(score)}%
                </div>
                <div className="text-emerald-300 font-quantico-bold">
                  Final Score
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="bg-black/40 rounded-xl p-6 mb-6 border border-gray-700/50">
              <h3 className="text-lg font-quantico-bold text-emerald-400 mb-4 flex items-center gap-2">
                <span>📝</span> Test Results
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Tests Passed:</span>
                  <span className={`font-quantico-bold ${allPassed ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {passedTests}/{totalTests}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Language:</span>
                  <span className="text-gray-100 font-quantico-bold">{selectedLanguage.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Anti-cheat Penalty:</span>
                  <span className="text-gray-100 font-quantico-bold">
                    {tabSwitchCount > 0 ? `-${tabSwitchCount * 5}%` : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="bg-gradient-to-r from-emerald-500/5 to-green-500/5 border border-emerald-500/20 rounded-xl p-6 mb-6">
              <p className="text-gray-300 text-center leading-relaxed">
                {allPassed ? (
                  <>🌟 <strong className="text-emerald-400">Excellent work!</strong> You passed all test cases. Your progress has been saved.</>
                ) : score >= 70 ? (
                  <>👍 <strong className="text-emerald-400">Good job!</strong> You passed the challenge. Your progress has been saved.</>
                ) : (
                  <>💪 <strong className="text-yellow-400">Keep practicing!</strong> Your submission has been recorded.</>
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowResults(false);
                  setScore(null);
                  setTestResults(null);
                  setOutput('');
                  setCode(codeTemplates[selectedLanguage]);
                  setTabSwitchCount(0);
                  setCopyAttempts(0);
                  setPasteAttempts(0);
                  setWarnings([]);
                  showToast('💪 Try again to improve your score!', 'info');
                }}
                className="flex-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/40 hover:border-yellow-400/60 text-yellow-200 font-quantico-bold py-4 px-6 rounded-xl transition-all duration-300"
              >
                🔄 Try Again
              </button>
              <button
                onClick={() => onNavigate('course', { courseId })}
                className="flex-1 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 font-quantico-bold py-4 px-6 rounded-xl transition-all duration-300"
              >
                ✓ Back to Course
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN CHALLENGE PAGE
  return (
    <div 
      ref={containerRef}
      className="w-full h-screen flex flex-col bg-black text-gray-100 overflow-hidden"
    >
      {/* Header - Project Theme */}
      <div className="bg-glossy-header backdrop-blur-xl border-b border-emerald-500/30 p-4 flex-shrink-0 shadow-lg">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-lg">💻</span>
            </div>
            <div>
              <h1 className="text-xl font-quantico-bold text-gray-100">
                {problem.title}
              </h1>
              <p className="text-xs text-gray-400 font-quantico">Coding Challenge</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg text-xs font-quantico-bold bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/40 text-emerald-300">
              {problem.difficulty}
            </span>
            {score !== null && (
              <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40">
                <span className="text-xs font-quantico-bold text-yellow-300">
                  Score: {Math.round(score)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Problem Statement */}
        <div className="w-2/5 bg-glossy-black-ultra border-r border-gray-700/50 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-b border-gray-700/50 p-3">
            <h2 className="text-base font-quantico-bold text-gray-100 flex items-center gap-2">
              <span>📋</span> Problem Statement
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Description */}
            <div className="bg-glossy-card backdrop-blur-md rounded-xl p-4 border border-gray-700/50 shadow-lg">
              <h3 className="text-sm font-quantico-bold text-emerald-400 mb-3 pb-2 border-b border-emerald-500/30">
                Description
              </h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">{problem.description}</p>
            </div>

            {/* Input/Output */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-glossy-card backdrop-blur-md p-4 rounded-xl border border-gray-700/50 shadow-lg">
                <h3 className="text-xs font-quantico-bold text-emerald-400 mb-2 flex items-center gap-2">
                  <span>📥</span> Input
                </h3>
                <p className="text-gray-300 text-xs leading-relaxed">{problem.input}</p>
              </div>
              <div className="bg-glossy-card backdrop-blur-md p-4 rounded-xl border border-gray-700/50 shadow-lg">
                <h3 className="text-xs font-quantico-bold text-emerald-400 mb-2 flex items-center gap-2">
                  <span>📤</span> Output
                </h3>
                <p className="text-gray-300 text-xs leading-relaxed">{problem.output}</p>
              </div>
            </div>

            {/* Examples */}
            <div className="bg-glossy-card backdrop-blur-md rounded-xl p-4 border border-gray-700/50 shadow-lg">
              <h3 className="text-sm font-quantico-bold text-emerald-400 mb-3 pb-2 border-b border-emerald-500/30 flex items-center gap-2">
                <span>💡</span> Examples
              </h3>
              <div className="space-y-3">
                {problem.examples.map((example, idx) => (
                  <div key={idx} className="bg-gray-800/40 backdrop-blur-sm p-3 rounded-lg border border-gray-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-emerald-500/20 rounded text-[10px] font-quantico-bold text-emerald-300">
                        Example {idx + 1}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <strong className="text-[10px] text-gray-400 font-quantico-bold">Input:</strong>
                        <pre className="mt-1 bg-black/50 p-2 rounded text-emerald-400 text-xs font-mono border border-emerald-500/20">
                          {example.input}
                        </pre>
                      </div>
                      <div>
                        <strong className="text-[10px] text-gray-400 font-quantico-bold">Output:</strong>
                        <pre className="mt-1 bg-black/50 p-2 rounded text-cyan-400 text-xs font-mono border border-cyan-500/20">
                          {example.output}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints with Modern Design */}
            <div className="bg-glossy-card backdrop-blur-md rounded-xl p-5 border border-gray-700/50 shadow-lg">
              <h3 className="text-base font-quantico-bold text-emerald-400 mb-4 pb-2 border-b border-emerald-500/30 flex items-center gap-2">
                <span>⚡</span> Constraints
              </h3>
              <ul className="space-y-2">
                {problem.constraints.map((constraint, idx) => (
                  <li key={idx} className="bg-gray-800/40 backdrop-blur-sm p-3 rounded-lg border-l-4 border-emerald-500/50 text-gray-300 text-sm flex items-center gap-3">
                    <span className="text-emerald-400">•</span>
                    <span>{constraint}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side - Code Editor */}
        <div className="w-3/5 flex flex-col bg-black">
          {/* Editor Header */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-b border-gray-700/50 p-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <label className="text-sm font-quantico-bold text-gray-300">Language:</label>
              <select 
                value={selectedLanguage} 
                onChange={(e) => {
                  const newLang = e.target.value;
                  setSelectedLanguage(newLang);
                  setCode(codeTemplates[newLang]);
                }}
                className="px-3 py-1.5 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg text-sm font-quantico focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 font-quantico-bold rounded-lg text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ▶ Run
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/40 hover:border-yellow-400/60 text-yellow-200 font-quantico-bold rounded-lg text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '⏳ Evaluating...' : '✓ Submit'}
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden relative bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={monacoLanguageMap[selectedLanguage]}
              value={code}
              onChange={(value) => {
                setCode(value || '');
              }}
              theme="vs-dark"
              onMount={(editor) => {
                editorRef.current = editor;
                editor.updateOptions({ readOnly: false });
                editor.focus();
              }}
              options={{
                readOnly: false,
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                tabSize: 4,
                wordWrap: 'on',
              }}
            />
          </div>

          {/* Output Section */}
          <div className="h-48 flex flex-col bg-gray-900/50 border-t border-gray-700/50">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-b border-gray-700/50 p-2 flex justify-between items-center">
              <h3 className="text-sm font-quantico-bold text-gray-100">Output</h3>
              {score !== null && (
                <span className="px-3 py-1 rounded-lg text-xs font-quantico-bold bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/40 text-emerald-300">
                  Score: {Math.round(score)}%
                </span>
              )}
            </div>
            <pre className="flex-1 p-4 overflow-y-auto text-gray-300 text-sm font-mono bg-black leading-relaxed">
              {output || '💡 Click "Run" to test or "Submit" to evaluate your solution.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingChallengePage;
