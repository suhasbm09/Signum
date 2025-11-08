/**
 * Feature Flags Configuration
 * Control which features are enabled in production
 * 
 * IMPORTANT: Set these flags before deploying to production
 * 
 * TESTING MODES:
 * - Set to `true` during development for easier testing
 * - Set to `false` in production to prevent abuse
 */

const FEATURE_FLAGS = {
  // AI Assistant Feature
  AI_ENABLED: true, // Set to false to disable AI for all users
  AI_TESTING_MODE: false, // Set to true to show "Testing Mode" banner
  
  // Quiz Anti-Cheat Feature
  QUIZ_ANTI_CHEAT_ENABLED: true, // Enable/disable anti-cheat system
  QUIZ_TESTING_MODE: false, // Set to true for testing without anti-cheat
  
  // Blockchain Features
  BLOCKCHAIN_ENABLED: true, // NFT Certificates
  BLOCKCHAIN_TESTING_MODE: false, // Allow re-minting certificates for testing
  
  // Future Features (for easy toggle)
  VOICE_INPUT_ENABLED: true, // Voice-to-text in AI chat
};

/**
 * Check if AI features are enabled
 */
export const isAIEnabled = () => FEATURE_FLAGS.AI_ENABLED;

/**
 * Check if AI is in testing mode
 */
export const isAITestingMode = () => FEATURE_FLAGS.AI_TESTING_MODE;

/**
 * Check if quiz anti-cheat is enabled
 */
export const isQuizAntiCheatEnabled = () => FEATURE_FLAGS.QUIZ_ANTI_CHEAT_ENABLED;

/**
 * Check if quiz is in testing mode
 */
export const isQuizTestingMode = () => FEATURE_FLAGS.QUIZ_TESTING_MODE;

/**
 * Check if blockchain features are enabled
 */
export const isBlockchainEnabled = () => FEATURE_FLAGS.BLOCKCHAIN_ENABLED;

/**
 * Check if blockchain is in testing mode (allows re-minting)
 */
export const isBlockchainTestingMode = () => FEATURE_FLAGS.BLOCKCHAIN_TESTING_MODE;

/**
 * Check if voice input is enabled
 */
export const isVoiceInputEnabled = () => FEATURE_FLAGS.VOICE_INPUT_ENABLED;

/**
 * Get all feature flags (for debugging)
 */
export const getAllFeatureFlags = () => ({ ...FEATURE_FLAGS });

export default FEATURE_FLAGS;
