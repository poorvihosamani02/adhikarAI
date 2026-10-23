/**
 * AdhikarAI - Document Checklist & Processing Service
 * 
 * Accurately parses and structures document requirements from the official
 * scheme dataset without fabricating unverified certificates.
 */

/**
 * Categorizes a document name into an intuitive domain group.
 * @param {string} docName
 * @returns {string} Category label
 */
function inferDocumentCategory(docName) {
    const lower = docName.toLowerCase();
    
    // Check self-declaration / employment declarations first
    if (lower.includes('self-declaration') || lower.includes('declaration of') || lower.includes('unemployed') || lower.includes('employment status')) {
        return 'Self-Declaration / Affidavit';
    }
    if (lower.includes('income') || lower.includes('salary') || lower.includes('itr') || lower.includes('form 16') || lower.includes('affidavit')) {
        return 'Income Proof';
    }
    if (lower.includes('caste') || lower.includes('tribe') || lower.includes('obc') || lower.includes('dnt') || /\b(sc|st)\b/i.test(docName) || lower.includes('category certificate')) {
        return 'Category / Caste Certificate';
    }
    if (lower.includes('aadhaar') || lower.includes('pan') || lower.includes('voter') || lower.includes('epic') || lower.includes('passport') || lower.includes('identity')) {
        return 'Identity Proof';
    }
    if (lower.includes('domicile') || lower.includes('residence') || lower.includes('ration') || lower.includes('electricity') || lower.includes('bill')) {
        return 'Domicile & Residence Proof';
    }
    if (lower.includes('admission') || lower.includes('fee') || lower.includes('receipt') || lower.includes('marks') || lower.includes('degree') || lower.includes('diploma') || lower.includes('bonafide') || lower.includes('sats')) {
        return 'Academic & Institution Record';
    }
    if (lower.includes('bank') || lower.includes('passbook') || lower.includes('account')) {
        return 'Banking & Financial Document';
    }
    return 'Required Scheme Document';
}

/**
 * Provides contextual guidance based on the document name.
 * @param {string} docName
 * @returns {string} Guidance note
 */
function getDocumentGuidance(docName) {
    const lower = docName.toLowerCase();
    if (lower.includes('income certificate')) {
        return 'Must be issued by competent revenue authority (e.g. Tahsildar / Nadakacheri) and valid for current financial year.';
    }
    if (lower.includes('caste') || lower.includes('category certificate')) {
        return 'Must state official community/caste code matching government notified lists.';
    }
    if (lower.includes('aadhaar')) {
        return 'UIDAI Aadhaar card/letter or e-Aadhaar. Ensure name spelling matches academic records.';
    }
    if (lower.includes('ration card')) {
        return 'Food & Civil Supplies ration card showing applicant / family members.';
    }
    if (lower.includes('fee receipt')) {
        return 'Official stamped fee receipt for current academic year with fee breakdown.';
    }
    if (lower.includes('admission letter')) {
        return 'Official allotment or admission letter issued by the educational institution.';
    }
    if (lower.includes('domicile') || lower.includes('residence')) {
        return 'Permanent residence certificate issued by the competent state department.';
    }
    if (lower.includes('self-declaration')) {
        return 'Formal declaration or affidavit confirming status in prescribed format.';
    }
    return 'Verify exact format and attestation rules on the official government portal.';
}

/**
 * Parses raw required_documents string into an array of structured document objects.
 * 
 * @param {string|null} rawDocs - Semicolon-delimited document list from schemes table
 * @param {string} schemeId - Scheme identifier (e.g. 'GOV001')
 * @returns {Array} Structured document items
 */
function parseRequiredDocuments(rawDocs, schemeId) {
    if (!rawDocs || typeof rawDocs !== 'string' || !rawDocs.trim()) {
        return [];
    }

    // Split on semicolons and filter out any empty entries
    const items = rawDocs
        .split(';')
        .map(item => item.trim())
        .filter(item => item.length > 0);

    return items.map((docName, index) => {
        const category = inferDocumentCategory(docName);
        const guidance = getDocumentGuidance(docName);

        return {
            id: `DOC_${schemeId}_${index + 1}`,
            name: docName,
            category: category,
            guidance: guidance,
            source: 'official_scheme_dataset',
            is_mandatory: true
        };
    });
}

/**
 * Builds the complete document checklist response object for a scheme.
 * 
 * @param {Object} scheme - Scheme database record
 * @returns {Object} Formatted document checklist response
 */
function buildDocumentChecklistResponse(scheme) {
    const documents = parseRequiredDocuments(scheme.required_documents, scheme.scheme_id);
    const hasDocs = documents.length > 0;
    const isVerified = scheme.verification_status === 'verified';

    let unavailableMessage = null;
    if (!hasDocs) {
        unavailableMessage = `Official required documents are not explicitly cataloged in this dataset record for scheme ${scheme.scheme_id} (${scheme.scheme_name}). Please consult the official guideline URL or portal to prevent misinformation.`;
    }

    let verificationWarning = null;
    if (!isVerified) {
        verificationWarning = `This scheme has verification_status="needs_review". Document requirements may vary based on latest ministry notifications.`;
    }

    return {
        status: 'success',
        scheme_id: scheme.scheme_id,
        scheme_name: scheme.scheme_name,
        provider_name: scheme.provider_name || null,
        jurisdiction: scheme.jurisdiction || null,
        category: scheme.category || null,
        verification_status: scheme.verification_status || 'needs_review',
        is_officially_verified: isVerified,
        verification_warning: verificationWarning,
        has_verified_docs: hasDocs,
        has_required_documents: hasDocs,
        documents_count: documents.length,
        documents: documents,
        unavailable_message: unavailableMessage,
        official_portal_url: scheme.application_url || null,
        source_url: scheme.source_url || null,
        guideline_url: scheme.guideline_url || null
    };
}

module.exports = {
    inferDocumentCategory,
    getDocumentGuidance,
    parseRequiredDocuments,
    buildDocumentChecklistResponse
};
