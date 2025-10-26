import React from 'react';

const TreesTBDContent = ({ onNavigate, courseId }) => {
  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-quantico-bold text-gray-100 mb-4">
          Advanced Trees - Coming Soon
        </h1>
        <p className="text-gray-400 text-lg">
          More tree topics will be added soon!
        </p>
      </div>

      {/* Coming Soon Notice */}
      <section className="mb-10">
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-dashed border-purple-500/40 rounded-xl p-16 text-center">
          <div className="text-8xl mb-6">🌳</div>
          <h2 className="text-3xl font-quantico-bold text-purple-300 mb-4">
            Advanced Tree Topics Coming Soon!
          </h2>
          <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
            We're working hard to bring you comprehensive content on advanced tree structures and algorithms.
          </p>
          <div className="inline-block bg-black/40 rounded-lg p-6 border border-purple-500/30">
            <p className="text-yellow-300 font-quantico-bold mb-3">Upcoming Topics:</p>
            <ul className="text-gray-300 text-left space-y-2">
              <li>• Red-Black Trees</li>
              <li>• B-Trees and B+ Trees</li>
              <li>• Trie (Prefix Tree)</li>
              <li>• Segment Trees</li>
              <li>• Fenwick Tree (Binary Indexed Tree)</li>
              <li>• Suffix Trees</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Placeholder Info */}
      <section className="mb-10 bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-emerald-500/20 rounded-xl p-6">
        <h2 className="text-2xl font-quantico-bold text-emerald-300 mb-4">
          📚 In the Meantime...
        </h2>
        <p className="text-gray-300 mb-4">
          While we prepare this content, make sure you've mastered the fundamentals:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <h3 className="text-yellow-300 font-quantico-bold mb-2">✓ Arrays</h3>
            <p className="text-gray-400 text-sm">1D and 2D array operations</p>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <h3 className="text-yellow-300 font-quantico-bold mb-2">✓ Stacks</h3>
            <p className="text-gray-400 text-sm">LIFO operations and applications</p>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <h3 className="text-yellow-300 font-quantico-bold mb-2">✓ Queues</h3>
            <p className="text-gray-400 text-sm">FIFO operations and variants</p>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <h3 className="text-yellow-300 font-quantico-bold mb-2">✓ Trees Intro</h3>
            <p className="text-gray-400 text-sm">Basic tree concepts and terminology</p>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <div className="mt-10 p-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl">
        <h3 className="text-lg font-quantico-bold text-emerald-300 mb-2">
          🚀 Continue Your Journey
        </h3>
        <p className="text-gray-300 mb-4">
          Ready to test your knowledge? Head to the Final Exam!
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => onNavigate('course', { courseId, topic: 'trees-intro' })}
            className="px-6 py-2 bg-gradient-to-r from-gray-600/20 to-gray-700/20 hover:from-gray-600/30 hover:to-gray-700/30 border border-gray-500/40 hover:border-gray-400/60 text-gray-200 font-quantico-bold rounded-lg transition-all duration-300"
          >
            ← Back to Trees Intro
          </button>
          <button
            onClick={() => onNavigate('course', { courseId, topic: 'quiz' })}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 font-quantico-bold rounded-lg transition-all duration-300"
          >
            Take Final Exam →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TreesTBDContent;
