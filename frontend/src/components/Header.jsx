import { logOut } from '../firebase/config';
import signumLogo from '../assets/Signum-logo-removebg-preview.png';

function Header({ user, onLogout, currentPage, onNavigate }) {
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

  return (
    <header className="bg-glossy-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4.5">
          <div className="flex items-center space-x-4">
            <img 
              src={signumLogo} 
              alt="Signum Logo" 
              className="w-10 h-10 object-contain brightness-110"
            />
            <h1 className="text-xl font-quantico-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Signum 
            </h1>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 font-quantico-bold text-sm ${
                currentPage === 'dashboard'
                  ? 'btn-primary text-gray-100'
                  : 'text-gray-300 hover:text-gray-100 hover:bg-gray-700/50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 font-quantico-bold text-sm ${
                currentPage === 'profile'
                  ? 'btn-primary text-gray-100'
                  : 'text-gray-300 hover:text-gray-100 hover:bg-gray-700/50'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 font-quantico-bold text-sm ${
                currentPage === 'about'
                  ? 'btn-primary text-gray-100'
                  : 'text-gray-300 hover:text-gray-100 hover:bg-gray-700/50'
              }`}
            >
              About
            </button>
          </nav>
          
          <div className="flex items-center space-x-4">
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
              <span className="text-gray-300 font-quantico text-sm">{user?.displayName || 'User'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-gray-100 px-4 py-1.5 rounded-lg transition-all duration-300 font-quantico-bold text-sm transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
