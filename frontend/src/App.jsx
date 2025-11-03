import { useState, useEffect, useRef } from 'react';
import './index.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import About from './pages/About';
import CourseContent from './pages/CourseContent';
import QuizPage from './pages/QuizPage';
import CodingChallengePage from './pages/CodingChallengePage';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { ProgressProvider, setGlobalToast } from './contexts/ProgressContext';
import { AIProvider } from './contexts/AIContext';
import AIAssistant from './components/AI/AIAssistant';
import { useToast } from './components/Toast';
import { API_BASE_URL } from './config/api';

function App() {
  const { showToast, ToastContainer } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Set global toast for ProgressContext to use
  useEffect(() => {
    setGlobalToast(showToast);
  }, [showToast]);
  
  // Restore navigation state from sessionStorage on mount (survives page refresh)
  const savedState = typeof window !== 'undefined' ? sessionStorage.getItem('appState') : null;
  const initialState = savedState ? JSON.parse(savedState) : { page: 'dashboard', course: null, topic: null };
  
  const [currentPage, setCurrentPage] = useState(initialState.page);
  const [selectedCourse, setSelectedCourse] = useState(initialState.course);
  const [selectedTopic, setSelectedTopic] = useState(initialState.topic);
  const [enrollments, setEnrollments] = useState([]);
  const [enrolling, setEnrolling] = useState(false);
  const historyInitializedRef = useRef(false);
  
  // Save navigation state to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('appState', JSON.stringify({
        page: currentPage,
        course: selectedCourse,
        topic: selectedTopic
      }));
    }
  }, [currentPage, selectedCourse, selectedTopic]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            credentials: 'include',
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
            setEnrollments(userData.user?.coursesEnrolled || []);
            
            // Set window.currentUser for ProgressContext to access
            if (typeof window !== 'undefined') {
              window.currentUser = {
                uid: userData.user.uid || userData.user.id,
                email: userData.user.email,
                displayName: userData.user.displayName
              };
              
              if (!historyInitializedRef.current) {
                window.history.replaceState({ page: 'dashboard' }, '', window.location.pathname);
                historyInitializedRef.current = true;
              }
            }
          } else {
            setUser(null);
            setEnrollments([]);
            if (typeof window !== 'undefined') {
              window.currentUser = null;
            }
          }
        } catch (error) {
          setUser(null);
          setEnrollments([]);
          if (typeof window !== 'undefined') {
            window.currentUser = null;
          }
        }
      } else {
        setUser(null);
        setEnrollments([]);
        if (typeof window !== 'undefined') {
          window.currentUser = null;
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.coursesEnrolled) {
      setEnrollments(user.coursesEnrolled);
    }
  }, [user?.coursesEnrolled]);

  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state;
      if (state?.page) {
        setCurrentPage(state.page);
        setSelectedCourse(state.courseId ?? null);
        setSelectedTopic(state.topic ?? null);
      } else {
        setCurrentPage('dashboard');
        setSelectedCourse(null);
        setSelectedTopic(null);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handlePopState);
      }
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setEnrollments(userData?.coursesEnrolled || []);
    
    // Set window.currentUser for ProgressContext to access
    if (typeof window !== 'undefined') {
      window.currentUser = {
        uid: userData.uid || userData.id,
        email: userData.email,
        displayName: userData.displayName
      };
      window.history.replaceState({ page: 'dashboard' }, '', window.location.pathname);
      historyInitializedRef.current = true;
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
    setSelectedCourse(null);
    setSelectedTopic(null);
    setEnrollments([]);
    historyInitializedRef.current = false;
    if (typeof window !== 'undefined') {
      window.currentUser = null; // Clear window.currentUser
      sessionStorage.removeItem('appState'); // Clear saved state
      window.history.replaceState({ page: 'login' }, '', window.location.pathname);
    }
  };

  const handleNavigation = (page, options = {}) => {
    const targetCourse = options.courseId ?? null;
    const targetTopic = options.topic ?? null;
    const targetContentType = options.contentType ?? null;
    
    // Handle content navigation - set topic for specific content
    if (page === 'content' && targetContentType) {
      setCurrentPage('course');
      setSelectedCourse(targetCourse);
      setSelectedTopic(targetContentType);
    } else if (page === 'course-content' && targetTopic) {
      setCurrentPage('course');
      setSelectedCourse(targetCourse);
      setSelectedTopic(targetTopic);
    } else {
      if (page === currentPage && targetCourse === selectedCourse && !targetTopic) {
        return;
      }
      setCurrentPage(page);
      setSelectedCourse(targetCourse);
      setSelectedTopic(targetTopic);
    }
    
    if (typeof window !== 'undefined') {
      window.history.pushState({ 
        page: page === 'content' ? 'course' : page, 
        courseId: targetCourse,
        topic: targetTopic || targetContentType
      }, '', window.location.pathname);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleCourseStart = (courseId) => {
    handleNavigation('course', { courseId });
  };

  const handleCourseEnroll = async (courseId) => {
    if (enrollments.includes(courseId)) {
      showToast('✅ Already enrolled in this course!', 'info');
      return;
    }
    
    setEnrolling(true);
    showToast('📝 Enrolling in course...', 'info');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/courses/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId })
      });

      if (response.ok) {
        const data = await response.json();
        setEnrollments(data.coursesEnrolled || []);
        setUser((prev) => (prev ? { ...prev, coursesEnrolled: data.coursesEnrolled || [] } : prev));
        showToast('✅ Successfully enrolled! Start learning now.', 'success');
      } else {
        showToast('❌ Failed to enroll. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Enrollment request failed', error);
      showToast('❌ Enrollment failed. Please check your connection.', 'error');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg pulse-glow">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-100 text-lg font-quantico">Loading Signum...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Render the appropriate page based on currentPage state
  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <Profile user={user} onLogout={handleLogout} onNavigate={handleNavigation} onUserUpdate={handleUserUpdate} />;
      case 'about':
        return <About user={user} onLogout={handleLogout} onNavigate={handleNavigation} />;
      case 'course':
        return <CourseContent user={user} onLogout={handleLogout} onNavigate={handleNavigation} courseId={selectedCourse} topic={selectedTopic} />;
      case 'quiz':
        return <QuizPage user={user} onLogout={handleLogout} onNavigate={handleNavigation} courseId={selectedCourse} />;
      case 'coding-challenge':
        return <CodingChallengePage user={user} onLogout={handleLogout} onNavigate={handleNavigation} courseId={selectedCourse} />;
      case 'dashboard':
      default:
        return (
          <Dashboard
            user={user}
            onLogout={handleLogout}
            onNavigate={handleNavigation}
            onCourseStart={handleCourseStart}
            onCourseEnroll={handleCourseEnroll}
            enrollments={enrollments}
          />
        );
    }
  };

  return (
    <AIProvider>
      <ProgressProvider>
        <div>
          {renderPage()}
          {user && <AIAssistant context={selectedCourse ? `Course: ${selectedCourse}` : null} />}
          <ToastContainer />
        </div>
      </ProgressProvider>
    </AIProvider>
  );
}

export default App;
