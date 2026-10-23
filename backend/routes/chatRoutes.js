/**
 * AdhikarAI - Know Your Rights Chatbot Integration Route
 * 
 * Proxies citizen legal rights inquiries to the verified Python RAG microservice
 * running on port 8001. Enforces input validation, graceful error handling,
 * and preserves authentic statutory citations.
 */

const express = require('express');
const router = express.Router();

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://127.0.0.1:8001';

// Input constraints
const MAX_QUESTION_LENGTH = 1000;
const MAX_LANGUAGE_LENGTH = 50;

/**
 * GET /api/chat/health
 * Health-check probe to verify Python RAG service connectivity.
 */
router.get('/health', async (req, res) => {
    try {
        const response = await fetch(`${RAG_SERVICE_URL}/api/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        });

        if (!response.ok) {
            return res.status(502).json({
                status: 'error',
                message: 'Python RAG microservice responded with an error.',
                statusCode: response.status
            });
        }

        const data = await response.json();
        res.json({
            status: 'success',
            gateway: 'Node.js Express',
            rag_service: data
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'Python RAG microservice is unreachable on port 8001.',
            error: error.message
        });
    }
});

/**
 * POST /api/chat
 * Public legal rights Q&A endpoint.
 * Accepts { question: string, language?: string }
 */
router.post('/', async (req, res) => {
    try {
        const { question, language } = req.body || {};

        // Validation 1: Field existence and type
        if (!question || typeof question !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'Question is required and must be a non-empty string.'
            });
        }

        // Validation 2: Trimmed length (consistent with FastAPI Pydantic rule)
        const trimmedQuestion = question.trim();
        if (trimmedQuestion.length < 2) {
            return res.status(400).json({
                status: 'error',
                message: 'Question must be at least 2 characters long.'
            });
        }

        if (trimmedQuestion.length > MAX_QUESTION_LENGTH) {
            return res.status(400).json({
                status: 'error',
                message: 'Question exceeds the maximum allowed length of 1000 characters.'
            });
        }

        // Validation 3: Optional language field validation
        let cleanLanguage = 'English';
        if (language !== undefined && language !== null && language !== '') {
            if (typeof language !== 'string') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Language must be a valid string.'
                });
            }

            const trimmedLanguage = language.trim();
            if (trimmedLanguage.length > MAX_LANGUAGE_LENGTH) {
                return res.status(400).json({
                    status: 'error',
                    message: `Language exceeds the maximum allowed length of ${MAX_LANGUAGE_LENGTH} characters.`
                });
            }

            cleanLanguage = trimmedLanguage || 'English';
        }

        // Forward inquiry to Python FastAPI RAG service
        let ragResponse;
        try {
            ragResponse = await fetch(`${RAG_SERVICE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: trimmedQuestion,
                    language: cleanLanguage
                }),
                signal: AbortSignal.timeout(10000) // 10-second timeout guard
            });
        } catch (fetchError) {
            console.error('Error connecting to Python RAG service:', fetchError.message);

            if (fetchError.name === 'TimeoutError') {
                return res.status(504).json({
                    status: 'error',
                    message: 'Legal rights AI service timed out while generating a response. Please try again.'
                });
            }

            // Connection refused or Python service offline
            return res.status(503).json({
                status: 'error',
                message: 'The Legal Rights AI service is temporarily offline or unreachable. Please verify the Python service is active on port 8001.',
                service: 'rag-chatbot'
            });
        }

        // Handle Python service non-200 responses
        if (!ragResponse.ok) {
            const errorBody = await ragResponse.json().catch(() => null);
            const detailMsg = errorBody?.detail || 'Upstream RAG service encountered an error.';
            return res.status(ragResponse.status).json({
                status: 'error',
                message: detailMsg
            });
        }

        // Parse verified RAG answer and citations
        const ragData = await ragResponse.json();

        res.json({
            status: 'success',
            is_mock: ragData.is_mock || false,
            answer: ragData.answer,
            language: ragData.language || 'English',
            sources: ragData.sources || [],
            suggested_questions: ragData.suggested_questions || []
        });
    } catch (error) {
        console.error('Unhandled error in chat proxy:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'An unexpected internal error occurred while processing your legal rights inquiry.'
        });
    }
});

module.exports = router;
