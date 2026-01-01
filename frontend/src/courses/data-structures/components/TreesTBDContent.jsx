import React, { useEffect } from 'react';
import { Clock, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

const TreesTBDContent = ({ onNavigate, courseId }) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const upcomingTopics = [
    { name: 'AVL Trees', description: 'Self-balancing binary search trees', icon: '⚖️' },
    { name: 'Red-Black Trees', description: 'Balanced trees with color properties', icon: '🔴' },
    { name: 'B-Trees & B+ Trees', description: 'Multi-way trees for databases', icon: '🗄️' },
    { name: 'Trie (Prefix Tree)', description: 'String searching & autocomplete', icon: '🔤' },
    { name: 'Segment Trees', description: 'Range queries & updates', icon: '📊' },
    { name: 'Fenwick Tree', description: 'Binary Indexed Tree for prefix sums', icon: '📈' },
    { name: 'Heap / Priority Queue', description: 'Complete binary tree for priorities', icon: '⏫' },
    { name: 'Suffix Trees', description: 'Pattern matching & string algorithms', icon: '🔍' },
  ];

  const completedTopics = [
    { name: 'Arrays (1D & 2D)', topic: 'arrays-1d' },
    { name: 'Linked Lists', topic: 'linked-list-singly' },
    { name: 'Stacks', topic: 'stacks' },
    { name: 'Queues', topic: 'queues' },
    { name: 'Binary Search Trees', topic: 'trees-intro' },
  ];

  return (
    <div className="w-full mx-auto">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8 animate-slideInDown">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Clock className="w-6 h-6 text-purple-400" />
          </div>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-quantico-bold rounded-full border border-purple-500/30">
            Coming Soon
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-quantico-bold text-gray-100 mb-4">
          Advanced Tree Structures
        </h1>
        <p className="text-gray-400 text-base sm:text-lg">
          Exciting new tree data structures and algorithms are on their way!
        </p>
      </div>

      {/* Coming Soon Hero */}
      <section className="mb-6 sm:mb-8 lg:mb-10 animate-slideInUp">
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-blue-900/30 border-2 border-dashed border-purple-500/40 rounded-xl p-8 sm:p-12 text-center">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-7xl sm:text-8xl mb-6 animate-bounce">🌳</div>
            <h2 className="text-2xl sm:text-3xl font-quantico-bold text-purple-300 mb-4 flex items-center justify-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              More Tree Topics Coming Soon!
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </h2>
            <p className="text-gray-300 text-base sm:text-lg mb-6 max-w-2xl mx-auto leading-relaxed">
              We're crafting comprehensive, interactive content on advanced tree structures 
              with beautiful visualizations and hands-on practice.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 text-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              Actively in development
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Topics Grid */}
      <section className="mb-6 sm:mb-8 lg:mb-10">
        <h2 className="text-2xl font-quantico-bold text-emerald-300 mb-6 flex items-center gap-2">
          <span>📋</span> Upcoming Topics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingTopics.map((topic, index) => (
            <div 
              key={topic.name}
              className="group bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-white/10 rounded-xl p-5 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {topic.icon}
              </div>
              <h3 className="text-yellow-300 font-quantico-bold mb-2 text-sm">
                {topic.name}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                {topic.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What You've Learned */}
      <section className="mb-6 sm:mb-8 lg:mb-10 bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-emerald-500/20 rounded-xl p-6">
        <h2 className="text-2xl font-quantico-bold text-emerald-300 mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          What You've Mastered
        </h2>
        <p className="text-gray-300 mb-6">
          Great job! You've built a solid foundation. Here's what you've learned so far:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {completedTopics.map((topic) => (
            <button
              key={topic.name}
              onClick={() => onNavigate('course', { courseId, topic: topic.topic })}
              className="group bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-400/50 rounded-lg p-4 text-left transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-black text-xs font-bold">✓</div>
                <span className="text-emerald-300 font-quantico-bold text-sm group-hover:text-emerald-200">
                  {topic.name}
                </span>
              </div>
              <p className="text-gray-500 text-xs pl-7">Review →</p>
            </button>
          ))}
        </div>
      </section>

      {/* Pro Tip */}
      <section className="mb-6 sm:mb-8 lg:mb-10 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
        <h3 className="text-lg font-quantico-bold text-yellow-300 mb-3 flex items-center gap-2">
          <span>💡</span> Pro Tip
        </h3>
        <p className="text-gray-300 leading-relaxed">
          While waiting for advanced tree content, strengthen your fundamentals by practicing 
          <strong className="text-emerald-300"> Binary Search Tree problems</strong> on LeetCode. 
          Understanding BST thoroughly will make learning AVL trees, Red-Black trees, and other 
          self-balancing trees much easier!
        </p>
      </section>

      {/* Navigation */}
      <div className="mt-10 p-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl animate-slideInUp">
        <h3 className="text-lg font-quantico-bold text-emerald-300 mb-2 flex items-center gap-2">
          <span>🚀</span> Continue Your Journey
        </h3>
        <p className="text-gray-300 mb-4">
          Ready to test everything you've learned? Take the Final Exam to earn your certificate!
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => onNavigate('course', { courseId, topic: 'trees-intro' })}
            className="px-6 py-3 bg-gradient-to-r from-gray-600/20 to-gray-700/20 hover:from-gray-600/30 hover:to-gray-700/30 border border-gray-500/40 hover:border-gray-400/60 text-gray-200 font-quantico-bold rounded-lg transition-all duration-300 hover-lift"
          >
            ← Back to Binary Search Trees
          </button>
          <button
            onClick={() => onNavigate('course', { courseId, topic: 'quiz' })}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 font-quantico-bold rounded-lg transition-all duration-300 hover-lift flex items-center gap-2"
          >
            Take Final Exam
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TreesTBDContent;
