
const db = require('./db');

// Store registered users
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
`);

// Store citizen eligibility profiles
db.exec(`
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

// Store government scheme information
db.exec(`
    CREATE TABLE IF NOT EXISTS schemes (
        scheme_id TEXT PRIMARY KEY,
        scheme_name TEXT NOT NULL,
        provider_type TEXT,
        provider_name TEXT,
        jurisdiction TEXT,
        category TEXT,
        benefit_description TEXT,
        benefit_amount REAL,
        benefit_frequency TEXT,
        eligibility_text TEXT,
        min_age INTEGER,
        max_age INTEGER,
        max_family_income REAL,
        eligible_state TEXT,
        eligible_course TEXT,
        required_documents TEXT,
        application_start TEXT,
        application_deadline TEXT,
        application_url TEXT,
        source_url TEXT,
        guideline_url TEXT,
        academic_year TEXT,
        last_verified TEXT,
        verification_status TEXT,
        notes TEXT
    );
`);

console.log('Database tables created successfully!');
