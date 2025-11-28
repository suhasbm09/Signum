/**
 * AI Assistant Component
 * Floating button to access AI chat functionality
 */

import { useState } from 'react';
import AIChat from './AIChat';
import { useAI } from '../../contexts/AIContext';

function AIAssistant({ context = null }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { aiEnabled, testingMode } = useAI();

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Don't render if AI is disabled
  if (!aiEnabled) {
    return null;
  }

  return (
    <>
      {/* Floating AI Button - Responsive */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={toggleChat}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative group"
          aria-label="Open AI Assistant"
        >
          {/* Bright green glow for visibility */}
          <div className="absolute inset-0 rounded-xl bg-emerald-500/50 blur-2xl animate-pulse"></div>
          <div className="absolute inset-0 rounded-xl bg-emerald-400/30 blur-xl"></div>
          
          {/* Main Button - Responsive size */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-800/90 to-green-800/90 backdrop-blur-xl rounded-xl flex items-center justify-center shadow-2xl shadow-emerald-500/50 transform transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border-2 border-emerald-400/60 hover:border-emerald-300">
            {testingMode && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse border border-yellow-300"></div>
            )}
            <svg 
              className="w-6 h-6 sm:w-7 sm:h-7 text-gray-100 transition-all duration-300 group-hover:scale-110" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isChatOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              )}
            </svg>
          </div>
          
          {/* Tooltip */}
          {isHovered && !isChatOpen && (
            <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-black/90 backdrop-blur-xl text-gray-100 text-xs font-quantico rounded-lg shadow-2xl whitespace-nowrap border border-emerald-500/40">
              <span className="text-emerald-400">AI Tutor</span>
              {testingMode && <span className="text-yellow-400 ml-2">(Testing Mode)</span>}
            </div>
          )}
        </button>
      </div>

      {/* AI Chat Modal */}
      <AIChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        context={context}
      />
    </>
  );
}

export default AIAssistant;
