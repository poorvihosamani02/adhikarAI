
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const db = require('../config/db');

// Find the CSV file in the project's datasets folder
const csvPath = path.join(__dirname, '..', '..', 'datasets', 'schemes_raw.csv');

// Read the CSV as text
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Convert CSV text into JavaScript objects using the header row
const schemes = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true
});

// These are the 25 columns in your CSV and database
const columns = [
    'scheme_id',
    'scheme_name',
    'provider_type',
    'provider_name',
    'jurisdiction',
    'category',
    'benefit_description',
    'benefit_amount',
    'benefit_frequency',
    'eligibility_text',
    'min_age',
    'max_age',
    'max_family_income',
    'eligible_state',
    'eligible_course',
    'required_documents',
    'application_start',
    'application_deadline',
    'application_url',
    'source_url',
    'guideline_url',
    'academic_year',
    'last_verified',
    'verification_status',
    'notes'
];

// Convert empty fields to NULL and numeric fields to numbers
function prepareValue(column, value) {
    if (value === undefined || value.trim() === '') {
        return null;
    }

    const numericColumns = [
        'benefit_amount',
        'min_age',
        'max_age',
        'max_family_income'
    ];

    if (numericColumns.includes(column)) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            throw new Error(
                `Invalid number for ${column}: "${value}"`
            );
        }

        return number;
    }

    return value;
}

// Build an INSERT statement that updates an existing scheme ID
const placeholders = columns.map(() => '?').join(', ');

const updateClause = columns
    .filter(column => column !== 'scheme_id')
    .map(column => `${column} = excluded.${column}`)
    .join(', ');

const insertSQL = `
    INSERT INTO schemes (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT(scheme_id) DO UPDATE SET ${updateClause}
`;

const insertScheme = db.prepare(insertSQL);

// Import all records as one transaction
const importSchemes = db.transaction(() => {
    for (const scheme of schemes) {
        if (!scheme.scheme_id || !scheme.scheme_name) {
            throw new Error(
                'Every scheme must have a scheme_id and scheme_name.'
            );
        }

        const values = columns.map(column =>
            prepareValue(column, scheme[column] ?? '')
        );

        insertScheme.run(values);
    }
});

try {
    importSchemes();

    const result = db.prepare(
        'SELECT COUNT(*) AS total FROM schemes'
    ).get();

    console.log(`CSV records read: ${schemes.length}`);
    console.log(`Schemes currently in database: ${result.total}`);
    console.log('Scheme import completed successfully!');
} catch (error) {
    console.error('Scheme import failed:', error.message);
    process.exitCode = 1;
} finally {
    db.close();
}
