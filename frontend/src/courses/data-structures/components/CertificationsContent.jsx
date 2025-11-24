import React, { useState, useEffect } from 'react';
import { useProgress } from '../../../contexts/ProgressContext';
import progressService from '../../../services/progressService';
import { useToast } from '../../../components/Toast';
import { isBlockchainEnabled, isBlockchainTestingMode } from '../../../config/features';
import { API_BASE_URL } from '../../../config/api';
import WalletGuideModal from '../../../components/Blockchain/WalletGuideModal';
import WhyNFTSection from '../../../components/Blockchain/WhyNFTSection';

// Lazy load heavy Solana/Anchor libraries only when needed (~400KB)
const loadSolanaLibraries = async () => {
  const [anchor, web3js, buffer] = await Promise.all([
    import('@coral-xyz/anchor'),
    import('@solana/web3.js'),
    import('buffer')
  ]);
  
  // Make Buffer available globally (required for Anchor)
  if (typeof window !== 'undefined') {
    window.Buffer = buffer.Buffer;
  }
  
  return {
    anchor,
    Connection: web3js.Connection,
    PublicKey: web3js.PublicKey,
    SystemProgram: web3js.SystemProgram,
    Buffer: buffer.Buffer
  };
};

// Constants (will be initialized when libraries are loaded)
let TOKEN_PROGRAM_ID;
let ASSOCIATED_TOKEN_PROGRAM_ID;
let METADATA_PROGRAM_ID;
const NETWORK = 'https://api.devnet.solana.com';
const COMMITMENT = 'confirmed';

// IDL will be loaded dynamically
let idl = null;
const loadIDL = async () => {
  if (!idl) {
    idl = (await import('../../../signum_certificate_idl.json')).default;
  }
  return idl;
};

const CertificationsContent = ({ user }) => {
  const { getCourseCompletionPercentage, getQuizScore, isModuleCompleted, isFinalExamComplete } = useProgress();
  const { showToast, ToastContainer } = useToast();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [minting, setMinting] = useState(false);
  const [nftMinted, setNftMinted] = useState(false);
  const [nftImageUrl, setNftImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [showGuideModal, setShowGuideModal] = useState(false);

  
  // Get user ID - will be replaced with actual auth context
  const getUserId = () => {
    if (typeof window !== 'undefined' && window.currentUser) {
      return window.currentUser.uid || window.currentUser.email || 'user_123';
    }
    return 'user_123';
  };
  
  const userId = getUserId(); 
  const courseId = 'data-structures';
  
  useEffect(() => {
    const initializeComponent = async () => {
      setLoading(true);
      
      // Step 1: Check wallet connection
      await checkWalletConnection();
      
      // Step 2: Load wallet from Firebase (user profile)
      await loadWalletFromFirebase();
      
      // Step 3: CRITICAL - Load NFT status from backend FIRST
      await loadNFTStatusFromFirebase();
      
      // Step 4: Check existing certificate on blockchain (only if wallet connected)
      // This will run after NFT status is loaded
      if (walletConnected) {
        await checkExistingCertificate();
      }
      
      setLoading(false);
      
      // Step 5: Auto-show guide if no wallet detected (after 2 seconds)
      if (typeof window !== 'undefined' && !window.solana) {
        setTimeout(() => {
          setShowGuideModal(true);
        }, 2000);
      }
    };
    
    initializeComponent();
    // Note: Don't mark certifications module as complete for progress tracking
  }, [walletConnected]); // Re-run when wallet connection changes
  
  const checkExistingCertificate = async () => {
    if (typeof window !== 'undefined' && window.solana && walletConnected) {
      try {
        // Lazy load Solana libraries
        const { anchor, Connection, PublicKey, Buffer } = await loadSolanaLibraries();
        const programIDL = await loadIDL();
        
        const provider = new anchor.AnchorProvider(
          new Connection(NETWORK, COMMITMENT),
          window.solana,
          { commitment: COMMITMENT }
        );
        
        const [certificatePda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('certificate'),
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(courseId),
            Buffer.from(userId)  // Include userId
          ],
          new PublicKey(programIDL.address)
        );
        
        const certificateAccount = await provider.connection.getAccountInfo(certificatePda);
        if (certificateAccount) {
          console.log('✅ Certificate exists on blockchain at:', certificatePda.toString());
          
          // Certificate exists on blockchain, now load the image URL from Firebase
          // This ensures the certificate displays properly in both testing and production mode
          await loadNFTStatusFromFirebase();
          
          console.log('✅ Certificate data loaded from Firebase');
        }
      } catch (error) {
        console.log('ℹ️ No existing certificate found on blockchain');
      }
    }
  };
  
  const handleCloseCertificate = async () => {
    if (!walletConnected || !window.solana) {
      showToast('⚠️ Please connect your Phantom wallet first!', 'warning');
      return;
    }
    
    if (!isBlockchainTestingMode()) {
      showToast('⚠️ Enable Blockchain Testing Mode in features.js to close certificates', 'warning');
      return;
    }
    
    setMinting(true);
    showToast('🗑️ Closing existing certificate account...', 'info');
    
    try {
      // Lazy load Solana libraries
      const { anchor, Connection, PublicKey, Buffer } = await loadSolanaLibraries();
      const programIDL = await loadIDL();
      
      const provider = new anchor.AnchorProvider(
        new Connection(NETWORK, COMMITMENT),
        window.solana,
        { commitment: COMMITMENT, preflightCommitment: COMMITMENT }
      );
      anchor.setProvider(provider);
      const program = new anchor.Program(programIDL, provider);
      
      const [certificatePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('certificate'),
          provider.wallet.publicKey.toBuffer(),
          Buffer.from(courseId),
          Buffer.from(userId)  // Include userId
        ],
        new PublicKey(programIDL.address)
      );
      
      // Check if account exists on blockchain
      const certificateAccount = await provider.connection.getAccountInfo(certificatePda);
      
      if (!certificateAccount) {
        console.log('ℹ️ No certificate account found on blockchain');
        
        // Clear from Firebase anyway
        await clearNFTStatusFromFirebase();
        
        showToast('✅ Certificate cleared from database. Ready to mint!', 'success');
        setNftMinted(false);
        setNftImageUrl('');
        
        // Reload NFT status to confirm deletion
        await loadNFTStatusFromFirebase();
        setMinting(false);
        return;
      }
      
      console.log('🗑️ Closing certificate at:', certificatePda.toString());
      
      // Call close_certificate instruction
      const tx = await program.methods
        .closeCertificate()
        .accounts({
          certificate: certificatePda,
          owner: provider.wallet.publicKey,
        })
        .rpc();
      
      console.log('✅ Certificate closed on blockchain. Transaction:', tx);
      
      // Clear NFT status from Firebase
      await clearNFTStatusFromFirebase();
      
      showToast('✅ Certificate deleted from blockchain and database! You can mint again.', 'success');
      setNftMinted(false);
      setNftImageUrl('');
      
      // Reload NFT status to confirm deletion
      await loadNFTStatusFromFirebase();
      
    } catch (error) {
      console.error('❌ Error closing certificate:', error);
      
      // Handle specific errors gracefully
      if (error.message?.includes('already been processed') || 
          error.message?.includes('AccountNotFound') || 
          error.message?.includes('could not find account')) {
        
        console.log('ℹ️ Certificate already deleted or not found. Clearing from database...');
        
        // Clear from Firebase anyway
        try {
          await clearNFTStatusFromFirebase();
          showToast('✅ Certificate cleared from database. Ready to mint!', 'success');
          setNftMinted(false);
          setNftImageUrl('');
          await loadNFTStatusFromFirebase();
        } catch (dbError) {
          console.error('Error clearing from database:', dbError);
          showToast('⚠️ Cleared from blockchain but database error. Try refreshing.', 'warning');
        }
      } else {
        showToast(`❌ Failed to close certificate: ${error.message}`, 'error');
      }
    } finally {
      setMinting(false);
    }
  };
  
  const loadWalletFromFirebase = async () => {
    try {
      // Use user.token for auth and get phantomWalletAddress from profile
      if (!user?.token) return;
      const walletAddressFromProfile = await progressService.getUserWallet(user.token);
      if (walletAddressFromProfile) {
        setWalletAddress(walletAddressFromProfile);
        setWalletConnected(true);
        console.log('✅ Wallet loaded from Firebase');
      }
    } catch (error) {
      console.error('Error loading wallet from Firebase:', error);
    }
  };

  const saveWalletToFirebase = async (address) => {
    try {
      await progressService.saveUserWallet(userId, address, 'phantom');
      console.log('✅ Wallet saved to Firebase');
    } catch (error) {
      console.error('❌ Failed to save wallet to Firebase:', error);
      throw error;
    }
  };
  
  const loadNFTStatusFromFirebase = async () => {
    try {
      console.log('🔍 Loading NFT certificate status for:', userId, courseId);
      
      const response = await fetch(`${API_BASE_URL}/certification/${courseId}/status?user_id=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📡 NFT certificate data from backend:', data);
        
        // Check if the certificate is minted
        if (data.minted || data.certificate_image_url) {
          const imageUrl = data.certificate_image_url || '';
          
          console.log('✅ NFT certificate found! Setting state...');
          console.log('   Image URL:', imageUrl);
          console.log('   Minted:', data.minted);
          
          // CRITICAL: Set both state variables
          setNftMinted(true);
          setNftImageUrl(imageUrl);
          
          console.log('✅ NFT state updated: nftMinted=true, nftImageUrl=', imageUrl);
        } else {
          console.log('ℹ️ No NFT certificate minted yet');
          setNftMinted(false);
          setNftImageUrl('');
        }
      } else {
        console.log('ℹ️ No NFT certificate found in database (404 or error)');
        setNftMinted(false);
        setNftImageUrl('');
      }
    } catch (error) {
      console.error('❌ Error loading NFT certificate:', error);
      // Don't change state on error - keep existing state
    }
  };

  const saveNFTStatusToFirebase = async (imageUrl, transactionSignature, mintAddress) => {
    try {
      console.log('💾 Saving NFT certificate to backend...');
      console.log('   User ID:', userId);
      console.log('   Course ID:', courseId);
      console.log('   Image URL:', imageUrl);
      console.log('   Transaction:', transactionSignature);
      console.log('   Mint Address:', mintAddress);
      
      const response = await fetch(`${API_BASE_URL}/certification/${courseId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
          certificate_image_url: imageUrl,
          transaction_signature: transactionSignature,
          mint_address: mintAddress,
          minted_at: new Date().toISOString(),
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ NFT certificate status saved to backend:', result);
        
        // CRITICAL: Immediately update frontend state after saving
        setNftMinted(true);
        setNftImageUrl(imageUrl);
        
        console.log('✅ Frontend state updated: nftMinted=true, imageUrl=', imageUrl);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to save NFT status. Response:', errorText);
      }
    } catch (error) {
      console.error('❌ Error saving NFT status:', error);
    }
  };

  const clearNFTStatusFromFirebase = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/certification/${courseId}/delete?user_id=${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        console.log('✅ NFT certificate status cleared');
      }
    } catch (error) {
      console.error('❌ Error clearing NFT status:', error);
    }
  };

  const copyShareLink = async () => {
    const shareUrl = 'https://signum-learn.vercel.app/courses/data-structures';
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('✅ Certificate link copied to clipboard!', 'success');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('✅ Certificate link copied to clipboard!', 'success');
    }
  };
  
  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.solana) {
      try {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        if (response.publicKey) {
          const address = response.publicKey.toString();
          setWalletConnected(true);
          setWalletAddress(address);
        }
      } catch (error) {
        setWalletConnected(false);
      }
    }
  };

  const connectPhantomWallet = async () => {
    if (typeof window !== 'undefined' && window.solana) {
      try {
        const response = await window.solana.connect();
        const address = response.publicKey.toString();
        
        setWalletConnected(true);
        setWalletAddress(address);
        
        // Save to Firebase ONLY (no localStorage)
        await saveWalletToFirebase(address);
        
        console.log('Wallet connected:', address);
        showToast('✅ Phantom wallet connected and saved!', 'success');
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        showToast('❌ Failed to connect Phantom wallet. Please try again.', 'error');
      }
    } else {
      showToast('⚠️ Phantom wallet not detected. Redirecting to installation...', 'info');
      window.open('https://phantom.app/', '_blank');
    }
  };
  
  const handleMintNFT = async () => {
    // Check if blockchain feature is enabled
    if (!isBlockchainEnabled()) {
      showToast('🔒 NFT minting is currently disabled. This feature will be available soon!', 'warning');
      return;
    }

    if (!isEligible) {
      showToast('⚠️ Please complete all requirements first', 'warning');
      return;
    }

    if (!walletConnected || !window.solana) {
      // Show guide modal if wallet not detected
      setShowGuideModal(true);
      showToast('👛 Please set up your Phantom wallet first!', 'info');
      return;
    }
    
    setMinting(true);
    showToast('🎨 Generating certificate metadata...', 'info');
    
    try {
      // Lazy load Solana libraries
      const { anchor, Connection, PublicKey, Buffer } = await loadSolanaLibraries();
      const programIDL = await loadIDL();
      
      // Initialize constants if not already done
      if (!TOKEN_PROGRAM_ID) {
        TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
        ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
        METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
      }
      
      // Setup Anchor provider
      const provider = new anchor.AnchorProvider(
        new Connection(NETWORK, COMMITMENT),
        window.solana,
        { commitment: COMMITMENT, preflightCommitment: COMMITMENT }
      );
      anchor.setProvider(provider);
      
      // Load program
      const program = new anchor.Program(programIDL, provider);
      
      // Generate new mint keypair each time to avoid duplicate transaction errors
      const mint = anchor.web3.Keypair.generate();
      
      // Add a small random delay to ensure unique transaction
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      
      // Derive associated token account address (more reliable than getAssociatedTokenAddress)
      const [tokenAccount] = PublicKey.findProgramAddressSync(
        [
          provider.wallet.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer()
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      
      // Derive metadata PDA
      const [metadataPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          METADATA_PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer()
        ],
        METADATA_PROGRAM_ID
      );
      
      // Derive master edition PDA
      const [masterEditionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          METADATA_PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer(),
          Buffer.from('edition')
        ],
        METADATA_PROGRAM_ID
      );
      
      // Derive certificate PDA - Using wallet + courseId + userId for uniqueness
      const [certificatePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('certificate'),
          provider.wallet.publicKey.toBuffer(),
          Buffer.from(courseId),
          Buffer.from(userId)  // Add userId to make it unique per user
        ],
        program.programId
      );
      
      console.log('🔑 Mint:', mint.publicKey.toString());
      console.log('📜 Certificate PDA:', certificatePda.toString());
      
      // Check if certificate already exists (skip in testing mode)
      if (!isBlockchainTestingMode()) {
        const certificateAccount = await provider.connection.getAccountInfo(certificatePda);
        if (certificateAccount) {
          // Certificate already exists for this wallet+course+user
          showToast('✅ Certificate NFT already minted for this course!', 'success');
          setNftMinted(true);
          setMinting(false);
          return;
        }
      } else {
        console.log('🧪 Testing mode enabled - skipping duplicate check');
      }
      
      showToast('📡 Requesting metadata from backend...', 'info');
      
            // Get metadata from backend
      const metadataResponse = await fetch(`${API_BASE_URL}/certification/${courseId}/mint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          wallet_address: provider.wallet.publicKey.toString(),
          user_name: user?.displayName || 'Student'
        })
      });
      
      if (!metadataResponse.ok) {
        throw new Error('Failed to generate metadata');
      }
      
      const metadataData = await metadataResponse.json();
      console.log('📦 Metadata response from backend:', metadataData);
      
      const { metadata, metadata_uri, final_score, image_uri } = metadataData.data;
      
      console.log('🖼️ Certificate image URL:', image_uri || metadata.image);
      
      // Ensure quiz_score and completion are integers (u8)
      const quizScoreInt = Math.round(metadataData.data.quiz_score || 0);
      const completionInt = Math.round(metadataData.data.completion_percentage || 0);
      
      console.log('📊 Minting with params:', {
        courseId,
        userId,
        quizScore: quizScoreInt,
        completion: completionInt,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata_uri
      });
      
      // Verify minimum requirements
      if (quizScoreInt < 85) {
        throw new Error(`Quiz score too low: ${quizScoreInt} (need 85+)`);
      }
      if (completionInt < 90) {
        throw new Error(`Completion too low: ${completionInt} (need 90+)`);
      }
      
      showToast('⛓️ Minting NFT on Solana blockchain...', 'info');
      
      // Log all accounts for debugging
      console.log('📋 Accounts:', {
        certificate: certificatePda.toString(),
        mint: mint.publicKey.toString(),
        tokenAccount: tokenAccount.toString(),
        metadata: metadataPda.toString(),
        masterEdition: masterEditionPda.toString(),
        recipient: provider.wallet.publicKey.toString(),
      });
      
      // Call mint_certificate instruction (Anchor converts to mintCertificate)
      const tx = await program.methods
        .mintCertificate(
          courseId,
          userId,
          quizScoreInt,  // Must be u8 integer >= 85
          completionInt, // Must be u8 integer >= 90
          metadata.name,
          metadata.symbol,
          metadata_uri
        )
        .accounts({
          certificate: certificatePda,
          mint: mint.publicKey,
          tokenAccount: tokenAccount,
          metadata: metadataPda,
          masterEdition: masterEditionPda,
          recipient: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenMetadataProgram: METADATA_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY
        })
        .signers([mint])
        .rpc();
      
      console.log('✅ Transaction:', tx);
      console.log('🎉 Mint Address:', mint.publicKey.toString());
      
      // Use image_uri from backend response (preferred) or fallback to metadata.image
      const certificateImageUrl = image_uri || metadata.image;
      console.log('💾 Certificate image URL to save:', certificateImageUrl);
      
      // CRITICAL: Save to Firebase FIRST, then update state
      await saveNFTStatusToFirebase(certificateImageUrl, tx, mint.publicKey.toString());
      
      // The saveNFTStatusToFirebase function now updates the state automatically
      // So we don't need to set it here again
      
      // Wait a moment to ensure backend has saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reload NFT status from Firebase to confirm it was saved correctly
      await loadNFTStatusFromFirebase();
      
      showToast('🎉 NFT Certificate minted successfully! Check your Phantom wallet.', 'success');
      
    } catch (error) {
      console.error('Error minting NFT:', error);
      
      // Log transaction details if available
      if (error.logs) {
        console.error('Transaction logs:', error.logs);
      }
      if (error.transactionLogs) {
        console.error('Transaction logs:', error.transactionLogs);
      }
      
      // Parse specific error codes
      let errorMessage = '❌ Error minting NFT certificate. ';
      
      // Check for duplicate transaction error
      if (error.message?.includes('already been processed') || error.message?.includes('duplicate')) {
        errorMessage = '✅ Transaction already completed. Your NFT should be in your wallet.';
        showToast(errorMessage, 'success');
        
        // Try to mark as minted
        setNftMinted(true);
        
        // Try to reload the NFT status from Firebase
        setTimeout(() => {
          loadNFTStatusFromFirebase();
        }, 1000);
        
        setMinting(false);
        return;
      }
      
      if (error.message?.includes('0x0') || error.message?.includes('6000')) {
        errorMessage += 'Quiz score requirement not met (need 85%+).';
      } else if (error.message?.includes('0x1') || error.message?.includes('6001')) {
        errorMessage += 'Course completion requirement not met (need 90%+).';
      } else if (error.message?.includes('0x2') || error.message?.includes('6002')) {
        errorMessage += 'Certificate has been revoked.';
      } else if (error.message?.includes('Not eligible')) {
        errorMessage += 'You are not eligible for certification yet.';
      } else if (error.message?.includes('wallet')) {
        errorMessage += 'Wallet error. Please reconnect your Phantom wallet.';
      } else if (error.message?.includes('insufficient')) {
        errorMessage += 'Insufficient SOL for transaction. Please add SOL to your wallet.';
      } else {
        errorMessage += 'Please try again or check the console for details.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setMinting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-400 text-lg">Loading certification status...</div>
      </div>
    );
  }

  // Get current progress data
  const courseCompletion = getCourseCompletionPercentage(courseId); // This now includes final exam
  const quizScore = getQuizScore(courseId);
  const codingCompleted = isModuleCompleted(courseId, 'coding-challenge');
  const finalExamComplete = isFinalExamComplete(courseId);
  
  // Eligibility: 90% or higher overall + final exam complete
  const isEligible = courseCompletion >= 90 && finalExamComplete;
  
  return (
    <div className="w-full mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-quantico-bold text-gray-100 mb-4">
          🏆 Certification & NFT
        </h2>
        <p className="text-gray-400 text-lg">
          Complete the course and mint your achievement NFT
        </p>
      </div>

      {/* Why NFT Certificates Matter Section */}
      <WhyNFTSection />

      {/* Single Unified Progress & Certification Window */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl p-8">
        <h3 className="text-2xl font-quantico-bold text-emerald-300 mb-6 text-center">
          📊 Certification Requirements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Overall Progress */}
          <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-6">
            <h4 className="text-lg font-quantico-bold text-gray-100 mb-4">Overall Progress</h4>
            <div className="text-center mb-4">
              <div className="text-4xl font-quantico-bold text-emerald-300 mb-2">
                {Math.round(courseCompletion)}%
              </div>
              <div className="text-gray-300 text-sm">Course Completion</div>
            </div>
            <div className="w-full bg-black/40 rounded-full h-3 mb-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-green-400 h-3 rounded-full transition-all duration-500 shadow-lg shadow-emerald-500/50"
                style={{ width: `${courseCompletion}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 text-center">
              {courseCompletion === 100 ? '✅ Complete' : `${100 - Math.round(courseCompletion)}% remaining`}
            </div>
          </div>

          {/* Quiz Results */}
          <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-6">
            <h4 className="text-lg font-quantico-bold text-gray-100 mb-4">Quiz Score</h4>
            {quizScore ? (
              <div className="text-center">
                <div className={`text-4xl font-quantico-bold mb-2 ${quizScore.score >= 85 ? 'text-emerald-300' : 'text-yellow-400'}`}>
                  {Math.round(quizScore.score)}%
                </div>
                <div className="text-gray-300 text-sm mb-3">Final Exam (50%)</div>
                <div className={`text-xs px-3 py-1 rounded-full border ${
                  quizScore.score >= 85 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                }`}>
                  {quizScore.score >= 85 ? '✅ Passed' : 'Need 85%'}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-2xl mb-2">📝</div>
                <div className="text-sm">Not attempted</div>
                <div className="text-xs mt-2">Complete quiz first</div>
              </div>
            )}
          </div>

          {/* Coding Challenge */}
          <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-6">
            <h4 className="text-lg font-quantico-bold text-gray-100 mb-4">Coding Challenge</h4>
            <div className="text-center">
              <div className={`text-4xl mb-2 ${codingCompleted ? 'text-emerald-300' : 'text-gray-500'}`}>
                {codingCompleted ? '✅' : '🔒'}
              </div>
              <div className="text-gray-300 text-sm mb-3">Final Exam (50%)</div>
              <div className={`text-xs px-3 py-1 rounded-full border ${
                codingCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/40'
              }`}>
                {codingCompleted ? '✅ Complete' : 'Not complete'}
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Status */}
        <div className="text-center mb-8">
          <div className={`inline-block px-6 py-3 rounded-xl border ${
            isEligible 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
              : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
          }`}>
            <div className="font-quantico-bold">
              {isEligible ? '🎉 NFT Mint Eligible!' : '⏳ Complete All Requirements'}
            </div>
            <div className="text-xs mt-1">
              {isEligible 
                ? 'All requirements met - ready to mint your certificate!' 
                : 'Complete all modules (100%) + quiz (85%+) + coding challenge'
              }
            </div>
          </div>
        </div>

        {/* Phantom Wallet Section */}
        <div className="bg-black/30 border border-purple-500/20 rounded-xl p-6 mb-6">
          <h4 className="text-lg font-quantico-bold text-gray-100 mb-4 flex items-center">
            <span className="mr-2">👛</span>
            Phantom Wallet Connection
          </h4>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className={`font-quantico-bold mb-1 ${walletConnected ? 'text-emerald-400' : 'text-gray-400'}`}>
                Status: {walletConnected ? 'Connected' : 'Not Connected'}
              </div>
              {walletAddress && (
                <div className="text-xs text-gray-400 font-mono">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {walletConnected 
                  ? '✅ Ready for NFT minting' 
                  : '⚠️ Connect wallet to mint NFTs'
                }
              </div>
            </div>
            
            <button
              onClick={connectPhantomWallet}
              disabled={walletConnected}
              className={`font-quantico-bold py-2 px-4 rounded-lg transition-all duration-300 ${
                walletConnected 
                  ? 'bg-emerald-600 text-gray-100 cursor-default opacity-50' 
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-gray-100'
              }`}
            >
              {walletConnected ? '✓ Connected' : 'Connect Phantom'}
            </button>
          </div>
        </div>

{/* Testing Mode Controls (only when blockchain enabled) */}
        {isBlockchainEnabled() && isBlockchainTestingMode() && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-lg font-quantico-bold text-yellow-300 mb-1">
                  🧪 Blockchain Testing Mode Active
                </h4>
                <p className="text-xs text-gray-400">
                  You can delete and re-mint certificates for testing
                </p>
              </div>
              <div className="px-4 py-2 rounded-lg font-quantico-bold bg-yellow-500 text-black">
                ✓ Enabled
              </div>
            </div>
            
            <div className="bg-black/30 border border-yellow-500/20 rounded-lg p-3 mt-3">
              <p className="text-yellow-400 text-xs mb-3">
                ⚠️ <strong>Testing Mode:</strong> Delete and re-mint as many times as you want
              </p>
              
              {/* Delete Certificate Button */}
              <button
                onClick={handleCloseCertificate}
                disabled={minting || !walletConnected}
                className={`w-full py-2 px-4 rounded-lg font-quantico-bold transition-all duration-300 ${
                  minting || !walletConnected
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {minting ? '⏳ Processing...' : '🗑️ Delete Existing Certificate'}
              </button>
              
              <p className="text-xs text-gray-500 mt-2">
                This will close the certificate PDA and return rent to your wallet
              </p>
              
              <div className="mt-3 pt-3 border-t border-yellow-500/20">
                <p className="text-xs text-gray-400">
                  💡 To disable testing mode: Set <code className="bg-black/50 px-1 rounded text-yellow-400">BLOCKCHAIN_TESTING_MODE = false</code> in <code className="bg-black/50 px-1 rounded">frontend/src/config/features.js</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* NFT Minting Section */}
        <div className="text-center">
          <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-6">
            <h4 className="text-lg font-quantico-bold text-gray-100 mb-4">
              🎭 Mint Your Achievement NFT
            </h4>
            
            {nftMinted ? (
              <div className="space-y-4">
                <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-4 mb-4">
                  <div className="text-emerald-400 font-quantico-bold mb-2">
                    🎉 NFT Successfully Minted!
                  </div>
                  <div className="text-gray-300 text-sm mb-4">
                    Your Data Structures completion certificate has been minted to your wallet
                  </div>
                  
                  {/* NFT Preview */}
                  <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-4">
                    <div className="text-center mb-3">
                      <div className="text-emerald-300 font-quantico-bold text-sm mb-2">
                        🖼️ Your NFT Certificate
                      </div>
                    </div>
                    
                    {/* Display actual certificate image if available */}
                    {nftImageUrl ? (
                      <div className="max-w-2xl mx-auto mb-4">
                        <img 
                          src={nftImageUrl} 
                          alt="Data Structures Certificate NFT" 
                          className="w-full h-auto rounded-lg border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/20"
                          onError={(e) => {
                            console.error('Failed to load certificate image');
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="mt-3 text-xs text-gray-400 text-center">
                          ✅ Full wallet address displayed for blockchain verification
                        </div>
                      </div>
                    ) : (
                      /* Fallback NFT Card Mock */
                      <div className="bg-gradient-to-br from-emerald-900/50 to-green-900/50 border-2 border-emerald-500/40 rounded-xl p-6 max-w-md mx-auto">
                        <div className="text-center">
                          <div className="text-5xl mb-4">🎓</div>
                          <h3 className="text-xl font-quantico-bold text-emerald-300 mb-2">
                            Data Structures Mastery
                          </h3>
                          <div className="text-gray-300 text-sm mb-3">
                            Completion Certificate
                          </div>
                          <div className="bg-black/40 rounded-lg p-3 mb-3">
                            <div className="text-xs text-gray-400 mb-1">Score</div>
                            <div className="text-2xl font-quantico-bold text-emerald-400">
                              {quizScore?.score}%
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            Token ID: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 space-y-3">
                      {/* View in Phantom Wallet */}
                      <div className="text-center">
                        <a 
                          href={`https://phantom.app/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
                        >
                          👛 View in Phantom Wallet
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>

                      {/* Share on Social Media */}
                      <div className="border-t border-emerald-500/20 pt-3">
                        <div className="text-xs text-gray-400 text-center mb-2">
                          Share Your Achievement
                        </div>
                        <div className="flex gap-2 justify-center">
                          {/* LinkedIn Share */}
                          <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://signum-learn.vercel.app/courses/data-structures')}&title=${encodeURIComponent('Data Structures Mastery Certificate')}&summary=${encodeURIComponent('I just earned my blockchain-verified NFT certificate on Signum with a score of ' + (getQuizScore('data-structures')?.score || 100) + '%!')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 hover:text-blue-300 px-3 py-2 rounded-lg text-sm transition-all"
                            title="Share on LinkedIn"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                            LinkedIn
                          </a>

                          {/* X (Twitter) Share */}
                          <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('🎉 I just earned my Data Structures Mastery NFT Certificate on Signum!\n\n🎓 Score: ' + (getQuizScore('data-structures')?.score || 100) + '%\n⛓️ Verified on Solana Blockchain\n\nLearn and earn blockchain certificates! 🚀')}&url=${encodeURIComponent('https://signum-learn.vercel.app')}&hashtags=Signum,Web3,Blockchain,NFT,Education`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/40 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-all"
                            title="Share on X (Twitter)"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            X
                          </a>

                          {/* Copy Link */}
                          <button
                            onClick={copyShareLink}
                            className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 px-3 py-2 rounded-lg text-sm transition-all"
                            title="Copy certificate link"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <div className="text-gray-300 text-sm mb-4">
                  Mint a unique NFT certificate to commemorate your achievement in mastering Data Structures
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  {/* Guide Button */}
                  <button
                    onClick={() => setShowGuideModal(true)}
                    className="font-quantico-bold py-3 px-6 rounded-xl bg-black/40 hover:bg-black/60 border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-300 hover:text-emerald-200 transition-all duration-300 flex items-center gap-2"
                  >
                    <span>📘</span>
                    <span>How to Mint NFT</span>
                  </button>
                  
                  {/* Mint Button */}
                  <button
                    onClick={handleMintNFT}
                    disabled={!isEligible || !walletConnected || minting || !isBlockchainEnabled()}
                    className={`font-quantico-bold py-3 px-8 rounded-xl transition-all duration-300 ${
                      isEligible && walletConnected && !minting && isBlockchainEnabled()
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black shadow-lg shadow-yellow-500/25'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {minting 
                      ? '⏳ Minting NFT...' 
                      : !isBlockchainEnabled()
                        ? '🔒 Minting Disabled'
                        : !isEligible 
                        ? '🔒 Complete Requirements First'
                        : !walletConnected 
                          ? '👛 Connect Wallet First'
                          : '🚀 Mint Achievement NFT'
                    }
                  </button>
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-4">
              <div className="mb-2">💡 <strong>Note:</strong> Make sure to connect your Phantom wallet before minting</div>
              <div>🔗 Your NFT will be minted on the Solana blockchain</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wallet Setup Guide Modal */}
      {showGuideModal && (
        <WalletGuideModal onClose={() => setShowGuideModal(false)} />
      )}
      
      <ToastContainer />
    </div>
  );
};

export default CertificationsContent;