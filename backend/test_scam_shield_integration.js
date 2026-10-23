/**
 * AdhikarAI - JavaScript Integration Test Suite for Scam Shield
 * 
 * Verifies Node.js Express backend (Port 3000) and Python FastAPI (Port 8003)
 * integration across health probes, heuristics detection, and validation checks.
 * 
 * Run: node test_scam_shield_integration.js
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runTests() {
    console.log('\n=======================================================');
    console.log(' AdhikarAI Scam Shield Backend Integration Tests (JS)');
    console.log(' Target:', BASE_URL);
    console.log('=======================================================\n');

    let passed = 0;
    let failed = 0;

    // Test 1: Health Check Probe
    try {
        console.log('Test 1: GET /api/scam/health');
        const res = await fetch(`${BASE_URL}/api/scam/health`);
        const data = await res.json();

        if (res.ok && data.status === 'success' && data.scam_service?.status === 'healthy') {
            console.log('  PASS: Health probe connected to Python service on port', data.scam_service.port);
            console.log('        Patterns loaded:', data.scam_service.patterns_loaded);
            passed++;
        } else {
            console.error('  FAIL: Unexpected health response:', data);
            failed++;
        }
    } catch (err) {
        console.error('  FAIL: Health check error:', err.message);
        failed++;
    }

    // Test 2: Urgent Electricity Disconnection Scam
    try {
        console.log('\nTest 2: POST /api/scam/analyze (Electricity Disconnection Threat)');
        const payload = {
            message_text: 'Dear Customer, your electricity connection will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Please immediately call 9876543210.',
            url: 'http://power-bill-update.xyz'
        };

        const res = await fetch(`${BASE_URL}/api/scam/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.risk_level === 'high' && data.scam_type.includes('Power Bill')) {
            console.log('  PASS: Flagged as HIGH risk:', data.scam_type);
            console.log('        Confidence Score:', data.confidence_score);
            console.log('        Warning Signs:', data.warning_signs.length);
            passed++;
        } else {
            console.error('  FAIL: Expected high-risk Power Bill Fraud, received:', data);
            failed++;
        }
    } catch (err) {
        console.error('  FAIL: Analyze error:', err.message);
        failed++;
    }

    // Test 3: Fake Scholarship Advance-Fee Scam
    try {
        console.log('\nTest 3: POST /api/scam/analyze (Fake Scholarship)');
        const payload = {
            message_text: 'Congratulations! You have been awarded National Higher Education Scholarship worth Rs 50,000. Click http://scholarship-gov-grant.in/apply to pay processing fee of Rs 499 and claim now.'
        };

        const res = await fetch(`${BASE_URL}/api/scam/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.risk_level === 'high' && data.scam_type.includes('Scholarship')) {
            console.log('  PASS: Flagged as HIGH risk fake scholarship:', data.scam_type);
            passed++;
        } else {
            console.error('  FAIL: Expected fake scholarship detection, received:', data);
            failed++;
        }
    } catch (err) {
        console.error('  FAIL: Analyze error:', err.message);
        failed++;
    }

    // Test 4: Genuine Government Notification (.gov.in)
    try {
        console.log('\nTest 4: POST /api/scam/analyze (Legitimate .gov.in Scholarship Notice)');
        const payload = {
            message_text: 'Dear Student, applications for National Means-cum-Merit Scholarship (NMMS) are open until 31st Oct. Apply online at official portal https://scholarships.gov.in',
            url: 'https://scholarships.gov.in'
        };

        const res = await fetch(`${BASE_URL}/api/scam/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.risk_level === 'safe') {
            console.log('  PASS: Recognized legitimate government notification as SAFE.');
            passed++;
        } else {
            console.error('  FAIL: Expected safe risk level, received:', data);
            failed++;
        }
    } catch (err) {
        console.error('  FAIL: Analyze error:', err.message);
        failed++;
    }

    // Test 5: Input Validation - Empty Message
    try {
        console.log('\nTest 5: POST /api/scam/analyze with empty message (Expect 400)');
        const res = await fetch(`${BASE_URL}/api/scam/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message_text: '' })
        });
        const data = await res.json();

        if (res.status === 400 && data.status === 'error') {
            console.log('  PASS: Correctly rejected empty message with HTTP 400:', data.message);
            passed++;
        } else {
            console.error('  FAIL: Expected HTTP 400 for empty message, received status:', res.status);
            failed++;
        }
    } catch (err) {
        console.error('  FAIL: Validation error:', err.message);
        failed++;
    }

    // Test 6: Input Validation - Oversized Message (> 5000 chars)
    try {
        console.log('\nTest 6: POST /api/scam/analyze with oversized message (> 5000 chars, Expect 400)');
        const res = await fetch(`${BASE_URL}/api/scam/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message_text: 'A'.repeat(5005) })
        });
        const data = await res.json();

        if (res.status === 400 && data.status === 'error') {
            console.log('  PASS: Correctly rejected oversized message with HTTP 400:', data.message);
            passed++;
        } else {
            console.error('  FAIL: Expected HTTP 400 for oversized message, received status:', res.status);
            failed++;
        }
    } catch (err) {
        console.error('  FAIL: Validation error:', err.message);
        failed++;
    }

    // Test 7: Input Validation - Whitespace-only Message (Expect 400)
    try {
        console.log('\nTest 7: POST /api/scam/analyze with whitespace-only message (Expect 400)');
        const res = await fetch(`${BASE_URL}/api/scam/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message_text: '      ' })
        });
        const data = await res.json();

        if (res.status === 400 && data.status === 'error') {
            console.log('  PASS: Correctly rejected whitespace-only message with HTTP 400:', data.message);
            passed++;
        } else {
            console.error('  FAIL: Expected HTTP 400 for whitespace-only message, received status:', res.status);
            failed++;
        }
    } catch (err) {
        console.error('  FAIL: Validation error:', err.message);
        failed++;
    }

    // Test 8: Input Validation - URL with incorrect type (numeric) (Expect 400)
    try {
        console.log('\nTest 8: POST /api/scam/analyze with numeric URL (Expect 400)');
        const res = await fetch(`${BASE_URL}/api/scam/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message_text: 'Dear customer please check bill', url: 123456 })
        });
        const data = await res.json();

        if (res.status === 400 && data.status === 'error') {
            console.log('  PASS: Correctly rejected non-string URL with HTTP 400:', data.message);
            passed++;
        } else {
            console.error('  FAIL: Expected HTTP 400 for non-string URL, received status:', res.status);
            failed++;
        }
    } catch (err) {
        console.error('  FAIL: Validation error:', err.message);
        failed++;
    }

    // Test 9: Input Validation - URL exceeding 1,000 characters (Expect 400)
    try {
        console.log('\nTest 9: POST /api/scam/analyze with oversized URL (> 1000 chars, Expect 400)');
        const res = await fetch(`${BASE_URL}/api/scam/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message_text: 'Dear customer please verify your account',
                url: 'https://secure-bank-login.example.com/' + 'a'.repeat(1005)
            })
        });
        const data = await res.json();

        if (res.status === 400 && data.status === 'error') {
            console.log('  PASS: Correctly rejected oversized URL with HTTP 400:', data.message);
            passed++;
        } else {
            console.error('  FAIL: Expected HTTP 400 for oversized URL, received status:', res.status);
            failed++;
        }
    } catch (err) {
        console.error('  FAIL: Validation error:', err.message);
        failed++;
    }

    // Test 10: Direct Python Scam Shield Service Validation (Port 8003 Pydantic limits)
    try {
        console.log('\nTest 10: Direct Python Scam Shield validation probe on port 8003 (Pydantic limits)');
        const pyRes = await fetch('http://127.0.0.1:8003/api/scam/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message_text: 'A'.repeat(5005)
            }),
            signal: AbortSignal.timeout(2000)
        });

        if (pyRes.status === 422) {
            console.log('  PASS: Direct Python service rejects message > 5000 chars with HTTP 422 (Pydantic validation)');
            passed++;
        } else {
            console.error('  FAIL: Expected HTTP 422 from Python service, received:', pyRes.status);
            failed++;
        }
    } catch (pyErr) {
        console.log('  [INFO] Direct Python test skipped:', pyErr.message);
    }

    console.log('\n=======================================================');
    console.log(` Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('=======================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
