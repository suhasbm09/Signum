import React, { useState, useEffect, useRef } from 'react';
import { useProgress } from '../contexts/ProgressContext';
import { useToast } from '../components/Toast';
import CodeAnalysisReport from '../components/CodeAnalysisReport';
import CodingChallengeContent from '../courses/data-structures/components/CodingChallengeContent';
import { generateCodeReportPDF, downloadReportAsPDF } from '../utils/pdfGenerator';
import { API_BASE_URL } from '../config/api';

const CodingChallengePage = ({ courseId, user, onNavigate }) => {
  const { showToast, ToastContainer } = useToast();
  const { loadProgressFromFirebase, markModuleComplete } = useProgress();
  
  const [showFullscreenStartPage, setShowFullscreenStartPage] = useState(false); // NEW: Intermediate state
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [savedSubmission, setSavedSubmission] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [challengeResults, setChallengeResults] = useState(null);
  
  const [violations, setViolations] = useState([]);
  const [challengeBlocked, setChallengeBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [warnings, setWarnings] = useState([]);
  
  const MAX_VIOLATIONS = 3;
  const COOLDOWN_MINUTES = 15; // First block is 15 minutes per documentation
  
  // Get user ID from prop OR window.currentUser
  const getUserId = () => {
    if (user?.uid) return user.uid;
    if (user?.email) return user.email;
    if (typeof window !== 'undefined' && window.currentUser) {
      return window.currentUser.uid || window.currentUser.email;
    }
    return null;
  };
  const userId = getUserId();
  
  const [sessionId, setSessionId] = useState(null);
  
  const containerRef = useRef(null);

  // Load initial state - check if blocked, clear violations if not
  useEffect(() => {
    const loadInitialState = async () => {
      // Safety check: don't load if courseId is missing
      if (!courseId || !userId) {
        return;
      }

      try {
        
        const blockResponse = await fetch(
          `${API_BASE_URL}/assessment/${courseId}/anti-cheat/status?user_id=${userId}&assessment_type=coding`
        );
        if (blockResponse.ok) {
          const blockData = await blockResponse.json();
          if (blockData.data.is_blocked) {
            setChallengeBlocked(true);
            const endTime = new Date(blockData.data.block_end_time).getTime();
            setBlockEndTime(endTime);
            setTimeRemaining(blockData.data.time_remaining_ms / 1000);
          } else {
            // Not blocked - reset violations
            setChallengeBlocked(false);
            setViolations([]);
          }
        }
      } catch (error) {
        console.error('❌ Error loading initial state:', error);
      }
    };

    loadInitialState();
  }, [userId, courseId]);

  // Countdown timer for blocked state with auto-clear
  useEffect(() => {
    let interval;
    if (challengeBlocked && blockEndTime) {
      interval = setInterval(async () => {
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((blockEndTime - now) / 1000));
        
        if (remaining <= 0) {
          // Block expired - clear violations and unblock
          setChallengeBlocked(false);
          setBlockEndTime(null);
          setTimeRemaining(null);
          setViolations([]);
          
          // Clear from backend
          try {
            await fetch(`${API_BASE_URL}/assessment/${courseId}/anti-cheat/clear?user_id=${userId}&assessment_type=coding`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: userId,
                course_id: courseId
              })
            });
          } catch (error) {
            console.error('Error clearing violations:', error);
          }
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [challengeBlocked, blockEndTime, userId, courseId]);

  // Check for previous submission - only if not blocked
  useEffect(() => {
    const checkPreviousAttempt = async () => {
      // Don't check if blocked
      if (challengeBlocked) {
        return;
      }
      
      try {
        
        // FIRST: Check submissions directly (more reliable)
        const submissionsResponse = await fetch(
          `${API_BASE_URL}/assessment/${courseId}/coding/submissions?user_id=${userId}`
        );
        
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          
          // Backend returns: { success: true, data: [...] }
          if (submissionsData.success && submissionsData.data && submissionsData.data.length > 0) {
            const lastSubmission = submissionsData.data[0];
            
            setHasAttempted(true);
            
            setSavedSubmission({
              score: lastSubmission.score,
              code: lastSubmission.code,
              language: lastSubmission.language,
              problem_id: lastSubmission.problem_id
            });
            
            // Set results for review
            setChallengeResults({
              score: lastSubmission.score,
              tests_passed: lastSubmission.test_results?.filter(t => t.passed).length || 0,
              test_results: lastSubmission.test_results || [],
              feedback: lastSubmission.feedback || 'No feedback available',
              anti_cheat_penalty: lastSubmission.anti_cheat_penalty || 0
            });
            
          } else {
            setHasAttempted(false);
            setSavedSubmission(null);
            setChallengeResults(null);
          }
        } else {
        }
      } catch (error) {
        console.error('❌ Error checking previous attempt:', error);
      }
    };

    // Only check if user exists and not blocked
    if (user && !challengeBlocked) {
      checkPreviousAttempt();
    }
  }, [courseId, user, userId, challengeBlocked]);

  const blockChallengeAccess = async () => {
    try {
      // Set block locally first
      const blockEndTimeMs = new Date().getTime() + (COOLDOWN_MINUTES * 60 * 1000);
      setChallengeBlocked(true);
      setBlockEndTime(blockEndTimeMs);
      setTimeRemaining(COOLDOWN_MINUTES * 60);
      
      // Report the block to backend
      await fetch(`${API_BASE_URL}/assessment/${courseId}/anti-cheat/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
          assessment_type: 'coding',
          violation_type: 'max_violations_exceeded',
          timestamp: new Date().toISOString()
        })
      });
      
      showToast(`🚫 Challenge blocked for ${COOLDOWN_MINUTES} minutes due to violations`, 'error');
    } catch (error) {
      console.error('Error blocking challenge:', error);
    }
  };

  const formatTimeRemaining = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const addViolation = async (type) => {
    // CRITICAL: Only add violations when challenge is actually started
    if (!challengeStarted) {
      return;
    }
    
    // Check if already at max violations - don't add more
    if (violations.length >= MAX_VIOLATIONS) {
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

    try {
      await fetch(`${API_BASE_URL}/assessment/${courseId}/anti-cheat/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
          assessment_type: 'coding',
          violation_type: type,
          timestamp: new Date().toISOString()
        })
      });
      
    } catch (error) {
      console.error('Error saving violation:', error);
    }

    // Check if we hit the limit
    if (updatedViolations.length >= MAX_VIOLATIONS) {
      // Block immediately
      await blockChallengeAccess();
      
      // Show final warning
      addWarning(`🚫 BLOCKED: ${MAX_VIOLATIONS} violations exceeded. Cooldown: ${COOLDOWN_MINUTES} minutes`);
      
      // Exit fullscreen and end challenge
      await exitFullscreen();
      
      // Wait 2 seconds to show message, then end challenge
      setTimeout(() => {
        endChallenge();
      }, 2000);
    } else {
      addWarning(`⚠️ Violation detected: ${type} (${updatedViolations.length}/${MAX_VIOLATIONS})`);
    }
  };

  const addWarning = (message) => {
    setWarnings(prev => [...prev, { message, id: Date.now() }]);
    setTimeout(() => {
      setWarnings(prev => prev.slice(1));
    }, 3000);
  };

    // Anti-cheat event listeners
  useEffect(() => {
    if (!challengeStarted) return;


    // Visibility change (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addViolation('Tab/Window Switch Detected');
      }
    };

    // Copy via event
    const handleCopy = (e) => {
      e.preventDefault();
      addViolation('Copy Attempt Blocked');
      return false;
    };

    // Paste via event
    const handlePaste = (e) => {
      e.preventDefault();
      addViolation('Paste Attempt Blocked');
      return false;
    };

    // Cut via event
    const handleCut = (e) => {
      e.preventDefault();
      addViolation('Cut Attempt Blocked');
      return false;
    };

    // Right-click/context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      addViolation('Right-Click Blocked');
      return false;
    };

    // Fullscreen exit - immediately end challenge
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && challengeStarted) {
        addViolation('Exited Fullscreen Mode');
        addWarning('⚠️ You exited fullscreen! Challenge will end in 2 seconds.');
        setTimeout(() => {
          endChallenge();
        }, 2000);
      }
    };

    // Keyboard shortcuts and F-keys
    const handleKeyDown = (e) => {
      
      // Block F-keys
      if (e.key === 'F5') {
        e.preventDefault();
        addViolation('Attempted to refresh page (F5)');
        return false;
      }

      if (e.key === 'F11') {
        e.preventDefault();
        addViolation('Attempted to toggle fullscreen (F11)');
        return false;
      }

      if (e.key === 'F12') {
        e.preventDefault();
        addViolation('Attempted to open developer tools (F12)');
        return false;
      }

      // Block Ctrl combinations
      if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        const ctrlForbidden = ['s', 'p', 'u', 'h', 'j', 'k', 'l', 'n', 't', 'w', 'r'];
        if (ctrlForbidden.includes(e.key.toLowerCase())) {
          e.preventDefault();
          const actionNames = {
            's': 'Save', 'p': 'Print', 'u': 'View Source', 'h': 'History',
            'j': 'Downloads', 'k': 'Search', 'l': 'Address Bar',
            'n': 'New Window', 't': 'New Tab', 'w': 'Close Tab', 'r': 'Refresh'
          };
          addViolation(`Blocked ${actionNames[e.key.toLowerCase()]}: Ctrl+${e.key.toUpperCase()}`);
          return false;
        }
      }

      // Block Ctrl+Shift combinations (Developer tools)
      if (e.ctrlKey && e.shiftKey && !e.altKey) {
        const devToolsKeys = ['i', 'j', 'c', 'k'];
        if (devToolsKeys.includes(e.key.toLowerCase())) {
          e.preventDefault();
          addViolation(`Developer Tools Blocked: Ctrl+Shift+${e.key.toUpperCase()}`);
          return false;
        }
      }
    };

    // Window blur (catches Alt+Tab and window switching)
    const handleBlur = () => {
      addViolation('Window Lost Focus (possible Alt+Tab)');
    };

    // Window focus (for tracking)
    const handleFocus = () => {
    };

    // Attach all listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [challengeStarted, userId, courseId, violations.length]);

  const enterFullscreen = async () => {
    try {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      } else {
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
    } catch (error) {
      console.error('❌ Failed to exit fullscreen:', error);
    }
  };

  // Called from MODULE PAGE - enters fullscreen and shows fullscreen start page
  const startChallenge = async () => {
    // Safety check: don't start if courseId is missing
    if (!courseId || !userId) {
      console.error('❌ Cannot start coding challenge: missing courseId or userId', { courseId, userId });
      showToast('❌ Error: Course information missing', 'error');
      return;
    }

    // IMPORTANT: Enter fullscreen FIRST (while we still have user gesture)
    // This must happen before any async operations
    try {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      } else {
      }
    } catch (error) {
      console.error('❌ Failed to enter fullscreen:', error);
      showToast('Unable to enter fullscreen mode. Please try again.', 'error');
      return; // Don't proceed if fullscreen fails
    }

    // Show loading toast
    showToast('🔒 Preparing coding challenge... Please wait', 'info');
    
    // CRITICAL: Re-check block status from backend before allowing start
    try {
      const blockResponse = await fetch(
        `${API_BASE_URL}/assessment/${courseId}/anti-cheat/status?user_id=${userId}&assessment_type=coding`
      );
      if (blockResponse.ok) {
        const blockData = await blockResponse.json();
        if (blockData.data.is_blocked) {
          setChallengeBlocked(true);
          const endTime = new Date(blockData.data.block_end_time).getTime();
          setBlockEndTime(endTime);
          setTimeRemaining(blockData.data.time_remaining_ms / 1000);
          showToast('❌ You are blocked from taking challenges', 'error');
          // Exit fullscreen since we're blocking
          await exitFullscreen();
          return;
        }
      }
    } catch (error) {
      console.error('❌ Error checking block status:', error);
      showToast('⚠️ Warning: Could not verify block status', 'warning');
    }
    
    // Clear any old violations from previous session
    setViolations([]);
    
    
    // Show the fullscreen start page (NOT the editor yet)
    setShowFullscreenStartPage(true);
    setShowResults(false);
    
    // Show success toast
    showToast('✅ Fullscreen mode activated', 'success');
  };

  // Called from FULLSCREEN START PAGE - actually starts the challenge
  const startSecureChallenge = async () => {
    // Generate new session ID
    const newSessionId = `challenge_${userId}_${courseId}_${Date.now()}`;
    setSessionId(newSessionId);
    
    
    // Now actually start the challenge
    setChallengeStarted(true);
    setShowFullscreenStartPage(false);
  };

  // Called when user clicks "Try Again" - same flow as startChallenge
  const startTryAgain = async () => {
    // CRITICAL: Re-check block status from backend before allowing retry
    try {
      const blockResponse = await fetch(
        `${API_BASE_URL}/assessment/${courseId}/anti-cheat/status?user_id=${userId}&assessment_type=coding`
      );
      if (blockResponse.ok) {
        const blockData = await blockResponse.json();
        if (blockData.data.is_blocked) {
          setChallengeBlocked(true);
          const endTime = new Date(blockData.data.block_end_time).getTime();
          setBlockEndTime(endTime);
          setTimeRemaining(blockData.data.time_remaining_ms / 1000);
          showToast('You are blocked from taking challenges', 'error');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking block status:', error);
    }
    
    // Clear violations for new attempt
    setViolations([]);
    
    
    // Enter fullscreen FIRST
    await enterFullscreen();
    
    // Then show the fullscreen start page
    setShowFullscreenStartPage(true);
    setShowResults(false);
  };

  // Download report as PDF
  const downloadPDFReport = () => {
    if (!challengeResults) {
      showToast('No results to download', 'warning');
      return;
    }

    try {
      const reportData = generateCodeReportPDF(
        challengeResults.ai_report,
        challengeResults.code,
        challengeResults.language,
        challengeResults.score,
        challengeResults.test_results,
        challengeResults.time_taken,
        new Date().toLocaleString()
      );

      downloadReportAsPDF(reportData, `code-analysis-${Date.now()}.pdf`);
      showToast('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading report:', error);
      showToast('Failed to download report', 'error');
    }
  };

  const viewReview = async () => {
    
    // Exit fullscreen first
    await exitFullscreen();
    
    // If challengeResults not already loaded, load them from savedSubmission
    if (!challengeResults && savedSubmission) {
      try {
        const submissionsResponse = await fetch(
          `${API_BASE_URL}/assessment/${courseId}/coding/submissions?user_id=${userId}`
        );
        
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          // Backend returns: { success: true, data: [...] }
          if (submissionsData.success && submissionsData.data && submissionsData.data.length > 0) {
            const lastSubmission = submissionsData.data[0];
            
            setChallengeResults({
              score: lastSubmission.score,
              tests_passed: lastSubmission.test_results?.filter(t => t.passed).length || 0,
              test_results: lastSubmission.test_results,
              feedback: lastSubmission.feedback || 'No feedback available',
              anti_cheat_penalty: lastSubmission.anti_cheat_penalty || 0,
              code: lastSubmission.code,
              language: lastSubmission.language,
              time_taken: lastSubmission.time_taken,
              time_complexity: lastSubmission.time_complexity,
              ai_report: lastSubmission.ai_report,
              submission_id: lastSubmission.id
            });
          }
        }
      } catch (error) {
        console.error('Error loading results for review:', error);
      }
    }
    
    setShowResults(true);
    setChallengeStarted(false);
    setShowFullscreenStartPage(false);
  };

  const endChallenge = async () => {
    
    exitFullscreen();
    setChallengeStarted(false);
    setShowFullscreenStartPage(false);
    setSessionId(null);
    
    // Don't clear violations - they persist for blocking logic
    // Violations will auto-clear when cooldown expires
  };

  const handleChallengeComplete = async (results) => {
    setChallengeResults(results);
    setShowResults(true);
    setChallengeStarted(false);
    setHasAttempted(true);
    exitFullscreen();
    
    // Mark module complete if passed (score >= 50)
    if (results.score >= 50) {
      await markModuleComplete(courseId, 'coding-challenge');
      showToast('✅ Coding Challenge Completed!', 'success');
    }
    
    await loadProgressFromFirebase();
  };

  // FULLSCREEN START PAGE (shown AFTER entering fullscreen from module page)
  if (showFullscreenStartPage && !challengeStarted) {
    return (
      <div ref={containerRef} className="h-screen bg-dark-bg flex flex-col overflow-hidden">
        {/* Blocked Overlay */}
        {challengeBlocked && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-red-900 to-red-700 border border-red-500 rounded-2xl p-8 max-w-md w-full text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-quantico-bold text-gray-100 mb-4">Challenge Access Blocked</h2>
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
        )}

        {/* Warning Toasts */}
        {warnings.map(warning => (
          <div 
            key={warning.id}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-red-500 to-orange-500 text-gray-100 p-4 rounded-xl shadow-lg animate-pulse border-2 border-red-400"
          >
            {warning.message}
          </div>
        ))}
        
        {/* Header with Exit */}
        <div className="bg-black/80 border-b border-emerald-500/30 p-3 flex-shrink-0">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center text-emerald-400">
              <span className="text-lg mr-2">🔒</span>
              <span className="font-quantico-bold text-sm">SECURE CODING ENVIRONMENT</span>
            </div>
            <button
              onClick={endChallenge}
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
                  Secure Coding Challenge
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">
                  You are now in fullscreen mode
                </p>
              </div>

              {hasAttempted && savedSubmission && (
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 mb-4">
                  <h3 className="text-base font-quantico-bold text-emerald-300 mb-2">
                    Previous Attempt
                  </h3>
                  <div className="text-gray-300">
                    <div className="mb-1">
                      Score: <span className="text-emerald-400 font-quantico-bold text-xl">{savedSubmission.score}%</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Language: {savedSubmission.language}
                    </div>
                  </div>
                </div>
              )}

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
                    Challenge Details
                  </h3>
                  <div className="space-y-2 text-gray-300 text-sm">
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2">•</span>
                      <span>Solve factorial problem</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2">•</span>
                      <span>10 test cases to pass</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2">•</span>
                      <span>50%+ to complete</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Different button layout based on whether user has attempted */}
              {hasAttempted && savedSubmission ? (
                <div className="space-y-3">
                  <button
                    onClick={viewReview}
                    className="w-full bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-500/90 hover:to-blue-600/90 text-white font-quantico-bold py-3 px-6 rounded-xl transition-all border border-blue-500/50"
                  >
                    📊 Review Previous Results
                  </button>
                  <button
                    onClick={startSecureChallenge}
                    className="w-full bg-gradient-to-r from-emerald-600/80 to-green-600/80 hover:from-emerald-500/90 hover:to-green-500/90 text-white font-quantico-bold py-3 px-6 rounded-xl transition-all border border-emerald-500/50"
                  >
                    🔄 Try Again
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={endChallenge}
                    className="flex-1 bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/60 hover:to-gray-700/60 border border-gray-600/40 text-gray-200 font-quantico-bold py-3 px-6 rounded-xl transition-all"
                  >
                    ← Cancel
                  </button>
                  <button
                    onClick={startSecureChallenge}
                    className="flex-1 bg-gradient-to-r from-emerald-600/80 to-green-600/80 hover:from-emerald-500/90 hover:to-green-500/90 text-white font-quantico-bold py-3 px-6 rounded-xl transition-all text-lg border border-emerald-500/50 shadow-lg shadow-emerald-500/20"
                  >
                    🚀 Start Challenge
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  // MODULE START PAGE (shown BEFORE entering fullscreen)
  if (!challengeStarted && !showResults && !showFullscreenStartPage) {
    return (
      <div ref={containerRef} className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        {/* Show block overlay if blocked */}
        {challengeBlocked && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-red-900 to-red-700 border border-red-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
              <div className="text-5xl sm:text-6xl mb-4">🚫</div>
              <h2 className="text-xl sm:text-2xl font-quantico-bold text-gray-100 mb-4">
                Challenge Access Blocked
              </h2>
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
              <div className="space-y-2 mb-6">
                <p className="text-red-200 text-sm">
                  You will be able to retry the challenge after the cooldown period.
                </p>
              </div>
              <button
                onClick={() => onNavigate('course', { courseId })}
                className="w-full bg-red-600 hover:bg-red-700 text-gray-100 px-6 py-3 rounded-xl font-quantico-bold transition-colors"
              >
                Return to Course
              </button>
            </div>
          </div>
        )}

        <div className="max-w-2xl w-full">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-emerald-500/30 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8 space-y-3">
              <div className="text-6xl mb-4">💻</div>
              <h1 className="text-4xl font-quantico-bold text-gray-100 mb-3">
                Coding Challenge
              </h1>
              <p className="text-gray-400 text-lg">
                Test your programming skills
              </p>
            </div>

            <div className="bg-black/50 border border-emerald-500/20 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-quantico-bold text-emerald-400 mb-4">
                Challenge Details
              </h2>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span>Solve coding problems in your preferred language</span>
                </div>
                <div className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span>Your code will be evaluated against 10 test cases</span>
                </div>
                <div className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span>Each test case is worth 5 points (50 points total, scaled to 100)</span>
                </div>
                <div className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span>Anti-cheat system is active - avoid violations</span>
                </div>
              </div>
            </div>

            {hasAttempted && savedSubmission && (
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-quantico-bold text-emerald-300 mb-3">
                  Previous Attempt
                </h3>
                <div className="text-gray-300">
                  <div className="mb-2">
                    Score: <span className="text-emerald-400 font-quantico-bold">{savedSubmission.score}%</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Language: {savedSubmission.language}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {hasAttempted ? (
                <>
                  <button
                    onClick={viewReview}
                    className="flex-1 bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/60 hover:to-gray-700/60 border border-gray-600/40 hover:border-gray-500/60 text-gray-200 font-quantico-bold py-4 px-6 rounded-xl transition-all"
                  >
                    📊 Review Results
                  </button>
                  <button
                    onClick={startTryAgain}
                    disabled={challengeBlocked}
                    className={`flex-1 ${
                      challengeBlocked
                        ? 'bg-gray-700/50 border-gray-600/30 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600/80 to-green-600/80 hover:from-emerald-500/90 hover:to-green-500/90 border-emerald-500/50 hover:border-emerald-400/70'
                    } border text-white font-quantico-bold py-4 px-6 rounded-xl transition-all`}
                  >
                    {challengeBlocked ? '🚫 Blocked' : '🔄 Try Again'}
                  </button>
                </>
              ) : (
                <button
                  onClick={startChallenge}
                  disabled={challengeBlocked}
                  className={`w-full ${
                    challengeBlocked
                      ? 'bg-gray-700/50 border-gray-600/30 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600/80 to-green-600/80 hover:from-emerald-500/90 hover:to-green-500/90 border-emerald-500/50 hover:border-emerald-400/70 shadow-lg shadow-emerald-500/20'
                  } border text-white font-quantico-bold py-4 px-6 rounded-xl transition-all text-lg`}
                >
                  {challengeBlocked ? '🚫 Challenge Blocked - Wait for Cooldown' : '🚀 Start Challenge'}
                </button>
              )}
            </div>

            <button
              onClick={() => onNavigate('course', { courseId })}
              className="w-full mt-4 bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/60 hover:to-gray-700/60 border border-gray-600/40 hover:border-gray-500/60 text-gray-200 font-quantico-bold py-3 px-6 rounded-xl transition-all"
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
    // If no results yet but we have savedSubmission, show loading state briefly
    if (!challengeResults && savedSubmission) {
      return (
        <div ref={containerRef} className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-400">Loading results...</p>
          </div>
        </div>
      );
    }
    
    // If no results at all, go back to start page
    if (!challengeResults) {
      setShowResults(false);
      return null;
    }
    
    const passed = challengeResults.score >= 50;

    return (
      <div ref={containerRef} className="min-h-screen bg-dark-bg p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{passed ? '🎉' : '📚'}</div>
            <h1 className="text-4xl font-quantico-bold text-gray-100 mb-3">
              {passed ? 'Challenge Completed!' : 'Keep Practicing!'}
            </h1>
            <p className="text-gray-400 text-lg">
              {passed 
                ? 'Excellent work on completing the challenge' 
                : 'Review your code and try again'}
            </p>
          </div>

          {/* Score Card */}
          <div className={`bg-gradient-to-br ${
            passed 
              ? 'from-emerald-900/30 to-emerald-900/10 border-emerald-500/30' 
              : 'from-red-900/30 to-red-900/10 border-red-500/30'
          } border rounded-xl p-8 mb-8 text-center`}>
            <div className={`text-6xl font-quantico-bold mb-2 ${
              passed ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {Math.round(challengeResults.score)}%
            </div>
            <div className="text-gray-400 text-lg mb-4">Final Score</div>
            <div className="text-cyan-300 text-xl font-quantico-bold">
              {challengeResults.tests_passed}/{challengeResults.test_results?.length || 0} Test Cases Passed
            </div>
            {challengeResults.time_taken && (
              <div className="text-gray-400 text-sm mt-2">
                Time Taken: {Math.floor(challengeResults.time_taken / 60)}m {challengeResults.time_taken % 60}s
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Test Results */}
            <div className="lg:col-span-1">
              <div className="bg-black/50 border border-emerald-500/20 rounded-xl p-6">
                <h3 className="text-lg font-quantico-bold text-emerald-400 mb-4">
                  📝 Test Results
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {challengeResults.test_results && challengeResults.test_results.map((test, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                        test.passed 
                          ? 'bg-green-900/20 border border-green-500/30' 
                          : 'bg-red-900/20 border border-red-500/30'
                      }`}
                    >
                      <span className="text-gray-300">Test {idx + 1}</span>
                      <span className={test.passed ? 'text-green-400' : 'text-red-400'}>
                        {test.passed ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submitted Code */}
            <div className="lg:col-span-2">
              <div className="bg-black/50 border border-blue-500/20 rounded-xl p-6">
                <h3 className="text-lg font-quantico-bold text-blue-400 mb-4">
                  💻 Your Submitted Code
                </h3>
                <pre className="bg-black/80 border border-gray-700 rounded p-4 text-xs text-gray-300 overflow-x-auto max-h-64 font-mono">
                  {challengeResults.code || 'Code not available'}
                </pre>
              </div>
            </div>
          </div>

          {/* AI Code Analysis Report */}
          {challengeResults.ai_report && (
            <div className="mb-8">
              <h2 className="text-2xl font-quantico-bold text-cyan-400 mb-4">🤖 AI Code Analysis Report</h2>
              <CodeAnalysisReport 
                report={challengeResults.ai_report}
                code={challengeResults.code}
                language={challengeResults.language}
                score={challengeResults.score}
                testResults={challengeResults.test_results}
                timeTaken={challengeResults.time_taken}
              />
            </div>
          )}

          {/* Anti-cheat Penalty */}
          {challengeResults.anti_cheat_penalty > 0 && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-8">
              <div className="text-red-400 font-quantico-bold">
                ⚠️ Anti-cheat Penalty: -{challengeResults.anti_cheat_penalty}%
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={startTryAgain}
              className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/60 hover:to-gray-700/60 border border-gray-600/40 hover:border-gray-500/60 text-gray-200 font-quantico-bold py-3 px-8 rounded-xl transition-all"
            >
              🔄 Try Again
            </button>
            <button
              onClick={() => downloadPDFReport()}
              className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500/90 hover:to-blue-500/90 text-white font-quantico-bold py-3 px-8 rounded-xl transition-all border border-purple-500/50 hover:border-purple-400/70"
            >
              📥 Download Report
            </button>
            <button
              onClick={() => onNavigate('course', { courseId })}
              className="bg-gradient-to-r from-emerald-600/80 to-green-600/80 hover:from-emerald-500/90 hover:to-green-500/90 text-white font-quantico-bold py-3 px-8 rounded-xl transition-all border border-emerald-500/50 hover:border-emerald-400/70"
            >
              ✓ Return to Course
            </button>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  // MAIN CHALLENGE PAGE
  return (
    <div ref={containerRef} className="h-screen bg-dark-bg flex flex-col overflow-hidden">
      {challengeBlocked && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <div className="bg-gradient-to-br from-red-900 to-red-700 border border-red-500 rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-quantico-bold text-gray-100 mb-4">
              Challenge Access Blocked
            </h2>
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
              className="bg-red-600 hover:bg-red-700 text-gray-100 px-6 py-3 rounded-xl font-quantico-bold transition-colors"
            >
              Return to Course
            </button>
          </div>
        </div>
      )}

      {warnings.map(warning => (
        <div 
          key={warning.id}
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-red-500 to-orange-500 text-gray-100 p-4 rounded-xl shadow-lg animate-pulse border-2 border-red-400"
        >
          {warning.message}
        </div>
      ))}

      {!challengeBlocked && (
        <>
          <div className="bg-black/80 border-b border-emerald-500/30 p-3 flex-shrink-0">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-emerald-400">
                  <span className="text-lg mr-2">🔒</span>
                  <span className="font-quantico-bold text-xs">SECURE MODE - FULLSCREEN</span>
                </div>
                <div className="text-gray-400 text-xs">
                  Violations: <span className="text-emerald-300 font-quantico-bold">{violations.length}/{MAX_VIOLATIONS}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-emerald-300 text-xs">
                  Student: <span className="text-gray-100 font-quantico-bold">{user?.displayName || 'Anonymous'}</span>
                </div>
                <button
                  onClick={endChallenge}
                  className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/60 hover:to-gray-700/60 border border-gray-600/40 hover:border-gray-500/60 text-gray-200 font-quantico-bold py-1 px-3 rounded-lg text-xs transition-all duration-300"
                >
                  End Challenge
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <CodingChallengeContent 
              courseId={courseId}
              user={user}
              onChallengeComplete={handleChallengeComplete}
              violations={violations}
            />
          </div>
        </>
      )}

      {violations.length > 0 && (
        <div className="fixed bottom-4 left-4 bg-black/90 border border-emerald-500/30 rounded-xl p-3 max-w-sm z-40">
          <h4 className="text-emerald-400 font-quantico-bold text-xs mb-2">Security Log</h4>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {violations.slice(-3).map(violation => (
              <div key={violation.id || violation.timestamp} className="text-xs text-gray-300">
                <span className="text-emerald-400">{new Date(violation.timestamp).toLocaleTimeString()}</span>: {violation.violation_type || violation.type}
              </div>
            ))}
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default CodingChallengePage;
