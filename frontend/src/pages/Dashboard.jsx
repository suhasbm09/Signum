import Layout from '../components/Layout';
import CourseCard from '../components/CourseCard';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useProgress } from '../contexts/ProgressContext';
import { useEffect, useState } from 'react';

// Course catalog data
const courseCatalog = [
  {
    id: 'data-structures',
    title: 'Data Structures',
    tagline: 'Core Computer Science Foundations',
    description: 'Build mastery over the data structures that power scalable applications through visual explorations, guided coding labs, and AI-driven feedback.',
    stats: [
      { label: 'Level', value: 'Intermediate' },
    ],
    topics: ['Arrays', 'Linked Lists', 'Stacks & Queues', 'Trees'],
    ctaText: 'Enroll Now',
  },
  {
    id: 'solana-blockchain',
    title: 'Solana Blockchain',
    tagline: 'High-Performance Web3 Engineering',
    description: 'Design and deploy lightning-fast decentralized applications on Solana with immersive simulations, smart contract walkthroughs, and on-chain credentialing.',
    stats: [
      { label: 'Level', value: 'Advanced' },
    ],
    topics: ['Solana Runtime', 'Accounts Model', 'Program Deployment'],
    ctaText: 'Enroll Now',
  },
];

function Dashboard({ user, onLogout, onNavigate, onCourseStart, onCourseEnroll, enrollments = [] }) {
  const { getCourseCompletionPercentage, getQuizScore, isModuleCompleted, initializeCourseProgress } = useProgress();
  const [loading, setLoading] = useState(true);
  
  // Initialize progress for enrolled courses
  useEffect(() => {
    setLoading(true);
    enrollments.forEach(courseId => {
      initializeCourseProgress(courseId);
    });
    // Simulate loading (remove if you have actual async data fetching)
    setTimeout(() => setLoading(false), 800);
  }, [enrollments, initializeCourseProgress]);
  
  const handleEnroll = (courseId) => {
    if (typeof onCourseEnroll === 'function') {
      onCourseEnroll(courseId);
    }
  };

  const handleStartJourney = (courseId) => {
    if (typeof onCourseStart === 'function') {
      onCourseStart(courseId);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout} currentPage="dashboard" onNavigate={onNavigate}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Header with animation */}
        <div className="mb-4 animate-slideInDown space-y-2">
          <h2 className="text-3xl font-bold text-gray-100 mb-0">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Learner'}! 🚀
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Ready to continue your AI-powered learning journey?
          </p>
        </div>

        {/* Continue Learning / Available Courses Section */}
        <section className="space-y-6 mb-12">
          <div className="flex flex-col gap-2 animate-slideInLeft sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-2xl font-quantico-bold text-gray-100">
              {enrollments.length > 0 ? 'Continue Learning' : 'Available Courses'}
            </h3>
            <span className="text-sm text-gray-500">
              {enrollments.length > 0 ? 'Keep up the momentum' : 'Select your path to mastery'}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonLoader type="card" count={2} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
              {courseCatalog.map((course) => {
                const isEnrolled = enrollments.includes(course.id);
                const courseProgress = getCourseCompletionPercentage(course.id);
                const quiz = getQuizScore(course.id);
                const codingCompleted = isModuleCompleted(course.id, 'coding-challenge');
                
                // Hide if completed (shown in completed section)
                if (isEnrolled && courseProgress === 100) {
                  return null;
                }

                return (
                  <CourseCard
                    key={course.id}
                    {...course}
                    enrolled={isEnrolled}
                    progress={courseProgress}
                    quizScore={quiz?.score}
                    codingCompleted={codingCompleted}
                    completed={false}
                    onEnroll={() => handleEnroll(course.id)}
                    onStart={() => handleStartJourney(course.id)}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Completed Courses Section */}
        {(() => {
          const completedCourses = courseCatalog.filter((course) => {
            const isEnrolled = enrollments.includes(course.id);
            const courseProgress = getCourseCompletionPercentage(course.id);
            return isEnrolled && courseProgress === 100;
          });

          if (completedCourses.length > 0) {
            return (
              <section className="space-y-6 mt-12">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-2xl font-quantico-bold text-emerald-300">
                    🎓 Completed Courses
                  </h3>
                  <span className="text-sm text-emerald-400">
                    {completedCourses.length} course{completedCourses.length > 1 ? 's' : ''} mastered
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {completedCourses.map((course) => {
                    const courseProgress = getCourseCompletionPercentage(course.id);
                    const quiz = getQuizScore(course.id);
                    const codingCompleted = isModuleCompleted(course.id, 'coding-challenge');

                    return (
                      <CourseCard
                        key={course.id}
                        {...course}
                        enrolled={true}
                        progress={courseProgress}
                        quizScore={quiz?.score}
                        codingCompleted={codingCompleted}
                        completed={true}
                        onStart={() => handleStartJourney(course.id)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          }
          return null;
        })()}
      </div>
    </Layout>
  );
}

export default Dashboard;
