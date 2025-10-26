/**
 * Course Configuration System
 * Centralized configuration for all courses to ensure scalability and consistency
 * 
 * This makes it easy to:
 * 1. Add new courses with custom progress tracking
 * 2. Define which modules count towards completion
 * 3. Configure evaluation criteria (quiz, coding, projects, etc.)
 * 4. Set passing thresholds
 */

export const courseConfigs = {
  'data-structures': {
    id: 'data-structures',
    name: 'Data Structures',
    
    // Progress calculation configuration
    progress: {
      // Modules that count towards course completion
      learningModules: [
        'overview',
        'arrays-1d',
        'arrays-2d', 
        'stacks',
        'queues',
        'trees-intro'
      ],
      
      // Modules that are excluded from progress (but still tracked)
      excludedModules: [
        'quiz',
        'coding-challenge',
        'certifications',
        'final-exam',
        'trees-tbd'  // Placeholder modules
      ],
      
      // Total number of learning modules for percentage calculation
      totalLearningModules: 6
    },
    
    // Final exam configuration
    finalExam: {
      enabled: true,
      
      // Components of final exam
      components: [
        {
          id: 'quiz',
          name: 'Quiz',
          weight: 0.5,  // 50% of final score
          passingScore: 85,
          required: true
        },
        {
          id: 'coding-challenge',
          name: 'Coding Challenge',
          weight: 0.5,  // 50% of final score
          passingScore: 70,
          required: true
        }
      ],
      
      // Overall passing criteria
      passingScore: 77.5,  // (85*0.5 + 70*0.5) minimum
      
      // Unlock certification if final exam is passed
      unlocksCertification: true
    },
    
    // Certification requirements
    certification: {
      requirements: {
        completionPercentage: 100,  // Must complete all learning modules
        finalExamPassed: true,       // Must pass final exam
        minimumFinalScore: 77.5
      }
    }
  },
  
  // Template for adding new courses
  // 'course-id': {
  //   id: 'course-id',
  //   name: 'Course Name',
  //   progress: {
  //     learningModules: ['module1', 'module2'],
  //     excludedModules: ['quiz', 'certification'],
  //     totalLearningModules: 2
  //   },
  //   finalExam: {
  //     enabled: true,
  //     components: [
  //       { id: 'quiz', weight: 0.5, passingScore: 80, required: true },
  //       { id: 'project', weight: 0.5, passingScore: 75, required: true }
  //     ],
  //     passingScore: 77.5,
  //     unlocksCertification: true
  //   },
  //   certification: {
  //     requirements: {
  //       completionPercentage: 100,
  //       finalExamPassed: true,
  //       minimumFinalScore: 77.5
  //     }
  //   }
  // }
};

/**
 * Get course configuration
 */
export const getCourseConfig = (courseId) => {
  return courseConfigs[courseId] || null;
};

/**
 * Check if a module is excluded from progress calculation
 */
export const isModuleExcluded = (courseId, moduleId) => {
  const config = getCourseConfig(courseId);
  if (!config) return false;
  
  return config.progress.excludedModules.includes(moduleId) ||
         moduleId.includes('certification') ||
         moduleId.includes('certificate') ||
         moduleId.includes('nft');
};

/**
 * Get total learning modules for a course
 */
export const getTotalLearningModules = (courseId) => {
  const config = getCourseConfig(courseId);
  return config?.progress.totalLearningModules || 1;
};

/**
 * Calculate progress percentage for a course
 */
export const calculateProgressPercentage = (courseId, completedModules) => {
  const config = getCourseConfig(courseId);
  if (!config) return 0;
  
  // Filter to only count learning modules
  const learningModulesCompleted = completedModules.filter(moduleId => 
    config.progress.learningModules.includes(moduleId)
  );
  
  const percentage = (learningModulesCompleted.length / config.progress.totalLearningModules) * 100;
  return Math.round(percentage);
};

/**
 * Calculate final exam score
 */
export const calculateFinalExamScore = (courseId, examScores) => {
  const config = getCourseConfig(courseId);
  if (!config?.finalExam.enabled) return 0;
  
  let totalScore = 0;
  
  config.finalExam.components.forEach(component => {
    const score = examScores[component.id] || 0;
    totalScore += score * component.weight;
  });
  
  return Math.round(totalScore);
};

/**
 * Check if final exam is passed
 */
export const isFinalExamPassed = (courseId, examScores) => {
  const config = getCourseConfig(courseId);
  if (!config?.finalExam.enabled) return false;
  
  // Check if all required components are passed
  const allComponentsPassed = config.finalExam.components.every(component => {
    if (!component.required) return true;
    const score = examScores[component.id] || 0;
    return score >= component.passingScore;
  });
  
  if (!allComponentsPassed) return false;
  
  // Check if overall score meets passing criteria
  const finalScore = calculateFinalExamScore(courseId, examScores);
  return finalScore >= config.finalExam.passingScore;
};

/**
 * Check if certification can be unlocked
 */
export const canUnlockCertification = (courseId, progressData) => {
  const config = getCourseConfig(courseId);
  if (!config?.certification) return false;
  
  const { completionPercentage, finalExamPassed, minimumFinalScore } = config.certification.requirements;
  
  // Check completion percentage
  if (progressData.completionPercentage < completionPercentage) {
    return false;
  }
  
  // Check final exam
  if (finalExamPassed) {
    const examScores = {
      quiz: progressData.quizScore || 0,
      'coding-challenge': progressData.codingScore || 0
    };
    
    if (!isFinalExamPassed(courseId, examScores)) {
      return false;
    }
    
    const finalScore = calculateFinalExamScore(courseId, examScores);
    if (finalScore < minimumFinalScore) {
      return false;
    }
  }
  
  return true;
};

export default courseConfigs;
