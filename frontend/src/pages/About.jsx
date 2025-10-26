import Header from '../components/Header';
import signumLogo from '../assets/Signum-logo-removebg-preview.png';

function About({ user, onLogout, onNavigate }) {
  return (
    <div className="min-h-screen bg-black text-gray-100 font-quantico">
      <Header user={user} onLogout={onLogout} currentPage="about" onNavigate={onNavigate} />
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="inline-block">
            <img 
              src={signumLogo} 
              alt="Signum Logo" 
              className="w-24 h-24 mx-auto object-contain drop-shadow-[0_0_25px_rgba(16,185,129,0.7)] mb-6"
            />
          </div>
          <h1 className="text-5xl font-quantico-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            Signum
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            An AI-Tutored Learning Platform with Dynamic NFT Certification
          </p>
        </div>

        {/* What is Signum */}
        <section className="mb-16 bg-gradient-to-br from-black/50 to-green-900/10 border border-emerald-600/30 rounded-2xl p-8">
          <h2 className="text-3xl font-quantico-bold text-emerald-400 mb-6 flex items-center">
            <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
            What is Signum?
          </h2>
          <div className="space-y-4 text-gray-300 leading-relaxed">
            <p>
              <strong className="text-emerald-300">Signum</strong> is a next-generation learning platform that combines AI-powered education 
              with blockchain-based certification. Students master Data Structures and Algorithms through interactive visualizations, 
              AI assistance, coding challenges, and comprehensive quizzes—then earn <strong className="text-emerald-300">verifiable NFT certificates</strong> minted 
              on the Solana blockchain upon course completion.
            </p>
            <p>
              The platform features a sophisticated <strong className="text-emerald-300">AI Tutor</strong> powered 
              by Google's Gemini 2.5 Flash that provides context-aware assistance, code evaluation, and personalized guidance. 
              With <strong className="text-emerald-300">anti-cheat protection</strong>, real-time progress tracking, and permanent blockchain credentials, 
              Signum represents the future of verifiable online education.
            </p>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-quantico-bold text-emerald-400 mb-8 flex items-center">
            <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-xl p-6">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-xl font-quantico-bold text-green-300 mb-3">AI Tutor Assistant</h3>
              <p className="text-gray-400 text-sm">
                Get instant help from an AI that knows what page you're on and can answer 
                questions about your current lesson with voice input support.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 border border-emerald-500/30 rounded-xl p-6">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-xl font-quantico-bold text-emerald-300 mb-3">Structured Course Content</h3>
              <p className="text-gray-400 text-sm">
                Learn Data Structures through organized modules covering arrays, stacks, queues, 
                trees, and more with clear progression tracking.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-xl font-quantico-bold text-green-300 mb-3">Secure Quizzes</h3>
              <p className="text-gray-400 text-sm">
                Test your knowledge with timed quizzes that include anti-cheat monitoring 
                for fair assessment.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-xl font-quantico-bold text-emerald-300 mb-3">Progress Tracking</h3>
              <p className="text-gray-400 text-sm">
                Track your learning progress through each module and see your quiz scores 
                to monitor improvement.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-xl p-6">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="text-xl font-quantico-bold text-green-300 mb-3">Anti-Cheat System</h3>
              <p className="text-gray-400 text-sm">
                Advanced monitoring with tab-switching detection, keyboard blocking, and violation tracking 
                ensures fair assessment and honest achievement.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 border border-emerald-500/30 rounded-xl p-6">
              <div className="text-3xl mb-3">💻</div>
              <h3 className="text-xl font-quantico-bold text-emerald-300 mb-3">Coding Challenges</h3>
              <p className="text-gray-400 text-sm">
                Practice with real coding problems in an integrated Monaco editor with live execution 
                and AI-powered code evaluation feedback.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-xl p-6">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-xl font-quantico-bold text-green-300 mb-3">Interactive Visualizations</h3>
              <p className="text-gray-400 text-sm">
                Master data structures through live visualizations: Binary Search Trees, Stacks, Queues, 
                2D Arrays, and 1D Arrays with step-by-step algorithm demonstrations.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 border border-emerald-500/30 rounded-xl p-6">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="text-xl font-quantico-bold text-emerald-300 mb-3">Time-Based Module Completion</h3>
              <p className="text-gray-400 text-sm">
                Ensures genuine learning with minimum time requirements per module, preventing instant 
                completion and encouraging proper content engagement.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-xl p-6">
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="text-xl font-quantico-bold text-green-300 mb-3">NFT Certificates (LIVE!)</h3>
              <p className="text-gray-400 text-sm">
                Mint permanent, verifiable NFT certificates on Solana blockchain with full wallet address 
                for trustless verification on Solana Explorer.
              </p>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-16 bg-gradient-to-br from-black/50 to-green-900/10 border border-emerald-600/30 rounded-2xl p-8">
          <h2 className="text-3xl font-quantico-bold text-emerald-400 mb-6 flex items-center">
            <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-quantico-bold text-green-300 mb-4">Frontend</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                  React 19 - Modern UI framework
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                  Vite - Lightning-fast build tool
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                  Tailwind CSS - Utility-first styling
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                  Monaco Editor - Code editing
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                  Firebase - Authentication & storage
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-quantico-bold text-green-300 mb-4">Backend</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                  FastAPI - Python API
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                  Google Gemini 2.5 - AI model
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                  LangChain - AI integration
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                  Firebase Admin - User data
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-quantico-bold text-green-300 mb-4">Blockchain</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                  Solana Devnet - High-speed blockchain
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                  Anchor Framework - Smart contracts
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                  Metaplex - NFT standard
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                  Pinata IPFS - Certificate storage
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                  Phantom Wallet - User authentication
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Blockchain Certification */}
        <section className="mb-16 bg-gradient-to-br from-black/50 to-green-900/10 border border-emerald-600/30 rounded-2xl p-8">
          <h2 className="text-3xl font-quantico-bold text-emerald-400 mb-6 flex items-center">
            <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
            Why Blockchain Certificates?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-quantico-bold text-green-300 mb-2">Tamper-Proof</h3>
              <p className="text-gray-400 text-sm">
                Certificates stored on Solana blockchain cannot be altered, forged, or deleted. 
                Your achievements are permanently verified.
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
              <div className="text-3xl mb-3">✓</div>
              <h3 className="text-lg font-quantico-bold text-emerald-300 mb-2">Trustless Verification</h3>
              <p className="text-gray-400 text-sm">
                Full wallet address on certificate allows anyone to verify authenticity on Solana Explorer 
                without trusting Signum—true decentralized verification!
              </p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <div className="text-3xl mb-3">🌐</div>
              <h3 className="text-lg font-quantico-bold text-green-300 mb-2">Permanent Ownership</h3>
              <p className="text-gray-400 text-sm">
                Your NFT certificates live in your Phantom wallet forever. Share globally, 
                display on LinkedIn, or showcase anywhere NFTs are supported.
              </p>
            </div>
          </div>
        </section>

        {/* Development Team */}
        <section className="mb-16">
          <h2 className="text-3xl font-quantico-bold text-emerald-400 mb-8 flex items-center">
            <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
            Development Team
          </h2>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">👨‍💻</div>
              <p className="text-gray-400 leading-relaxed">
                Signum is developed by a team of Computer Science students passionate about 
                creating better learning tools with modern technology.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-4 text-center">
                <h3 className="text-lg font-quantico-bold text-green-300 mb-1">Suhas B M</h3>
                <p className="text-gray-500 text-sm">Developer</p>
              </div>
              <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-4 text-center">
                <h3 className="text-lg font-quantico-bold text-green-300 mb-1">Suhas B H</h3>
                <p className="text-gray-500 text-sm">Developer</p>
              </div>
              <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-4 text-center">
                <h3 className="text-lg font-quantico-bold text-green-300 mb-1">Nischith S</h3>
                <p className="text-gray-500 text-sm">Developer</p>
              </div>
              <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-4 text-center">
                <h3 className="text-lg font-quantico-bold text-green-300 mb-1">Rohan P</h3>
                <p className="text-gray-500 text-sm">Developer</p>
              </div>
            </div>
          </div>
        </section>

        {/* Current Status */}
        <section className="mb-16 bg-gradient-to-br from-black/50 to-green-900/10 border border-emerald-600/30 rounded-2xl p-8">
          <h2 className="text-3xl font-quantico-bold text-emerald-400 mb-6 flex items-center">
            <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
            Current Status
          </h2>
          <div className="space-y-4 text-gray-300 leading-relaxed">
            <div className="flex items-start">
              <span className="text-emerald-400 mr-3 mt-1">✓</span>
              <p><strong className="text-emerald-300">Data Structures Course</strong> - Complete with modules on Arrays, Stacks, Queues, Trees, and more</p>
            </div>
            <div className="flex items-start">
              <span className="text-emerald-400 mr-3 mt-1">✓</span>
              <p><strong className="text-emerald-300">AI Assistant</strong> - Working with context awareness and voice input</p>
            </div>
            <div className="flex items-start">
              <span className="text-emerald-400 mr-3 mt-1">✓</span>
              <p><strong className="text-emerald-300">Quiz System</strong> - Functional with 100+ questions and anti-cheat features</p>
            </div>
            <div className="flex items-start">
              <span className="text-emerald-400 mr-3 mt-1">✓</span>
              <p><strong className="text-emerald-300">Blockchain NFT Certificates</strong> - LIVE on Solana Devnet with Phantom Wallet integration</p>
            </div>
            <div className="flex items-start">
              <span className="text-emerald-400 mr-3 mt-1">✓</span>
              <p><strong className="text-emerald-300">Coding Challenges</strong> - AI-powered code evaluation with real-time feedback</p>
            </div>
            <div className="flex items-start">
              <span className="text-emerald-400 mr-3 mt-1">✓</span>
              <p><strong className="text-emerald-300">Interactive Visualizations</strong> - 5 live visualizers: BST, Stack, Queue, 2D Arrays, and 1D Arrays with algorithm demonstrations</p>
            </div>
            <div className="flex items-start">
              <span className="text-emerald-400 mr-3 mt-1">✓</span>
              <p><strong className="text-emerald-300">Full-Width Responsive Layout</strong> - Adaptive content layout that expands to full screen when sidebar is collapsed</p>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 mr-3 mt-1">○</span>
              <p className="text-gray-500"><strong>Additional Courses</strong> - Algorithms, System Design, and more planned for future development</p>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <section className="text-center bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-xl p-6">
          <p className="text-gray-400 text-sm">
            Built with modern web technologies • Powered by Google Gemini AI
          </p>
          <p className="text-gray-500 text-xs mt-2">
            © 2025 Signum Learning Platform
          </p>
        </section>
      </div>
      </div>
    </div>
  );
}

export default About;
