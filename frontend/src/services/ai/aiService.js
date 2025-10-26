/**
 * AI Service - Simple API communication
 */

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/ai`;

/**
 * Get current screen content for context (like Copilot)
 */
const getScreenContent = () => {
  try {
    // Get main content from page
    const mainContent = document.querySelector('main')?.innerText || 
                       document.querySelector('.content')?.innerText ||
                       document.body.innerText;
    
    // Limit to first 6000 characters to capture full page content including team section
    return mainContent?.substring(0, 6000) || '';
  } catch (error) {
    return '';
  }
};

/**
 * Send chat message with context awareness
 */
export const sendChatMessage = async (message, conversationHistory = null, context = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory,
        context: context || 'General Learning',
        screen_content: getScreenContent() // Send current screen content
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('AI Service Error:', error);
    return {
      success: false,
      error: error.message,
      response: 'Unable to connect. Please try again.',
    };
  }
};

/**
 * Check AI service status
 */
export const checkAIStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/status`);
    return await response.json();
  } catch (error) {
    return { status: 'offline', error: error.message };
  }
};
