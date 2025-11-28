import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/auth/verify-firebase-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // CRITICAL: Send and receive cookies
      body: JSON.stringify({ idToken })
    });
    
    if (response.ok) {
      const userData = await response.json();
      // No need to store anything - httpOnly cookie is set automatically
      return { success: true, user: userData.user };
    } else {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Backend authentication failed');
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    
    await fetch(`${backendUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include'  // Send cookie for logout
    });
    
    // Cookie is cleared by backend automatically
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default app;
