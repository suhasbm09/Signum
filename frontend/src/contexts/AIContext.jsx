/**
 * AI Context
 * Manages AI assistant state and provides AI functionality throughout the app
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { sendChatMessage } from '../services/ai/aiService';
import { isAIEnabled, isAITestingMode } from '../config/features';

const AIContext = createContext();

export function AIProvider({ children }) {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentContext, setCurrentContext] = useState(null);
  
  // Feature flags
  const aiEnabled = isAIEnabled();
  const testingMode = isAITestingMode();

  /**
   * Send a message to the AI assistant
   */
  const chat = useCallback(async (message, context = null) => {
    // Check if AI is enabled
    if (!aiEnabled) {
      const disabledMessage = { 
        role: 'assistant', 
        content: 'AI Assistant is currently disabled. Please contact your administrator for access.' 
      };
      setConversationHistory(prev => [...prev, disabledMessage]);
      return {
        success: false,
        error: 'AI_DISABLED',
        response: disabledMessage.content,
      };
    }

    setIsLoading(true);
    try {
      // Add user message to history immediately
      const userMessage = { role: 'user', content: message };
      setConversationHistory(prev => [...prev, userMessage]);

      // Send to API with current conversation history
      const result = await sendChatMessage(
        message,
        conversationHistory,
        context || currentContext
      );

      console.log('AI Response:', result); // Debug log

      if (result.success) {
        // Add assistant response to history
        const assistantMessage = { role: 'assistant', content: result.response };
        setConversationHistory(prev => [...prev, assistantMessage]);
      } else {
        // Handle different error types
        let errorContent = result.response || 'Sorry, I encountered an error.';
        
        // Special handling for daily limit
        if (result.error === 'daily_limit_reached') {
          errorContent = '⚠️ **AI Daily Limit Reached**\n\n' + 
            'The AI tutor has reached its daily usage limit. Don\'t worry, you can still:\n\n' +
            '• Continue learning with **interactive visualizations**\n' +
            '• Practice coding in the **coding environment**\n' +
            '• Track your progress and complete modules\n' +
            '• Review course materials\n\n' +
            '🔄 AI tutor will be available again tomorrow!';
        }
        
        // Add error message to history
        const errorMessage = { role: 'assistant', content: errorContent };
        setConversationHistory(prev => [...prev, errorMessage]);
      }

      return result;
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { role: 'assistant', content: 'An error occurred. Please try again.' };
      setConversationHistory(prev => [...prev, errorMessage]);
      return {
        success: false,
        error: error.message,
        response: 'An error occurred. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  }, [conversationHistory, currentContext]);

  /**
   * Clear conversation history
   */
  const clearHistory = useCallback(() => {
    setConversationHistory([]);
  }, []);

  /**
   * Set context for AI responses
   */
  const setContext = useCallback((context) => {
    setCurrentContext(context);
  }, []);

  const value = {
    conversationHistory,
    isLoading,
    currentContext,
    chat,
    clearHistory,
    setContext,
    // Feature flag states
    aiEnabled,
    testingMode,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
