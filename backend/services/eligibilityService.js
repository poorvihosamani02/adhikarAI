/**
 * AdhikarAI - Scheme Eligibility Matching Service
 * 
 * Accurately matches citizen profiles against the 20 cataloged welfare schemes
 * in the SQLite database based on real dataset fields.
 */

/**
 * Normalizes text for case-insensitive and whitespace-tolerant comparisons.
 * @param {string|null|undefined} text
 * @returns {string}
 */
function normalize(text) {
    if (!text || typeof text !== 'string') return '';
    return text.trim().toLowerCase();
}

/**
 * Evaluates a single scheme against a citizen profile.
 * 
 * @param {Object} profile - Citizen profile from database
 * @param {Object} scheme - Scheme record from database
 * @returns {Object} Evaluated match result
 */
function evaluateSingleScheme(profile, scheme) {
    const matchedCriteria = [];
    const unmetCriteria = [];
    const unknownConditions = [];

    const normProfileState = normalize(profile.state);
    const normProfileCategory = normalize(profile.category);
    const normProfileGender = normalize(profile.gender);
    const normProfileEducation = normalize(profile.education_level);
    const normProfileCourse = normalize(profile.course);
    const normProfileOccupation = normalize(profile.occupation);

    const schemeName = scheme.scheme_name || '';
    const normSchemeName = normalize(schemeName);
    const normEligibleState = normalize(scheme.eligible_state);
    const normJurisdiction = normalize(scheme.jurisdiction);
    const normEligibleCourse = normalize(scheme.eligible_course);
    const normEligibilityText = normalize(scheme.eligibility_text);

    let evaluatedCriteriaCount = 0;

    // ==========================================
    // 1. STATE & JURISDICTION CHECK
    // ==========================================
    if (normJurisdiction === 'karnataka' || normEligibleState === 'karnataka') {
        evaluatedCriteriaCount++;
        if (normProfileState === 'karnataka') {
            matchedCriteria.push('State residency matches Karnataka (State Scheme requirement).');
        } else if (normProfileState) {
            unmetCriteria.push(`Restricted to Karnataka residents; citizen profile indicates state is "${profile.state}".`);
        } else {
            unknownConditions.push('Scheme requires Karnataka residency, but citizen state is not specified in profile.');
        }
    } else if (normJurisdiction === 'central' || !normEligibleState) {
        // Pan-India Central Scheme
        matchedCriteria.push('Pan-India Central Scheme: open to eligible citizens across all Indian States & UTs.');
    }

    // ==========================================
    // 2. ANNUAL / FAMILY INCOME CHECK
    // ==========================================
    if (scheme.max_family_income !== null && scheme.max_family_income !== undefined) {
        const incomeLimit = Number(scheme.max_family_income);
        evaluatedCriteriaCount++;

        if (profile.annual_income !== null && profile.annual_income !== undefined) {
            const citizenIncome = Number(profile.annual_income);
            if (citizenIncome <= incomeLimit) {
                matchedCriteria.push(
                    `Annual income ₹${citizenIncome.toLocaleString('en-IN')} is within the maximum family income limit of ₹${incomeLimit.toLocaleString('en-IN')}.`
                );
            } else {
                unmetCriteria.push(
                    `Annual income ₹${citizenIncome.toLocaleString('en-IN')} exceeds the scheme maximum income ceiling of ₹${incomeLimit.toLocaleString('en-IN')}.`
                );
            }
        } else {
            unknownConditions.push(
                `Requires annual family income up to ₹${incomeLimit.toLocaleString('en-IN')}, but citizen annual income is not provided in profile.`
            );
        }
    }

    // ==========================================
    // 3. AGE BOUNDS CHECK (min_age & max_age)
    // ==========================================
    const hasMinAge = scheme.min_age !== null && scheme.min_age !== undefined;
    const hasMaxAge = scheme.max_age !== null && scheme.max_age !== undefined;

    if (hasMinAge || hasMaxAge) {
        evaluatedCriteriaCount++;
        if (profile.age !== null && profile.age !== undefined) {
            const citizenAge = Number(profile.age);

            if (hasMinAge && citizenAge < Number(scheme.min_age)) {
                unmetCriteria.push(
                    `Citizen age ${citizenAge} is below the minimum required age of ${scheme.min_age} years.`
                );
            } else if (hasMaxAge && citizenAge > Number(scheme.max_age)) {
                unmetCriteria.push(
                    `Citizen age ${citizenAge} exceeds the maximum allowed age of ${scheme.max_age} years.`
                );
            } else {
                const ageRangeDesc = hasMinAge && hasMaxAge
                    ? `between ${scheme.min_age} and ${scheme.max_age} years`
                    : hasMinAge
                    ? `at least ${scheme.min_age} years`
                    : `up to ${scheme.max_age} years`;
                matchedCriteria.push(`Citizen age ${citizenAge} satisfies age requirement (${ageRangeDesc}).`);
            }
        } else {
            const ageRangeDesc = hasMinAge && hasMaxAge
                ? `${scheme.min_age} to ${scheme.max_age} years`
                : hasMinAge
                ? `minimum ${scheme.min_age} years`
                : `maximum ${scheme.max_age} years`;
            unknownConditions.push(`Scheme requires age ${ageRangeDesc}, but citizen age is not provided in profile.`);
        }
    }

    // ==========================================
    // 4. SOCIAL CATEGORY & MINORITY CHECK
    // ==========================================
    const isSCScheme = normSchemeName.includes('scheduled caste') ||
                       normSchemeName.includes('sc student') ||
                       normEligibilityText.includes('scheduled caste') ||
                       (normSchemeName.includes('sc/st') && !normSchemeName.includes('obc'));

    const isSTScheme = normSchemeName.includes('scheduled tribe') ||
                       normSchemeName.includes('st student') ||
                       normEligibilityText.includes('scheduled tribe');

    const isOBCorEBCScheme = normSchemeName.includes('obc') ||
                             normSchemeName.includes('ebc') ||
                             normSchemeName.includes('dnt') ||
                             normSchemeName.includes('backward class') ||
                             normEligibilityText.includes('backward class');

    const isMinorityScheme = normSchemeName.includes('minorities') ||
                             normEligibilityText.includes('minority community');

    // Case 4a: Minority-targeted scheme
    if (isMinorityScheme) {
        evaluatedCriteriaCount++;
        if (profile.is_minority || normProfileCategory === 'minority') {
            matchedCriteria.push('Citizen status matches notified Minority community eligibility.');
        } else if (profile.is_minority === 0 || profile.is_minority === false) {
            unmetCriteria.push('Scheme is designated for notified minority communities; citizen profile indicates non-minority.');
        } else {
            unknownConditions.push('Scheme requires belonging to a notified minority community, which is unverified.');
        }
    }
    // Case 4b: SC & ST shared schemes (e.g. ICAR GOV011)
    else if (normSchemeName.includes('sc/st')) {
        evaluatedCriteriaCount++;
        if (normProfileCategory === 'sc' || normProfileCategory === 'st') {
            matchedCriteria.push(`Citizen category (${profile.category.toUpperCase()}) matches SC/ST quota requirement.`);
        } else if (normProfileCategory) {
            unmetCriteria.push(`Restricted to SC/ST candidates; citizen category in profile is "${profile.category}".`);
        } else {
            unknownConditions.push('Requires SC/ST social category, but category is not specified in profile.');
        }
    }
    // Case 4c: Exclusively SC schemes (e.g. GOV003, GOV016)
    else if (isSCScheme) {
        evaluatedCriteriaCount++;
        if (normProfileCategory === 'sc') {
            matchedCriteria.push('Citizen category matches Scheduled Caste (SC) requirement.');
        } else if (normProfileCategory) {
            unmetCriteria.push(`Restricted to Scheduled Caste (SC) candidates; citizen category in profile is "${profile.category}".`);
        } else {
            unknownConditions.push('Requires Scheduled Caste (SC) category, but category is not specified in profile.');
        }
    }
    // Case 4d: Exclusively ST schemes (e.g. GOV004)
    else if (isSTScheme) {
        evaluatedCriteriaCount++;
        if (normProfileCategory === 'st') {
            matchedCriteria.push('Citizen category matches Scheduled Tribe (ST) requirement.');
        } else if (normProfileCategory) {
            unmetCriteria.push(`Restricted to Scheduled Tribe (ST) candidates; citizen category in profile is "${profile.category}".`);
        } else {
            unknownConditions.push('Requires Scheduled Tribe (ST) category, but category is not specified in profile.');
        }
    }
    // Case 4e: OBC / EBC / DNT schemes (e.g. GOV005, GOV006, GOV007, GOV008, GOV017)
    else if (isOBCorEBCScheme) {
        evaluatedCriteriaCount++;
        if (['obc', 'ebc', 'dnt', 'bc', 'backward class'].includes(normProfileCategory)) {
            matchedCriteria.push(`Citizen category (${profile.category.toUpperCase()}) matches OBC/EBC/Backward Class requirement.`);
        } else if (normProfileCategory) {
            unmetCriteria.push(`Restricted to OBC, EBC or Backward Class candidates; citizen category is "${profile.category}".`);
        } else {
            unknownConditions.push('Requires OBC/EBC/Backward Class category, but category is not specified in profile.');
        }
    }

    // ==========================================
    // 5. GENDER CHECK (Women-specific schemes)
    // ==========================================
    const isGirlOrWomanScheme = normSchemeName.includes('girl students') ||
                                normSchemeName.includes('gruha lakshmi') ||
                                normEligibilityText.includes('girl student') ||
                                normEligibilityText.includes('woman head of household');

    if (isGirlOrWomanScheme) {
        evaluatedCriteriaCount++;
        if (normProfileGender === 'female' || normProfileGender === 'woman' || normProfileGender === 'girl') {
            matchedCriteria.push('Citizen gender matches female/woman eligibility requirement.');
        } else if (normProfileGender === 'male') {
            unmetCriteria.push('Scheme is exclusively designated for female/woman candidates; citizen gender in profile is Male.');
        } else {
            unknownConditions.push('Scheme is designated for female applicants, but citizen gender is not specified in profile.');
        }
    }

    // ==========================================
    // 6. OCCUPATION & BPL ALIGNMENT CHECK
    // ==========================================
    // 6a. Farmer scheme (PM-KISAN GOV012)
    if (normSchemeName.includes('kisan') || normEligibilityText.includes('farmer families')) {
        evaluatedCriteriaCount++;
        if (normProfileOccupation === 'farmer' || normProfileOccupation === 'agriculture') {
            matchedCriteria.push('Citizen occupation matches farmer/agricultural family requirement.');
        } else if (normProfileOccupation && !['farmer', 'agriculture'].includes(normProfileOccupation)) {
            // Note: PM-KISAN strictly targets cultivable landholder farmers
            unmetCriteria.push(`Scheme targets landholding farmer families; citizen occupation is listed as "${profile.occupation}".`);
        } else {
            unknownConditions.push('Requires cultivable landholding farmer family status, which cannot be verified from profile alone.');
        }
    }

    // 6b. Unemployment Allowance (Yuva Nidhi GOV020)
    if (normSchemeName.includes('yuva nidhi') || normEligibilityText.includes('unemployed')) {
        evaluatedCriteriaCount++;
        if (normProfileOccupation === 'unemployed') {
            matchedCriteria.push('Citizen occupation status matches unemployed youth eligibility.');
        } else if (['salaried', 'employed', 'government', 'private employee'].includes(normProfileOccupation)) {
            unmetCriteria.push(`Scheme excludes currently employed individuals; citizen occupation is "${profile.occupation}".`);
        } else {
            unknownConditions.push('Requires being unemployed for at least 180 days post-graduation/diploma.');
        }
    }

    // 6c. BPL-aligned health / welfare schemes (e.g. AB PM-JAY GOV013, Gruha Lakshmi GOV018)
    if (normSchemeName.includes('jan arogya') || normEligibilityText.includes('secc 2011')) {
        if (profile.is_bpl) {
            matchedCriteria.push('BPL ration card/low-income status aligns with deprivation criteria.');
        } else {
            unknownConditions.push('Requires inclusion in SECC 2011 deprivation beneficiary database.');
        }
    }

    // ==========================================
    // 7. EDUCATION & COURSE ALIGNMENT CHECK
    // ==========================================
    if (normEligibleCourse) {
        if (normEligibleCourse.includes('graduation') || normEligibleCourse.includes('degree') || normEligibleCourse.includes('post-matric')) {
            if (['undergraduate', 'postgraduate', 'graduate', 'degree', 'diploma', 'college', '12th', 'class 12'].includes(normProfileEducation)) {
                matchedCriteria.push(`Educational level (${profile.education_level}) aligns with course criteria: "${scheme.eligible_course}".`);
            }
        }
        if (normEligibleCourse.includes('agriculture') && (normProfileCourse.includes('agri') || normProfileCourse.includes('agriculture'))) {
            matchedCriteria.push(`Enrolled course (${profile.course}) matches agricultural degree requirement.`);
        }
    }

    // ==========================================
    // 8. UNVERIFIED EXTERNAL CRITERIA NOTES
    // ==========================================
    if (scheme.scheme_id === 'GOV001') {
        unknownConditions.push('Requires scoring above 80th percentile in respective Class 12 Board exam.');
        unknownConditions.push('Must not be availing any other state/central scholarship or fee reimbursement.');
    }
    if (scheme.scheme_id === 'GOV002') {
        unknownConditions.push('Requires minimum 55% marks in Class VII and passing state MAT/SAT entrance exams.');
    }
    if (scheme.scheme_id === 'GOV019') {
        unknownConditions.push('Applies to domestic electricity meter consumers whose monthly usage is under 200 units.');
    }

    // Verification status advisory
    const isOfficiallyVerified = scheme.verification_status === 'verified';
    if (!isOfficiallyVerified) {
        unknownConditions.push(
            'Scheme data has verification_status="needs_review". Terms should be cross-verified on the official government portal.'
        );
    }

    // ==========================================
    // 9. MATCH STATUS & SCORING COMPUTATION
    // ==========================================
    const hasUnmet = unmetCriteria.length > 0;
    const hasMatched = matchedCriteria.length > 0;

    let isEligible = false;
    let matchStatus = 'ineligible';
    let matchScore = 0;

    if (hasUnmet) {
        // Disqualified by one or more hard eligibility rules
        matchStatus = 'ineligible';
        isEligible = false;
        matchScore = 0;
    } else if (hasMatched && evaluatedCriteriaCount > 0) {
        // Passed all evaluated criteria
        const coreUnknownCount = unknownConditions.filter(
            u => !u.includes('needs_review')
        ).length;

        if (coreUnknownCount === 0) {
            matchStatus = 'eligible';
            isEligible = true;
            matchScore = 100;
        } else {
            matchStatus = 'potentially_eligible';
            isEligible = true;
            // Proportionally scaled score (between 70% and 90%)
            matchScore = Math.max(70, Math.min(90, 85 - (coreUnknownCount * 5)));
        }
    } else {
        // General welfare benefit with no restrictive criteria in dataset
        matchStatus = 'general_benefit';
        isEligible = true;
        matchScore = 60;
    }

    // Build human-friendly match summary
    let matchSummary = '';
    if (matchStatus === 'eligible') {
        matchSummary = 'Strong Match: You satisfy all cataloged eligibility criteria for this scheme.';
    } else if (matchStatus === 'potentially_eligible') {
        matchSummary = 'Likely Match: You satisfy the core cataloged criteria. Additional external documentation/conditions require confirmation.';
    } else if (matchStatus === 'general_benefit') {
        matchSummary = 'General Welfare Benefit: No disqualifying restrictions found in dataset.';
    } else {
        matchSummary = `Does not meet eligibility: Failed ${unmetCriteria.length} requirement(s).`;
    }

    return {
        scheme_id: scheme.scheme_id,
        scheme_name: scheme.scheme_name,
        provider_name: scheme.provider_name,
        provider_type: scheme.provider_type,
        jurisdiction: scheme.jurisdiction,
        category: scheme.category,
        benefit_description: scheme.benefit_description,
        benefit_amount: scheme.benefit_amount,
        benefit_frequency: scheme.benefit_frequency,
        eligibility_text: scheme.eligibility_text,
        max_family_income: scheme.max_family_income,
        min_age: scheme.min_age,
        max_age: scheme.max_age,
        eligible_state: scheme.eligible_state,
        eligible_course: scheme.eligible_course,
        required_documents: scheme.required_documents,
        application_url: scheme.application_url,
        source_url: scheme.source_url,
        verification_status: scheme.verification_status,
        is_officially_verified: isOfficiallyVerified,

        // Eligibility Evaluation Results
        is_eligible: isEligible,
        match_status: matchStatus,
        match_score: matchScore,
        match_summary: matchSummary,
        matched_criteria: matchedCriteria,
        unmet_criteria: unmetCriteria,
        unknown_conditions: unknownConditions,

        // Backward compatibility for frontend demo components
        demo_match: {
            is_likely_eligible: isEligible,
            match_score: matchScore,
            reasons: matchedCriteria.length > 0 ? matchedCriteria : ['General public benefit'],
            warnings: unmetCriteria
        }
    };
}

/**
 * Evaluates all schemes against the citizen profile and sorts results.
 * 
 * @param {Object} profile - Citizen profile from database
 * @param {Array} schemes - Array of all schemes from database
 * @returns {Array} Evaluated schemes sorted by eligibility and match score
 */
function evaluateEligibility(profile, schemes) {
    if (!schemes || !Array.isArray(schemes)) {
        return [];
    }

    const evaluated = schemes.map(scheme => evaluateSingleScheme(profile, scheme));

    // Sort: Eligible first (highest match score descending), followed by ineligible
    evaluated.sort((a, b) => {
        if (a.is_eligible !== b.is_eligible) {
            return a.is_eligible ? -1 : 1;
        }
        return b.match_score - a.match_score;
    });

    return evaluated;
}

module.exports = {
    evaluateSingleScheme,
    evaluateEligibility
};
