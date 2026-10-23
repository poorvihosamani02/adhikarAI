
const Database = require('better-sqlite3');
const path = require('path');

// Store the database file inside the backend folder
const dbPath = path.join(__dirname, '..', 'adhikar.db');

// Open the database, creating the file if it does not exist
const db = new Database(dbPath);

// Enforce foreign-key relationships
db.pragma('foreign_keys = ON');

// Export the connection for other backend files
module.exports = db;
