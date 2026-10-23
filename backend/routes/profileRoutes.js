const express = require('express');
const db = require('../config/db');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Helper to normalize and format profile data for consistent API responses.
 * Provides both snake_case and camelCase to guarantee seamless compatibility
 * with database fields and frontend React components.
 */
function formatProfile(profile, user) {
    if (!profile) return null;

    const annualIncome = profile.annual_income !== null && profile.annual_income !== undefined
        ? Number(profile.annual_income)
        : null;

    const isMinority = Boolean(profile.is_minority);
    const isBPL = Boolean(profile.is_bpl);

    return {
        id: profile.id,
        userId: profile.user_id,
        name: user?.name || null,
        email: user?.email || null,
        age: profile.age !== null ? Number(profile.age) : null,
        gender: profile.gender || null,
        annual_income: annualIncome,
        annualIncome: annualIncome,
        category: profile.category || null,
        state: profile.state || null,
        education_level: profile.education_level || null,
        educationLevel: profile.education_level || null,
        course: profile.course || null,
        occupation: profile.occupation || null,
        is_minority: isMinority,
        isMinority: isMinority,
        is_bpl: isBPL,
        isBPL: isBPL,
        updated_at: profile.updated_at || null
    };
}

// GET /api/profile - Retrieve the logged-in user's profile
router.get('/', authenticateToken, (req, res) => {
    try {
        const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.userId);
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User account not found.'
            });
        }

        const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.userId);

        if (!profile) {
            return res.json({
                status: 'success',
                profile: null,
                message: 'No profile created yet for this account.'
            });
        }

        res.json({
            status: 'success',
            profile: formatProfile(profile, user)
        });
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Unable to retrieve citizen profile.'
        });
    }
});

// POST & PUT /api/profile - Create or update the logged-in user's profile
const handleSaveProfile = (req, res) => {
    try {
        const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.userId);
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User account not found.'
            });
        }

        const {
            name,
            age,
            gender,
            annualIncome,
            annual_income,
            category,
            state,
            educationLevel,
            education_level,
            course,
            occupation,
            isMinority,
            is_minority,
            isBPL,
            is_bpl
        } = req.body;

        // Validation: Age
        let parsedAge = null;
        if (age !== undefined && age !== null && age !== '') {
            parsedAge = Number(age);
            if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 120) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Age must be a valid integer between 1 and 120.'
                });
            }
        }

        // Validation: Income (accepts camelCase or snake_case)
        const rawIncome = annualIncome !== undefined ? annualIncome : annual_income;
        let parsedIncome = null;
        if (rawIncome !== undefined && rawIncome !== null && rawIncome !== '') {
            parsedIncome = Number(rawIncome);
            if (!Number.isFinite(parsedIncome) || parsedIncome < 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Annual income must be a non-negative number.'
                });
            }
        }

        // Education & category normalization
        const parsedEdu = (educationLevel !== undefined ? educationLevel : education_level) || null;
        const parsedCat = category !== undefined ? String(category).trim() : null;
        const parsedState = state !== undefined ? String(state).trim() : null;
        const parsedGender = gender !== undefined ? String(gender).trim() : null;
        const parsedCourse = course !== undefined ? String(course).trim() : null;
        const parsedOcc = occupation !== undefined ? String(occupation).trim() : null;

        // Boolean flag conversion (0 or 1 for SQLite)
        const rawMinority = isMinority !== undefined ? isMinority : is_minority;
        const parsedMinority = rawMinority ? 1 : 0;

        const rawBpl = isBPL !== undefined ? isBPL : is_bpl;
        const parsedBpl = rawBpl ? 1 : 0;

        // Upsert into profiles table
        const upsertQuery = `
            INSERT INTO profiles (
                user_id, age, gender, annual_income, category, state,
                education_level, course, occupation, is_minority, is_bpl, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
            )
            ON CONFLICT(user_id) DO UPDATE SET
                age = excluded.age,
                gender = excluded.gender,
                annual_income = excluded.annual_income,
                category = excluded.category,
                state = excluded.state,
                education_level = excluded.education_level,
                course = excluded.course,
                occupation = excluded.occupation,
                is_minority = excluded.is_minority,
                is_bpl = excluded.is_bpl,
                updated_at = CURRENT_TIMESTAMP
        `;

        db.prepare(upsertQuery).run(
            req.userId,
            parsedAge,
            parsedGender,
            parsedIncome,
            parsedCat,
            parsedState,
            parsedEdu,
            parsedCourse,
            parsedOcc,
            parsedMinority,
            parsedBpl
        );

        // Optionally update citizen display name if provided
        if (name && typeof name === 'string' && name.trim()) {
            db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name.trim(), req.userId);
            user.name = name.trim();
        }

        // Fetch newly updated profile
        const updatedProfile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.userId);

        res.status(200).json({
            status: 'success',
            message: 'Citizen profile saved successfully.',
            profile: formatProfile(updatedProfile, user)
        });
    } catch (error) {
        console.error('Error saving profile:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Unable to save citizen profile.'
        });
    }
};

router.post('/', authenticateToken, handleSaveProfile);
router.put('/', authenticateToken, handleSaveProfile);

module.exports = router;
