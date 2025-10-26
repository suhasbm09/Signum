/**
 * Progress Service - Handles all progress, quiz, and anti-cheat data via Firebase
 * This replaces localStorage for sensitive data to prevent client-side tampering
 */

const API_BASE_URL = 'http://localhost:8000';

class ProgressService {
  /**
   * Sync course progress to Firebase
   */
  async syncCourseProgress(userId, courseId, modulesCompleted, completionPercentage, quizScore = null) {
    try {
      // Build payload, only include quiz_score if not null/undefined
      const payload = {
        user_id: userId,
        course_id: courseId,
        modules_completed: modulesCompleted,
        completion_percentage: completionPercentage
      };
      if (quizScore !== null && quizScore !== undefined) {
        payload.quiz_score = quizScore;
      }
      const response = await fetch(`${API_BASE_URL}/progress/course/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to sync progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing progress:', error);
      throw error;
    }
  }

  /**
   * Get course progress from Firebase
   */
  async getCourseProgress(userId, courseId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/progress/course/progress/${courseId}?user_id=${userId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching progress:', error);
      // Return default progress on error
      return {
        modules_completed: [],
        completion_percentage: 0,
        quiz_score: null
      };
    }
  }

  /**
   * Save quiz result to Firebase
   */
  async saveQuizResult(userId, courseId, score, answers, violations = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/progress/quiz/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
          score: score,
          answers: answers,
          violations: violations
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save quiz result');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving quiz result:', error);
      throw error;
    }
  }

  /**
   * Get quiz results from Firebase
   */
  async getQuizResults(userId, courseId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/progress/quiz/results/${courseId}?user_id=${userId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch quiz results');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      return [];
    }
  }

  /**
   * Get certification status from Firebase
   */
  async getCertificationStatus(userId, courseId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/progress/certification/status/${courseId}?user_id=${userId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch certification status');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching certification status:', error);
      return {
        eligible: false,
        quiz_passed: false,
        course_completed: false
      };
    }
  }

  /**
   * Save anti-cheat violation to Firebase
   */
  async saveViolation(userId, courseId, violationType, timestamp) {
    try {
      const response = await fetch(`${API_BASE_URL}/progress/quiz/violation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
          violation_type: violationType,
          timestamp: timestamp
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save violation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving violation:', error);
      throw error;
    }
  }

  /**
   * Get all violations for a user/course from Firebase
   */
  async getViolations(userId, courseId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/progress/quiz/violations/${courseId}?user_id=${userId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch violations');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching violations:', error);
      return [];
    }
  }

  /**
   * Block quiz access (server-side enforcement)
   */
  async blockQuizAccess(userId, courseId, blockDurationMinutes, violationCount) {
    try {
      const response = await fetch(`${API_BASE_URL}/progress/quiz/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
          block_duration_minutes: blockDurationMinutes,
          violation_count: violationCount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to block quiz access');
      }

      return await response.json();
    } catch (error) {
      console.error('Error blocking quiz access:', error);
      throw error;
    }
  }

  /**
   * Check if quiz is blocked from Firebase
   */
  async getQuizBlockStatus(userId, courseId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/progress/quiz/block-status/${courseId}?user_id=${userId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch block status');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching block status:', error);
      return {
        is_blocked: false,
        block_end_time: null,
        time_remaining_ms: 0
      };
    }
  }

  /**
   * Save user's Solana wallet address to Firebase
   */
  async saveUserWallet(userId, walletAddress, walletType = 'phantom') {
    try {
      const response = await fetch(`${API_BASE_URL}/progress/wallet/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          wallet_address: walletAddress,
          wallet_type: walletType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save wallet');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving wallet:', error);
      throw error;
    }
  }

  /**
   * Get user's saved wallet address from Firebase
   */
  async getUserWallet(userId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/progress/wallet/${userId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch wallet');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      return null;
    }
  }
}

export default new ProgressService();
