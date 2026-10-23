/**
 * AdhikarAI - Comprehensive Scheme Eligibility Engine Test Suite
 * 
 * Tests all 7 required scenarios:
 * 1. Valid authenticated user with saved profile (evaluation, reasons, scores)
 * 2. User with no profile (graceful has_profile: false response)
 * 3. Missing, malformed, and expired JWT tokens (401 access denied)
 * 4. High-income vs low-income, age boundaries, state boundaries (Karnataka vs Delhi)
 * 5. Missing / unknown profile fields (handling nulls without false passes)
 * 6. verification_status preservation (needs_review vs verified)
 * 7. Regression tests for register, login, profile, and existing scheme endpoints
 */

const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'adhikar_jwt_secret_dev_key_2026';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  [PASS] ${message}`);
        passedTests++;
    } else {
        console.error(`  [FAIL] ${message}`);
        failedTests++;
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
    console.log('       ADHIKARAI SCHEME ELIGIBILITY ENGINE TEST SUITE          ');
    console.log('===============================================================\n');

    const randomSuffix = Math.floor(Math.random() * 100000);
    const testEmail1 = `citizen_profile_${randomSuffix}@example.com`;
    const testEmail2 = `citizen_noprofile_${randomSuffix}@example.com`;
    const testPassword = 'Password123!';

    // -------------------------------------------------------------
    // TEST SUITE 1: REGRESSION TESTS (Existing Endpoints)
    // -------------------------------------------------------------
    console.log('--- 1. Regression Tests: Core Platform Endpoints ---');

    // 1a: Health check
    const health = await request('/api/health');
    assert(health.status === 200 && health.data?.status === 'success', 'GET /api/health responds 200 OK');

    // 1b: Existing scheme catalog listing
    const schemesList = await request('/api/schemes');
    assert(schemesList.status === 200 && schemesList.data?.count === 20, 'GET /api/schemes returns all 20 cataloged schemes');

    // 1c: Existing scheme detail by ID
    const schemeDetail = await request('/api/schemes/GOV001');
    assert(schemeDetail.status === 200 && schemeDetail.data?.data?.scheme_id === 'GOV001', 'GET /api/schemes/GOV001 returns scheme detail');

    // 1d: Existing scheme detail for non-existent ID
    const scheme404 = await request('/api/schemes/GOV99999');
    assert(scheme404.status === 404 && scheme404.data?.status === 'error', 'GET /api/schemes/GOV99999 correctly returns 404');

    // 1e: User Registration
    const regRes1 = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: 'Priya Sharma', email: testEmail1, password: testPassword })
    });
    assert(regRes1.status === 201 && regRes1.data?.status === 'success', 'POST /api/auth/register creates user account');

    const regRes2 = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: 'Rahul Verma', email: testEmail2, password: testPassword })
    });
    assert(regRes2.status === 201, 'POST /api/auth/register creates second user account for no-profile test');

    // 1f: User Login
    const loginRes1 = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail1, password: testPassword })
    });
    assert(loginRes1.status === 200 && loginRes1.data?.token, 'POST /api/auth/login returns valid JWT token');
    const token1 = loginRes1.data.token;

    const loginRes2 = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail2, password: testPassword })
    });
    const token2 = loginRes2.data.token;

    // -------------------------------------------------------------
    // TEST SUITE 2: USER WITH NO PROFILE
    // -------------------------------------------------------------
    console.log('\n--- 2. Eligibility Test: User With No Saved Profile ---');
    const noProfileMatched = await request('/api/schemes/matched', {
        headers: { Authorization: `Bearer ${token2}` }
    });
    assert(noProfileMatched.status === 200, 'GET /api/schemes/matched returns 200 for user without profile');
    assert(noProfileMatched.data?.has_profile === false, 'Response has_profile is explicitly false');
    assert(noProfileMatched.data?.matched_count === 0, 'matched_count is 0 when profile is missing');
    assert(Array.isArray(noProfileMatched.data?.schemes) && noProfileMatched.data.schemes.length === 0, 'schemes array is empty');
    assert(typeof noProfileMatched.data?.message === 'string' && noProfileMatched.data.message.includes('complete your profile'), 'Clear prompt advising citizen to complete profile');

    // -------------------------------------------------------------
    // TEST SUITE 3: TOKEN SECURITY & AUTHENTICATION TESTS
    // -------------------------------------------------------------
    console.log('\n--- 3. Security Tests: Missing, Malformed & Expired Tokens ---');

    // 3a: Missing Authorization header
    const missingToken = await request('/api/schemes/matched');
    assert(missingToken.status === 401, 'GET /api/schemes/matched rejects request without Authorization header (401)');

    // 3b: Malformed token
    const malformedToken = await request('/api/schemes/matched', {
        headers: { Authorization: 'Bearer this_is_definitely_not_a_valid_jwt' }
    });
    assert(malformedToken.status === 401, 'GET /api/schemes/matched rejects malformed token (401)');

    // 3c: Expired token
    const expiredJwt = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '-10s' });
    const expiredRes = await request('/api/schemes/matched', {
        headers: { Authorization: `Bearer ${expiredJwt}` }
    });
    assert(expiredRes.status === 401, 'GET /api/schemes/matched rejects expired token (401)');

    // 3d: Tampered signature token
    const forgedJwt = jwt.sign({ userId: 1 }, 'wrong_secret_key_1234');
    const forgedRes = await request('/api/schemes/matched', {
        headers: { Authorization: `Bearer ${forgedJwt}` }
    });
    assert(forgedRes.status === 401, 'GET /api/schemes/matched rejects invalid signature token (401)');

    // -------------------------------------------------------------
    // TEST SUITE 4: MATCHING ELIGIBILITY (Karnataka Student Profile)
    // Profile: Karnataka female student, OBC, Income ₹1,80,000, Age 21, Undergrad
    // -------------------------------------------------------------
    console.log('\n--- 4. Eligibility Test: Karnataka Low-Income Female OBC Student ---');
    const saveProfileRes = await request('/api/profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token1}` },
        body: JSON.stringify({
            age: 21,
            gender: 'Female',
            annualIncome: 180000,
            category: 'OBC',
            state: 'Karnataka',
            educationLevel: 'Undergraduate',
            course: 'B.Tech',
            occupation: 'Student',
            isMinority: false,
            isBPL: false
        })
    });
    assert(saveProfileRes.status === 200, 'POST /api/profile successfully saves citizen profile');

    // Fetch matched schemes
    const matchedRes = await request('/api/schemes/matched', {
        headers: { Authorization: `Bearer ${token1}` }
    });
    assert(matchedRes.status === 200, 'GET /api/schemes/matched returns 200 for user with profile');
    assert(matchedRes.data?.has_profile === true, 'Response has_profile is true');
    assert(matchedRes.data?.citizen?.state === 'Karnataka', 'Response echoes authenticated citizen data');
    assert(matchedRes.data?.summary?.total_schemes_evaluated === 20, 'Evaluated all 20 cataloged schemes');
    assert(matchedRes.data?.matched_count > 0, `Found ${matchedRes.data?.matched_count} matching schemes`);

    const schemes = matchedRes.data.schemes;

    // Check specific scheme evaluations:
    // Vidyasiri (GOV017 - Karnataka OBC Post-Matric) should be ELIGIBLE
    const vidyasiri = schemes.find(s => s.scheme_id === 'GOV017');
    assert(vidyasiri?.is_eligible === true, 'Vidyasiri (GOV017 - Karnataka OBC) is eligible');
    assert(vidyasiri?.matched_criteria?.some(r => r.includes('Karnataka')), 'Vidyasiri has matched criteria for Karnataka residency');
    assert(vidyasiri?.matched_criteria?.some(r => r.includes('OBC')), 'Vidyasiri has matched criteria for OBC category');

    // Gruha Lakshmi (GOV018 - Karnataka Female) should be ELIGIBLE
    const gruhaLakshmi = schemes.find(s => s.scheme_id === 'GOV018');
    assert(gruhaLakshmi?.is_eligible === true, 'Gruha Lakshmi (GOV018 - Karnataka Female) is eligible');
    assert(gruhaLakshmi?.matched_criteria?.some(r => r.includes('female')), 'Gruha Lakshmi matches female requirement');

    // AICTE Pragati (GOV010 - Girl Student Technical Education <= 8L) should be ELIGIBLE
    const pragati = schemes.find(s => s.scheme_id === 'GOV010');
    assert(pragati?.is_eligible === true, 'AICTE Pragati (GOV010 - Girl Student Technical) is eligible');
    assert(pragati?.matched_criteria?.some(r => r.includes('1,80,000')), 'Pragati matches income within 8L limit');

    // PM-YASASVI College (GOV007 - OBC College <= 2.5L) should be ELIGIBLE
    const yasasvi = schemes.find(s => s.scheme_id === 'GOV007');
    assert(yasasvi?.is_eligible === true, 'PM-YASASVI College (GOV007 - OBC College) is eligible');

    // Atal Pension Yojana (GOV015 - Age 18-40) should be ELIGIBLE (Age 21 is within 18-40)
    const apy = schemes.find(s => s.scheme_id === 'GOV015');
    assert(apy?.is_eligible === true, 'Atal Pension Yojana (GOV015 - Age 18-40) is eligible for age 21');

    // Senior Citizen Health (GOV014 - Age 70+) should be INELIGIBLE (Age 21 < 70)
    const seniorHealth = schemes.find(s => s.scheme_id === 'GOV014');
    assert(seniorHealth?.is_eligible === false, 'AB PM-JAY Senior 70+ (GOV014) is correctly INELIGIBLE for age 21');
    assert(seniorHealth?.unmet_criteria?.some(u => u.includes('below the minimum required age of 70')), 'Explains age below 70 requirement');

    // Post-Matric SC (GOV003 & GOV016) should be INELIGIBLE (Citizen is OBC, not SC)
    const scCentral = schemes.find(s => s.scheme_id === 'GOV003');
    assert(scCentral?.is_eligible === false, 'Post-Matric SC (GOV003) is correctly INELIGIBLE for OBC citizen');
    assert(scCentral?.unmet_criteria?.some(u => u.includes('Scheduled Caste (SC)')), 'Explains SC category requirement unmet');

    // Post-Matric ST (GOV004) should be INELIGIBLE (Citizen is OBC, not ST)
    const stCentral = schemes.find(s => s.scheme_id === 'GOV004');
    assert(stCentral?.is_eligible === false, 'Post-Matric ST (GOV004) is correctly INELIGIBLE for OBC citizen');

    // -------------------------------------------------------------
    // TEST SUITE 5: BOUNDARY & DISQUALIFICATION TEST
    // Profile: Delhi resident, Age 75, High Income ₹15,00,000, Male, General
    // -------------------------------------------------------------
    console.log('\n--- 5. Eligibility Test: Delhi Senior High-Income Male Profile ---');
    await request('/api/profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token1}` },
        body: JSON.stringify({
            age: 75,
            gender: 'Male',
            annualIncome: 1500000,
            category: 'General',
            state: 'Delhi',
            educationLevel: 'Postgraduate',
            course: 'M.Com',
            occupation: 'Retired',
            isMinority: false,
            isBPL: false
        })
    });

    const seniorRes = await request('/api/schemes/matched', {
        headers: { Authorization: `Bearer ${token1}` }
    });
    const seniorSchemes = seniorRes.data.schemes;

    // Senior Citizen Health (GOV014) should now be ELIGIBLE (Age 75 >= 70, no income cap)
    const seniorHealthMatch = seniorSchemes.find(s => s.scheme_id === 'GOV014');
    assert(seniorHealthMatch?.is_eligible === true, 'AB PM-JAY Senior 70+ (GOV014) is now ELIGIBLE for age 75');
    assert(seniorHealthMatch?.matched_criteria?.some(m => m.includes('satisfies age requirement')), 'Matches 70+ age requirement');

    // APY (GOV015 - Max age 40) should be INELIGIBLE (Age 75 > 40)
    const apySenior = seniorSchemes.find(s => s.scheme_id === 'GOV015');
    assert(apySenior?.is_eligible === false, 'Atal Pension Yojana (GOV015) is INELIGIBLE for age 75');
    assert(apySenior?.unmet_criteria?.some(u => u.includes('exceeds the maximum allowed age of 40')), 'Explains age exceeds max age of 40');

    // All Karnataka state schemes should be INELIGIBLE (Citizen state is Delhi)
    const gruhaLakshmiSenior = seniorSchemes.find(s => s.scheme_id === 'GOV018');
    assert(gruhaLakshmiSenior?.is_eligible === false, 'Gruha Lakshmi (Karnataka) is INELIGIBLE for Delhi resident');
    assert(gruhaLakshmiSenior?.unmet_criteria?.some(u => u.includes('Restricted to Karnataka residents')), 'Explains state restriction');

    // CSSS (GOV001 - Max income 4.5L) should be INELIGIBLE (Income 15L > 4.5L)
    const csss = seniorSchemes.find(s => s.scheme_id === 'GOV001');
    assert(csss?.is_eligible === false, 'CSSS (GOV001 - Max Income 4.5L) is INELIGIBLE for income ₹15,00,000');
    assert(csss?.unmet_criteria?.some(u => u.includes('exceeds the scheme maximum income ceiling')), 'Explains income exceeds ₹4,50,000');

    // Girl student scholarship (GOV010) should be INELIGIBLE (Male)
    const pragatiMale = seniorSchemes.find(s => s.scheme_id === 'GOV010');
    assert(pragatiMale?.is_eligible === false, 'AICTE Pragati (GOV010) is INELIGIBLE for Male applicant');
    assert(pragatiMale?.unmet_criteria?.some(u => u.includes('female/woman')), 'Explains female gender requirement unmet');

    // -------------------------------------------------------------
    // TEST SUITE 6: MISSING / UNKNOWN FIELDS HANDLING
    // Profile: Null age, null income, null state
    // -------------------------------------------------------------
    console.log('\n--- 6. Eligibility Test: Incomplete Profile / Null Fields Handling ---');
    await request('/api/profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token1}` },
        body: JSON.stringify({
            age: null,
            gender: null,
            annualIncome: null,
            category: null,
            state: null,
            educationLevel: null,
            course: null,
            occupation: null,
            isMinority: false,
            isBPL: false
        })
    });

    const incompleteRes = await request('/api/schemes/matched', {
        headers: { Authorization: `Bearer ${token1}` }
    });
    const incompleteSchemes = incompleteRes.data.schemes;

    // Check APY with null age: should record unknown condition for age, NOT blindly approve
    const apyIncomplete = incompleteSchemes.find(s => s.scheme_id === 'GOV015');
    assert(apyIncomplete?.unknown_conditions?.some(u => u.includes('citizen age is not provided')), 'Reports unknown age requirement when citizen age is null');

    // Check income-capped scheme with null income: should record unknown condition for income
    const csssIncomplete = incompleteSchemes.find(s => s.scheme_id === 'GOV001');
    assert(csssIncomplete?.unknown_conditions?.some(u => u.includes('annual income is not provided')), 'Reports unknown income requirement when citizen income is null');

    // -------------------------------------------------------------
    // TEST SUITE 7: VERIFICATION STATUS ACCURACY
    // -------------------------------------------------------------
    console.log('\n--- 7. Integrity Test: verification_status Preservation ---');
    const nmmss = incompleteSchemes.find(s => s.scheme_id === 'GOV002');
    assert(nmmss?.verification_status === 'verified', 'GOV002 preserves verification_status="verified"');
    assert(nmmss?.is_officially_verified === true, 'GOV002 has is_officially_verified=true');

    const otherSchemes = incompleteSchemes.filter(s => s.scheme_id !== 'GOV002');
    const allNeedsReview = otherSchemes.every(s => s.verification_status === 'needs_review' && s.is_officially_verified === false);
    assert(allNeedsReview, 'All 19 other schemes preserve verification_status="needs_review" and is_officially_verified=false');
    assert(otherSchemes[0]?.unknown_conditions?.some(u => u.includes('needs_review')), 'Includes cautionary advisory for needs_review schemes');

    // -------------------------------------------------------------
    // TEST SUITE 8: ALIAS ENDPOINT COMPATIBILITY
    // -------------------------------------------------------------
    console.log('\n--- 8. Compatibility Test: Alias Endpoints (/api/eligibility) ---');
    const aliasRes1 = await request('/api/schemes/my-schemes', {
        headers: { Authorization: `Bearer ${token1}` }
    });
    assert(aliasRes1.status === 200 && aliasRes1.data?.status === 'success', 'GET /api/schemes/my-schemes alias works');

    const aliasRes2 = await request('/api/eligibility/matched', {
        headers: { Authorization: `Bearer ${token1}` }
    });
    assert(aliasRes2.status === 200 && aliasRes2.data?.status === 'success', 'GET /api/eligibility/matched alias works');

    // Summary
    console.log('\n===============================================================');
    console.log(`TOTAL TESTS RUN: ${passedTests + failedTests}`);
    console.log(`PASSED: ${passedTests}`);
    console.log(`FAILED: ${failedTests}`);
    console.log('===============================================================\n');

    if (failedTests > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
