/**
 * AdhikarAI - Document Doctor Integration Route
 * 
 * Secure gateway connecting frontend citizen document verification
 * to the Python Document Doctor microservice running on port 8002.
 * Enforces file validation, size limits, and sanitizes responses.
 */

const express = require('express');
const router = express.Router();

const DOC_DOCTOR_SERVICE_URL = process.env.DOC_DOCTOR_SERVICE_URL || 'http://127.0.0.1:8002';

// Supported file extensions for scheme document uploads
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
const MAX_FILE_SIZE_KB = 5 * 1024; // 5 MB

/**
 * GET /api/documents/health
 * Probes connectivity to the Python Document Doctor microservice.
 */
router.get('/health', async (req, res) => {
    try {
        const response = await fetch(`${DOC_DOCTOR_SERVICE_URL}/api/health`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(3000)
        });

        if (!response.ok) {
            return res.status(502).json({
                status: 'error',
                message: 'Document Doctor microservice responded with an error.',
                statusCode: response.status
            });
        }

        const data = await response.json();
        res.json({
            status: 'success',
            gateway: 'Node.js Express',
            doc_service: data
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'Document Doctor microservice is unreachable on port 8002.',
            error: error.message
        });
    }
});

/**
 * GET /api/documents/rules
 * Returns available document verification rules from the microservice.
 */
router.get('/rules', async (req, res) => {
    try {
        const response = await fetch(`${DOC_DOCTOR_SERVICE_URL}/api/rules`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(4000)
        });

        if (!response.ok) {
            return res.status(502).json({
                status: 'error',
                message: 'Failed to retrieve document rules from AI service.'
            });
        }

        const rules = await response.json();
        res.json({
            status: 'success',
            count: rules.length,
            rules: rules
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'Document Doctor service is offline. Unable to fetch rules.',
            error: error.message
        });
    }
});

/**
 * POST /api/documents/check
 * Validates document metadata and runs rule-based pre-verification.
 */
router.post('/check', async (req, res) => {
    try {
        const { scheme_id, document_type, document_name, file_name, file_size_kb, user_notes } = req.body || {};

        // 1. Validate required fields
        if (!document_name || typeof document_name !== 'string' || !document_name.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Document name is required.'
            });
        }

        if (!document_type || typeof document_type !== 'string' || !document_type.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Document type is required.'
            });
        }

        // 2. Validate file format / extension
        if (file_name) {
            if (typeof file_name !== 'string') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid file name format.'
                });
            }

            const cleanFileName = file_name.trim();
            const parts = cleanFileName.split('.');
            const ext = parts.length > 1 ? parts.pop().toLowerCase() : '';

            if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
                return res.status(400).json({
                    status: 'error',
                    message: `Unsupported file type '${ext || 'unknown'}'. Only PDF and images (JPG, PNG) are accepted.`
                });
            }
        }

        // 3. Validate file size (empty or oversized)
        if (file_size_kb !== undefined && file_size_kb !== null) {
            const size = Number(file_size_kb);
            if (isNaN(size) || size <= 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Uploaded file is empty (0 KB). Please select a valid, legible certificate.'
                });
            }

            if (size > MAX_FILE_SIZE_KB) {
                return res.status(400).json({
                    status: 'error',
                    message: `File size (${(size / 1024).toFixed(1)} MB) exceeds the 5 MB limit. Please compress or resize the document.`
                });
            }
        }

        // 4. Forward to Python Document Doctor microservice
        let serviceResponse;
        try {
            serviceResponse = await fetch(`${DOC_DOCTOR_SERVICE_URL}/api/documents/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    scheme_id: scheme_id ? String(scheme_id).trim() : null,
                    document_type: document_type.trim(),
                    document_name: document_name.trim(),
                    file_name: file_name ? file_name.trim() : 'sample_document.pdf',
                    file_size_kb: file_size_kb !== undefined && file_size_kb !== null ? Number(file_size_kb) : 150,
                    user_notes: user_notes ? String(user_notes).trim() : ''
                }),
                signal: AbortSignal.timeout(10000) // 10-second timeout guard
            });
        } catch (fetchError) {
            console.error('Error connecting to Document Doctor microservice:', fetchError.message);

            if (fetchError.name === 'TimeoutError') {
                return res.status(504).json({
                    status: 'error',
                    message: 'Document Doctor service timed out while analyzing the document. Please try again.'
                });
            }

            return res.status(503).json({
                status: 'error',
                message: 'The Document Doctor AI service is temporarily offline or unreachable on port 8002.',
                service: 'document-doctor'
            });
        }

        if (!serviceResponse.ok) {
            let errorMsg = `Upstream service returned status ${serviceResponse.status}`;
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

        // Return sanitized result
        res.json({
            status: 'success',
            is_mock: result.is_mock !== undefined ? result.is_mock : true,
            rule_id: result.rule_id || 'N/A',
            document_name: result.document_name || document_name,
            document_type: result.document_type || document_type,
            document_purpose: result.document_purpose || '',
            issuing_authority: result.issuing_authority || 'Official Authority',
            official_verification_method: result.official_verification_method || 'Official Portal',
            accepted_format: result.accepted_format || 'PDF / Image',
            expiry_or_validity_rule: result.expiry_or_validity_rule || 'Not specified',
            extracted_fields: result.extracted_fields || {},
            missing_or_unreadable: Array.isArray(result.missing_or_unreadable) ? result.missing_or_unreadable : [],
            possible_mismatches: Array.isArray(result.possible_mismatches) ? result.possible_mismatches : [],
            validation_checks: Array.isArray(result.validation_checks) ? result.validation_checks : [],
            common_errors_to_check: Array.isArray(result.common_errors_to_check) ? result.common_errors_to_check : [],
            warnings: Array.isArray(result.warnings) ? result.warnings : [],
            corrective_action: result.corrective_action || '',
            source_url: result.source_url || '',
            disclaimer: result.disclaimer || 'This is a demonstration analysis based on official validation rules in our dataset.'
        });
    } catch (error) {
        console.error('Unhandled error in document check gateway:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'An unexpected internal error occurred while analyzing the document.'
        });
    }
});

module.exports = router;
