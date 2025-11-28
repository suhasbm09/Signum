import React, { useMemo, useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import ProgressBar from '../components/ProgressBar';
import { courseRegistry } from '../courses';
import { useProgress } from '../contexts/ProgressContext';

// Small, local utility: auto-hide Layout header/footer based on a specific scroll container
function useAutoHideChrome(scrollElRef, { threshold = 8 } = {}) {
  useEffect(() => {
    const el = scrollElRef.current;
    if (!el) return;

    const header = document.querySelector('[data-app-header]');
    const footer = document.querySelector('[data-app-footer]');

    // If Layout doesn't expose these markers, fail silently
    if (!header && !footer) return;

    let lastY = 0;

    const onScroll = () => {
      const y = el.scrollTop;
      const dy = y - lastY;

      // scrolling down → hide both
      if (dy > threshold) {
        if (header) header.style.transform = 'translateY(-100%)';
        if (footer) footer.style.transform = 'translateY(100%)';
      }
      // scrolling up → show both
      if (dy < -threshold) {
        if (header) header.style.transform = 'translateY(0)';
        if (footer) footer.style.transform = 'translateY(0)';
      }

      // snap visible at top/bottom
      if (y <= 0 && header) header.style.transform = 'translateY(0)';
      const atBottom = Math.ceil(y + el.clientHeight) >= el.scrollHeight;
      if (atBottom && footer) footer.style.transform = 'translateY(0)';

      lastY = y;
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollElRef, threshold]);
}

function CourseContent({ user, onLogout, onNavigate, courseId, topic }) {
  const { initializeCourseProgress, isModuleCompleted, getQuizScore } = useProgress();

  // --- helpers ---
  const areAllChildrenCompleted = (section) => {
    if (!section.children || section.children.length === 0) return false;
    return section.children.every(child => {
      if (child.id === 'quiz') return getQuizScore && getQuizScore(courseId)?.score >= 85;
      if (child.id === 'coding-challenge') return isModuleCompleted(courseId, 'coding-challenge');
      return isModuleCompleted(courseId, child.id);
    });
  };

  const readableCourseName = courseId
    ? courseId
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : null;

  const courseData = useMemo(() => {
    if (!courseRegistry[courseId]) return null; // show placeholder for unknown course
    return courseRegistry[courseId];
  }, [courseId]);

  const outline = courseData?.outline || [];
  const courseContent = courseData?.content || {};

  // --- unknown course placeholder ---
  if (!courseData) {
    return (
      <Layout user={user} onLogout={onLogout} currentPage="course" onNavigate={onNavigate}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-2xl px-8">
            <div className="mb-8">
              <svg className="w-32 h-32 mx-auto text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h2 className="text-4xl font-quantico-bold text-gray-100 mb-4">{readableCourseName}</h2>
              <p className="text-xl text-gray-400 mb-2">Course Modules Coming Soon! 🚀</p>
              <p className="text-gray-500 mb-8">This course is currently under development. Check back soon for exciting new content!</p>
            </div>

            <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-quantico-bold text-emerald-300 mb-3">What to expect:</h3>
              <ul className="text-left text-gray-300 space-y-2">
                <li className="flex items-start"><span className="text-emerald-400 mr-2">✓</span><span>Interactive visualizations and hands-on examples</span></li>
                <li className="flex items-start"><span className="text-emerald-400 mr-2">✓</span><span>AI-powered tutoring and personalized guidance</span></li>
                <li className="flex items-start"><span className="text-emerald-400 mr-2">✓</span><span>Secure quizzes and coding challenges</span></li>
                <li className="flex items-start"><span className="text-emerald-400 mr-2">✓</span><span>Blockchain-verified NFT certificates upon completion</span></li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate('dashboard')}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-quantico-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // --- state ---
  const [activeTopic, setActiveTopic] = useState(topic || outline?.[0]?.id || null);
  const [expandedSections, setExpandedSections] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // RIGHT content scroll ref (independent scroller)
  const contentRef = useRef(null);

  // ensure right-pane scroll-to-top on topic change (this page uses inner scroller)
  useEffect(() => {
    if (topic) {
      setActiveTopic(topic);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [topic]);

  // initialize progress and default topic when outline changes
  useEffect(() => {
    setActiveTopic(outline?.[0]?.id || null);
    if (courseId) initializeCourseProgress(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outline, courseId]);

  // auto-hide Layout header/footer when RIGHT pane scrolls (only this page needed)
  useAutoHideChrome(contentRef, { threshold: 8 });

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const activeTopicTitle = useMemo(() => {
    if (!activeTopic) return null;
    for (const section of outline) {
      if (section.id === activeTopic) return section.title;
      if (section.children) {
        const match = section.children.find((child) => child.id === activeTopic);
        if (match) return match.title;
      }
    }
    return null;
  }, [activeTopic, outline]);

  return (
    <Layout user={user} onLogout={onLogout} currentPage="course" onNavigate={onNavigate}>
      <div className="relative">
        {/* Fixed-height app viewport below the Layout header/footer. Adjust if your header height differs. */}
        <div className="flex h-full min-h-0 overflow-hidden">
          {/* Desktop Sidebar — independent scroll */}
          <aside
            className={`hidden lg:block bg-glossy-black-ultra backdrop-blur-xl border-r border-white/10 shadow-2xl transition-all duration-300 overflow-y-auto min-h-0 ${
              sidebarCollapsed ? 'w-[2%]' : 'w-[25%]'
            }`}
          >
            <div
              className={`p-6 h-full transition-opacity duration-300 ${
                sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-quantico-bold text-gray-100">{readableCourseName || 'Course Outline'}</h1>
                <p className="text-gray-500 text-sm mt-2">Follow the modules to unlock immersive, animated lessons.</p>
              </div>

              <ProgressBar courseId={courseId || 'data-structures'} className="mb-6" />

              <nav className="space-y-4">
                {outline.map((section) => {
                  // Check if Final Exam is complete: BOTH quiz passed AND coding challenge complete
                  const isFinalExamComplete = section.id === 'final-exam' && 
                    getQuizScore && 
                    getQuizScore(courseId)?.score >= 85 && 
                    isModuleCompleted(courseId, 'coding-challenge');
                  
                  const isCompleted =
                    isModuleCompleted(courseId, section.id) ||
                    areAllChildrenCompleted(section) ||
                    isFinalExamComplete;
                  const isCertification = section.id === 'certifications';

                  return (
                    <div key={section.id}>
                      <button
                        type="button"
                        className={`w-full text-left px-4 py-2 rounded-xl font-quantico text-sm transition-all duration-200 flex items-center justify-between ${
                          activeTopic === section.id
                            ? isCertification
                              ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40'
                              : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                            : isCertification
                              ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 hover:border-yellow-500/40'
                              : 'bg-black/40 text-gray-200 border border-white/5 hover:border-emerald-500/30'
                        }`}
                        onClick={() => {
                          setActiveTopic(section.id);
                          if (section.children) toggleSection(section.id);
                          // keep the right pane scrolled to top for parent sections
                          contentRef.current?.scrollTo({ top: 0 });
                        }}
                      >
                        <span className="flex items-center">
                          {isCompleted && <span className="mr-2 text-emerald-400">✓</span>}
                          {section.title}
                        </span>
                        {section.children && (
                          <svg className={`w-4 h-4 transition-transform duration-200 ${expandedSections[section.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>

                      {section.children && section.children.length > 0 && expandedSections[section.id] && (
                        <ul className="mt-2 space-y-2 pl-4">
                          {section.children.map((child) => (
                            <li key={child.id}>
                              <button
                                type="button"
                                className={`w-full text-left px-4 py-2 rounded-xl text-xs font-quantico transition-all duration-200 ${
                                  child.id === 'quiz' || child.id === 'coding-challenge'
                                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/40 hover:border-yellow-400/60'
                                    : activeTopic === child.id
                                      ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40'
                                      : 'bg-black/30 text-gray-400 border border-white/5 hover:border-emerald-500/30'
                                }`}
                                onClick={() => {
                                  if (child.id === 'quiz') {
                                    onNavigate('quiz', { courseId });
                                  } else if (child.id === 'coding-challenge') {
                                    onNavigate('coding-challenge', { courseId });
                                  } else {
                                    setActiveTopic(child.id);
                                    contentRef.current?.scrollTo({ top: 0 });
                                  }
                                }}
                              >
                                <span className="flex items-center">
                                  {child.id === 'quiz' && getQuizScore && getQuizScore(courseId)?.score >= 85 && (
                                    <span className="mr-2 text-emerald-400">✓</span>
                                  )}
                                  {child.id === 'quiz' && (!getQuizScore || !getQuizScore(courseId) || getQuizScore(courseId)?.score < 85) && (
                                    <span className="mr-2">🔒</span>
                                  )}
                                  {child.id === 'coding-challenge' && isModuleCompleted(courseId, 'coding-challenge') && (
                                    <span className="mr-2 text-emerald-400">✓</span>
                                  )}
                                  {child.id === 'coding-challenge' && !isModuleCompleted(courseId, 'coding-challenge') && (
                                    <span className="mr-2">🔒</span>
                                  )}
                                  {child.id !== 'quiz' && child.id !== 'coding-challenge' && (
                                    isModuleCompleted(courseId, child.id) ? <span className="mr-2 text-emerald-400">✓</span> : null
                                  )}
                                  {child.title}
                                  {(child.id === 'quiz' || child.id === 'coding-challenge') && <span className="ml-auto text-xs">SECURE</span>}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Mobile Sidebar Drawer */}
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Drawer */}
              <aside className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-glossy-black-ultra border-r border-white/10 shadow-2xl z-50 lg:hidden overflow-y-auto">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-quantico-bold text-gray-100">{readableCourseName || 'Course'}</h1>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-lg text-gray-300 hover:text-gray-100 hover:bg-gray-700/50 transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <ProgressBar courseId={courseId || 'data-structures'} className="mb-4" />

                  <nav className="space-y-3">
                    {outline.map((section) => {
                      const isFinalExamComplete = section.id === 'final-exam' && 
                        getQuizScore && 
                        getQuizScore(courseId)?.score >= 85 && 
                        isModuleCompleted(courseId, 'coding-challenge');
                      
                      const isCompleted =
                        isModuleCompleted(courseId, section.id) ||
                        areAllChildrenCompleted(section) ||
                        isFinalExamComplete;
                      const isCertification = section.id === 'certifications';

                      return (
                        <div key={section.id}>
                          <button
                            type="button"
                            className={`w-full text-left px-3 py-2 rounded-lg font-quantico text-sm transition-all duration-200 flex items-center justify-between ${
                              activeTopic === section.id
                                ? isCertification
                                  ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40'
                                  : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                                : isCertification
                                  ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 hover:border-yellow-500/40'
                                  : 'bg-black/40 text-gray-200 border border-white/5 hover:border-emerald-500/30'
                            }`}
                            onClick={() => {
                              setActiveTopic(section.id);
                              if (section.children) toggleSection(section.id);
                              contentRef.current?.scrollTo({ top: 0 });
                              setMobileMenuOpen(false);
                            }}
                          >
                            <span className="flex items-center text-xs">
                              {isCompleted && <span className="mr-2 text-emerald-400">✓</span>}
                              {section.title}
                            </span>
                            {section.children && (
                              <svg className={`w-4 h-4 transition-transform duration-200 ${expandedSections[section.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </button>

                          {section.children && section.children.length > 0 && expandedSections[section.id] && (
                            <ul className="mt-2 space-y-1 pl-3">
                              {section.children.map((child) => (
                                <li key={child.id}>
                                  <button
                                    type="button"
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-quantico transition-all duration-200 ${
                                      child.id === 'quiz' || child.id === 'coding-challenge'
                                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/40 hover:border-yellow-400/60'
                                        : activeTopic === child.id
                                          ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40'
                                          : 'bg-black/30 text-gray-400 border border-white/5 hover:border-emerald-500/30'
                                    }`}
                                    onClick={() => {
                                      if (child.id === 'quiz') {
                                        onNavigate('quiz', { courseId });
                                      } else if (child.id === 'coding-challenge') {
                                        onNavigate('coding-challenge', { courseId });
                                      } else {
                                        setActiveTopic(child.id);
                                        contentRef.current?.scrollTo({ top: 0 });
                                      }
                                      setMobileMenuOpen(false);
                                    }}
                                  >
                                    <span className="flex items-center">
                                      {child.id === 'quiz' && getQuizScore && getQuizScore(courseId)?.score >= 85 && (
                                        <span className="mr-2 text-emerald-400">✓</span>
                                      )}
                                      {child.id === 'quiz' && (!getQuizScore || !getQuizScore(courseId) || getQuizScore(courseId)?.score < 85) && (
                                        <span className="mr-2">🔒</span>
                                      )}
                                      {child.id === 'coding-challenge' && isModuleCompleted(courseId, 'coding-challenge') && (
                                        <span className="mr-2 text-emerald-400">✓</span>
                                      )}
                                      {child.id === 'coding-challenge' && !isModuleCompleted(courseId, 'coding-challenge') && (
                                        <span className="mr-2">🔒</span>
                                      )}
                                      {child.id !== 'quiz' && child.id !== 'coding-challenge' && (
                                        isModuleCompleted(courseId, child.id) ? <span className="mr-2 text-emerald-400">✓</span> : null
                                      )}
                                      {child.title}
                                    </span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </nav>
                </div>
              </aside>
            </>
          )}

          {/* Toggle Sidebar Button - Floating (Desktop only) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`hidden lg:block fixed top-20 z-50 bg-gradient-to-r from-emerald-800/80 to-green-800/80 hover:from-emerald-700/90 hover:to-green-700/90 text-gray-200 p-3 rounded-r-xl shadow-lg transition-all duration-300 border-y border-r border-emerald-400/40 ${
              sidebarCollapsed ? 'left-[2%]' : 'left-[25%]'
            }`}
            title={sidebarCollapsed ? 'Show Table of Contents' : 'Hide Table of Contents'}
          >
            <svg className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Mobile Menu Button - Floating */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden fixed bottom-6 left-6 z-30 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white p-4 rounded-full shadow-2xl transition-all duration-300 border border-emerald-400/40"
            title="Open course menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* RIGHT content — independent scroll + auto-hide header/footer */}
          <section
            ref={contentRef}
            className={`bg-glossy-black-ultra backdrop-blur-xl shadow-2xl overflow-y-auto min-h-0 transition-all duration-300 w-full ${
              sidebarCollapsed ? 'lg:w-full' : 'lg:w-[75%]'
            }`}
          >
            <div className="p-4 sm:p-6 md:p-10">
              {courseContent[activeTopic] ? (
                React.createElement(courseContent[activeTopic], {
                  onNavigate,
                  courseId,
                  user,
                  onQuizComplete: (score) => {
                    // hook to your progress context if needed
                    // console.log(`Quiz completed with score: ${score}%`);
                  },
                })
              ) : (
                <div className="flex flex-col items-center text-center pt-20">
                  {activeTopic === 'arrays' && (
                    <div className="max-w-2xl">
                      <h2 className="text-3xl font-quantico-bold text-gray-100 mb-4">Arrays</h2>
                      <p className="text-gray-400 text-lg mb-8">Learn your first data structure - Arrays</p>
                      <div className="space-y-4">
                        <button
                          onClick={() => onNavigate('course', { courseId, topic: 'arrays-1d' })}
                          className="w-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 font-quantico-bold py-4 px-6 rounded-xl transition-all duration-300"
                        >
                          📚 Learn 1D Arrays
                        </button>
                        <button
                          onClick={() => onNavigate('course', { courseId, topic: 'arrays-2d' })}
                          className="w-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 font-quantico-bold py-4 px-6 rounded-xl transition-all duration-300"
                        >
                          📊 Learn 2D Arrays
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTopic === 'linked-lists' && (
                    <div className="max-w-2xl">
                      <h2 className="text-3xl font-quantico-bold text-gray-100 mb-4">Linked Lists</h2>
                      <p className="text-gray-400 text-lg mb-8">Master dynamic data structures with pointers</p>
                      <div className="space-y-4">
                        <button
                          onClick={() => onNavigate('course', { courseId, topic: 'linked-list-singly' })}
                          className="w-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 font-quantico-bold py-4 px-6 rounded-xl transition-all duration-300"
                        >
                          🔗 Learn Singly Linked List
                        </button>
                        <button
                          onClick={() => onNavigate('course', { courseId, topic: 'linked-list-doubly' })}
                          className="w-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 font-quantico-bold py-4 px-6 rounded-xl transition-all duration-300"
                        >
                          ⇄ Learn Doubly Linked List
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTopic === 'stacks-queues' && (
                    <div className="max-w-2xl">
                      <h2 className="text-3xl font-quantico-bold text-gray-100 mb-4">Stacks & Queues</h2>
                      <p className="text-gray-400 text-lg mb-8">Master linear data structures</p>
                      <div className="space-y-4">
                        <button
                          onClick={() => onNavigate('course', { courseId, topic: 'stacks' })}
                          className="w-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 font-quantico-bold py-4 px-6 rounded-xl transition-all duration-300"
                        >
                          📚 Learn Stacks (LIFO)
                        </button>
                        <button
                          onClick={() => onNavigate('course', { courseId, topic: 'queues' })}
                          className="w-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 font-quantico-bold py-4 px-6 rounded-xl transition-all duration-300"
                        >
                          📊 Learn Queues (FIFO)
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTopic === 'trees' && (
                    <div className="max-w-2xl">
                      <h2 className="text-3xl font-quantico-bold text-gray-100 mb-4">Trees</h2>
                      <p className="text-gray-400 text-lg mb-8">Explore hierarchical data structures</p>
                      <div className="space-y-4">
                        <button
                          onClick={() => onNavigate('course', { courseId, topic: 'trees-intro' })}
                          className="w-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 font-quantico-bold py-4 px-6 rounded-xl transition-all duration-300"
                        >
                          🌳 Learn Binary Trees
                        </button>
                        <button
                          disabled
                          className="w-full bg-gray-600 text-gray-400 font-quantico-bold py-4 px-6 rounded-xl cursor-not-allowed"
                        >
                          🔒 Advanced Trees (Coming Soon)
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTopic === 'final-exam' && (
                    <div className="max-w-2xl">
                      <h2 className="text-3xl font-quantico-bold text-gray-100 mb-4">Final Exam</h2>
                      <p className="text-gray-400 text-lg mb-8">Test your knowledge of Data Structures</p>
                      <div className="space-y-4">
                        <button
                          onClick={() => onNavigate('quiz', { courseId })}
                          className="w-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/40 hover:border-yellow-400/60 text-yellow-200 font-quantico-bold py-4 px-6 rounded-xl transition-all duration-300"
                        >
                          � Quiz (50%)
                        </button>
                        <button
                          onClick={() => onNavigate('coding-challenge', { courseId })}
                          className="w-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/40 hover:border-yellow-400/60 text-yellow-200 font-quantico-bold py-4 px-6 rounded-xl transition-all duration-300"
                        >
                          💻 Coding Challenge (50%)
                        </button>
                      </div>
                    </div>
                  )}

                  {(!activeTopic || !['arrays', 'linked-lists', 'stacks-queues', 'trees', 'final-exam'].includes(activeTopic)) && (
                    <div>
                      <h2 className="text-3xl font-quantico-bold text-gray-100 mb-4">Select a topic to begin</h2>
                      <p className="text-gray-400 text-lg max-w-xl">Choose a section from the course outline to start learning.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default CourseContent;
