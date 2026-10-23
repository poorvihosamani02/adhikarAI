/**
 * AdhikarAI - Scheme Details & Document Checklist Test Suite
 * 
 * Verifies all 6 required scenarios:
 * 1. Retrieving existing scheme details (GOV001, GOV018)
 * 2. Retrieving scheme document checklist (GOV018, GOV009, GOV020)
 * 3. Requesting unknown scheme ID (GOV99999 detail & documents)
 * 4. Schemes with missing document information (GOV002, GOV012, GOV014)
 * 5. Schemes marked needs_review vs verified (warning & advisory validation)
 * 6. Regression tests for scheme listing (GET /api/schemes) and eligibility engine (GET /api/schemes/matched)
 */

const BASE_URL = 'http://localhost:3000';

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  [PASS] ${message}`);
        passed++;
    } else {
        console.error(`  [FAIL] ${message}`);
        failed++;
    }
}

async function request(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
}

async function runTests() {
    console.log('===============================================================');
    console.log('   ADHIKARAI SCHEME DETAILS & DOCUMENT CHECKLIST TEST SUITE    ');
    console.log('===============================================================\n');

    // -------------------------------------------------------------
    // SCENARIO 1: RETRIEVING EXISTING SCHEME DETAILS
    // -------------------------------------------------------------
    console.log('--- 1. Test Existing Scheme Details (GET /api/schemes/:id) ---');
    const gov001 = await request('/api/schemes/GOV001');
    assert(gov001.status === 200, 'GET /api/schemes/GOV001 returns HTTP 200');
    assert(gov001.data?.status === 'success', 'Response status is "success"');
    assert(gov001.data?.scheme?.scheme_id === 'GOV001', 'Scheme ID matches GOV001');
    assert(gov001.data?.scheme?.scheme_name.includes('PM-USP CSSS'), 'Scheme name matches PM-USP CSSS');
    assert(typeof gov001.data?.scheme?.benefit_description === 'string', 'Entitlement benefit description present');
    assert(gov001.data?.scheme?.benefit_amount === 12000, 'Benefit amount ₹12,000 matches dataset');
    assert(gov001.data?.scheme?.max_family_income === 450000, 'Max family income ₹4,50,000 matches dataset');
    assert(gov001.data?.scheme?.application_info?.application_url === 'https://scholarships.gov.in/', 'Application portal URL present');
    assert(gov001.data?.scheme?.verification_info?.status === 'needs_review', 'Verification status is "needs_review"');
    assert(gov001.data?.scheme?.verification_info?.is_officially_verified === false, 'is_officially_verified is false for needs_review scheme');
    assert(gov001.data?.scheme?.verification_info?.warning !== null, 'Contains warning advisory for needs_review scheme');
    assert(gov001.data?.scheme?.has_required_documents === true, 'has_required_documents is true for GOV001');
    assert(gov001.data?.scheme?.structured_documents?.length === 1, 'structured_documents contains 1 parsed document for GOV001');

    // -------------------------------------------------------------
    // SCENARIO 2: RETRIEVING SCHEME DOCUMENT CHECKLIST
    // -------------------------------------------------------------
    console.log('\n--- 2. Test Document Checklist (GET /api/schemes/:id/documents) ---');
    // 2a: GOV018 Gruha Lakshmi (5 documents)
    const gov018Docs = await request('/api/schemes/GOV018/documents');
    assert(gov018Docs.status === 200, 'GET /api/schemes/GOV018/documents returns HTTP 200');
    assert(gov018Docs.data?.has_required_documents === true, 'has_required_documents is true for GOV018');
    assert(gov018Docs.data?.has_verified_docs === true, 'has_verified_docs is true for frontend compatibility');
    assert(gov018Docs.data?.documents_count === 5, 'documents_count is exactly 5 for GOV018');
    assert(gov018Docs.data?.documents?.length === 5, 'documents array contains 5 structured items');

    const firstDoc = gov018Docs.data?.documents?.[0];
    assert(firstDoc?.id === 'DOC_GOV018_1', 'Document item has structured ID DOC_GOV018_1');
    assert(firstDoc?.name.toLowerCase().includes('aadhaar'), 'Document name contains Aadhaar');
    assert(firstDoc?.category === 'Identity Proof', 'Document category correctly inferred as "Identity Proof"');
    assert(typeof firstDoc?.guidance === 'string', 'Document has practical guidance notes');
    assert(firstDoc?.is_mandatory === true, 'is_mandatory flag is true');

    const rationDoc = gov018Docs.data?.documents?.find(d => d.name.toLowerCase().includes('ration'));
    assert(rationDoc?.category === 'Domicile & Residence Proof', 'Ration card categorized under Domicile & Residence Proof');

    // 2b: GOV009 Merit-cum-Means Minorities (3 documents)
    const gov009Docs = await request('/api/schemes/GOV009/documents');
    assert(gov009Docs.status === 200, 'GET /api/schemes/GOV009/documents returns HTTP 200');
    assert(gov009Docs.data?.documents_count === 3, 'GOV009 documents_count is 3 (income, fee receipt, PAN card)');
    const incomeDoc = gov009Docs.data?.documents?.find(d => d.name.toLowerCase().includes('income'));
    assert(incomeDoc?.category === 'Income Proof', 'Income certificate categorized as "Income Proof"');

    // 2c: GOV020 Yuva Nidhi (4 documents)
    const gov020Docs = await request('/api/schemes/GOV020/documents');
    assert(gov020Docs.status === 200, 'GET /api/schemes/GOV020/documents returns HTTP 200');
    assert(gov020Docs.data?.documents_count === 4, 'GOV020 documents_count is 4');
    const selfDeclDoc = gov020Docs.data?.documents?.find(d => d.name.toLowerCase().includes('self-declaration'));
    assert(selfDeclDoc?.category === 'Self-Declaration / Affidavit', 'Self-declaration categorized correctly');

    // -------------------------------------------------------------
    // SCENARIO 3: REQUESTING UNKNOWN SCHEME ID
    // -------------------------------------------------------------
    console.log('\n--- 3. Test Unknown Scheme ID (404 Not Found) ---');
    const unknownDetail = await request('/api/schemes/GOV99999');
    assert(unknownDetail.status === 404, 'GET /api/schemes/GOV99999 returns HTTP 404');
    assert(unknownDetail.data?.status === 'error', 'Error status returned for unknown scheme detail');
    assert(unknownDetail.data?.message === 'Scheme not found.', 'Clear "Scheme not found." message');

    const unknownDocs = await request('/api/schemes/GOV99999/documents');
    assert(unknownDocs.status === 404, 'GET /api/schemes/GOV99999/documents returns HTTP 404');
    assert(unknownDocs.data?.status === 'error', 'Error status returned for unknown scheme documents');
    assert(unknownDocs.data?.message === 'Scheme not found.', 'Clear "Scheme not found." message for documents');

    // -------------------------------------------------------------
    // SCENARIO 4: SCHEMES WITH MISSING DOCUMENT INFORMATION
    // -------------------------------------------------------------
    console.log('\n--- 4. Test Schemes with Missing Document Information ---');
    // 4a: GOV002 NMMSS (has no required_documents in dataset)
    const gov002Docs = await request('/api/schemes/GOV002/documents');
    assert(gov002Docs.status === 200, 'GET /api/schemes/GOV002/documents returns HTTP 200');
    assert(gov002Docs.data?.has_required_documents === false, 'has_required_documents is false when documents are absent');
    assert(gov002Docs.data?.has_verified_docs === false, 'has_verified_docs is false');
    assert(gov002Docs.data?.documents_count === 0, 'documents_count is 0');
    assert(Array.isArray(gov002Docs.data?.documents) && gov002Docs.data.documents.length === 0, 'documents array is empty (no fabricated placeholders)');
    assert(typeof gov002Docs.data?.unavailable_message === 'string', 'Clear unavailable_message explaining absence of cataloged documents');
    assert(gov002Docs.data?.unavailable_message.includes('not explicitly cataloged'), 'unavailable_message mentions not explicitly cataloged');

    // 4b: GOV012 PM-KISAN (has no required_documents in dataset)
    const gov012Docs = await request('/api/schemes/GOV012/documents');
    assert(gov012Docs.status === 200, 'GET /api/schemes/GOV012/documents returns HTTP 200');
    assert(gov012Docs.data?.has_required_documents === false, 'PM-KISAN has_required_documents is false');
    assert(gov012Docs.data?.documents.length === 0, 'PM-KISAN documents array is empty');

    // 4c: GOV014 AB PM-JAY Senior 70+
    const gov014Docs = await request('/api/schemes/GOV014/documents');
    assert(gov014Docs.status === 200, 'GET /api/schemes/GOV014/documents returns HTTP 200');
    assert(gov014Docs.data?.has_required_documents === false, 'Senior 70+ has_required_documents is false');

    // -------------------------------------------------------------
    // SCENARIO 5: VERIFICATION STATUS PRESERVATION (needs_review vs verified)
    // -------------------------------------------------------------
    console.log('\n--- 5. Test verification_status Preservation ---');
    // 5a: GOV002 is the only verified scheme in dataset
    const gov002Detail = await request('/api/schemes/GOV002');
    assert(gov002Detail.data?.scheme?.verification_info?.status === 'verified', 'GOV002 has verification_status="verified"');
    assert(gov002Detail.data?.scheme?.verification_info?.is_officially_verified === true, 'GOV002 has is_officially_verified=true');
    assert(gov002Detail.data?.scheme?.verification_info?.warning === null, 'GOV002 has warning=null');
    assert(gov002Docs.data?.is_officially_verified === true, 'GOV002 documents API preserves is_officially_verified=true');
    assert(gov002Docs.data?.verification_warning === null, 'GOV002 documents API has verification_warning=null');

    // 5b: GOV010 has verification_status='needs_review'
    const gov010Docs = await request('/api/schemes/GOV010/documents');
    assert(gov010Docs.data?.verification_status === 'needs_review', 'GOV010 documents API preserves verification_status="needs_review"');
    assert(gov010Docs.data?.is_officially_verified === false, 'GOV010 has is_officially_verified=false');
    assert(typeof gov010Docs.data?.verification_warning === 'string', 'GOV010 documents API includes cautionary verification_warning');

    // -------------------------------------------------------------
    // SCENARIO 6: REGRESSION TESTS FOR EXISTING SCHEME & ELIGIBILITY APIS
    // -------------------------------------------------------------
    console.log('\n--- 6. Regression Tests: Scheme Catalog & Eligibility Matching ---');
    // 6a: Scheme listing
    const allSchemes = await request('/api/schemes');
    assert(allSchemes.status === 200, 'GET /api/schemes returns HTTP 200');
    assert(allSchemes.data?.count === 20, 'Catalog returns all 20 schemes');

    // 6b: Scheme eligibility matching
    const loginRes = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'testuser@example.com', password: 'TestPass123!' })
    });
    
    let token = loginRes.data?.token;
    if (!token) {
        // Fallback: register a temporary user for eligibility test
        const regRes = await request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Regression Citizen',
                email: `reg_${Date.now()}@example.com`,
                password: 'TestPass123!'
            })
        });
        const reLogin = await request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: regRes.data.user.email, password: 'TestPass123!' })
        });
        token = reLogin.data.token;
    }

    const matchedRes = await request('/api/schemes/matched', {
        headers: { Authorization: `Bearer ${token}` }
    });
    assert(matchedRes.status === 200, 'GET /api/schemes/matched continues to return HTTP 200');
    assert(matchedRes.data?.status === 'success', 'Eligibility matching API status is "success"');

    // Summary
    console.log('\n===============================================================');
    console.log(`TOTAL TESTS RUN: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log('===============================================================\n');

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
