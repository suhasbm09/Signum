import { useState, useEffect, useRef } from 'react';
import QuizContent from '../courses/data-structures/components/QuizContent';
import { isQuizAntiCheatEnabled, isQuizTestingMode } from '../config/features';
import progressService from '../services/progressService';
import { useToast } from '../components/Toast';
import { useProgress } from '../contexts/ProgressContext';

function QuizPage({ user, onLogout, onNavigate, courseId }) {
  const { showToast, ToastContainer } = useToast();
  const { getQuizScore } = useProgress();
  
  // State flow: MODULE PAGE → FULLSCREEN START PAGE → QUIZ → RESULTS
  const [showFullscreenStartPage, setShowFullscreenStartPage] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  
  // Previous attempt tracking
  const [hasAttempted, setHasAttempted] = useState(false);
  const [savedSubmission, setSavedSubmission] = useState(null);
  
  // Anti-cheat state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [antiCheatEnabled, setAntiCheatEnabled] = useState(false);
  const [violations, setViolations] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  
  // Block state
  const [quizBlocked, setQuizBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  
  // Feature flags from config
  const antiCheatFeatureEnabled = isQuizAntiCheatEnabled();
  const testingMode = isQuizTestingMode();
  
  const pageRef = useRef();

  // Constants
  const MAX_VIOLATIONS = 3;
  const COOLDOWN_MINUTES = 15;
  
  // Get user ID from prop OR window.currentUser
  const getUserId = () => {
    if (user?.uid) return user.uid;
    if (typeof window !== 'undefined' && window.currentUser) {
      return window.currentUser.uid || window.currentUser.email;
    }
    return null;
  };
  const userId = getUserId();
  
  // Session ID for current quiz attempt
  const [sessionId, setSessionId] = useState(null);

  // Load initial state - check if blocked and previous attempts
  useEffect(() => {
    const loadInitialState = async () => {
      if (!courseId || !userId) {
        return;
      }

      try {
        
        // Check if user is blocked
        const blockStatus = await progressService.getBlockStatus(userId, courseId, 'quiz');
        
        if (blockStatus.is_blocked) {
          setQuizBlocked(true);
          const endTime = new Date(blockStatus.block_end_time).getTime();
          setBlockEndTime(endTime);
          setTimeRemaining(blockStatus.time_remaining_ms / 1000);
        } else {
          setQuizBlocked(false);
          setBlockEndTime(null);
          setTimeRemaining(null);
          setViolations([]);
        }
        
        // Check for previous attempts - fetch full data from server
        const attempts = await progressService.getQuizResults(userId, courseId);
        if (attempts && attempts.length > 0) {
          const latestAttempt = attempts[0];
          setHasAttempted(true);
          setSavedSubmission(latestAttempt);
        } else {
          // Fallback to context if server doesn't have data
          const existingScore = getQuizScore(courseId);
          if (existingScore && existingScore.score !== undefined) {
            setHasAttempted(true);
            setSavedSubmission({
              score: existingScore.score,
              answers: existingScore.answers || [],
              timestamp: existingScore.timestamp
            });
          }
        }
      } catch (error) {
        console.error('Error loading initial state:', error);
        setQuizBlocked(false);
      }
    };
    
    loadInitialState();
  }, [userId, courseId, getQuizScore]);

  // Countdown timer for blocked state
  useEffect(() => {
    let interval;
    if (quizBlocked && blockEndTime) {
      interval = setInterval(async () => {
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((blockEndTime - now) / 1000));
        
        if (remaining <= 0) {
          setQuizBlocked(false);
          setBlockEndTime(null);
          setTimeRemaining(null);
          setViolations([]);
          
          try {
            await progressService.clearQuizViolations(userId, courseId);
          } catch (error) {
            console.error('Error clearing violations:', error);
          }
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [quizBlocked, blockEndTime, userId, courseId]);

  const blockQuizAccess = async () => {
    try {
      const blockEndTimeMs = new Date().getTime() + (COOLDOWN_MINUTES * 60 * 1000);
      setQuizBlocked(true);
      setBlockEndTime(blockEndTimeMs);
      setTimeRemaining(COOLDOWN_MINUTES * 60);
      
      await progressService.blockQuizAccess(userId, courseId, COOLDOWN_MINUTES, violations.length);
      
      setQuizStarted(false);
      setAntiCheatEnabled(false);
      await exitFullscreen();
      
      showToast(`🚫 Quiz blocked for ${COOLDOWN_MINUTES} minutes due to violations`, 'error');
    } catch (error) {
      console.error('❌ Failed to block quiz access:', error);
    }
  };

  const formatTimeRemaining = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const addViolation = async (type) => {
    if (!quizStarted || !antiCheatEnabled) {
      return;
    }
    
    if (violations.length >= MAX_VIOLATIONS) {
      return;
    }
    
    const violation = {
      type,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    
    const updatedViolations = [...violations, violation];
    setViolations(updatedViolations);
    
    try {
      await progressService.saveViolation(userId, courseId, 'quiz', type, violation.timestamp);
    } catch (error) {
      console.error('❌ Failed to save violation:', error);
    }
    
    if (updatedViolations.length >= MAX_VIOLATIONS) {
      setWarningMessage(`🚫 BLOCKED: Maximum violations (${MAX_VIOLATIONS}) exceeded. Cooldown: ${COOLDOWN_MINUTES} minutes`);
      setShowWarning(true);
      await blockQuizAccess();
      setTimeout(() => setShowWarning(false), 3000);
    } else {
      setWarningMessage(`⚠️ Violation detected: ${type} (${updatedViolations.length}/${MAX_VIOLATIONS})`);
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
  };

  // Fullscreen functions
  const enterFullscreen = async () => {
    try {
      if (pageRef.current?.requestFullscreen) {
        await pageRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('❌ Failed to enter fullscreen:', error);
      showToast('Unable to enter fullscreen mode', 'error');
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  };

  // Anti-cheat event listeners
  useEffect(() => {
    if (!quizStarted || !antiCheatEnabled || testingMode) return;


    const handleVisibilityChange = () => {
      if (document.hidden) {
        addViolation('Tab/Window Switch Detected');
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && quizStarted) {
        addViolation('Exited Fullscreen Mode');
      }
    };

    const handleBlur = () => {
      addViolation('Window Lost Focus (possible Alt+Tab)');
    };

    const handleCopy = (e) => {
      e.preventDefault();
      addViolation('Copy Attempt Blocked');
      return false;
    };

    const handlePaste = (e) => {
      e.preventDefault();
      addViolation('Paste Attempt Blocked');
      return false;
    };

    const handleCut = (e) => {
      e.preventDefault();
      addViolation('Cut Attempt Blocked');
      return false;
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      addViolation('Right-Click Blocked');
      return false;
    };

    const handleKeyDown = (e) => {
      const forbiddenFKeys = ['F5', 'F11', 'F12'];
      if (forbiddenFKeys.includes(e.key)) {
        e.preventDefault();
        addViolation(`Forbidden key: ${e.key}`);
        return false;
      }

      if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        const ctrlForbidden = ['c', 'v', 'x', 'a', 's', 'p', 'f', 'h', 'j', 'k', 'l', 'n', 't', 'w', 'r', 'u'];
        if (ctrlForbidden.includes(e.key.toLowerCase())) {
          e.preventDefault();
          addViolation(`Blocked Ctrl+${e.key.toUpperCase()}`);
          return false;
        }
      }

      if (e.ctrlKey && e.shiftKey && !e.altKey) {
        const devToolsKeys = ['i', 'j', 'c', 'k'];
        if (devToolsKeys.includes(e.key.toLowerCase())) {
          e.preventDefault();
          addViolation(`Developer Tools Blocked: Ctrl+Shift+${e.key.toUpperCase()}`);
          return false;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      window.removeEventListener('blur', handleBlur);
    };
  }, [antiCheatEnabled, quizStarted, testingMode, violations.length]);

  // Called from MODULE PAGE - enters fullscreen and shows fullscreen start page
  const startQuiz = async () => {
    if (!courseId || !userId) {
      showToast('❌ Error: Course information missing', 'error');
      return;
    }

    // Enter fullscreen FIRST (user gesture required)
    try {
      if (pageRef.current?.requestFullscreen) {
        await pageRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('❌ Failed to enter fullscreen:', error);
      showToast('Unable to enter fullscreen mode. Please try again.', 'error');
      return;
    }

    showToast('🔒 Preparing quiz... Please wait', 'info');
    
    // Check block status
    try {
      const blockStatus = await progressService.getBlockStatus(userId, courseId, 'quiz');
      if (blockStatus.is_blocked) {
        setQuizBlocked(true);
        setBlockEndTime(new Date(blockStatus.block_end_time).getTime());
        setTimeRemaining(blockStatus.time_remaining_ms / 1000);
        showToast('❌ Quiz is blocked due to violations', 'error');
        await exitFullscreen();
        return;
      }
    } catch (error) {
      console.error('Error checking block status:', error);
    }
    
    setViolations([]);
    setShowFullscreenStartPage(true);
    setShowResults(false);
    showToast('✅ Fullscreen mode activated', 'success');
  };

  // Called from FULLSCREEN START PAGE - actually starts the quiz
  const startSecureQuiz = async () => {
    const newSessionId = `quiz_${userId}_${courseId}_${Date.now()}`;
    setSessionId(newSessionId);
    
    const shouldEnableAntiCheat = antiCheatFeatureEnabled && !testingMode;
    setAntiCheatEnabled(shouldEnableAntiCheat);
    setQuizStarted(true);
    setShowFullscreenStartPage(false);
    
  };

  // Called when user clicks "Try Again"
  const startTryAgain = async () => {
    try {
      const blockStatus = await progressService.getBlockStatus(userId, courseId, 'quiz');
      if (blockStatus.is_blocked) {
        setQuizBlocked(true);
        setBlockEndTime(new Date(blockStatus.block_end_time).getTime());
        setTimeRemaining(blockStatus.time_remaining_ms / 1000);
        showToast('Quiz is blocked due to violations', 'error');
        return;
      }
    } catch (error) {
      console.error('Error checking block status:', error);
    }
    
    setViolations([]);
    await enterFullscreen();
    setShowFullscreenStartPage(true);
    setShowResults(false);
  };

  // View previous results - fetch full data from server
  const viewReview = async () => {
    try {
      const attempts = await progressService.getQuizResults(userId, courseId);
      
      if (attempts && attempts.length > 0) {
        const latestAttempt = attempts[0];
        
        // Update saved submission with full data including answers
        setSavedSubmission(latestAttempt);
        setQuizResults(latestAttempt);
      }
    } catch (error) {
      console.error('Error fetching quiz results:', error);
    }
    
    await exitFullscreen();
    setShowResults(true);
    setQuizStarted(false);
    setShowFullscreenStartPage(false);
  };

  const endQuiz = async () => {
    setAntiCheatEnabled(false);
    setQuizStarted(false);
    setShowFullscreenStartPage(false);
    setSessionId(null);
    await exitFullscreen();
  };

  const handleQuizComplete = async (results) => {
    setQuizResults(results);
    setShowResults(true);
    setQuizStarted(false);
    setHasAttempted(true);
    setSavedSubmission(results);
    await exitFullscreen();
  };

  // =============== RENDER STATES ===============

  // BLOCKED OVERLAY
  const BlockedOverlay = () => (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-red-900 to-red-700 border border-red-500 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-quantico-bold text-gray-100 mb-4">Quiz Access Blocked</h2>
        <p className="text-red-200 mb-6">
          Maximum security violations ({MAX_VIOLATIONS}) exceeded. 
          Please wait before attempting again.
        </p>
        <div className="bg-black/50 rounded-xl p-4 mb-6">
          <div className="text-3xl font-quantico-bold text-red-300 mb-2">
            {formatTimeRemaining(timeRemaining)}
          </div>
          <div className="text-sm text-red-400">Time Remaining</div>
        </div>
        <button
          onClick={() => onNavigate('course', { courseId })}
          className="w-full bg-red-600 hover:bg-red-700 text-gray-100 px-6 py-3 rounded-xl font-quantico-bold transition-colors"
        >
          Return to Course
        </button>
      </div>
    </div>
  );

  // WARNING TOAST
  const WarningToast = () => showWarning && (
    <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-red-500 to-orange-500 text-gray-100 p-4 rounded-xl shadow-lg animate-pulse border-2 border-red-400">
      <div className="flex items-center">
        <span className="text-xl mr-2">⚠️</span>
        <span className="font-quantico-bold">{warningMessage}</span>
      </div>
    </div>
  );

  // FULLSCREEN START PAGE (after entering fullscreen, before starting quiz)
  if (showFullscreenStartPage && !quizStarted) {
    return (
      <div ref={pageRef} className="h-screen bg-dark-bg flex flex-col overflow-hidden">
        {quizBlocked && <BlockedOverlay />}
        <WarningToast />
        
        {/* Header with Exit */}
        <div className="bg-black/80 border-b border-emerald-500/30 p-3 flex-shrink-0">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center text-emerald-400">
              <span className="text-lg mr-2">🔒</span>
              <span className="font-quantico-bold text-sm">SECURE QUIZ ENVIRONMENT</span>
            </div>
            <button
              onClick={endQuiz}
              className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-red-600/50 hover:to-red-700/50 border border-gray-600/40 hover:border-red-500/50 text-gray-200 font-quantico-bold py-2 px-4 rounded-lg text-sm transition-all flex items-center gap-2"
            >
              <span>✕</span>
              <span>Exit Fullscreen</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl">
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🔒</div>
                <h1 className="text-2xl sm:text-3xl font-quantico-bold text-gray-100 mb-2">
                  Secure Quiz Environment
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">
                  You are now in fullscreen mode
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-black/50 border border-emerald-500/20 rounded-xl p-4">
                  <h2 className="text-base font-quantico-bold text-emerald-400 mb-3">
                    Security Rules
                  </h2>
                  <div className="space-y-2 text-gray-300 text-sm">
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2">•</span>
                      <span>Stay in fullscreen mode</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2">•</span>
                      <span>Do not switch tabs/windows</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2">•</span>
                      <span>Copy/paste disabled</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2">•</span>
                      <span>Max {MAX_VIOLATIONS} violations</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-red-400 mr-2">⚠️</span>
                      <span className="text-red-300">{COOLDOWN_MINUTES}-min cooldown on block</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4">
                  <h3 className="text-base font-quantico-bold text-emerald-300 mb-3">
                    Quiz Details
                  </h3>
                  <div className="space-y-2 text-gray-300 text-sm">
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2">•</span>
                      <span>10 random questions</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2">•</span>
                      <span>15 minutes time limit</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2">•</span>
                      <span>85%+ for NFT eligible</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={endQuiz}
                  className="flex-1 bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/60 hover:to-gray-700/60 border border-gray-600/40 text-gray-200 font-quantico-bold py-3 px-6 rounded-xl transition-all"
                >
                  ← Cancel
                </button>
                <button
                  onClick={startSecureQuiz}
                  className="flex-1 bg-gradient-to-r from-emerald-600/80 to-green-600/80 hover:from-emerald-500/90 hover:to-green-500/90 text-white font-quantico-bold py-3 px-6 rounded-xl transition-all text-lg border border-emerald-500/50 shadow-lg shadow-emerald-500/20"
                >
                  {hasAttempted ? '🔄 Retake Quiz' : '🚀 Start Quiz'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  // MODULE PAGE (before entering fullscreen)
  if (!quizStarted && !showResults && !showFullscreenStartPage) {
    return (
      <div ref={pageRef} className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        {quizBlocked && <BlockedOverlay />}
        
        <div className="max-w-2xl w-full">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-emerald-500/30 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8 space-y-3">
              <div className="text-6xl mb-4">📝</div>
              <h1 className="text-4xl font-quantico-bold text-gray-100 mb-3">
                Data Structures Quiz
              </h1>
              <p className="text-gray-400 text-lg">
                Test your knowledge
              </p>
            </div>

            {testingMode && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-yellow-300 font-quantico-bold">
                  <span className="text-xl">⚠️</span>
                  <span>TESTING MODE - Anti-cheat disabled</span>
                </div>
              </div>
            )}

            <div className="bg-black/50 border border-emerald-500/20 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-quantico-bold text-emerald-400 mb-4">
                Quiz Details
              </h2>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span>10 questions randomly selected</span>
                </div>
                <div className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span>Topics: Arrays, Stacks, Queues, Trees</span>
                </div>
                <div className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span>15 minutes time limit</span>
                </div>
                <div className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span>Anti-cheat system is active</span>
                </div>
              </div>
            </div>

            {hasAttempted && savedSubmission && (
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-quantico-bold text-emerald-300 mb-3">
                  📊 Previous Attempt
                </h3>
                <div className="text-gray-300 mb-3">
                  <div className="mb-2">
                    Score: <span className="text-emerald-400 font-quantico-bold text-2xl">{savedSubmission.score}%</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {savedSubmission.score >= 85 ? '🏆 NFT Eligible!' : 'Try again for NFT eligibility (85%+)'}
                  </div>
                </div>
                <button
                  onClick={viewReview}
                  className="w-full bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500/90 hover:to-blue-500/90 text-white font-quantico-bold py-3 px-6 rounded-xl transition-all border border-cyan-500/50"
                >
                  📖 Review Previous Answers
                </button>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={hasAttempted ? startTryAgain : startQuiz}
                disabled={quizBlocked}
                className={`w-full ${
                  quizBlocked
                    ? 'bg-gray-700/50 border-gray-600/30 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600/80 to-green-600/80 hover:from-emerald-500/90 hover:to-green-500/90 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                } border text-white font-quantico-bold py-4 px-6 rounded-xl transition-all text-lg`}
              >
                {quizBlocked ? '🚫 Quiz Blocked - Wait for Cooldown' : (hasAttempted ? '🔄 Retake Quiz' : '🚀 Start Quiz')}
              </button>
            </div>

            <button
              onClick={() => onNavigate('course', { courseId })}
              className="w-full mt-4 bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/60 hover:to-gray-700/60 border border-gray-600/40 text-gray-200 font-quantico-bold py-3 px-6 rounded-xl transition-all"
            >
              ← Back to Course
            </button>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  // RESULTS PAGE
  if (showResults) {
    const results = quizResults || savedSubmission;
    if (!results) {
      setShowResults(false);
      return null;
    }

    const passed = results.score >= 85;

    return (
      <div ref={pageRef} className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <div className={`bg-gradient-to-br ${
            passed 
              ? 'from-gray-900 to-black border-emerald-500/30' 
              : 'from-gray-900 to-black border-yellow-500/30'
          } border rounded-2xl p-8 shadow-2xl`}>
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{passed ? '🏆' : '📚'}</div>
              <h1 className="text-4xl font-quantico-bold text-gray-100 mb-3">
                {passed ? 'Quiz Passed!' : 'Quiz Completed!'}
              </h1>
              <p className="text-gray-400 text-lg">
                {passed 
                  ? 'Congratulations! You are NFT eligible!' 
                  : 'Keep practicing to reach 85% for NFT eligibility'}
              </p>
            </div>

            <div className="bg-black/50 border border-emerald-500/20 rounded-xl p-8 mb-6 text-center">
              <div className={`text-7xl font-quantico-bold mb-2 ${
                passed ? 'text-emerald-400' : 'text-yellow-400'
              }`}>
                {Math.round(results.score)}%
              </div>
              <div className="text-gray-400 text-lg mb-4">Final Score</div>
              
              {results.answers && (
                <div className="text-emerald-300 text-xl font-quantico-bold">
                  {results.answers.filter(a => a.is_correct).length}/{results.answers.length} Questions Correct
                </div>
              )}
            </div>

            {/* Answers Review - Full Details */}
            {results.answers && results.answers.length > 0 && (
              <div className="bg-black/50 border border-emerald-500/20 rounded-xl p-4 sm:p-6 mb-6 max-h-[60vh] overflow-y-auto">
                <h3 className="text-xl font-quantico-bold text-emerald-400 mb-4 text-center">
                  📖 Answer Review
                </h3>
                <div className="space-y-4">
                  {results.answers.map((answer, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-xl border ${
                        answer.is_correct 
                          ? 'bg-emerald-900/20 border-emerald-500/30' 
                          : 'bg-red-900/20 border-red-500/30'
                      }`}
                    >
                      {/* Question Header */}
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs text-gray-400">Question {idx + 1}{answer.topic ? ` - ${answer.topic}` : ''}</span>
                        <span className={`text-xs font-quantico-bold px-2 py-1 rounded ${
                          answer.is_correct 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {answer.is_correct ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      </div>
                      
                      {/* Full Question */}
                      <p className="text-gray-100 mb-3 text-sm leading-relaxed font-medium">
                        {answer.question}
                      </p>
                      
                      {/* Your Answer */}
                      <div className="mb-2">
                        <span className="text-xs text-gray-400">Your Answer: </span>
                        <span className={`text-sm font-quantico-bold ${
                          answer.user_answer !== null && answer.user_answer !== undefined
                            ? (answer.is_correct ? 'text-emerald-400' : 'text-red-400')
                            : 'text-gray-500'
                        }`}>
                          {answer.user_answer !== null && answer.user_answer !== undefined && answer.options
                            ? `${String.fromCharCode(65 + answer.user_answer)}. ${answer.options[answer.user_answer]}`
                            : 'No answer selected'}
                        </span>
                      </div>
                      
                      {/* Correct Answer (show if wrong) */}
                      {!answer.is_correct && answer.options && answer.correct_answer !== undefined && (
                        <div className="mb-2">
                          <span className="text-xs text-gray-400">Correct Answer: </span>
                          <span className="text-sm font-quantico-bold text-emerald-400">
                            {String.fromCharCode(65 + answer.correct_answer)}. {answer.options[answer.correct_answer]}
                          </span>
                        </div>
                      )}
                      
                      {/* Explanation */}
                      {answer.explanation && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <span className="text-xs text-gray-400">💡 Explanation: </span>
                          <span className="text-xs text-gray-300 italic">{answer.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={startTryAgain}
                className="flex-1 bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/60 hover:to-gray-700/60 border border-gray-600/40 text-gray-200 font-quantico-bold py-4 px-6 rounded-xl transition-all"
              >
                🔄 Try Again
              </button>
              <button
                onClick={() => onNavigate('course', { courseId })}
                className="flex-1 bg-gradient-to-r from-emerald-600/80 to-green-600/80 hover:from-emerald-500/90 hover:to-green-500/90 text-white font-quantico-bold py-4 px-6 rounded-xl transition-all border border-emerald-500/50"
              >
                ✓ Complete & Return to Course
              </button>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  // MAIN QUIZ PAGE (during quiz)
  return (
    <div ref={pageRef} className="h-screen bg-dark-bg flex flex-col overflow-hidden">
      {quizBlocked && <BlockedOverlay />}
      <WarningToast />

      {!quizBlocked && (
        <>
          {/* Header */}
          <div className="bg-black/80 border-b border-emerald-500/30 p-3 flex-shrink-0">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-emerald-400">
                  <span className="text-lg mr-2">🔒</span>
                  <span className="font-quantico-bold text-xs">
                    {testingMode ? 'TESTING MODE' : 'SECURE MODE - FULLSCREEN'}
                  </span>
                </div>
                {testingMode && (
                  <div className="bg-green-500/20 border border-green-500/40 rounded px-2 py-1">
                    <span className="text-green-300 text-xs font-quantico-bold">
                      Anti-cheat disabled
                    </span>
                  </div>
                )}
                <div className="text-gray-400 text-xs">
                  Violations: <span className="text-emerald-300 font-quantico-bold">{violations.length}/{MAX_VIOLATIONS}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-emerald-300 text-xs">
                  Student: <span className="text-gray-100 font-quantico-bold">{user?.displayName || 'Anonymous'}</span>
                </div>
                <button
                  onClick={endQuiz}
                  className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/60 hover:to-gray-700/60 border border-gray-600/40 text-gray-200 font-quantico-bold py-1 px-3 rounded-lg text-xs transition-all"
                >
                  End Quiz
                </button>
              </div>
            </div>
          </div>

          {/* Quiz Content */}
          <div className="flex-1 overflow-hidden">
            <QuizContent 
              onNavigate={onNavigate}
              courseId={courseId}
              onQuizComplete={handleQuizComplete}
              violations={violations}
            />
          </div>
        </>
      )}

      {/* Violations Log */}
      {violations.length > 0 && (
        <div className="fixed bottom-4 left-4 bg-black/90 border border-emerald-500/30 rounded-xl p-3 max-w-sm z-40">
          <h4 className="text-emerald-400 font-quantico-bold text-xs mb-2">Security Log</h4>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {violations.slice(-3).map(violation => (
              <div key={violation.id} className="text-xs text-gray-300">
                <span className="text-emerald-400">{new Date(violation.timestamp).toLocaleTimeString()}</span>: {violation.type}
              </div>
            ))}
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default QuizPage;
