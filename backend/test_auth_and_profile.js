/**
 * AdhikarAI — Automated Authentication and Citizen Profile API Test Suite
 * File: backend/test_auth_and_profile.js
 * 
 * Safety & Database Isolation Design:
 * - Uses an ephemeral SQLite database (test_auth_profile_isolated.db) created at runtime.
 * - NEVER writes to, modifies, or pollutes the development database (adhikar.db).
 * - Enforces explicit path safety assertion preventing accidental target of adhikar.db.
 * - Closes database connections, in-process server, and unlinks test file in a robust finally block.
 * - Restores Node.js module cache for config/db upon completion.
 * - Redacts passwords, secrets, and full authentication tokens from all console output.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const express = require('express');
const jwt = require('jsonwebtoken');

// Ensure working directory is backend/
const backendDir = __dirname;
const testDbPath = path.join(backendDir, 'test_auth_profile_isolated.db');

// STRICT SAFETY ASSERTION: Guarantee test path never points to development database
if (path.resolve(testDbPath).toLowerCase().endsWith('adhikar.db')) {
    throw new Error('FATAL SAFETY VIOLATION: Test database path cannot point to the development database (adhikar.db).');
}

// Ensure cleanup on sudden process termination
function cleanupTestDbFile() {
    if (fs.existsSync(testDbPath)) {
        try { fs.unlinkSync(testDbPath); } catch {}
    }
}
process.on('exit', cleanupTestDbFile);
process.on('SIGINT', () => { cleanupTestDbFile(); process.exit(1); });

// Setup environment and secrets for test runner
const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test_isolated_jwt_secret_key_minimum_32_chars_2026';
process.env.JWT_SECRET = TEST_JWT_SECRET;

let passed = 0;
let failed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`  [PASS] ${testName}`);
        passed++;
    } else {
        console.error(`  [FAIL] ${testName}`);
        failed++;
    }
}

async function runTestSuite() {
    console.log('================================================================================');
    console.log('  ADHIKARAI — AUTHENTICATION & CITIZEN PROFILE API TEST SUITE');
    console.log('  Database Strategy: Fully Isolated Ephemeral SQLite DB (Zero adhikar.db impact)');
    console.log('================================================================================\n');

    let testDb = null;
    let server = null;

    try {
        // 1. Initialize isolated test database schema
        cleanupTestDbFile();

        testDb = new Database(testDbPath);
        testDb.pragma('foreign_keys = ON');

        testDb.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        `);

        testDb.exec(`
            CREATE TABLE IF NOT EXISTS profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                age INTEGER,
                gender TEXT,
                annual_income REAL,
                category TEXT,
                state TEXT,
                education_level TEXT,
                course TEXT,
                occupation TEXT,
                is_minority INTEGER DEFAULT 0,
                is_bpl INTEGER DEFAULT 0,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // 2. Intercept require.cache so routes connect exclusively to testDb
        const dbModulePath = require.resolve('./config/db');
        require.cache[dbModulePath] = {
            id: dbModulePath,
            filename: dbModulePath,
            loaded: true,
            exports: testDb
        };

        // 3. Mount routes onto an isolated in-process Express application
        const authRoutes = require('./routes/authRoutes');
        const profileRoutes = require('./routes/profileRoutes');

        const app = express();
        app.use(express.json());
        app.use('/api/auth', authRoutes);
        app.use('/api/profile', profileRoutes);

        // 4. Bind to ephemeral random port
        server = await new Promise((resolve, reject) => {
            const s = app.listen(0, '127.0.0.1', () => resolve(s));
            s.on('error', reject);
        });

        const port = server.address().port;
        const baseUrl = `http://127.0.0.1:${port}`;

        async function apiRequest(endpoint, options = {}) {
            const url = `${baseUrl}${endpoint}`;
            const res = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                }
            });
            const body = await res.json().catch(() => null);
            return { status: res.status, body };
        }

        const testUser = {
            name: 'Asha Patil',
            email: 'asha.patil.test@example.in',
            password: 'SecureTestPassword123!'
        };

        let authToken = null;
        let userId = null;

        // -------------------------------------------------------------
        // SUITE 1: REGISTRATION ENDPOINT (POST /api/auth/register)
        // -------------------------------------------------------------
        console.log('--- Suite 1: User Registration Validations ---');

        // Test 1.1: Registration with missing required fields
        const missingFieldsRes = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email: testUser.email })
        });
        assert(missingFieldsRes.status === 400 && missingFieldsRes.body?.status === 'error',
            'Registration rejects missing name/password with HTTP 400 Bad Request');

        // Test 1.2: Registration with short password (< 8 chars)
        const shortPassRes = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name: testUser.name, email: testUser.email, password: 'short' })
        });
        assert(shortPassRes.status === 400 && shortPassRes.body?.message?.includes('8 characters'),
            'Registration enforces 8-character password length boundary with HTTP 400');

        // Test 1.3: Registration with valid input
        const validRegRes = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(testUser)
        });
        assert(validRegRes.status === 201 && validRegRes.body?.status === 'success' && validRegRes.body?.user?.id,
            'Registration succeeds with HTTP 201 Created and returns user ID and sanitized profile');
        userId = validRegRes.body?.user?.id;

        // Test 1.4: Registration rejects duplicate email
        const dupRegRes = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(testUser)
        });
        assert(dupRegRes.status === 409 && dupRegRes.body?.status === 'error',
            'Registration rejects duplicate email address with HTTP 409 Conflict');

        // -------------------------------------------------------------
        // SUITE 2: LOGIN ENDPOINT (POST /api/auth/login)
        // -------------------------------------------------------------
        console.log('\n--- Suite 2: User Login Validations ---');

        // Test 2.1: Login with missing fields
        const missingLoginRes = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: testUser.email })
        });
        assert(missingLoginRes.status === 400 && missingLoginRes.body?.status === 'error',
            'Login rejects missing password with HTTP 400 Bad Request');

        // Test 2.2: Login with incorrect password
        const wrongPassRes = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: testUser.email, password: 'WrongPassword456!' })
        });
        assert(wrongPassRes.status === 401 && wrongPassRes.body?.status === 'error',
            'Login rejects incorrect password with HTTP 401 Unauthorized');

        // Test 2.3: Login with non-existent email
        const unknownUserRes = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'nonexistent.citizen@example.in', password: testUser.password })
        });
        assert(unknownUserRes.status === 401 && unknownUserRes.body?.status === 'error',
            'Login rejects non-existent account with HTTP 401 Unauthorized');

        // Test 2.4: Login with valid credentials
        const validLoginRes = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: testUser.email, password: testUser.password })
        });
        assert(validLoginRes.status === 200 && validLoginRes.body?.status === 'success' && typeof validLoginRes.body?.token === 'string',
            'Login succeeds with HTTP 200 OK and returns a valid JWT authentication token');
        authToken = validLoginRes.body?.token;

        // -------------------------------------------------------------
        // SUITE 3: TOKEN AUTHENTICATION SECURITY
        // -------------------------------------------------------------
        console.log('\n--- Suite 3: Protected Route Authentication Guards ---');

        // Test 3.1: Protected profile request without token
        const noTokenRes = await apiRequest('/api/profile', { method: 'GET' });
        assert(noTokenRes.status === 401 && noTokenRes.body?.status === 'error',
            'Profile endpoint rejects request lacking Authorization header with HTTP 401');

        // Test 3.2: Protected profile request with malformed token
        const malformedRes = await apiRequest('/api/profile', {
            method: 'GET',
            headers: { Authorization: 'Bearer this_is_a_malformed_fake_token_123' }
        });
        assert(malformedRes.status === 401 && malformedRes.body?.message?.includes('Invalid or expired'),
            'Profile endpoint rejects malformed token with HTTP 401 Unauthorized');

        // Test 3.3: Protected profile request with expired token
        const expiredToken = jwt.sign({ userId }, TEST_JWT_SECRET, { expiresIn: '-10s' });
        const expiredRes = await apiRequest('/api/profile', {
            method: 'GET',
            headers: { Authorization: `Bearer ${expiredToken}` }
        });
        assert(expiredRes.status === 401 && expiredRes.body?.message?.includes('Invalid or expired'),
            'Profile endpoint rejects expired JWT with HTTP 401 Unauthorized');

        // -------------------------------------------------------------
        // SUITE 4: CITIZEN PROFILE CRUD (GET & PUT /api/profile)
        // -------------------------------------------------------------
        console.log('\n--- Suite 4: Citizen Profile Retrieval & Updates ---');

        // Test 4.1: Profile retrieval when no profile has been saved yet
        const initialProfileRes = await apiRequest('/api/profile', {
            method: 'GET',
            headers: { Authorization: `Bearer ${authToken}` }
        });
        assert(initialProfileRes.status === 200 && initialProfileRes.body?.profile === null,
            'Profile retrieval returns 200 OK with profile: null for new accounts');

        // Test 4.2: Profile update with invalid age (< 1 or > 120)
        const invalidAgeRes = await apiRequest('/api/profile', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ age: 180, annualIncome: 250000 })
        });
        assert(invalidAgeRes.status === 400 && invalidAgeRes.body?.message?.includes('between 1 and 120'),
            'Profile update rejects invalid age (> 120) with HTTP 400 Bad Request');

        // Test 4.3: Profile update with negative income
        const negativeIncomeRes = await apiRequest('/api/profile', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ age: 28, annualIncome: -5000 })
        });
        assert(negativeIncomeRes.status === 400 && negativeIncomeRes.body?.message?.includes('non-negative'),
            'Profile update rejects negative income with HTTP 400 Bad Request');

        // Test 4.4: Profile creation & update with valid demographic data
        const profilePayload = {
            age: 26,
            gender: 'Female',
            annualIncome: 180000,
            category: 'OBC',
            state: 'Karnataka',
            educationLevel: 'Graduate',
            course: 'B.Com',
            occupation: 'Accountant',
            isMinority: false,
            isBPL: true
        };

        const saveProfileRes = await apiRequest('/api/profile', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${authToken}` },
            body: JSON.stringify(profilePayload)
        });
        assert(saveProfileRes.status === 200 && saveProfileRes.body?.status === 'success' && saveProfileRes.body?.profile?.age === 26,
            'Profile update saves valid demographic fields and returns HTTP 200 OK');

        // Test 4.5: Profile retrieval verifies persisted fields
        const getUpdatedProfileRes = await apiRequest('/api/profile', {
            method: 'GET',
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const p = getUpdatedProfileRes.body?.profile;
        assert(
            getUpdatedProfileRes.status === 200 &&
            p?.age === 26 &&
            p?.state === 'Karnataka' &&
            p?.category === 'OBC' &&
            p?.is_bpl === true &&
            p?.annual_income === 180000,
            'Profile retrieval accurately reflects saved state, category, BPL flag, and income'
        );

    } finally {
        // 5. Robust Teardown: close server, close database, restore module cache, unlink test file
        if (server) {
            try {
                await new Promise((resolve) => server.close(resolve));
            } catch {}
        }

        if (testDb && testDb.open) {
            try {
                testDb.close();
            } catch {}
        }

        // Restore Node.js module cache
        try {
            delete require.cache[require.resolve('./config/db')];
            delete require.cache[require.resolve('./routes/authRoutes')];
            delete require.cache[require.resolve('./routes/profileRoutes')];
        } catch {}

        // Guarantee deletion of test database file
        cleanupTestDbFile();
    }

    console.log('\n================================================================================');
    console.log(`  TEST RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log('================================================================================');

    if (failed > 0) {
        process.exit(1);
    }
}

// Export for programmatic invocation or run directly if called as a script
if (require.main === module) {
    runTestSuite().catch((err) => {
        cleanupTestDbFile();
        console.error('Unhandled test suite error:', err.message);
        process.exit(1);
    });
}

module.exports = { runTestSuite };
