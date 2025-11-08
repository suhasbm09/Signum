/**
 * AI Chat Component
 * Interactive chat interface for AI-powered tutoring
 */

import { useState, useRef, useEffect } from 'react';
import { useAI } from '../../contexts/AIContext';
import { isVoiceInputEnabled } from '../../config/features';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function AIChat({ isOpen, onClose, context = null }) {
  const { chat, conversationHistory, isLoading, clearHistory, setContext, aiEnabled, testingMode } = useAI();
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceEnabled = isVoiceInputEnabled();

  // Initialize Speech Recognition
  useEffect(() => {
    if (voiceEnabled && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Set context when component mounts or context changes
  useEffect(() => {
    if (context) {
      setContext(context);
    }
  }, [context, setContext]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');

    console.log('Sending message:', message); // Debug
    const result = await chat(message, context);
    console.log('Chat result:', result); // Debug
    
    // Check if daily limit was reached
    if (result && result.error === 'daily_limit_reached') {
      setDailyLimitReached(true);
    }
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearHistory = () => {
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    clearHistory();
    setShowClearConfirm(false);
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      // Silently do nothing if not supported
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Check if we're inside a course (not dashboard)
  const isInsideCourse = context && context !== "General Learning" && !context.includes("Dashboard");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-5xl h-[85vh] bg-gradient-to-br from-black/25 via-black/40 to-black/60 backdrop-blur-xl rounded-3xl border border-emerald-400/12 shadow-[0_0_75px_-35px_rgba(16,185,129,0.85)] flex flex-col overflow-hidden">

        {/* Testing Mode Banner */}
        {testingMode && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-500/40 px-4 py-2 flex items-center justify-center gap-2">
            <span className="text-yellow-300 text-xs font-quantico-bold">⚠️ AI TESTING MODE</span>
            <span className="text-yellow-400/80 text-xs">Limited features for testing</span>
          </div>
        )}
        
        {/* AI Disabled Banner */}
        {!aiEnabled && (
          <div className="bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-b border-gray-500/40 px-4 py-3 flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <span className="text-gray-300 text-sm font-quantico-bold">AI Features Disabled</span>
            <span className="text-gray-400/80 text-xs">Contact administrator for access</span>
          </div>
        )}
        
        {/* Daily Limit Reached Banner */}
        {aiEnabled && dailyLimitReached && (
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-red-500/40 px-4 py-3 flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-red-300 text-sm font-quantico-bold">AI Daily Limit Reached</span>
            <span className="text-red-400/80 text-xs">• Continue with visualizations & coding • Resets tomorrow</span>
          </div>
        )}

        {/* Sleek Header */}
  <div className="relative p-5 border-b border-emerald-400/10 bg-black/12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-400/25 blur-lg animate-pulse-slow"></div>
                <div className="relative w-10 h-10 rounded-full border border-emerald-400/35 bg-black/70 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-quantico-bold text-emerald-300 tracking-wide">
                  AI Tutor
                </h2>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/70 font-quantico">Powered by Gemini</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {conversationHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="group relative flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/70 border border-emerald-400/20 text-emerald-200 text-xs font-quantico transition-all duration-300"
                  title="Clear History"
                >
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Clear</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600/80 to-red-500/80 hover:from-rose-500/90 hover:to-red-400/90 text-gray-100 text-sm font-quantico-bold transition-all duration-300 shadow-[0_8px_20px_-12px_rgba(248,113,113,0.7)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
  <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-emerald-400/25 scrollbar-track-transparent bg-black/6">
          {conversationHistory.length === 0 ? (
            <div className="h-full flex items-center justify-center animate-fade-in-slow">
              <div className="text-center space-y-10 max-w-md">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-emerald-400/12 blur-3xl animate-pulse-slow"></div>
                  <div className="relative w-full h-full rounded-[32px] border border-emerald-400/18 bg-black/35 backdrop-blur-2xl flex items-center justify-center shadow-[0_25px_60px_-50px_rgba(16,185,129,0.65)]">
                    <svg className="w-14 h-14 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-3xl font-quantico-bold text-emerald-300 tracking-wide">
                    Ready When You Are
                  </h3>
                  <p className="text-slate-300/80 text-sm font-quantico leading-relaxed">
                    Ask about course concepts, debug code, or explore new topics. Your AI tutor adapts to your context instantly.
                  </p>
                </div>

                {/* Only show suggestions when inside a course */}
                {isInsideCourse && (
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={() => setInputMessage("Explain data structures")}
                      className="px-5 py-2.5 rounded-full bg-black/35 hover:bg-black/45 text-emerald-200 text-sm font-quantico border border-emerald-400/28 backdrop-blur-2xl transition-all duration-300 hover:border-emerald-400/55 hover:scale-105"
                    >
                      📚 Explain data structures
                    </button>
                    <button
                      onClick={() => setInputMessage("What are arrays?")}
                      className="px-5 py-2.5 rounded-full bg-black/35 hover:bg-black/45 text-emerald-200 text-sm font-quantico border border-emerald-400/28 backdrop-blur-2xl transition-all duration-300 hover:border-emerald-400/55 hover:scale-105"
                    >
                    🔢 What are arrays?
                    </button>
                    <button
                      onClick={() => setInputMessage("Help me understand recursion")}
                      className="px-5 py-2.5 rounded-full bg-black/35 hover:bg-black/45 text-emerald-200 text-sm font-quantico border border-emerald-400/28 backdrop-blur-2xl transition-all duration-300 hover:border-emerald-400/55 hover:scale-105"
                    >
                      🔄 Help with recursion
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {conversationHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-in`}
                >
                  {msg.role === 'assistant' && (
                    <div className="relative flex-shrink-0 mt-2 w-9 h-9 flex items-center justify-center bg-slate-900/70 rounded-full border border-emerald-400/30 shadow-[0_0_20px_-10px_rgba(16,185,129,0.8)]">
                      <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-4 rounded-xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-emerald-400/22 to-emerald-600/35 text-gray-100 rounded-br-none shadow-[0_18px_40px_-28px_rgba(16,185,129,0.85)]'
                        : 'bg-black/28 text-slate-100/85 border border-emerald-400/12 rounded-bl-none backdrop-blur-3xl shadow-[0_18px_40px_-36px_rgba(16,185,129,0.75)]'
                    }`}
                  >
                    <div className="text-sm font-quantico leading-relaxed break-words prose prose-invert prose-sm max-w-none
                      prose-headings:text-emerald-300 prose-headings:font-quantico-bold prose-headings:mt-3 prose-headings:mb-2
                      prose-p:my-2 prose-p:text-slate-200/80
                      prose-strong:text-emerald-200 prose-strong:font-quantico-bold
                      prose-code:text-emerald-200 prose-code:bg-black/45 prose-code:px-1.5 prose-code:py-1 prose-code:rounded-md prose-code:font-mono prose-code:text-xs
                      prose-pre:bg-black/38 prose-pre:border prose-pre:border-emerald-400/18 prose-pre:rounded-xl prose-pre:p-4
                      prose-ul:my-2 prose-ul:list-disc prose-ul:list-inside
                      prose-ol:my-2 prose-ol:list-decimal prose-ol:list-inside
                      prose-li:my-1
                      prose-a:text-emerald-300 prose-a:underline hover:prose-a:text-emerald-200
                      prose-blockquote:border-l-4 prose-blockquote:border-emerald-400/40 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-200/80">
                      {msg.role === 'user' ? (
                        <p className="text-gray-100">{msg.content}</p>
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="relative flex-shrink-0 mt-2 w-9 h-9 flex items-center justify-center bg-black/28 rounded-full border border-emerald-400/18 backdrop-blur-2xl">
                      <svg className="w-5 h-5 text-emerald-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 animate-message-in">
                  <div className="relative flex-shrink-0 mt-2 w-9 h-9 flex items-center justify-center bg-black/28 rounded-full border border-emerald-400/18 backdrop-blur-2xl">
                    <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="max-w-[80%] p-4 rounded-xl rounded-bl-none bg-black/26 border border-emerald-400/16 backdrop-blur-3xl">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-emerald-400/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-emerald-400/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-emerald-400/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
  <div className="relative p-6 border-t border-emerald-400/10 bg-black/10">
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 rounded-2xl border border-emerald-400/18 backdrop-blur-2xl px-4 py-2  bg-transparent">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask anything about your learning path..."
                disabled={isLoading}
                className="w-full bg-transparent text-slate-100 placeholder-slate-400 font-quantico focus:outline-none"
              />
              
              {/* Microphone Button - Only show if voice input is enabled */}
              {voiceEnabled && (
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={isLoading}
                  className={`p-2 rounded-lg transition-all ${
                    isListening 
                      ? 'bg-red-500/20 text-red-400 animate-pulse' 
                      : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isListening ? 'Stop recording' : 'Voice input'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              )}
              
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim() || dailyLimitReached || !aiEnabled}
                className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/80 to-emerald-600/80 hover:from-emerald-400/85 hover:to-emerald-500/85 text-gray-100 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_15px_35px_-24px_rgba(16,185,129,0.85)]"
                title={!aiEnabled ? "AI is disabled" : dailyLimitReached ? "Daily AI limit reached" : "Send message"}
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                  </svg>
                )}
              </button>
            </div>
            {conversationHistory.length === 0 && (
              <button
                type="button"
                onClick={() => setInputMessage(context ? `Help me with ${context.topic ?? 'this topic'}` : 'How should I study today?')}
                className="px-4 py-2 rounded-2xl bg-black/12 border border-emerald-400/15 text-emerald-200 text-xs font-quantico transition-all duration-300 hover:bg-black/20 backdrop-blur-2xl"
              >
                Inspire me
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Clear Confirmation Modal - No more alert()! */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-black/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-quantico-bold text-gray-100 mb-2">Clear Chat History?</h3>
                <p className="text-sm text-slate-300 font-quantico mb-4">This will remove all conversation messages. This action cannot be undone.</p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-gray-100 text-sm font-quantico transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmClear}
                    className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-gray-100 text-sm font-quantico-bold transition-all"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIChat;
