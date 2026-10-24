import schemesData from './schemes.json';
import documentsData from './documents.json';
import rightsData from './rights.json';
import scamsData from './scams.json';
import { DEMO_PROFILES, DEFAULT_CITIZEN_PROFILE } from './mockProfiles';

// Local storage key constants
const STORAGE_KEYS = {
  USER: 'adhikar_demo_user',
  TOKEN: 'adhikar_demo_token',
  PROFILE: 'adhikar_demo_profile',
  CHAT_HISTORY: 'adhikar_demo_chat_history'
};

/* --------------------------------------------------------------------------
   Auth Service (Mock)
   -------------------------------------------------------------------------- */
export const mockAuthService = {
  login: async (email, password) => {
    // Artificial small delay for UX realism
    await new Promise((r) => setTimeout(r, 450));

    // Simple validation
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    // Check if matching demo profile or standard test
    const matchedProfile = DEMO_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());
    const user = {
      id: matchedProfile ? matchedProfile.id : 99,
      name: matchedProfile ? matchedProfile.name : email.split('@')[0],
      email: email.toLowerCase()
    };
    const token = 'demo_jwt_token_' + Date.now();

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);

    if (matchedProfile) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(matchedProfile));
    } else {
      // Clear demo profile for custom users so profile setup starts at 0%
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
    }

    return {
      status: 'success',
      is_demo: true,
      token,
      user
    };
  },

  register: async (name, email, password) => {
    await new Promise((r) => setTimeout(r, 550));

    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required.');
    }
    if (password.length < 8) {
      throw new Error('Password must contain at least 8 characters.');
    }

    const newUser = {
      id: Math.floor(Math.random() * 1000) + 10,
      name: name.trim(),
      email: email.toLowerCase().trim()
    };

    // Fresh sign up starts with 0% profile
    localStorage.removeItem(STORAGE_KEYS.PROFILE);

    return {
      status: 'success',
      is_demo: true,
      message: 'Demo account registered successfully! You can now log in.',
      user: newUser
    };
  },

  getCurrentUser: () => {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  }
};

/* --------------------------------------------------------------------------
   Profile Service (Mock)
   -------------------------------------------------------------------------- */
export const mockProfileService = {
  getProfile: async () => {
    await new Promise((r) => setTimeout(r, 200));
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      // Do NOT default to Arun Kumar; return empty/null profile so new sign-ins start at 0%
      return { status: 'success', is_demo: true, profile: null, has_profile: false };
    }
    try {
      const parsed = JSON.parse(raw);
      return { status: 'success', is_demo: true, profile: parsed, has_profile: Boolean(parsed && parsed.state && parsed.category) };
    } catch {
      return { status: 'success', is_demo: true, profile: null, has_profile: false };
    }
  },

  saveProfile: async (profileData) => {
    await new Promise((r) => setTimeout(r, 400));
    if (profileData.age && (profileData.age < 1 || profileData.age > 120)) {
      throw new Error('Age must be between 1 and 120.');
    }
    if (profileData.annual_income < 0) {
      throw new Error('Annual income cannot be negative.');
    }

    const updatedProfile = {
      ...profileData,
      id: profileData.id || 1,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));
    return {
      status: 'success',
      is_demo: true,
      message: 'Citizen profile saved successfully (Demo State)',
      profile: updatedProfile
    };
  },

  setPresetProfile: (presetKey) => {
    const profile = DEMO_PROFILES.find((p) => p.tag.toLowerCase().includes(presetKey.toLowerCase())) || DEMO_PROFILES[0];
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify({ id: profile.id, name: profile.name, email: profile.email })
    );
    return profile;
  }
};

/* --------------------------------------------------------------------------
   Government Schemes Service (Mock)
   -------------------------------------------------------------------------- */
export const mockSchemesService = {
  getAllSchemes: async () => {
    await new Promise((r) => setTimeout(r, 250));
    return {
      status: 'success',
      is_demo: true,
      count: schemesData.length,
      data: schemesData
    };
  },

  getSchemeById: async (id) => {
    await new Promise((r) => setTimeout(r, 200));
    const scheme = schemesData.find((s) => s.scheme_id === id);
    if (!scheme) {
      throw new Error(`Scheme with ID "${id}" was not found.`);
    }

    // Build structured required documents
    const docNames = Array.isArray(scheme.required_documents)
      ? scheme.required_documents
      : typeof scheme.required_documents === 'string'
      ? scheme.required_documents.split(';').map((d) => d.trim()).filter(Boolean)
      : [];

    const structured_documents = docNames.map((name, index) => {
      // Find matching rule in documents dataset if available
      const rule = documentsData.find((d) =>
        d.document_name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(d.document_name.toLowerCase())
      );

      return {
        id: `DOC_${scheme.scheme_id}_${index + 1}`,
        name: name,
        category: rule ? rule.document_type : 'Official Certificate',
        rule_id: rule ? rule.rule_id : null,
        issuing_authority: rule ? rule.issuing_authority : 'State / Central Revenue Department',
        guidance: rule ? rule.document_purpose : 'Mandatory supporting credential required for eligibility verification.',
        verification_method: rule ? rule.official_verification_method : 'Official Portal Verification',
        is_mandatory: true
      };
    });

    return {
      status: 'success',
      is_demo: true,
      data: {
        ...scheme,
        has_required_documents: structured_documents.length > 0,
        structured_documents,
        application_info: {
          application_url: scheme.application_url || 'https://scholarships.gov.in',
          source_url: scheme.source_url || 'https://india.gov.in',
          guideline_url: scheme.guideline_url,
          application_start: scheme.application_start || 'Open All Year',
          application_deadline: scheme.application_deadline || 'Check Official Portal'
        },
        verification_info: {
          status: scheme.verification_status,
          is_officially_verified: scheme.verification_status === 'verified',
          warning: scheme.verification_status === 'needs_review'
            ? 'This scheme record is cataloged from open data and is awaiting official gazette re-verification. Always verify latest deadlines on the official portal.'
            : null
        }
      }
    };
  },

  getSchemeDocuments: async (id) => {
    const res = await mockSchemesService.getSchemeById(id);
    return {
      status: 'success',
      is_demo: true,
      scheme_id: id,
      scheme_name: res.data.scheme_name,
      provider_name: res.data.provider_name,
      jurisdiction: res.data.jurisdiction,
      documents: res.data.structured_documents,
      official_portal_url: res.data.application_url
    };
  },

  evaluateMatchedSchemes: async (profile) => {
    await new Promise((r) => setTimeout(r, 380));

    const hasCompleteProfile = Boolean(profile && profile.state && profile.category && profile.age);
    if (!profile || !hasCompleteProfile) {
      return {
        status: 'success',
        is_demo: true,
        has_profile: false,
        message: 'Citizen profile not completed yet. Please complete your profile to find eligible schemes.',
        matched_count: 0,
        total_schemes_evaluated: 0,
        schemes: []
      };
    }

    const citizenAge = Number(profile.age) || 25;
    const citizenIncome = Number(profile.annual_income) || 0;
    const citizenState = (profile.state || '').trim().toLowerCase();
    const citizenCategory = (profile.category || 'General').toUpperCase();
    const isBPL = Boolean(profile.is_bpl);

    const evaluatedSchemes = schemesData.map((scheme) => {
      const matched_criteria = [];
      const unmet_criteria = [];

      // 1. Jurisdiction & State Check
      const schemeJurisdiction = (scheme.jurisdiction || 'central').toLowerCase();
      const schemeEligibleState = (scheme.eligible_state || '').trim().toLowerCase();

      if (schemeJurisdiction === 'central' || !schemeEligibleState) {
        matched_criteria.push('Pan-India Central Scheme: open to eligible citizens across all Indian States & UTs.');
      } else if (schemeEligibleState && citizenState && schemeEligibleState.includes(citizenState)) {
        matched_criteria.push(`State Residency Matched: Eligible for ${profile.state} residents.`);
      } else {
        unmet_criteria.push(`Residency Requirement: Scheme requires ${scheme.eligible_state} residency.`);
      }

      // 2. Income Limit Check
      const maxIncome = scheme.max_family_income ? Number(scheme.max_family_income) : null;
      if (maxIncome === null || maxIncome === 0) {
        matched_criteria.push('No restrictive family income ceiling specified.');
      } else if (citizenIncome <= maxIncome) {
        matched_criteria.push(`Annual income ₹${citizenIncome.toLocaleString('en-IN')} is within maximum limit of ₹${maxIncome.toLocaleString('en-IN')}.`);
      } else {
        unmet_criteria.push(`Annual income ₹${citizenIncome.toLocaleString('en-IN')} exceeds the maximum limit of ₹${maxIncome.toLocaleString('en-IN')}.`);
      }

      // 3. Age Limit Check
      const minAge = scheme.min_age !== null && scheme.min_age !== undefined ? Number(scheme.min_age) : null;
      const maxAge = scheme.max_age !== null && scheme.max_age !== undefined ? Number(scheme.max_age) : null;

      if (minAge !== null && maxAge !== null) {
        if (citizenAge >= minAge && citizenAge <= maxAge) {
          matched_criteria.push(`Age ${citizenAge} is within eligible age range (${minAge} - ${maxAge} years).`);
        } else {
          unmet_criteria.push(`Age ${citizenAge} is outside required age range (${minAge} - ${maxAge} years).`);
        }
      } else if (minAge !== null) {
        if (citizenAge >= minAge) {
          matched_criteria.push(`Age ${citizenAge} meets minimum age requirement of ${minAge} years.`);
        } else {
          unmet_criteria.push(`Age ${citizenAge} is below required minimum age of ${minAge} years.`);
        }
      } else if (maxAge !== null) {
        if (citizenAge <= maxAge) {
          matched_criteria.push(`Age ${citizenAge} is within maximum age limit of ${maxAge} years.`);
        } else {
          unmet_criteria.push(`Age ${citizenAge} exceeds maximum age limit of ${maxAge} years.`);
        }
      } else {
        matched_criteria.push('Open to all age groups without specific age restriction.');
      }

      // 4. Category Check
      const schemeText = ((scheme.eligibility_text || '') + ' ' + (scheme.scheme_name || '')).toLowerCase();
      if (schemeText.includes('sc students') || schemeText.includes('scheduled caste')) {
        if (citizenCategory === 'SC') {
          matched_criteria.push('Target Category: Matches Scheduled Caste (SC) citizen profile.');
        } else {
          unmet_criteria.push('Target Category: Restricted to Scheduled Caste (SC) applicants.');
        }
      } else if (schemeText.includes('st students') || schemeText.includes('scheduled tribe')) {
        if (citizenCategory === 'ST') {
          matched_criteria.push('Target Category: Matches Scheduled Tribe (ST) citizen profile.');
        } else {
          unmet_criteria.push('Target Category: Restricted to Scheduled Tribe (ST) applicants.');
        }
      } else if (schemeText.includes('obc') || schemeText.includes('other backward classes')) {
        if (citizenCategory === 'OBC') {
          matched_criteria.push('Target Category: Matches Other Backward Class (OBC) citizen profile.');
        } else {
          unmet_criteria.push('Target Category: Restricted to OBC applicants.');
        }
      } else if (schemeText.includes('minority')) {
        if (profile.is_minority) {
          matched_criteria.push('Target Category: Matches Minority community citizen status.');
        } else {
          unmet_criteria.push('Target Category: Restricted to notified religious or linguistic minorities.');
        }
      } else {
        matched_criteria.push('Social Category: Open to all social categories.');
      }

      // 5. BPL requirement check if explicit
      if (schemeText.includes('below poverty line') || schemeText.includes('bpl')) {
        if (isBPL) {
          matched_criteria.push('Poverty Status: Citizen holds verified Below Poverty Line (BPL) status.');
        } else {
          unmet_criteria.push('Poverty Status: Scheme is specifically reserved for BPL households.');
        }
      }

      const is_eligible = unmet_criteria.length === 0;
      const match_percentage = is_eligible ? 100 : Math.max(30, Math.round((matched_criteria.length / (matched_criteria.length + unmet_criteria.length)) * 100));

      return {
        ...scheme,
        is_eligible,
        match_percentage,
        matched_criteria,
        unmet_criteria
      };
    });

    const matchedSchemes = evaluatedSchemes.filter((s) => s.is_eligible);
    const ineligibleSchemes = evaluatedSchemes.filter((s) => !s.is_eligible);

    return {
      status: 'success',
      is_demo: true,
      has_profile: true,
      citizen: profile,
      summary: {
        total_schemes_evaluated: evaluatedSchemes.length,
        matched_count: matchedSchemes.length,
        ineligible_count: ineligibleSchemes.length,
        verified_schemes_count: evaluatedSchemes.filter((s) => s.verification_status === 'verified').length,
        needs_review_count: evaluatedSchemes.filter((s) => s.verification_status === 'needs_review').length
      },
      matched_count: matchedSchemes.length,
      schemes: evaluatedSchemes
    };
  }
};

/* --------------------------------------------------------------------------
   Legal Rights Q&A Chatbot (Mock RAG Service)
   -------------------------------------------------------------------------- */
export const mockChatService = {
  getHealth: async () => {
    return {
      status: 'success',
      is_demo: true,
      gateway: 'Mock Frontend Client',
      rag_service: {
        status: 'healthy',
        service: 'rag-chatbot',
        port: 8001,
        loaded_rights: rightsData.length,
        loaded_documents: 14
      }
    };
  },

  askQuestion: async (question, language = 'English') => {
    await new Promise((r) => setTimeout(r, 650));

    const q = question.toLowerCase().trim();

    // Find best match in rights.json
    let bestMatch = null;
    let highestScore = 0;

    for (const item of rightsData) {
      const corpus = `${item.topic} ${item.right_or_protection_name} ${item.plain_language_explanation} ${item.legal_basis} ${item.how_to_exercise_or_access}`.toLowerCase();
      const words = q.split(/\s+/).filter((w) => w.length > 2);
      let score = 0;
      for (const word of words) {
        if (corpus.includes(word)) score += 1;
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && highestScore >= 1) {
      const sources = (bestMatch.linked_documents || []).map((doc) => ({
        document_id: doc.document_id || 'DOC-RTI',
        title: doc.document_title || bestMatch.right_or_protection_name,
        authority: doc.issuing_authority || bestMatch.responsible_authority,
        source_url: doc.source_url || bestMatch.official_contact_or_portal,
        legal_basis: bestMatch.legal_basis,
        verification_status: 'official'
      }));

      if (sources.length === 0) {
        sources.push({
          document_id: bestMatch.right_id,
          title: bestMatch.right_or_protection_name,
          authority: bestMatch.responsible_authority,
          source_url: bestMatch.source_url || bestMatch.official_contact_or_portal,
          legal_basis: bestMatch.legal_basis,
          verification_status: 'official'
        });
      }

      return {
        status: 'success',
        is_mock: true,
        answer: `${bestMatch.plain_language_explanation}\n\n**Procedural Steps:**\n${bestMatch.how_to_exercise_or_access}\n\n**Statutory Authority:** ${bestMatch.responsible_authority} under ${bestMatch.legal_basis}.`,
        language,
        sources,
        suggested_questions: [
          'What is the time limit for an RTI reply?',
          'Who is eligible for free legal aid under NALSA?',
          'How do I report financial cyber fraud via 1930?'
        ]
      };
    }

    // Default zero-hallucination explanation
    return {
      status: 'success',
      is_mock: true,
      answer: `I do not have verified statutory data in my starter knowledge base for this exact query.\n\nTo ensure **Zero Hallucinations** and prevent legal misinformation, AdhikarAI currently provides strictly verified guidance on:\n1. **Filing Central RTIs online & first appeals** (RTI Act 2005)\n2. **Free Legal Aid under NALSA** (Legal Services Authorities Act 1987)\n3. **Financial Cybercrime Reporting** (Helpline 1930 & IT Act 2000)\n\nPlease select one of the suggested statutory topics below.`,
      language,
      sources: [],
      suggested_questions: [
        'How do I file an RTI application online?',
        'Who qualifies for free legal aid under NALSA?',
        'How do I report online financial fraud to 1930?',
        'What is the time limit for an RTI reply?'
      ]
    };
  }
};

/* --------------------------------------------------------------------------
   Document Doctor Service (Mock)
   -------------------------------------------------------------------------- */
export const mockDocumentDoctorService = {
  getRules: async () => {
    return {
      status: 'success',
      is_demo: true,
      count: documentsData.length,
      rules: documentsData.map((d) => ({
        rule_id: d.rule_id,
        document_name: d.document_name,
        document_type: d.document_type,
        issuing_authority: d.issuing_authority,
        document_purpose: d.document_purpose
      }))
    };
  },

  checkDocument: async ({ scheme_id, document_type, document_name, file_name, file_size_kb, user_notes }) => {
    await new Promise((r) => setTimeout(r, 600));

    // Find rule in dataset
    const rule = documentsData.find(
      (d) =>
        d.document_name.toLowerCase().includes((document_name || '').toLowerCase()) ||
        (document_name || '').toLowerCase().includes(d.document_name.toLowerCase()) ||
        d.rule_id === document_name
    ) || documentsData[1]; // fallback to Income Certificate

    return {
      status: 'success',
      is_mock: true,
      rule_id: rule.rule_id,
      document_name: rule.document_name,
      document_type: rule.document_type,
      document_purpose: rule.document_purpose,
      issuing_authority: rule.issuing_authority,
      official_verification_method: rule.official_verification_method,
      accepted_format: rule.accepted_format || 'PDF / Image (Max 5 MB)',
      expiry_or_validity_rule: rule.expiry_or_validity_rule,
      extracted_fields: {
        applicant_name: 'Verified (Matches Citizen Profile)',
        document_number: 'XXXX-XXXX-XXXX',
        validity_status: 'Current Academic Year Valid',
        issuing_state: rule.applicable_state || 'All India'
      },
      validation_checks: rule.validation_rules || [
        'Official government seal and digital signature detected',
        'Document within valid non-expired issuance window',
        'Legible barcode / QR acknowledgment verification code present'
      ],
      common_errors_to_check: rule.common_errors || [
        'Submitting previous expired financial year certificate',
        'Name spelling mismatch between Aadhaar and document',
        'Blurry scan or cut-off margins'
      ],
      corrective_action: rule.corrective_action,
      source_url: rule.source_url,
      disclaimer: 'This pre-verification check is a heuristic analysis based on 30 official dataset rules. Final acceptance rests with the designated government verifying officer.'
    };
  }
};

/* --------------------------------------------------------------------------
   Scam Shield Service (Mock)
   -------------------------------------------------------------------------- */
export const mockScamShieldService = {
  getSampleScams: () => {
    return scamsData.slice(0, 6);
  },

  analyzeScam: async (messageText, url = '') => {
    await new Promise((r) => setTimeout(r, 700));

    const text = (messageText || '').toLowerCase();
    const urlText = (url || '').toLowerCase();

    // Check against patterns in scams.json
    let matchedScam = scamsData.find((s) => {
      const sText = s.message_text.toLowerCase();
      const keywords = s.scam_type.toLowerCase().split(' ');
      return keywords.some((k) => text.includes(k)) || (s.warning_signs && s.warning_signs.toLowerCase().split(',').some((w) => text.includes(w.trim())));
    });

    // Check specific fraud keywords
    const isElectricity = text.includes('electricity') || text.includes('disconnect') || text.includes('power');
    const isLottery = text.includes('lottery') || text.includes('won') || text.includes('kbc') || text.includes('prize');
    const isScholarship = text.includes('scholarship') && (text.includes('fee') || text.includes('processing') || text.includes('apk'));
    const isKYC = text.includes('kyc') || text.includes('deactivat') || text.includes('sim card') || text.includes('pan card');
    const isGovLegit = (text.includes('pib') || text.includes('gov.in')) && !text.includes('urgent') && !text.includes('processing fee');

    if (isGovLegit) {
      return {
        status: 'success',
        is_mock: true,
        risk_level: 'safe',
        scam_type: 'Official Government Communication',
        confidence_score: 0.94,
        matched_patterns: ['Official .gov.in domain reference', 'Informational notification without payment request'],
        warning_signs: [],
        recommended_actions: [
          'Message appears consistent with standard official advisories.',
          'Always verify notices on the ministry portal directly before taking action.'
        ],
        advisory_sources: ['PIB Fact Check (factcheck.pib.gov.in)'],
        disclaimer: 'Heuristic evaluation based on cyber threat models and PIB Fact Check guidelines.'
      };
    }

    if (isElectricity || isLottery || isScholarship || isKYC || matchedScam) {
      const type = isElectricity
        ? 'Power Bill Fraud / Immediate Disconnection Scam'
        : isScholarship
        ? 'Fake Scholarship / Advance Fee Fraud'
        : isKYC
        ? 'Urgent SIM / Bank KYC Phishing Scam'
        : isLottery
        ? 'Lottery / Cash Reward Advance Tax Scam'
        : matchedScam.scam_type;

      return {
        status: 'success',
        is_mock: true,
        risk_level: 'high',
        scam_type: type,
        confidence_score: 0.96,
        matched_patterns: [
          'Urgent deadline threat forcing rash citizen reaction',
          'Unofficial 10-digit mobile number or WhatsApp contact provided',
          'Advance payment or sensitive detail disclosure requested'
        ],
        warning_signs: [
          'Government agencies and DISCOMs NEVER threaten disconnection within hours via unofficial mobile numbers.',
          'Genuine government scholarships never ask for advance processing fees (e.g. ₹499 or ₹999).',
          'Urgent deactivation threats are hallmark tactics of social engineering cyber-fraud.'
        ],
        recommended_actions: [
          'DO NOT call the mobile number or click any URL provided in the message.',
          'Verify your official bill or scholarship status directly at the official portal.',
          'Report this cyber fraud immediately by calling National Cyber Crime Helpline: 1930.',
          'File a formal report on the cybercrime portal: https://cybercrime.gov.in'
        ],
        advisory_sources: [
          'National Cyber Crime Reporting Portal (cybercrime.gov.in)',
          'PIB Fact Check Advisory on Power Bill Scams',
          'Ministry of Home Affairs Cyber Safety Guidelines'
        ],
        disclaimer: 'This analysis is generated using heuristic pattern matching and citizen advisories. Do not share OTPs or banking credentials under any circumstances.'
      };
    }

    // Default Suspicious evaluation
    return {
      status: 'success',
      is_mock: true,
      risk_level: 'suspicious',
      scam_type: 'Unverified Third-Party Communication',
      confidence_score: 0.75,
      matched_patterns: ['Unknown sender origin', 'Non-standard civic communication pattern'],
      warning_signs: [
        'Contains unverified links or unofficial contact details.',
        'Sender domain does not match official government (.gov.in / .nic.in) conventions.'
      ],
      recommended_actions: [
        'Exercise caution: Do not click unknown shortened links.',
        'Do not share personal Aadhaar numbers, OTPs, or UPI PINs.',
        'Call official department helplines directly if you suspect impersonation.'
      ],
      advisory_sources: ['National Cyber Crime Helpline: 1930'],
      disclaimer: 'AdhikarAI AI Scam Shield educational heuristic analysis.'
    };
  }
};
