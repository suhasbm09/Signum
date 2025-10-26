import { useState } from 'react';
import CompletionTracker from '../../../components/CompletionTracker';

function OverviewContent() {
  const [showGoldenTip, setShowGoldenTip] = useState(false);
  
  return (
    <CompletionTracker 
      courseId="data-structures" 
      moduleId="overview" 
      contentLength="long"
    >
    <div className="w-full mx-auto">
      <h2 className="text-3xl font-quantico-bold text-gray-100 mb-6 text-center">
        Data Structures: The Blueprint of Efficient Computing
      </h2>
      
      {/* Hero Quote */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-l-4 border-emerald-500 p-6 mb-8 rounded-r-xl">
        <p className="text-emerald-200 text-lg italic font-quantico">
          "Bad programmers worry about the code. Good programmers worry about data structures and their relationships."
        </p>
        <p className="text-gray-400 text-sm mt-2">- Linus Torvalds, Creator of Linux</p>
      </div>

      <div className="space-y-10">
        {/* What Are Data Structures */}
        <div className="mb-8">
          <h3 className="text-2xl font-quantico-bold text-emerald-300 mb-6 flex items-center">
            <span className="bg-emerald-500/20 text-emerald-300 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">1</span>
            The Foundation: What Are Data Structures?
          </h3>
          <div className="pl-11 space-y-4">
            <div className="bg-black/30 border-l-4 border-emerald-500 pl-6 py-4 rounded-r-lg">
              <p className="text-gray-100 text-base leading-relaxed">
                Imagine your computer's memory as a vast digital library. Data structures are the <span className="text-emerald-300 font-bold">organizational systems</span> - 
                the shelving methods, cataloging systems, and retrieval protocols that transform chaos into order.
              </p>
            </div>
            <p className="text-gray-300 text-base leading-relaxed">
              Every tap on your phone, every search on Google, every transaction on Amazon - they all depend on carefully chosen data structures 
              working behind the scenes. These aren't just academic concepts; they're the <strong className="text-gray-100">invisible engines </strong> 
              powering every digital experience you've ever had.
            </p>
          </div>
        </div>

        {/* Why Master Data Structures */}
        <div className="mb-8">
          <h3 className="text-2xl font-quantico-bold text-emerald-300 mb-6 flex items-center">
            <span className="bg-emerald-500/20 text-emerald-300 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">2</span>
            The Power: Why Master Data Structures?
          </h3>
          <div className="pl-11">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-5">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full mr-3"></div>
                  <h4 className="text-gray-100 font-quantico-bold">Lightning Performance</h4>
                </div>
                <p className="text-gray-300 text-sm">
                  Transform algorithms from taking <em>hours</em> to <em>milliseconds</em>. 
                  The right data structure can make your code 1000x faster.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-5">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <h4 className="text-gray-100 font-quantico-bold">Career Acceleration</h4>
                </div>
                <p className="text-gray-300 text-sm">
                  MAANG interviews, startup CTOs, senior architect roles - they all hinge on 
                  demonstrating mastery of fundamental data structures.
                </p>
              </div>
            </div>
            
            <div className="bg-black/40 rounded-xl p-6 border border-white/10">
              <h4 className="text-gray-100 font-quantico-bold mb-3 flex items-center">
                <span className="text-emerald-400 mr-2">🎯</span>
                Real Impact Examples
              </h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li><strong className="text-emerald-300">Netflix</strong>: Uses sophisticated graph structures to recommend your next binge-watch</li>
                <li><strong className="text-emerald-300">WhatsApp</strong>: Handles 100 billion messages daily using optimized hash tables and trees</li>
                <li><strong className="text-emerald-300">Uber</strong>: Matches millions of rides using advanced spatial data structures</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modern Applications */}
        <div className="mb-8">
          <h3 className="text-2xl font-quantico-bold text-emerald-300 mb-6 flex items-center">
            <span className="bg-emerald-500/20 text-emerald-300 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">3</span>
            The Revolution: Modern Applications
          </h3>
          <div className="pl-11">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-500/10 to-green-600/10 border border-emerald-500/20 rounded-xl p-4">
                  <h4 className="text-emerald-300 font-quantico-bold mb-2 flex items-center">
                    <span className="mr-2">🤖</span> AI & Machine Learning
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Neural networks are just graphs. Transformers use attention mechanisms built on matrices. 
                    Every AI breakthrough relies on optimized data structures.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-4">
                  <h4 className="text-green-300 font-quantico-bold mb-2 flex items-center">
                    <span className="mr-2">⚡</span> Real-Time Systems
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Gaming engines, financial trading, live streaming - where microseconds matter, 
                    the right data structure is life or death.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                  <h4 className="text-green-300 font-quantico-bold mb-2 flex items-center">
                    <span className="mr-2">🌐</span> Blockchain & Web3
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Merkle trees secure Bitcoin. Hash tables power Ethereum. 
                    The decentralized future is built on data structures.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-500/10 to-green-600/10 border border-emerald-500/20 rounded-xl p-4">
                  <h4 className="text-emerald-300 font-quantico-bold mb-2 flex items-center">
                    <span className="mr-2">☁️</span> Cloud Architecture
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Distributed databases, microservices, container orchestration - 
                    modern cloud infrastructure is data structures at planetary scale.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The Universe of Data Structures */}
        <div className="mb-8">
          <h3 className="text-2xl font-quantico-bold text-emerald-300 mb-6 flex items-center">
            <span className="bg-emerald-500/20 text-emerald-300 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">4</span>
            The Universe: Data Structure Taxonomy
          </h3>
          <div className="pl-11">
            <p className="text-gray-300 text-base mb-8 leading-relaxed">
              Like species in biology, data structures form an interconnected ecosystem. Each has evolved to solve specific problems with mathematical elegance.
            </p>
            
            <div className="space-y-6">
              {/* Linear vs Non-Linear */}
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-600/30 rounded-xl p-6">
                <h4 className="text-xl font-quantico-bold text-gray-100 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
                  Organization Structure
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                    <h5 className="text-emerald-300 font-quantico-bold mb-2">🔗 Linear Structures</h5>
                    <p className="text-gray-300 text-sm mb-3">Elements follow each other like cars in a train</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-emerald-200">Arrays</span><span className="text-gray-400">Random access</span></div>
                      <div className="flex justify-between"><span className="text-emerald-200">Linked Lists</span><span className="text-gray-400">Dynamic size</span></div>
                      <div className="flex justify-between"><span className="text-emerald-200">Stacks</span><span className="text-gray-400">LIFO operations</span></div>
                      <div className="flex justify-between"><span className="text-emerald-200">Queues</span><span className="text-gray-400">FIFO operations</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <h5 className="text-green-300 font-quantico-bold mb-2">🌳 Non-Linear Structures</h5>
                    <p className="text-gray-300 text-sm mb-3">Elements branch out like a family tree</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-green-200">Trees</span><span className="text-gray-400">Hierarchical data</span></div>
                      <div className="flex justify-between"><span className="text-green-200">Graphs</span><span className="text-gray-400">Network relationships</span></div>
                      <div className="flex justify-between"><span className="text-green-200">Heaps</span><span className="text-gray-400">Priority ordering</span></div>
                      <div className="flex justify-between"><span className="text-green-200">Hash Tables</span><span className="text-gray-400">Key-value mapping</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Memory & Performance */}
              <div className="bg-gradient-to-r from-black/50 to-green-900/30 border border-emerald-600/30 rounded-xl p-6">
                <h4 className="text-xl font-quantico-bold text-gray-100 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
                  Memory & Performance Characteristics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                    <h5 className="text-emerald-300 font-quantico-bold mb-2 text-sm">🔒 Static</h5>
                    <p className="text-gray-400 text-xs mb-2">Fixed size, predictable memory</p>
                    <div className="text-emerald-200 text-xs">Arrays, Tuples</div>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <h5 className="text-green-300 font-quantico-bold mb-2 text-sm">⚡ Dynamic</h5>
                    <p className="text-gray-400 text-xs mb-2">Grows/shrinks during runtime</p>
                    <div className="text-green-200 text-xs">Lists, Trees, Graphs</div>
                  </div>
                  
                  <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-lg p-4">
                    <h5 className="text-emerald-400 font-quantico-bold mb-2 text-sm">🎯 Specialized</h5>
                    <p className="text-gray-400 text-xs mb-2">Optimized for specific operations</p>
                    <div className="text-emerald-300 text-xs">Heaps, Tries, B-Trees</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Classification Diagram */}
        <div className="mb-8">
          <h3 className="text-2xl font-quantico-bold text-emerald-300 mb-6 text-center flex items-center justify-center">
            <span className="bg-emerald-500/20 text-emerald-300 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">📊</span>
            Complete Classification Overview
          </h3>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-gray-300 text-sm mb-6">
              Here's the complete taxonomy that organizes our entire learning journey:
            </p>
            <div className="bg-white rounded-xl p-4 inline-block">
              <img 
                src="/src/assets/Courses/Data-Structures/Classification.jpeg" 
                alt="Classification of Data Structures - Complete hierarchical diagram showing Linear (Static Arrays, Dynamic Queues/Stacks/Linked Lists) and Non-Linear (Trees, Graphs) structures"
                className="max-w-full h-auto"
                style={{ maxHeight: '500px' }}
              />
            </div>
            <p className="text-gray-400 text-xs mt-4 italic">
              This roadmap shows exactly what we'll master together - from basic arrays to complex graph algorithms.
            </p>
          </div>
        </div>

        {/* Important Note: Big O Notation */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-l-4 border-yellow-500 rounded-r-xl p-6">
          <h3 className="text-xl font-quantico-bold text-yellow-300 mb-4 flex items-center">
            <span className="mr-3">📝</span>
            Important Note: The Language of Efficiency
          </h3>
          <div className="space-y-4">
            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-gray-100 font-quantico-bold mb-2">🕒 Time Complexity</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Measures how execution time grows with input size. When we say "this algorithm runs in O(n) time," 
                we mean it scales linearly with the data size.
              </p>
            </div>
            
            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-gray-100 font-quantico-bold mb-2">💾 Space Complexity</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Measures how memory usage grows with input size. An O(1) space algorithm uses the same memory 
                regardless of input size, while O(n) grows proportionally.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
              <h4 className="text-yellow-300 font-quantico-bold mb-2 flex items-center">
                <span className="mr-2">🎯</span>
                The Big O Standard
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                Throughout this course and in <strong className="text-gray-100">every technical interview</strong>, 
                we'll use <strong className="text-yellow-300">Big O notation</strong> as our universal language for measuring efficiency:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="text-center">
                  <div className="text-green-300 font-bold">O(1)</div>
                  <div className="text-gray-400">Constant</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-300 font-bold">O(log n)</div>
                  <div className="text-gray-400">Logarithmic</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-300 font-bold">O(n)</div>
                  <div className="text-gray-400">Linear</div>
                </div>
                <div className="text-center">
                  <div className="text-red-300 font-bold">O(n²)</div>
                  <div className="text-gray-400">Quadratic</div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-400 text-xs italic">
              💡 Pro tip: Mastering Big O notation isn't just academic - it's the key to acing technical interviews 
              and making smart architectural decisions in real-world systems.
            </p>
          </div>
        </div>

        {/* Golden Tip Section */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setShowGoldenTip(!showGoldenTip)}
            className="group bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-quantico-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center mx-auto"
          >
            <span className="mr-3 text-xl">🏆</span>
            Golden Tip: Algorithm Complexity Cheat Sheet
            <span className="ml-3 transform transition-transform group-hover:rotate-180">
              {showGoldenTip ? '▲' : '▼'}
            </span>
          </button>

          {showGoldenTip && (
            <div className="mt-8 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-8 animate-fadeIn">
              <h3 className="text-2xl font-quantico-bold text-yellow-300 mb-4 flex items-center justify-center">
                <span className="mr-3">⚡</span>
                Competitive Programming & Interview Complexity Guide
              </h3>
              <p className="text-gray-300 text-sm mb-6 max-w-3xl mx-auto">
                This is the secret weapon used by competitive programmers and MAANG engineers. 
                Match your input size to the right time complexity and choose the perfect algorithm.
              </p>
              
              <div className="overflow-x-auto bg-black/30 rounded-xl">
                <table className="w-full min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-yellow-500/30">
                      <th className="text-yellow-300 font-quantico-bold py-4 px-6 text-left">Input Size (n)</th>
                      <th className="text-yellow-300 font-quantico-bold py-4 px-6 text-left">Max Time Complexity</th>
                      <th className="text-yellow-300 font-quantico-bold py-4 px-6 text-left">Recommended Algorithms</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-gray-700/30 hover:bg-yellow-500/5 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-red-300 font-bold">&gt; 10⁸</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-green-300 font-mono">O(1), O(log n)</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div>Mathematical formulas, bit manipulation</div>
                          <div className="text-xs text-gray-400">Binary search, hash lookups</div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/30 hover:bg-yellow-500/5 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-orange-300 font-bold">≤ 10⁸</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-blue-300 font-mono">O(n)</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div>Linear search, single pass algorithms</div>
                          <div className="text-xs text-gray-400">Array traversal, simple DP</div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/30 hover:bg-yellow-500/5 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-yellow-300 font-bold">≤ 10⁶</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-cyan-300 font-mono">O(n log n)</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div>Merge sort, heap sort, divide & conquer</div>
                          <div className="text-xs text-gray-400">Fast sorting, balanced trees</div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/30 hover:bg-yellow-500/5 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-green-300 font-bold">≤ 10⁴</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-purple-300 font-mono">O(n²)</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div>Bubble sort, selection sort, naive DP</div>
                          <div className="text-xs text-gray-400">Nested loops, basic dynamic programming</div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/30 hover:bg-yellow-500/5 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-indigo-300 font-bold">≤ 500</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-red-300 font-mono">O(n³)</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div>Floyd-Warshall, matrix multiplication</div>
                          <div className="text-xs text-gray-400">Triple nested loops, 3D DP</div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/30 hover:bg-yellow-500/5 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-pink-300 font-bold">≤ 100</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-orange-300 font-mono">O(n⁴), O(n⁵)</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div>Complex DP with multiple dimensions</div>
                          <div className="text-xs text-gray-400">Advanced optimization problems</div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/30 hover:bg-yellow-500/5 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-emerald-300 font-bold">≤ 25</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-red-400 font-mono">O(2ⁿ)</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div>Backtracking, subset generation</div>
                          <div className="text-xs text-gray-400">Exponential algorithms, brute force</div>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-yellow-500/5 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-red-400 font-bold">≤ 12</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-red-500 font-mono">O(n!)</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div>Traveling salesman, permutation generation</div>
                          <div className="text-xs text-gray-400">Factorial algorithms, brute force search</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                  <h4 className="text-green-300 font-quantico-bold mb-2 flex items-center">
                    <span className="mr-2">✅</span>
                    Pro Strategy
                  </h4>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Always check input constraints first</li>
                    <li>• Choose the slowest acceptable complexity</li>
                    <li>• Consider constant factors in practice</li>
                    <li>• Memory limits matter too (space complexity)</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl p-4">
                  <h4 className="text-red-300 font-quantico-bold mb-2 flex items-center">
                    <span className="mr-2">⚠️</span>
                    Common Pitfalls
                  </h4>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Don't optimize prematurely</li>
                    <li>• Watch out for integer overflow</li>
                    <li>• Consider worst-case scenarios</li>
                    <li>• Test with maximum input sizes</li>
                  </ul>
                </div>
              </div>

              <p className="text-yellow-300 text-xs font-quantico-bold mt-6">
                🎯 Bookmark this table - it's your competitive programming compass!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
    </CompletionTracker>
  );
}

export default OverviewContent;