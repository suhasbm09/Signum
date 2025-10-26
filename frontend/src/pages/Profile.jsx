import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useToast } from '../components/Toast';

function Profile({ user, onLogout, onNavigate, onUserUpdate }) {
  const { showToast, ToastContainer } = useToast();
  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: '',
    interests: [],
    phantomWalletAddress: '',
    preferredLanguage: 'en',
    timezone: 'UTC'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    fetchProfile();
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.solana) {
      try {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        if (response.publicKey) {
          setWalletConnected(true);
          setWalletAddress(response.publicKey.toString());
          setProfile(prev => ({
            ...prev,
            phantomWalletAddress: response.publicKey.toString()
          }));
        }
      } catch (error) {
        setWalletConnected(false);
      }
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/auth/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setProfile(prev => ({
          ...prev,
          ...userData.user,
          bio: userData.user.profile?.bio || '',
          interests: userData.user.profile?.interests || [],
          preferredLanguage: userData.user.profile?.preferredLanguage || 'en',
          timezone: userData.user.profile?.timezone || 'UTC'
        }));
        
        // Set wallet info if available from database
        if (userData.user.phantomWalletAddress) {
          setWalletAddress(userData.user.phantomWalletAddress);
          setWalletConnected(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:8000/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          displayName: profile.displayName,
          bio: profile.bio,
          interests: profile.interests,
          preferredLanguage: profile.preferredLanguage,
          timezone: profile.timezone,
          phantomWalletAddress: profile.phantomWalletAddress
        })
      });

      if (response.ok) {
        setIsEditing(false);
        // Refresh profile data to get updated info
        await fetchProfile();
        // Notify parent component to update user data
        if (onUserUpdate) {
          const updatedResponse = await fetch('http://localhost:8000/auth/me', {
            credentials: 'include',
          });
          if (updatedResponse.ok) {
            const updatedUserData = await updatedResponse.json();
            onUserUpdate(updatedUserData.user);
          }
        }
        showToast('✅ Profile updated successfully!', 'success');
      } else {
        showToast('❌ Failed to update profile. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('❌ Error updating profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const connectPhantomWallet = async () => {
    if (typeof window !== 'undefined' && window.solana) {
      try {
        const response = await window.solana.connect();
        if (response.publicKey) {
          const address = response.publicKey.toString();
          setWalletConnected(true);
          setWalletAddress(address);
          setProfile(prev => ({
            ...prev,
            phantomWalletAddress: address
          }));
          
          // Save wallet address to backend (users collection only)
          try {
            const response = await fetch('http://localhost:8000/auth/phantom-wallet', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                walletAddress: address
              })
            });
            
            if (!response.ok) {
              throw new Error('Failed to save wallet address');
            }
            
            showToast('✅ Phantom wallet connected and saved!', 'success');
          } catch (error) {
            console.error('Error saving wallet address:', error);
            showToast('⚠️ Wallet connected but save failed. Please try again.', 'error');
          }
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        showToast('Failed to connect Phantom wallet. Please try again.', 'error');
      }
    } else {
      showToast('Phantom wallet not detected. Installing...', 'info');
      window.open('https://phantom.app/', '_blank');
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setProfile(prev => ({
      ...prev,
      phantomWalletAddress: ''
    }));
    
    if (window.solana && window.solana.disconnect) {
      window.solana.disconnect();
    }
    
    showToast('Wallet disconnected successfully!', 'success');
  };

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (index) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const deleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch('http://localhost:8000/auth/account', {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          showToast('✅ Account deleted successfully', 'success');
          setTimeout(() => onLogout(), 2000); // Wait for toast to show
        } else {
          showToast('❌ Failed to delete account. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        showToast('❌ Error deleting account. Please check your connection.', 'error');
      }
    }
  };

  return (
    <Layout user={user} onLogout={onLogout} currentPage="profile" onNavigate={onNavigate}>
      <ToastContainer />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-glossy-black-ultra backdrop-blur-xl border-3 border-green-400 rounded-xl p-8 shadow-2xl ring-1 ring-green-600/30">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-quantico-bold text-gray-100">Profile Management</h1>
            <div className="space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-gray-100 px-4 py-2 rounded-lg transition-colors font-quantico-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary text-gray-100 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 font-quantico-bold"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary text-gray-100 px-4 py-2 rounded-lg transition-colors font-quantico-bold"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture & Basic Info */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-emerald-500/50 shadow-lg shadow-emerald-500/20 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.displayName || 'User') + '&background=10b981&color=fff&size=128';
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-emerald-500/50 bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <span className="text-4xl font-bold text-white">
                        {profile.displayName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-100">{profile.displayName}</h2>
                <p className="text-gray-400">{profile.email}</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-quantico-bold text-gray-100 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-quantico">Display Name</label>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter your preferred display name"
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 disabled:opacity-50 focus-green font-quantico transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500 mt-1 font-quantico">This name will appear on certificates and NFTs</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-quantico">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 disabled:opacity-50 focus-green font-quantico transition-all duration-200"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div>
                <h3 className="text-lg font-quantico-bold text-gray-100 mb-4">Interests</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-sm flex items-center font-quantico"
                    >
                      {interest}
                      {isEditing && (
                        <button
                          onClick={() => removeInterest(index)}
                          className="ml-2 text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add interest..."
                      className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus-green font-quantico transition-all duration-200"
                      onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    />
                    <button
                      onClick={addInterest}
                      className="btn-primary text-gray-100 px-4 py-2 rounded-lg font-quantico-bold"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Phantom Wallet */}
              <div>
                <h3 className="text-lg font-quantico-bold text-gray-100 mb-4 flex items-center">
                  <span className="mr-3">👛</span>
                  Phantom Wallet (Solana)
                </h3>
                
                {walletConnected ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-emerald-300 font-quantico-bold mb-1">✓ Wallet Connected</h4>
                        <p className="text-gray-300 text-sm font-quantico">Ready for NFT minting and blockchain features</p>
                      </div>
                      <button
                        onClick={disconnectWallet}
                        className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 px-4 py-2 rounded-lg font-quantico-bold text-sm transition-all duration-300"
                      >
                        Disconnect
                      </button>
                    </div>
                    <div className="bg-black/40 rounded-lg p-3">
                      <p className="text-gray-400 text-xs font-quantico mb-1">Wallet Address:</p>
                      <p className="text-gray-100 font-mono text-sm break-all">{walletAddress}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-gray-300 font-quantico-bold mb-1">Connect Your Phantom Wallet</h4>
                        <p className="text-gray-400 text-sm font-quantico">Required for NFT certificates and blockchain features</p>
                      </div>
                      <button
                        onClick={connectPhantomWallet}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-gray-100 px-6 py-2 rounded-lg font-quantico-bold transition-all duration-300"
                      >
                        Connect Phantom
                      </button>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <span className="text-yellow-400 text-sm">💡</span>
                        <div>
                          <p className="text-yellow-300 text-sm font-quantico-bold">Important:</p>
                          <p className="text-gray-300 text-xs font-quantico">
                            You'll need a connected wallet to mint NFT certificates when you complete courses with 85%+ quiz scores.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-quantico-bold text-gray-100 mb-4">Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-quantico">Language</label>
                    <select
                      value={profile.preferredLanguage}
                      onChange={(e) => setProfile(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 disabled:opacity-50 focus-green font-quantico transition-all duration-200"
                    >
                      <option value="en">English</option>
                      <option value="kn">ಕನ್ನಡ (Kannada)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-quantico">Timezone</label>
                    <select
                      value={profile.timezone}
                      onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 disabled:opacity-50 focus-green font-quantico transition-all duration-200"
                    >
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="Asia/Kolkata">IST (Indian Standard Time)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border-t border-red-500/20 pt-6">
                <h3 className="text-lg font-quantico-bold text-red-400 mb-4">Danger Zone</h3>
                <button
                  onClick={deleteAccount}
                  className="bg-red-600 hover:bg-red-700 text-gray-100 px-4 py-2 rounded-lg transition-colors font-quantico-bold"
                >
                  Delete Account
                </button>
                <p className="text-gray-400 text-sm mt-2 font-quantico">
                  This action cannot be undone. Your account will be permanently deleted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;
