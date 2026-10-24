import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProfile, calculateProfileCompleteness } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { schemesApi } from '../api/schemesApi';
import SchemeCard from '../components/schemes/SchemeCard';
import DocumentChecklistModal from '../components/schemes/DocumentChecklistModal';

const INDIAN_STATES = [
  'Karnataka',
  'Maharashtra',
  'Tamil Nadu',
  'Kerala',
  'Andhra Pradesh',
  'Telangana',
  'Uttar Pradesh',
  'Bihar',
  'West Bengal',
  'Rajasthan',
  'Madhya Pradesh',
  'Gujarat',
  'Punjab',
  'Haryana',
  'Delhi',
  'Other State / UT'
];

const FindSchemesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { profile, updateProfile } = useProfile();

  const [evaluationResult, setEvaluationResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form Fields for Profiler
  const [stateVal, setStateVal] = useState(profile?.state || '');
  const [categoryVal, setCategoryVal] = useState(profile?.category || '');
  const [ageVal, setAgeVal] = useState(profile?.age ? String(profile.age) : '');
  const [genderVal, setGenderVal] = useState(profile?.gender || '');
  const [occupationVal, setOccupationVal] = useState(profile?.occupation || '');
  const [incomeVal, setIncomeVal] = useState(
    profile?.annual_income !== null && profile?.annual_income !== undefined && profile?.annual_income !== ''
      ? String(profile.annual_income)
      : ''
  );

  // Category Filter among matching schemes
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [activeChecklistSchemeId, setActiveChecklistSchemeId] = useState(null);

  const profileCompleteness = calculateProfileCompleteness(profile);
  const isProfileConfigured = Boolean(profile && profile.state && profile.category && profile.age && profileCompleteness > 0);

  useEffect(() => {
    if (profile) {
      if (profile.state) setStateVal(profile.state);
      if (profile.category) setCategoryVal(profile.category);
      if (profile.age) setAgeVal(String(profile.age));
      if (profile.gender) setGenderVal(profile.gender);
      if (profile.occupation) setOccupationVal(profile.occupation);
      if (profile.annual_income !== null && profile.annual_income !== undefined && profile.annual_income !== '') {
        setIncomeVal(String(profile.annual_income));
      }
    }
  }, [profile]);

  const runEvaluation = (customProfile = null) => {
    const targetProfile = customProfile || profile;

    // If profile is not set up, don't execute evaluation
    if (!targetProfile || !targetProfile.state || !targetProfile.category) {
      setEvaluationResult({
        has_profile: false,
        schemes: [],
        summary: { matched_count: 0 }
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    schemesApi
      .getMatchedSchemes(targetProfile)
      .then((res) => {
        setEvaluationResult(res);
      })
      .catch((err) => {
        console.error('Failed to evaluate matched schemes:', err);
        setEvaluationResult({
          has_profile: true,
          schemes: [],
          summary: { matched_count: 0 }
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    runEvaluation();
  }, [profile]);

  const handleProfilerSubmit = (e) => {
    e.preventDefault();
    if (!stateVal || !categoryVal || !ageVal) return;

    const updated = {
      ...profile,
      state: stateVal,
      category: categoryVal,
      age: Number(ageVal) || 25,
      gender: genderVal || 'Male',
      occupation: occupationVal || 'Student',
      annual_income: incomeVal !== '' ? Number(incomeVal) : 120000
    };
    updateProfile(updated);
    runEvaluation(updated);

    const el = document.getElementById('results-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // STRICT REQUIREMENT: Display ONLY schemes that match the citizen profile (is_eligible === true)
  const matchingSchemes = useMemo(() => {
    if (!evaluationResult?.schemes) return [];
    return evaluationResult.schemes.filter((s) => s.is_eligible);
  }, [evaluationResult]);

  // Secondary sub-filter (by scheme category or search keyword) on the matching schemes
  const displayedSchemes = useMemo(() => {
    return matchingSchemes.filter((s) => {
      if (categoryFilter !== 'all') {
        const cat = (s.category || '').toLowerCase();
        if (!cat.includes(categoryFilter.toLowerCase())) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = (s.scheme_name || '').toLowerCase();
        const desc = (s.benefit_description || '').toLowerCase();
        const provider = (s.provider_name || '').toLowerCase();
        if (!title.includes(q) && !desc.includes(q) && !provider.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [matchingSchemes, categoryFilter, searchQuery]);

  return (
    <main>
      {/* =====================================================
           1. SMART PROFILER (Emerald Section from Friend's Design)
      ====================================================== */}
      <section className="profiler-section" id="profiler" style={{ paddingTop: '50px', paddingBottom: '70px' }}>
        <div className="section-wrap profiler-layout">
          {/* Left Column: Mission, Promise & Steps */}
          <div className="profiler-copy">
            <div className="section-kicker light-kicker">YOUR STARTING POINT</div>
            <h2>Let's make the search a little more <em>you.</em></h2>
            <p>
              Your citizen profile determines your statutory eligibility for government welfare programs, scholarships, and financial benefits across India.
            </p>

            <div className="profile-promise">
              <span>🛡️</span>
              <div>
                <strong>Zero data leaves your trust</strong>
                <p>No Aadhaar numbers, OTPs or banking PINs are ever asked. Calculations are strictly eligibility criteria matches.</p>
              </div>
            </div>

            <div className="profile-step-list">
              <div className="profile-step">
                <span>01</span>
                <p>Share your broad demographic details</p>
              </div>
              <div className="profile-step">
                <span>02</span>
                <p>Our engine evaluates 20+ statutory schemes</p>
              </div>
              <div className="profile-step">
                <span>03</span>
                <p>View only the schemes matching your profile</p>
              </div>
            </div>

            <div
              style={{
                marginTop: '30px',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(219, 241, 202, 0.15)',
                background: 'rgba(255, 255, 255, 0.04)'
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '.1em', color: '#c0d5b0', marginBottom: '10px' }}>
                EXPLORE OTHER CIVIC TOOLS
              </div>
              <Link to="/schemes" style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.09)', color: '#c4cec2', fontSize: '13px' }}>
                Browse full scheme catalog →
              </Link>
              <Link to="/document-doctor" style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.09)', color: '#c4cec2', fontSize: '13px' }}>
                Pre-verify documents in Document Doctor →
              </Link>
              <Link to="/know-your-rights" style={{ display: 'block', padding: '8px 0', color: '#c4cec2', fontSize: '13px' }}>
                Ask Legal Genie a statutory question →
              </Link>
            </div>
          </div>

          {/* Right Column: Profiler Input Panel */}
          <div className="profile-panel">
            <div className="panel-heading">
              <div>
                <span className="tiny-label">SMART PROFILER</span>
                <h3>My Schemes Matcher</h3>
              </div>
              <span className="panel-progress">
                {matchingSchemes.length > 0 ? `${matchingSchemes.length} Matched` : isProfileConfigured ? '0 Matched' : 'Profile: 0%'}
              </span>
            </div>

            <div className="progress-track">
              <span style={{ width: matchingSchemes.length > 0 ? '100%' : isProfileConfigured ? '60%' : '15%' }}></span>
            </div>

            <form id="profiler-form" onSubmit={handleProfilerSubmit}>
              <div className="form-section-label">
                <span>01</span> LOCATION &amp; DEMOGRAPHICS
              </div>

              <div className="field-grid">
                <label className="field">
                  <span>State of Residence</span>
                  <select
                    id="profile-state"
                    value={stateVal}
                    onChange={(e) => setStateVal(e.target.value)}
                    required
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Social Category</span>
                  <select
                    id="profile-category"
                    value={categoryVal}
                    onChange={(e) => setCategoryVal(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="SC">Scheduled Caste (SC)</option>
                    <option value="ST">Scheduled Tribe (ST)</option>
                    <option value="OBC">Other Backward Class (OBC)</option>
                    <option value="General">General / Unreserved</option>
                    <option value="Minority">Religious Minority</option>
                  </select>
                </label>
              </div>

              <div className="form-section-label" style={{ marginTop: '20px' }}>
                <span>02</span> CITIZEN STATUS &amp; INCOME
              </div>

              <div className="field-grid">
                <label className="field">
                  <span>Age</span>
                  <input
                    type="number"
                    id="profile-age"
                    min="1"
                    max="120"
                    placeholder="e.g. 24"
                    value={ageVal}
                    onChange={(e) => setAgeVal(e.target.value)}
                    required
                  />
                </label>

                <label className="field">
                  <span>Gender</span>
                  <select
                    id="profile-gender"
                    value={genderVal}
                    onChange={(e) => setGenderVal(e.target.value)}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className="field">
                  <span>Primary Occupation</span>
                  <select
                    id="profile-occupation"
                    value={occupationVal}
                    onChange={(e) => setOccupationVal(e.target.value)}
                    required
                  >
                    <option value="">Select Occupation</option>
                    <option value="Student">Student</option>
                    <option value="Farmer">Farmer / Cultivator</option>
                    <option value="Agricultural Labourer">Agricultural Labourer</option>
                    <option value="Self Employed">Self Employed / Artisan</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Senior Citizen">Senior Citizen / Retired</option>
                  </select>
                </label>

                <label className="field">
                  <span>Annual Household Income (₹)</span>
                  <select
                    id="profile-income"
                    value={incomeVal}
                    onChange={(e) => setIncomeVal(e.target.value)}
                  >
                    <option value="">Select Income Bracket</option>
                    <option value="50000">Below ₹50,000 (BPL / Antyodaya)</option>
                    <option value="150000">₹50,000 – ₹1.5 Lakhs</option>
                    <option value="250000">₹1.5 Lakhs – ₹2.5 Lakhs</option>
                    <option value="500000">₹2.5 Lakhs – ₹5.0 Lakhs</option>
                    <option value="800000">Above ₹5.0 Lakhs</option>
                  </select>
                </label>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className="button button-dark"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Update &amp; Re-evaluate My Schemes <span>→</span>
                </button>
                <Link
                  to="/profile"
                  className="button"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    textDecoration: 'none'
                  }}
                >
                  Full Profile Setup →
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* =====================================================
           2. MATCHED RESULTS SECTION (Display ONLY matching schemes)
      ====================================================== */}
      <section className="section-wrap" id="results-section" style={{ paddingTop: '60px', paddingBottom: '90px' }}>
        <div className="section-kicker">PERSONALIZED BENEFIT PORTFOLIO</div>

        <div className="section-heading-row" style={{ marginTop: '12px', marginBottom: '24px' }}>
          <div>
            <h2>
              My Schemes<br />
              <em>Matched to Your Profile</em>
            </h2>
          </div>
          <p>
            {isProfileConfigured
              ? `Displaying government schemes matching your profile: ${categoryVal || profile?.category} • ${occupationVal || profile?.occupation} • ${stateVal || profile?.state} • Age ${ageVal || profile?.age}.`
              : 'Please complete your citizen profile setup to evaluate and unlock your matching schemes.'}
          </p>
        </div>

        {/* Empty Profile State: Prompt user to set up profile */}
        {!isProfileConfigured && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              borderRadius: '24px',
              background: '#fffefa',
              border: '1.5px solid var(--line, #e8e4dc)',
              boxShadow: 'var(--shadow-soft)',
              maxWidth: '680px',
              margin: '0 auto 40px'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-.02em' }}>
              Your Citizen Profile is Not Set Up Yet (0%)
            </h3>
            <p style={{ color: '#77786f', fontSize: '14.5px', lineHeight: 1.6, margin: '0 0 24px' }}>
              To view the government welfare schemes and scholarships you qualify for, please set up your profile details (state of residence, social category, age, and occupation).
            </p>
            <Link
              to="/profile"
              className="button button-dark"
              style={{
                background: '#254c3c',
                color: '#ffffff',
                padding: '12px 28px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '14px',
                textDecoration: 'none'
              }}
            >
              Set up citizen profile now →
            </Link>
          </div>
        )}

        {/* When profile is configured: Filter Bar & Scheme Counter */}
        {isProfileConfigured && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '28px',
                background: 'var(--white, #fffefa)',
                border: '1px solid var(--line, #e8e4dc)',
                borderRadius: '16px',
                padding: '16px 20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="tiny-label" style={{ marginRight: '6px' }}>FILTER MY SCHEMES:</span>
                <button
                  type="button"
                  className={`rights-filter ${categoryFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('all')}
                >
                  All Matching ({matchingSchemes.length})
                </button>
                <button
                  type="button"
                  className={`rights-filter ${categoryFilter === 'education' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('education')}
                >
                  Scholarships &amp; Education
                </button>
                <button
                  type="button"
                  className={`rights-filter ${categoryFilter === 'agriculture' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('agriculture')}
                >
                  Agriculture &amp; Farmer
                </button>
                <button
                  type="button"
                  className={`rights-filter ${categoryFilter === 'welfare' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('welfare')}
                >
                  Social Welfare &amp; Pension
                </button>
              </div>

              <div style={{ fontSize: '13px', color: '#254c3c', fontWeight: 700 }}>
                ✓ {displayedSchemes.length} Eligible Scheme{displayedSchemes.length === 1 ? '' : 's'} Found
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#77786f' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>⚙️</div>
                <p>Evaluating statutory scheme rules against your demographic profile...</p>
              </div>
            )}

            {/* Matched Scheme Cards Grid: Displays ONLY schemes where is_eligible === true */}
            {!loading && displayedSchemes.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '20px'
                }}
              >
                {displayedSchemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.scheme_id}
                    scheme={scheme}
                    isMatchedView={true}
                    onOpenChecklist={(s) => setActiveChecklistSchemeId(s.scheme_id)}
                  />
                ))}
              </div>
            )}

            {/* Empty State when 0 schemes match criteria */}
            {!loading && displayedSchemes.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '50px 24px',
                  borderRadius: '20px',
                  background: '#fffefa',
                  border: '1px solid var(--line, #e8e4dc)'
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '20px', fontWeight: 800, margin: '0 0 8px' }}>
                  No schemes match your exact criteria under this filter
                </h3>
                <p style={{ color: '#77786f', maxWidth: '480px', margin: '0 auto 20px', fontSize: '14px', lineHeight: 1.6 }}>
                  You can update your demographic details above, edit your profile details, or explore our complete 20+ schemes directory.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/profile" className="button button-dark" style={{ padding: '9px 18px', fontSize: '13px' }}>
                    Edit Profile Details →
                  </Link>
                  <Link to="/schemes" className="button" style={{ background: '#f5f3ee', color: '#254c3c', padding: '9px 18px', fontSize: '13px' }}>
                    Browse All Catalog Schemes →
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Modal for Scheme Document Checklist */}
      <DocumentChecklistModal
        schemeId={activeChecklistSchemeId}
        isOpen={Boolean(activeChecklistSchemeId)}
        onClose={() => setActiveChecklistSchemeId(null)}
      />
    </main>
  );
};

export default FindSchemesPage;
