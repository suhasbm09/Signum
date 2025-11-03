/**
 * Progress Service - Unified API for progress, assessment, and certification
 * v2.0 - Optimized endpoints with domain-driven architecture
 */

import { API_BASE_URL, API_ENDPOINTS, buildUrl } from '../config/api';

class ProgressService {
  /**
   * Get user wallet address from backend profile
   */
  async getUserWallet(userToken) {
    try {
      const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.ME), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user wallet');
      }
      const data = await response.json();
      return data.user?.phantomWalletAddress || null;
    } catch (error) {
      console.error('Error fetching user wallet:', error);
      return null;
    }
  }

  /**
   * Sync course progress to backend
   */
  async syncCourseProgress(userId, courseId, modulesCompleted, completionPercentage) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROGRESS.SYNC(courseId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
          modules_completed: modulesCompleted,
          completion_percentage: completionPercentage
        })
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
   * Get course progress
   */
  async getCourseProgress(userId, courseId) {
    try {
      const response = await fetch(
        buildUrl(`${API_ENDPOINTS.PROGRESS.GET(courseId)}`, { user_id: userId }),
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();
      return data.data || {
        modules_completed: [],
        completion_percentage: 0,
        quiz: {},
        coding: {}
      };
    } catch (error) {
      console.error('Error fetching progress:', error);
      return {
        modules_completed: [],
        completion_percentage: 0,
        quiz: {},
        coding: {}
      };
    }
  }

  /**
   * Save quiz result
   */
  async saveQuizResult(userId, courseId, score, answersData) {
    try {
      const quizId = 'quiz-1';
      
      // Submit quiz
      const response = await fetch(`${API_BASE_URL}/assessment/${courseId}/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          score: score,
          passed: score >= 85,
          answers: answersData || []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const result = await response.json();
      console.log('✅ Quiz saved:', result);
      
      return { success: true, score };
    } catch (error) {
      console.error('Error saving quiz:', error);
      throw error;
    }
  }

  /**
   * Get quiz results
   */
  async getQuizResults(userId, courseId, quizId = null) {
    try {
      const url = quizId 
        ? `${API_BASE_URL}/assessment/${courseId}/quiz/attempts?user_id=${userId}&quiz_id=${quizId}`
        : `${API_BASE_URL}/assessment/${courseId}/quiz/attempts?user_id=${userId}`;
      
      const response = await fetch(url, { method: 'GET' });

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
   * Get certification status
   */
  async getCertificationStatus(userId, courseId) {
    try {
      const response = await fetch(
        buildUrl(`${API_ENDPOINTS.PROGRESS.CERT_STATUS(courseId)}`, { user_id: userId }),
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
   * Save anti-cheat violation (unified for quiz and coding)
   */
  async saveViolation(userId, courseId, assessmentType, violationType, timestamp) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ASSESSMENT.ANTI_CHEAT_REPORT(courseId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
          assessment_type: assessmentType,
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
   * Get all violations for a user/course
   */
  async getViolations(userId, courseId, assessmentType) {
    try {
      const response = await fetch(
        buildUrl(`${API_ENDPOINTS.ASSESSMENT.ANTI_CHEAT_STATUS(courseId)}`, {
          user_id: userId,
          assessment_type: assessmentType
        }),
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch violations');
      }

      const data = await response.json();
      return data.data?.violations || [];
    } catch (error) {
      console.error('Error fetching violations:', error);
      return [];
    }
  }

  /**
   * Get block status (quiz or coding)
   */
  async getBlockStatus(userId, courseId, assessmentType) {
    try {
      console.log('📡 Fetching block status:', { userId, courseId, assessmentType });
      
      const url = buildUrl(`${API_ENDPOINTS.ASSESSMENT.ANTI_CHEAT_STATUS(courseId)}`, {
        user_id: userId,
        assessment_type: assessmentType
      });
      
      console.log('📡 Request URL:', url);
      
      const response = await fetch(url, { method: 'GET' });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Block status API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to fetch block status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Block status received:', data);
      
      return data.data || {
        is_blocked: false,
        block_end_time: null,
        time_remaining_ms: 0
      };
    } catch (error) {
      console.error('❌ Error fetching block status:', error);
      // Return safe default instead of throwing
      return {
        is_blocked: false,
        block_end_time: null,
        time_remaining_ms: 0
      };
    }
  }

  /**
   * Clear violations after cooldown (unified)
   */
  async clearViolations(userId, courseId, assessmentType) {
    try {
      const response = await fetch(
        buildUrl(`${API_ENDPOINTS.ASSESSMENT.ANTI_CHEAT_CLEAR(courseId)}`, {
          user_id: userId,
          assessment_type: assessmentType
        }),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to clear violations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error clearing violations:', error);
      throw error;
    }
  }

  // Backward compatibility aliases
  async getQuizBlockStatus(userId, courseId) {
    return this.getBlockStatus(userId, courseId, 'quiz');
  }

  async clearQuizViolations(userId, courseId) {
    return this.clearViolations(userId, courseId, 'quiz');
  }

  async blockQuizAccess(userId, courseId, blockDurationMinutes, violationCount) {
    // This is now handled automatically by the backend when violations are reported
    console.warn('blockQuizAccess is deprecated - blocking is automatic based on violations');
    return { success: true };
  }
}

export default new ProgressService();
