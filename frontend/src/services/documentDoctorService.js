/**
 * AdhikarAI - Document Doctor Service
 * 
 * Frontend service connecting the citizen Document Doctor UI
 * to the Node.js Express backend (Port 3000) and Document Doctor microservice (Port 8002).
 */

import documentsData from '../data/documents.json';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Sends document metadata and verification request to the backend.
 * 
 * @param {Object} payload
 * @param {string} [payload.scheme_id]
 * @param {string} payload.document_type
 * @param {string} payload.document_name
 * @param {string} [payload.file_name]
 * @param {number} [payload.file_size_kb]
 * @param {string} [payload.user_notes]
 * @returns {Promise<Object>} Verification analysis response
 */
export async function checkDocument(payload) {
    if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid request payload.');
    }

    if (!payload.document_name || !payload.document_name.trim()) {
        throw new Error('Document name is required for verification.');
    }

    if (!payload.document_type || !payload.document_type.trim()) {
        throw new Error('Document category is required.');
    }

    const endpoint = `${API_BASE_URL}/api/documents/check`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                scheme_id: payload.scheme_id || null,
                document_type: payload.document_type.trim(),
                document_name: payload.document_name.trim(),
                file_name: payload.file_name || 'sample_document.pdf',
                file_size_kb: typeof payload.file_size_kb === 'number' ? payload.file_size_kb : 150,
                user_notes: payload.user_notes || ''
            })
        });

        if (!response.ok) {
            let errorMsg = `Document service returned status ${response.status}.`;
            try {
                const errJson = await response.json();
                if (errJson.message) errorMsg = errJson.message;
                else if (errJson.detail) errorMsg = errJson.detail;
            } catch {
                // Ignore parse errors
            }

            if (response.status === 503) {
                errorMsg = 'The Document Doctor AI service is temporarily offline. Please ensure the Python service is running on port 8002.';
            } else if (response.status === 504) {
                errorMsg = 'Document Doctor timed out while analyzing the file. Please try again.';
            }

            throw new Error(errorMsg);
        }

        const data = await response.json();
        return {
            status: data.status || 'success',
            is_mock: Boolean(data.is_mock),
            rule_id: data.rule_id || 'N/A',
            document_name: data.document_name || payload.document_name,
            document_type: data.document_type || payload.document_type,
            document_purpose: data.document_purpose || '',
            issuing_authority: data.issuing_authority || 'Official Authority',
            official_verification_method: data.official_verification_method || 'Official Portal',
            accepted_format: data.accepted_format || 'PDF / Image',
            expiry_or_validity_rule: data.expiry_or_validity_rule || 'Not specified',
            extracted_fields: data.extracted_fields || {},
            missing_or_unreadable: Array.isArray(data.missing_or_unreadable) ? data.missing_or_unreadable : [],
            possible_mismatches: Array.isArray(data.possible_mismatches) ? data.possible_mismatches : [],
            validation_checks: Array.isArray(data.validation_checks) ? data.validation_checks : [],
            common_errors_to_check: Array.isArray(data.common_errors_to_check) ? data.common_errors_to_check : [],
            warnings: Array.isArray(data.warnings) ? data.warnings : [],
            corrective_action: data.corrective_action || '',
            source_url: data.source_url || '',
            disclaimer: data.disclaimer || 'This is a demonstration analysis based on official validation rules in our dataset.'
        };
    } catch (error) {
        if (error.name === 'TypeError' && error.message.toLowerCase().includes('fetch')) {
            console.error(`[documentDoctorService] Connection failed to ${endpoint}:`, error);
            throw new Error(`Unable to connect to AdhikarAI backend at ${API_BASE_URL}. Ensure Node.js server is active on port 3000.`);
        }
        throw error;
    }
}

/**
 * Checks connectivity to the Document Doctor microservice via backend.
 * 
 * @returns {Promise<Object>} Health status details
 */
export async function checkDocumentHealth() {
    const endpoint = `${API_BASE_URL}/api/documents/health`;
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            return {
                isHealthy: false,
                message: `Health check returned status ${response.status}`
            };
        }

        const data = await response.json();
        return {
            isHealthy: data.status === 'success' && data.doc_service?.status === 'healthy',
            data: data
        };
    } catch (err) {
        return {
            isHealthy: false,
            message: `Backend is unreachable at ${API_BASE_URL}: ${err.message}`
        };
    }
}

/**
 * Returns available document verification rules.
 * 
 * @returns {Array} List of document rules
 */
export function getDocumentRules() {
    return documentsData;
}

export default {
    checkDocument,
    checkDocumentHealth,
    getDocumentRules
};
