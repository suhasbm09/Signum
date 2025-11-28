import { useState } from 'react';
import { logOut } from '../firebase/config';
import signumLogo from '../assets/Signum-logo-removebg-preview.png';

function Header({ user, onLogout, currentPage, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const result = await logOut();
      if (result.success) {
        onLogout();
      } else {
        onLogout();
      }
    } catch (error) {
      onLogout();
    }
  };

  const handleNavigate = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-glossy-header sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <img 
              src={signumLogo} 
              alt="Signum Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain brightness-110"
            />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-quantico-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Signum 
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 font-quantico-bold text-sm ${
                currentPage === 'dashboard'
                  ? 'bg-gradient-to-r from-emerald-600/30 to-green-600/30 border border-emerald-500/50 text-emerald-200'
                  : 'text-gray-300 hover:text-gray-100 hover:bg-gray-700/50 border border-transparent'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 font-quantico-bold text-sm ${
                currentPage === 'profile'
                  ? 'bg-gradient-to-r from-emerald-600/30 to-green-600/30 border border-emerald-500/50 text-emerald-200'
                  : 'text-gray-300 hover:text-gray-100 hover:bg-gray-700/50 border border-transparent'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 font-quantico-bold text-sm ${
                currentPage === 'about'
                  ? 'bg-gradient-to-r from-emerald-600/30 to-green-600/30 border border-emerald-500/50 text-emerald-200'
                  : 'text-gray-300 hover:text-gray-100 hover:bg-gray-700/50 border border-transparent'
              }`}
            >
              About
            </button>
          </nav>
          
          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile"
                  className="w-7 h-7 rounded-full border-2 border-emerald-500/50 hover:border-emerald-500 transition-all duration-300 object-cover shadow-md shadow-emerald-500/20"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.displayName || 'User') + '&background=10b981&color=fff&size=32';
                  }}
                />
              ) : (
                <div className="w-7 h-7 rounded-full border-2 border-emerald-500/50 bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <span className="text-xs font-bold text-white">
                    {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <span className="text-gray-300 font-quantico text-sm hidden lg:inline">{user?.displayName || 'User'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-gray-100 px-4 py-1.5 rounded-lg transition-all duration-300 font-quantico-bold text-sm transform hover:scale-105"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-gray-100 hover:bg-gray-700/50 transition-all duration-300"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
            <div className="fixed top-0 right-0 bottom-0 w-full max-w-[320px] bg-black border-l border-emerald-500/50 z-50 md:hidden shadow-[0_0_60px_rgba(16,185,129,0.7)]">
            <div className="flex flex-col h-full p-5 space-y-3 text-sm">
              {/* Close Button */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-quantico-bold text-emerald-300 tracking-wide">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-300 hover:text-gray-100 hover:bg-gray-700/50 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-emerald-500/20">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-emerald-500/50 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.displayName || 'User') + '&background=10b981&color=fff&size=40';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-500/50 bg-emerald-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-100 font-quantico text-sm truncate">{user?.displayName || 'User'}</p>
                  <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 space-y-2">
                  <button
                    onClick={() => handleNavigate('dashboard')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-quantico-bold text-sm border text-gray-200 ${
                      currentPage === 'dashboard'
                        ? 'bg-emerald-900 border-emerald-500/60 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                        : 'border-transparent hover:bg-emerald-900 hover:border-emerald-400 hover:text-emerald-100'
                    }`}
                  >
                    📊 Dashboard
                  </button>
                <button
                  onClick={() => handleNavigate('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-quantico-bold text-sm border text-gray-200 ${
                    currentPage === 'profile'
                      ? 'bg-emerald-900 border-emerald-500/60 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                      : 'border-transparent hover:bg-emerald-900 hover:border-emerald-400 hover:text-emerald-100'
                  }`}
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => handleNavigate('about')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-quantico-bold text-sm border text-gray-200 ${
                    currentPage === 'about'
                      ? 'bg-emerald-900 border-emerald-500/60 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                      : 'border-transparent hover:bg-emerald-900 hover:border-emerald-400 hover:text-emerald-100'
                  }`}
                >
                  ℹ️ About
                </button>
              </nav>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-gray-100 px-4 py-3 rounded-lg transition-all duration-300 font-quantico-bold text-sm mt-4"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export default Header;

