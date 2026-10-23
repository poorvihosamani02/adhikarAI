/**
 * AdhikarAI - Chat API Bridge
 * 
 * Re-exports chatService methods to ensure full compatibility
 * with existing modules while communicating directly with the backend.
 */

import { sendQuestion, checkChatHealth } from '../services/chatService';

export { sendQuestion, checkChatHealth };

/**
 * Legacy wrapper for sendQuestion, maintaining compatibility with earlier signatures.
 * 
 * @param {Object|string} payload - Chat question payload or string
 * @param {boolean} [_isDemoMode=false] - Demo mode flag (ignored, uses live backend)
 * @returns {Promise<Object>} Backend chat response
 */
export async function sendChatMessage(payload, _isDemoMode = false) {
  const question = typeof payload === 'string' ? payload : (payload?.question || '');
  const language = payload?.language || 'English';
  return sendQuestion(question, language);
}

export default {
  sendQuestion,
  checkChatHealth,
  sendChatMessage
};

