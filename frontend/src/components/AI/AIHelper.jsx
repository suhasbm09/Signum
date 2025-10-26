/**
 * AI Helper Component
 * Example component showing how to use AI features in course content
 */

import { useState } from 'react';
import { useAI } from '../../contexts/AIContext';

function AIHelper({ topic, courseId }) {
  const { explain, createQuiz, helpWithCode, isLoading } = useAI();
  const [result, setResult] = useState(null);
  const [showHelper, setShowHelper] = useState(false);
  const [activeTab, setActiveTab] = useState('explain');

  const handleExplain = async () => {
    const response = await explain(topic, 'intermediate');
    setResult(response);
  };

  const handleQuiz = async () => {
    const response = await createQuiz(topic, 5);
    setResult(response);
  };

  const handleCodeHelp = async (code, issue) => {
    const response = await helpWithCode(code, issue);
    setResult(response);
  };

  if (!showHelper) {
    return (
      <button
        onClick={() => setShowHelper(true)}
        className="fixed bottom-24 right-6 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-gray-100 font-quantico-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        🎓 Quick AI Help
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 w-96 bg-glossy-black rounded-xl border border-purple-500/30 shadow-2xl shadow-purple-500/10 overflow-hidden z-30">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-3 border-b border-purple-500/30 flex items-center justify-between">
        <h3 className="text-gray-100 font-quantico-bold text-sm">AI Quick Help</h3>
        <button
          onClick={() => setShowHelper(false)}
          className="text-gray-400 hover:text-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('explain')}
          className={`flex-1 py-2 px-3 text-xs font-quantico transition-colors ${
            activeTab === 'explain'
              ? 'bg-purple-600/30 text-purple-300 border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50'
          }`}
        >
          📖 Explain
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-2 px-3 text-xs font-quantico transition-colors ${
            activeTab === 'quiz'
              ? 'bg-purple-600/30 text-purple-300 border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50'
          }`}
        >
          🧪 Quiz
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex-1 py-2 px-3 text-xs font-quantico transition-colors ${
            activeTab === 'code'
              ? 'bg-purple-600/30 text-purple-300 border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50'
          }`}
        >
          💻 Code
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'explain' && (
          <div className="space-y-3">
            <p className="text-gray-300 text-sm font-quantico">
              Get a detailed explanation of: <strong className="text-purple-400">{topic}</strong>
            </p>
            <button
              onClick={handleExplain}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-gray-100 font-quantico-bold rounded-lg transition-all duration-300 disabled:opacity-50 text-sm"
            >
              {isLoading ? 'Explaining...' : 'Explain Topic'}
            </button>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="space-y-3">
            <p className="text-gray-300 text-sm font-quantico">
              Generate quiz questions about: <strong className="text-purple-400">{topic}</strong>
            </p>
            <button
              onClick={handleQuiz}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-gray-100 font-quantico-bold rounded-lg transition-all duration-300 disabled:opacity-50 text-sm"
            >
              {isLoading ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-3">
            <p className="text-gray-300 text-sm font-quantico">
              Paste your code below for AI analysis and help
            </p>
            <textarea
              placeholder="Paste your code here..."
              className="w-full h-24 px-3 py-2 bg-gray-900/80 border border-gray-700 rounded-lg text-gray-100 text-xs font-mono focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 resize-none"
            />
            <button
              onClick={() => handleCodeHelp('// Your code', 'General help')}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-gray-100 font-quantico-bold rounded-lg transition-all duration-300 disabled:opacity-50 text-sm"
            >
              {isLoading ? 'Analyzing...' : 'Get Help'}
            </button>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-4 p-3 bg-gray-900/50 border border-purple-500/30 rounded-lg">
            <h4 className="text-purple-300 font-quantico-bold text-xs mb-2">AI Response:</h4>
            <p className="text-gray-300 text-xs font-quantico leading-relaxed whitespace-pre-wrap">
              {result.response}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIHelper;
