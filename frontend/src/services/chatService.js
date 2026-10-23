/**
 * AdhikarAI - Know Your Rights Chat Service
 * 
 * Reusable frontend service connecting the citizen chatbot UI
 * to the Node.js Express backend (Port 3000) and Python RAG service (Port 8001).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Sends a citizen query to the Know Your Rights RAG backend.
 * 
 * @param {string} question - Citizen legal rights inquiry
 * @param {string} [language='English'] - Preferred response language
 * @returns {Promise<Object>} Backend chat response containing answer and sources
 */
export async function sendQuestion(question, language = 'English') {
    if (!question || typeof question !== 'string' || !question.trim()) {
        throw new Error('Please enter a valid question before sending.');
    }

    const trimmed = question.trim();
    if (trimmed.length < 2) {
        throw new Error('Your question must be at least 2 characters long.');
    }

    const endpoint = `${API_BASE_URL}/api/chat`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                question: trimmed,
                language: language || 'English'
            })
        });

        if (!response.ok) {
            let errorMsg = `Chat service returned status ${response.status}.`;
            try {
                const errorJson = await response.json();
                if (errorJson.message) errorMsg = errorJson.message;
                else if (errorJson.detail) errorMsg = errorJson.detail;
            } catch {
                // Ignore JSON parse error on non-JSON response
            }

            if (response.status === 503) {
                errorMsg = 'The Legal Rights AI microservice is temporarily offline. Please ensure the Python service is running on port 8001.';
            } else if (response.status === 504) {
                errorMsg = 'The AI service took too long to generate an answer. Please try again with a more specific question.';
            }

            throw new Error(errorMsg);
        }

        const data = await response.json();
        return {
            status: data.status || 'success',
            is_mock: Boolean(data.is_mock),
            answer: data.answer || '',
            language: data.language || language,
            sources: Array.isArray(data.sources) ? data.sources : [],
            suggested_questions: Array.isArray(data.suggested_questions) ? data.suggested_questions : []
        };
    } catch (error) {
        // Distinguish network connection failures from application errors
        if (error.name === 'TypeError' && error.message.toLowerCase().includes('fetch')) {
            console.error(`[chatService] Unable to connect to backend at ${endpoint}:`, error);
            throw new Error(`Unable to connect to AdhikarAI backend at ${API_BASE_URL}. Please ensure the Node.js server is running on port 3000.`);
        }
        throw error;
    }
}

/**
 * Checks connectivity and health of the chat gateway and Python RAG microservice.
 * 
 * @returns {Promise<Object>} Health status details
 */
export async function checkChatHealth() {
    const endpoint = `${API_BASE_URL}/api/chat/health`;
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            return {
                isHealthy: false,
                message: `Health check failed with status ${response.status}`
            };
        }

        const data = await response.json();
        return {
            isHealthy: data.status === 'success' && data.rag_service?.status === 'healthy',
            data: data
        };
    } catch (err) {
        return {
            isHealthy: false,
            message: `Backend is unreachable at ${API_BASE_URL}: ${err.message}`
        };
    }
}

// Re-export for compatibility
export default {
    sendQuestion,
    checkChatHealth
};
