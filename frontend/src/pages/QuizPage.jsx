import { useState, useEffect, useRef } from 'react';
import QuizContent from '../courses/data-structures/components/QuizContent';
import { isQuizAntiCheatEnabled, isQuizTestingMode } from '../config/features';
import progressService from '../services/progressService';

function QuizPage({ user, onLogout, onNavigate, courseId }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [antiCheatEnabled, setAntiCheatEnabled] = useState(false);
  const [violations, setViolations] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  
  // Feature flags from config
  const antiCheatFeatureEnabled = isQuizAntiCheatEnabled();
  const testingMode = isQuizTestingMode();
  
  const [quizBlocked, setQuizBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const pageRef = useRef();

  // Constants
  const MAX_VIOLATIONS = 3;
  const COOLDOWN_MINUTES = 30;
  const userId = user?.uid || 'user_123';
  
  // Session ID for current quiz attempt
  const [sessionId, setSessionId] = useState(null);

  // Load violations and block status ONLY - don't start tracking yet
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        // Check if user is blocked
        const blockStatus = await progressService.getQuizBlockStatus(userId, courseId);
        
        if (blockStatus.is_blocked) {
          setQuizBlocked(true);
          const endTime = new Date(blockStatus.block_end_time).getTime();
          setBlockEndTime(endTime);
          setTimeRemaining(blockStatus.time_remaining_ms / 1000);
        } else {
          // If not blocked, auto-clear old violations when cooldown expires
          setQuizBlocked(false);
          setBlockEndTime(null);
          setTimeRemaining(null);
          setViolations([]); // Reset violations when accessing quiz page fresh
        }
      } catch (error) {
        console.error('Error loading initial state:', error);
      }
    };
    
    loadInitialState();
  }, [userId, courseId]);

  // Countdown timer for blocked state
  useEffect(() => {
    let interval;
    if (quizBlocked && blockEndTime) {
      interval = setInterval(async () => {
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((blockEndTime - now) / 1000));
        
        if (remaining <= 0) {
          // Block expired - auto-clear violations and unblock
          setQuizBlocked(false);
          setBlockEndTime(null);
          setTimeRemaining(null);
          setViolations([]);
          
          // Clear from backend too
          try {
            await progressService.clearQuizViolations(userId, courseId);
            console.log('✅ Cooldown expired - violations cleared');
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

  // Remove old checkQuizBlockStatus function (now in useEffect above)
  
  const blockQuizAccess = async () => {
    try {
      // Block via Firebase backend
      await progressService.blockQuizAccess(
        userId,
        courseId,
        COOLDOWN_MINUTES,
        violations.length
      );
      
      const blockEndTimeMs = new Date().getTime() + (COOLDOWN_MINUTES * 60 * 1000);
      setQuizBlocked(true);
      setBlockEndTime(blockEndTimeMs);
      setTimeRemaining(COOLDOWN_MINUTES * 60);
      
      // End current quiz and disable anti-cheat
      setQuizStarted(false);
      setAntiCheatEnabled(false);
      await exitFullscreen();
      
      console.log('✅ Quiz access blocked in Firebase');
    } catch (error) {
      console.error('❌ Failed to block quiz access:', error);
    }
  };

  const formatTimeRemaining = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset violations - Admin only feature (for testing)
  const resetViolations = async () => {
    try {
      // In production, this should be protected by admin authentication
      setViolations([]);
      setShowWarning(false);
      setWarningMessage('');
      console.log('⚠️ Violations reset (testing mode only)');
    } catch (error) {
      console.error('Error resetting violations:', error);
    }
  };

  // Anti-cheat detection functions
  const detectTabSwitch = () => {
    if (antiCheatEnabled && quizStarted && !testingMode) {
      addViolation('Tab/Window Switch Detected');
    }
  };

  const detectRightClick = (e) => {
    if (antiCheatEnabled && quizStarted && !testingMode) {
      e.preventDefault();
      addViolation('Right-click Attempted');
      return false;
    }
  };

  const detectKeyboardShortcuts = (e) => {
    if (antiCheatEnabled && quizStarted && !testingMode) {
      // Prevent common shortcuts
      const forbiddenKeys = [
        'F12', // Developer tools
        'F5',  // Refresh
        'F11', // Fullscreen toggle
      ];

      const forbiddenCombos = [
        { ctrl: true, key: 'c' }, // Copy
        { ctrl: true, key: 'v' }, // Paste
        { ctrl: true, key: 'x' }, // Cut
        { ctrl: true, key: 'a' }, // Select all
        { ctrl: true, key: 's' }, // Save
        { ctrl: true, key: 'p' }, // Print
        { ctrl: true, key: 'f' }, // Find
        { ctrl: true, key: 'h' }, // History
        { ctrl: true, key: 'j' }, // Downloads
        { ctrl: true, key: 'k' }, // Search
        { ctrl: true, key: 'l' }, // Address bar
        { ctrl: true, key: 'n' }, // New tab
        { ctrl: true, key: 't' }, // New tab
        { ctrl: true, key: 'w' }, // Close tab
        { ctrl: true, key: 'r' }, // Refresh
        { ctrl: true, key: 'u' }, // View source
        { ctrl: true, shift: true, key: 'i' }, // Developer tools
        { ctrl: true, shift: true, key: 'j' }, // Developer tools
        { ctrl: true, shift: true, key: 'c' }, // Developer tools
        { alt: true, key: 'Tab' }, // Alt+Tab
      ];

      // Check forbidden keys
      if (forbiddenKeys.includes(e.key)) {
        e.preventDefault();
        addViolation(`Forbidden key pressed: ${e.key}`);
        return false;
      }

      // Check forbidden combinations
      const matchesForbidden = forbiddenCombos.some(combo => {
        return (
          (!combo.ctrl || e.ctrlKey) &&
          (!combo.alt || e.altKey) &&
          (!combo.shift || e.shiftKey) &&
          e.key.toLowerCase() === combo.key.toLowerCase()
        );
      });

      if (matchesForbidden) {
        e.preventDefault();
        addViolation(`Forbidden key combination: ${e.ctrlKey ? 'Ctrl+' : ''}${e.altKey ? 'Alt+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`);
        return false;
      }
    }
  };

  const detectDevTools = () => {
    if (antiCheatEnabled && quizStarted && !testingMode) {
      let devtools = { open: false, orientation: null };
      
      setInterval(() => {
        if (window.outerHeight - window.innerHeight > 160 || window.outerWidth - window.innerWidth > 160) {
          if (!devtools.open) {
            devtools.open = true;
            addViolation('Developer Tools Opened');
          }
        } else {
          devtools.open = false;
        }
      }, 500);
    }
  };

  const addViolation = async (type) => {
    // CRITICAL: Only add violations when quiz is actually started AND anti-cheat is enabled
    if (!quizStarted || !antiCheatEnabled) {
      console.log('⚠️ Violation ignored - quiz not active:', type);
      return;
    }
    
    // Check if already at max violations - don't add more
    if (violations.length >= MAX_VIOLATIONS) {
      console.log('⚠️ Already at max violations');
      return;
    }
    
    const violation = {
      type,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    
    // Add to local state first
    const updatedViolations = [...violations, violation];
    setViolations(updatedViolations);
    
    // Save violation to backend
    try {
      await progressService.saveViolation(
        userId,
        courseId,
        'quiz', // assessment_type
        type,
        violation.timestamp
      );
      console.log('✅ Violation saved to backend');
    } catch (error) {
      console.error('❌ Failed to save violation to backend:', error);
    }
    
    // Check if we hit the limit
    if (updatedViolations.length >= MAX_VIOLATIONS) {
      setWarningMessage(`QUIZ BLOCKED: Maximum violations (${MAX_VIOLATIONS}) exceeded. Access blocked for ${COOLDOWN_MINUTES} minutes.`);
      setShowWarning(true);
      await blockQuizAccess();
      setTimeout(() => {
        onNavigate('dashboard');
      }, 5000);
    } else {
      setWarningMessage(`Security Alert: ${type} (${updatedViolations.length}/${MAX_VIOLATIONS})`);
      setShowWarning(true);
      setTimeout(() => {
        setShowWarning(false);
      }, 3000);
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
      console.error('Failed to enter fullscreen:', error);
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

  // Event listeners setup
  useEffect(() => {
    // Visibility change (tab switch detection)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        detectTabSwitch();
      }
    };

    // Fullscreen change detection
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement && antiCheatEnabled && quizStarted && !testingMode) {
        addViolation('Exited Fullscreen Mode');
      }
    };

    // Blur detection (window focus loss)
    const handleBlur = () => {
      if (antiCheatEnabled && quizStarted && !testingMode) {
        addViolation('Window Lost Focus');
      }
    };

    // Setup event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', detectRightClick);
    document.addEventListener('keydown', detectKeyboardShortcuts);
    window.addEventListener('blur', handleBlur);

    // Detect dev tools
    detectDevTools();

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', detectRightClick);
      document.removeEventListener('keydown', detectKeyboardShortcuts);
      window.removeEventListener('blur', handleBlur);
    };
  }, [antiCheatEnabled, quizStarted]);

  const startSecureQuiz = async () => {
    // Check if blocked before starting
    if (quizBlocked) {
      console.log('❌ Cannot start quiz - user is blocked');
      return;
    }
    
    // Clear any old violations from previous session
    setViolations([]);
    
    // Generate new session ID
    const newSessionId = `quiz_${userId}_${courseId}_${Date.now()}`;
    setSessionId(newSessionId);
    
    // Only enable anti-cheat if the feature flag is enabled and not in testing mode
    const shouldEnableAntiCheat = antiCheatFeatureEnabled && !testingMode;
    setAntiCheatEnabled(shouldEnableAntiCheat);
    setQuizStarted(true);
    
    console.log('🔒 Quiz session started:', newSessionId);
    console.log('🔒 Anti-cheat enabled:', shouldEnableAntiCheat);
    
    // Only enter fullscreen if anti-cheat is enabled
    if (shouldEnableAntiCheat) {
      await enterFullscreen();
    }
  };

  const endQuiz = async () => {
    console.log('🛑 Ending quiz session:', sessionId);
    
    // Disable anti-cheat and exit quiz mode
    setAntiCheatEnabled(false);
    setQuizStarted(false);
    setSessionId(null);
    
    // Don't clear violations here - they should persist for blocking logic
    // Violations will auto-clear when cooldown expires
    
    await exitFullscreen();
  };

  if (!quizStarted) {
    return (
      <div ref={pageRef} className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-quantico-bold text-gray-100 mb-6">
            Secure Quiz Environment
          </h1>
          
          {/* Testing Mode Banner */}
          {testingMode && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-yellow-300 font-quantico-bold">
                <span className="text-xl">⚠️</span>
                <span>QUIZ TESTING MODE</span>
              </div>
              <p className="text-yellow-400/80 text-sm mt-2">
                Anti-cheat system is disabled for testing purposes
              </p>
            </div>
          )}
          
          <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-quantico-bold text-emerald-300 mb-4 flex items-center justify-center">
              <span className="mr-3">{testingMode ? '🧪' : '🔒'}</span>
              {testingMode ? 'Testing Mode Active' : 'Anti-Cheat System Active'}
            </h2>
            {antiCheatFeatureEnabled && !testingMode ? (
              <div className="text-left space-y-2 text-gray-300 text-sm">
                <p>• <strong className="text-gray-100">Fullscreen Mode:</strong> Quiz will run in fullscreen, exiting will be flagged</p>
                <p>• <strong className="text-gray-100">Tab Monitoring:</strong> Switching tabs/windows will be detected</p>
                <p>• <strong className="text-gray-100">Keyboard Restrictions:</strong> Copy, paste, and developer shortcuts are disabled</p>
                <p>• <strong className="text-gray-100">Right-Click Disabled:</strong> Context menus are blocked</p>
                <p>• <strong className="text-gray-100">Developer Tools:</strong> Opening dev tools will be flagged</p>
                <p>• <strong className="text-gray-100">Focus Monitoring:</strong> Window focus changes are tracked</p>
              </div>
            ) : (
              <div className="text-left space-y-2 text-gray-300 text-sm">
                <p>• <strong className="text-gray-100">No Anti-Cheat:</strong> Take the quiz in normal mode for testing</p>
                <p>• <strong className="text-gray-100">Full Browser Access:</strong> All shortcuts and tools are available</p>
                <p>• <strong className="text-gray-100">No Monitoring:</strong> Your actions are not being tracked</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-quantico-bold text-emerald-300 mb-3">Quiz Information</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>Course: <span className="text-gray-100 font-quantico-bold">Data Structures</span></p>
              <p>Duration: <span className="text-gray-100">15 minutes</span></p>
              <p>Questions: <span className="text-gray-100">10 (random)</span></p>
              <p>Total Marks: <span className="text-gray-100">100</span></p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={startSecureQuiz}
              className="w-full bg-gradient-to-r from-emerald-600/80 to-green-600/80 hover:from-emerald-500/90 hover:to-green-500/90 border border-emerald-500/50 hover:border-emerald-400/70 text-white font-quantico-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20"
            >
              Start Secure Quiz
            </button>
            
            <button
              onClick={() => onNavigate('course', { courseId })}
              className="w-full bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/60 hover:to-gray-700/60 border border-gray-600/40 hover:border-gray-500/60 text-gray-200 font-quantico-bold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Back to Course
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            By starting the quiz, you agree to the anti-cheat monitoring. All activities are logged for academic integrity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="h-screen bg-dark-bg flex flex-col overflow-hidden">
      {/* Quiz Blocked Overlay */}
      {quizBlocked && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <div className="bg-gradient-to-br from-red-900 to-red-700 border border-red-500 rounded-2xl p-8 max-w-md mx-4 text-center">
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
              onClick={() => onNavigate('dashboard')}
              className="bg-red-600 hover:bg-red-700 text-gray-100 px-6 py-3 rounded-xl font-quantico-bold transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Security Warning Overlay */}
      {showWarning && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-red-500 to-orange-500 text-gray-100 p-4 rounded-xl shadow-lg animate-pulse border-2 border-red-400">
          <div className="flex items-center">
            <span className="text-xl mr-2">⚠️</span>
            <span className="font-quantico-bold">{warningMessage}</span>
          </div>
        </div>
      )}

      {/* Quiz Header with Security Info - Fixed */}
      {!quizBlocked && (
        <>
          <div className="bg-black/80 border-b border-emerald-500/30 p-3 flex-shrink-0">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-emerald-300">
                  <span className="text-lg mr-2">🔒</span>
                  <span className="font-quantico-bold text-xs">
                    {testingMode ? 'TESTING MODE' : 'SECURE MODE'}
                  </span>
                </div>
                {testingMode && (
                  <div className="bg-green-500/20 border border-green-500/40 rounded px-2 py-1">
                    <span className="text-green-300 text-xs font-quantico-bold">
                      Anti-cheat disabled for testing
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
                {testingMode && (
                  <button
                    onClick={resetViolations}
                    className="bg-gradient-to-r from-emerald-600/50 to-green-600/50 hover:from-emerald-500/60 hover:to-green-500/60 border border-emerald-500/50 hover:border-emerald-400/70 text-emerald-200 font-quantico-bold py-1 px-2 rounded text-xs transition-all duration-300"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={endQuiz}
                  className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/60 hover:to-gray-700/60 border border-gray-600/40 hover:border-gray-500/60 text-gray-200 font-quantico-bold py-1 px-3 rounded-lg text-xs transition-all duration-300"
                >
                  End Quiz
                </button>
              </div>
            </div>
          </div>

          {/* Quiz Content - Flexible */}
          <div className="flex-1 overflow-hidden">
            <QuizContent 
              onNavigate={onNavigate}
              courseId={courseId}
              onQuizComplete={(score) => {
                console.log(`Quiz completed with score: ${score}%`);
                // Reset violations after successful quiz completion
                resetViolations();
              }}
            />
          </div>
        </>
      )}

      {/* Violations Log (Only visible if there are violations) */}
      {violations.length > 0 && (
        <div className="fixed bottom-4 left-4 bg-black/90 border border-emerald-500/30 rounded-xl p-3 max-w-sm z-40">
          <h4 className="text-emerald-300 font-quantico-bold text-xs mb-2">Security Log</h4>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {violations.slice(-3).map(violation => (
              <div key={violation.id} className="text-xs text-gray-300">
                <span className="text-emerald-400">{violation.timestamp}</span>: {violation.type}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizPage;