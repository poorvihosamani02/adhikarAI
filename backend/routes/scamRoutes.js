/**
 * AdhikarAI - Scam Shield Integration Route
 * 
 * Secure gateway connecting frontend citizen threat detection
 * to the Python Scam Shield microservice running on port 8003.
 * Enforces input validation, size limits, and sanitizes responses.
 */

const express = require('express');
const router = express.Router();

const SCAM_SERVICE_URL = process.env.SCAM_SERVICE_URL || 'http://127.0.0.1:8003';

// Input constraints
const MAX_MESSAGE_LENGTH = 5000;
const MAX_URL_LENGTH = 1000;

/**
 * GET /api/scam/health
 * Probes connectivity to the Python Scam Shield microservice on port 8003.
 */
router.get('/health', async (req, res) => {
    try {
        const response = await fetch(`${SCAM_SERVICE_URL}/api/health`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(3000)
        });

        if (!response.ok) {
            return res.status(502).json({
                status: 'error',
                message: 'Scam Shield microservice responded with an error.',
                statusCode: response.status
            });
        }

        const data = await response.json();
        res.json({
            status: 'success',
            gateway: 'Node.js Express',
            scam_service: data
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'Scam Shield microservice is unreachable on port 8003.',
            error: error.message
        });
    }
});

/**
 * POST /api/scam/analyze
 * Analyzes suspicious SMS, WhatsApp, email text and optional link
 * against verified Indian cybercrime typologies and heuristics.
 */
router.post('/analyze', async (req, res) => {
    try {
        const { message_text, url } = req.body || {};

        // 1. Validate required message_text
        if (!message_text || typeof message_text !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'Message text is required and must be a non-empty string.'
            });
        }

        const trimmedText = message_text.trim();
        if (trimmedText.length < 2) {
            return res.status(400).json({
                status: 'error',
                message: 'Message text must be at least 2 characters long.'
            });
        }

        if (trimmedText.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({
                status: 'error',
                message: `Message text exceeds the maximum allowed length of ${MAX_MESSAGE_LENGTH} characters.`
            });
        }

        // 2. Validate optional URL
        let cleanUrl = null;
        if (url !== undefined && url !== null && url !== '') {
            if (typeof url !== 'string') {
                return res.status(400).json({
                    status: 'error',
                    message: 'URL must be a valid string.'
                });
            }

            cleanUrl = url.trim();
            if (cleanUrl.length > MAX_URL_LENGTH) {
                return res.status(400).json({
                    status: 'error',
                    message: `URL exceeds the maximum allowed length of ${MAX_URL_LENGTH} characters.`
                });
            }
        }

        // 3. Forward request to Python FastAPI Scam Shield service on Port 8003
        let serviceResponse;
        try {
            serviceResponse = await fetch(`${SCAM_SERVICE_URL}/api/scam/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    message_text: trimmedText,
                    url: cleanUrl || null
                }),
                signal: AbortSignal.timeout(10000) // 10-second timeout guard
            });
        } catch (fetchError) {
            console.error('Error connecting to Scam Shield microservice:', fetchError.message);

            if (fetchError.name === 'TimeoutError') {
                return res.status(504).json({
                    status: 'error',
                    message: 'Scam Shield service timed out while analyzing the message. Please try again.'
                });
            }

            return res.status(503).json({
                status: 'error',
                message: 'The Scam Shield AI microservice is temporarily offline or unreachable on port 8003.',
                service: 'scam-shield'
            });
        }

        // 4. Handle non-200 responses from upstream Python service
        if (!serviceResponse.ok) {
            let errorMsg = `Scam Shield microservice returned status ${serviceResponse.status}`;
            try {
                const errBody = await serviceResponse.json();
                if (errBody.detail) errorMsg = errBody.detail;
                else if (errBody.message) errorMsg = errBody.message;
            } catch {
                // Ignore JSON parse error
            }

            return res.status(serviceResponse.status).json({
                status: 'error',
                message: errorMsg
            });
        }

        const result = await serviceResponse.json();

        // 5. Return sanitized, structured response
        res.json({
            status: 'success',
            is_mock: Boolean(result.is_mock),
            risk_level: result.risk_level || 'low',
            scam_type: result.scam_type || 'Unclassified / General Inquiry',
            confidence_score: typeof result.confidence_score === 'number' ? result.confidence_score : 0.5,
            matched_patterns: Array.isArray(result.matched_patterns) ? result.matched_patterns : [],
            warning_signs: Array.isArray(result.warning_signs) ? result.warning_signs : [],
            recommended_actions: Array.isArray(result.recommended_actions) ? result.recommended_actions : [],
            advisory_sources: Array.isArray(result.advisory_sources) ? result.advisory_sources : [],
            disclaimer: result.disclaimer || 'This is an automated educational heuristic tool and does NOT guarantee that any message is 100% safe or fraudulent. Always verify through official channels.'
        });
    } catch (error) {
        console.error('Unhandled error in scam analyze gateway:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'An unexpected internal error occurred while analyzing the suspicious message.'
        });
    }
});

module.exports = router;
