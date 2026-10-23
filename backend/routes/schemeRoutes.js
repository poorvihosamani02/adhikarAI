
const express = require('express');
const db = require('../config/db');
const authenticateToken = require('../middleware/authMiddleware');
const { evaluateEligibility } = require('../services/eligibilityService');

const router = express.Router();

/**
 * Controller to handle eligibility matching for the authenticated citizen.
 * Strictly derives citizen identity from req.userId (verified JWT payload).
 */
function handleEligibilityMatching(req, res) {
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
            return res.status(200).json({
                status: 'success',
                has_profile: false,
                message: 'Citizen profile not found. Please complete your profile to find eligible schemes.',
                matched_count: 0,
                total_schemes_evaluated: 0,
                schemes: []
            });
        }

        // Fetch all schemes from database
        const allSchemes = db.prepare('SELECT * FROM schemes ORDER BY scheme_name').all();

        // Run matching engine
        const evaluatedSchemes = evaluateEligibility(profile, allSchemes);
        const eligibleCount = evaluatedSchemes.filter(s => s.is_eligible).length;
        const ineligibleCount = evaluatedSchemes.length - eligibleCount;

        res.json({
            status: 'success',
            has_profile: true,
            citizen: {
                id: user.id,
                name: user.name,
                email: user.email,
                age: profile.age !== null ? Number(profile.age) : null,
                gender: profile.gender || null,
                annual_income: profile.annual_income !== null ? Number(profile.annual_income) : null,
                category: profile.category || null,
                state: profile.state || null,
                education_level: profile.education_level || null,
                course: profile.course || null,
                occupation: profile.occupation || null,
                is_minority: Boolean(profile.is_minority),
                is_bpl: Boolean(profile.is_bpl)
            },
            summary: {
                total_schemes_evaluated: evaluatedSchemes.length,
                matched_count: eligibleCount,
                ineligible_count: ineligibleCount,
                verified_schemes_count: evaluatedSchemes.filter(s => s.is_officially_verified).length,
                needs_review_count: evaluatedSchemes.filter(s => !s.is_officially_verified).length
            },
            dataset_notice: 'Dataset notice: 19 of 20 schemes in this dataset have verification_status="needs_review". Evaluations are based strictly on available cataloged fields. Please verify latest guidelines on the official ministry portal.',
            matched_count: eligibleCount,
            schemes: evaluatedSchemes
        });
    } catch (error) {
        console.error('Error matching scheme eligibility:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Unable to evaluate scheme eligibility.'
        });
    }
}

// GET /api/schemes/matched - Primary authenticated eligibility endpoint
router.get('/matched', authenticateToken, handleEligibilityMatching);

// Route aliases for frontend and legacy client compatibility
router.get('/my-schemes', authenticateToken, handleEligibilityMatching);
router.post('/my-schemes', authenticateToken, handleEligibilityMatching);

// GET /api/schemes - return all schemes
router.get('/', (req, res) => {
    try {
        const schemes = db.prepare(`
            SELECT *
            FROM schemes
            ORDER BY scheme_name
        `).all();

        res.json({
            status: 'success',
            count: schemes.length,
            data: schemes,
            schemes: schemes // Support both response key formats
        });
    } catch (error) {
        console.error('Error fetching schemes:', error.message);

        res.status(500).json({
            status: 'error',
            message: 'Unable to fetch schemes.'
        });
    }
});

const { parseRequiredDocuments, buildDocumentChecklistResponse } = require('../services/documentService');

// GET /api/schemes/:id/documents - Return structured document checklist for a scheme
router.get('/:id/documents', (req, res) => {
    try {
        const scheme = db.prepare(`
            SELECT *
            FROM schemes
            WHERE scheme_id = ?
        `).get(req.params.id);

        if (!scheme) {
            return res.status(404).json({
                status: 'error',
                message: 'Scheme not found.'
            });
        }

        const checklist = buildDocumentChecklistResponse(scheme);
        res.json(checklist);
    } catch (error) {
        console.error('Error fetching scheme documents:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Unable to fetch scheme document checklist.'
        });
    }
});

// GET /api/schemes/:id - return full scheme details by ID
router.get('/:id', (req, res) => {
    try {
        const scheme = db.prepare(`
            SELECT *
            FROM schemes
            WHERE scheme_id = ?
        `).get(req.params.id);

        if (!scheme) {
            return res.status(404).json({
                status: 'error',
                message: 'Scheme not found.'
            });
        }

        const docs = parseRequiredDocuments(scheme.required_documents, scheme.scheme_id);
        const isVerified = scheme.verification_status === 'verified';

        const enrichedScheme = {
            ...scheme,
            has_required_documents: docs.length > 0,
            structured_documents: docs,
            application_info: {
                application_url: scheme.application_url || null,
                source_url: scheme.source_url || null,
                guideline_url: scheme.guideline_url || null,
                application_start: scheme.application_start || null,
                application_deadline: scheme.application_deadline || null
            },
            verification_info: {
                status: scheme.verification_status || 'needs_review',
                is_officially_verified: isVerified,
                last_verified: scheme.last_verified || null,
                warning: !isVerified
                    ? 'This scheme has verification_status="needs_review" and has not been officially verified against current ministry guidelines. Please verify details on the official portal.'
                    : null
            }
        };

        res.json({
            status: 'success',
            data: enrichedScheme,
            scheme: enrichedScheme
        });
    } catch (error) {
        console.error('Error fetching scheme:', error.message);

        res.status(500).json({
            status: 'error',
            message: 'Unable to fetch scheme details.'
        });
    }
});

module.exports = router;


