import Layout from '../components/Layout';
import signumLogo from '../assets/Signum-logo-removebg-preview.png';
import { Brain, Shield, Trophy, Code, Zap, Lock, Globe, Sparkles } from 'lucide-react';

function About({ user, onLogout, onNavigate }) {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Learning",
      description: "Gemini 2.5 Flash provides context-aware tutoring, instant code evaluation, and personalized guidance throughout your journey."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Anti-Cheat Protection",
      description: "Advanced monitoring ensures assessment integrity with tab-switching detection and progressive violation handling."
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Blockchain Certificates",
      description: "Earn verifiable NFT credentials on Solana blockchain - permanently owned, globally recognized, trustlessly verified."
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Interactive Coding",
      description: "Monaco-powered editor with live execution, automated test validation, and AI-driven feedback on your solutions."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Visual Learning",
      description: "Master algorithms through interactive visualizations - trees, stacks, queues, arrays with step-by-step execution."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Real-Time Progress",
      description: "Firebase-synced tracking across devices with granular module completion and assessment score analytics."
    }
  ];

  const techStack = {
    frontend: [
      "React 19 - Modern UI",
      "Vite - Build tooling",
      "Tailwind CSS - Styling",
      "Monaco Editor - Code editor",
      "Firebase - Auth & sync"
    ],
    backend: [
      "FastAPI - Python REST API",
      "Gemini 2.5 Flash - AI model",
      "RAG - Content retrieval",
      "Firebase - Firestore database"
    ],
    blockchain: [
      "Solana - L1 blockchain",
      "Anchor - Smart contracts",
      "Metaplex - NFT standard",
      "Phantom - Wallet integration"
    ]
  };

  return (
    <Layout user={user} onLogout={onLogout} currentPage="about" onNavigate={onNavigate}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Hero Section */}
        <div className="text-center mb-24 relative animate-slideInDown">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-[600px] h-[600px] bg-emerald-500/40 rounded-full blur-[120px] animate-pulse-slow"></div>
          </div>
          
          <div className="relative inline-block mb-10">
            <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-3xl animate-pulse"></div>
            <img 
              src={signumLogo} 
              alt="Signum" 
              className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 mx-auto object-contain relative z-10 drop-shadow-[0_0_50px_rgba(16,185,129,1)]"
            />
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-quantico-bold bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent mb-6 tracking-tight">
            Signum
          </h1>
          
          <p className="text-xl sm:text-2xl lg:text-3xl text-gray-200 font-quantico mb-4 tracking-wide">
            The Future of Verified Learning
          </p>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            AI-powered education meets blockchain certification. Master computer science fundamentals, 
            earn verifiable on-chain credentials.
          </p>
        </div>

        {/* Mission Statement */}
        <section className="mb-12 sm:mb-16 lg:mb-20 animate-slideInUp">
          <div className="bg-gradient-to-br from-emerald-500/5 via-black to-green-500/5 border border-emerald-500/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-emerald-400 mr-3" />
                <h2 className="text-2xl sm:text-3xl font-quantico-bold text-emerald-400">What is Signum?</h2>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed text-center max-w-4xl mx-auto">
                <span className="text-emerald-300 font-quantico-bold">Signum</span> is a next-generation learning platform 
                combining <span className="text-emerald-300">AI-powered education</span> with <span className="text-emerald-300">blockchain certification</span>. 
                Students master Data Structures and Algorithms through interactive visualizations, AI assistance, 
                and comprehensive assessments—then earn <span className="text-emerald-300">verifiable NFT certificates</span> minted 
                on Solana blockchain upon completion. With advanced anti-cheat protection and real-time progress tracking, 
                Signum represents the future of trustworthy online education.
              </p>
            </div>
          </div>
        </section>

        {/* Core Features Grid */}
        <section className="mb-12 sm:mb-16 lg:mb-20 animate-slideInUp" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-3xl sm:text-4xl font-quantico-bold text-center mb-8 sm:mb-10 lg:mb-12">
            <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Core Features
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-emerald-500/10 via-black to-green-500/10 border border-emerald-500/30 rounded-lg sm:rounded-xl p-6 sm:p-8 hover-lift transition-all duration-300"
              >
                <div className="text-emerald-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-quantico-bold text-gray-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-12 sm:mb-16 lg:mb-20 animate-slideInUp" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-3xl sm:text-4xl font-quantico-bold text-center mb-8 sm:mb-10 lg:mb-12">
            <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Technology Stack
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-emerald-500/5 to-black border border-emerald-500/30 rounded-lg sm:rounded-xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-quantico-bold text-emerald-400 mb-4 sm:mb-6 flex items-center">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                Frontend
              </h3>
              <ul className="space-y-3">
                {techStack.frontend.map((tech, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/5 to-black border border-green-500/30 rounded-lg sm:rounded-xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-quantico-bold text-green-400 mb-4 sm:mb-6 flex items-center">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                Backend
              </h3>
              <ul className="space-y-3">
                {techStack.backend.map((tech, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500/5 to-black border border-emerald-500/30 rounded-lg sm:rounded-xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-quantico-bold text-emerald-400 mb-4 sm:mb-6 flex items-center">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                Blockchain
              </h3>
              <ul className="space-y-3">
                {techStack.blockchain.map((tech, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Why Blockchain Certificates */}
        <section className="mb-20 animate-slideInUp" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-4xl font-quantico-bold text-center mb-12">
            <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Why Blockchain Certificates?
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-500/10 to-black border border-emerald-500/30 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-quantico-bold text-emerald-300 mb-4">Tamper-Proof</h3>
              <p className="text-gray-400 leading-relaxed">
                Certificates on Solana blockchain cannot be altered, forged, or deleted. 
                Your achievements are permanently verified.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-black border border-green-500/30 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-quantico-bold text-green-300 mb-4">Trustless Verification</h3>
              <p className="text-gray-400 leading-relaxed">
                Anyone can verify authenticity on Solana Explorer using the wallet address—no need to trust Signum.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500/10 to-black border border-emerald-500/30 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-quantico-bold text-emerald-300 mb-4">Permanent Ownership</h3>
              <p className="text-gray-400 leading-relaxed">
                NFT certificates live in your wallet forever. Share on LinkedIn, showcase globally—your credential, your control.
              </p>
            </div>
          </div>
        </section>

        {/* Development Team */}
        <section className="mb-20 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-4xl font-quantico-bold text-center mb-12">
            <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Built By Students, For Students
            </span>
          </h2>
          
          <div className="bg-gradient-to-br from-emerald-500/5 to-black border border-emerald-500/30 rounded-2xl p-10">
            <p className="text-center text-gray-300 text-lg mb-10 max-w-3xl mx-auto leading-relaxed">
              Signum is developed by a team of Computer Science students passionate about 
              creating better learning experiences through modern technology.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Suhas B M', 'Suhas B H', 'Nischith S', 'Rohan P'].map((name, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-emerald-500/10 to-black border border-emerald-500/20 rounded-xl p-6 text-center hover-lift transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-quantico-bold text-black">
                    {name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-quantico-bold text-emerald-300 mb-1">{name}</h3>
                  <p className="text-gray-500 text-sm">Developer</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="text-center animate-slideInUp" style={{ animationDelay: '0.5s' }}>
          <div className="bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10 border border-emerald-500/30 rounded-2xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent animate-shimmer"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-quantico-bold text-gray-100 mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Join the future of verified education today.
              </p>
              <button
                onClick={() => onNavigate('dashboard')}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-8 py-4 rounded-xl font-quantico-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/30"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
          
          <div className="mt-12 text-gray-500 text-sm">
            <p>© 2025 Signum • Built with React 19, FastAPI, Solana • Powered by Gemini AI</p>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default About;
