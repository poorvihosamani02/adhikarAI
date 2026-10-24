import React, { useState, useEffect, useMemo } from 'react';
import { schemesApi } from '../api/schemesApi';
import SchemeCard from '../components/schemes/SchemeCard';
import DocumentChecklistModal from '../components/schemes/DocumentChecklistModal';

const AllSchemesPage = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');

  // Modal State
  const [activeChecklistSchemeId, setActiveChecklistSchemeId] = useState(null);

  useEffect(() => {
    schemesApi
      .getAllSchemes()
      .then((res) => {
        setSchemes(res?.data || res?.schemes || []);
      })
      .catch((err) => console.error('Failed to load schemes from API:', err))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    schemes.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [schemes]);

  const filteredSchemes = useMemo(() => {
    return schemes
      .filter((scheme) => {
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = (scheme.scheme_name || '').toLowerCase().includes(q);
          const matchProvider = (scheme.provider_name || '').toLowerCase().includes(q);
          const matchDesc = (scheme.benefit_description || '').toLowerCase().includes(q);
          const matchElig = (scheme.eligibility_text || '').toLowerCase().includes(q);
          if (!matchName && !matchProvider && !matchDesc && !matchElig) return false;
        }

        if (selectedJurisdiction !== 'all') {
          if ((scheme.jurisdiction || 'central').toLowerCase() !== selectedJurisdiction.toLowerCase()) {
            return false;
          }
        }

        if (selectedCategory !== 'all') {
          if ((scheme.category || '').toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        if (selectedBeneficiary !== 'all') {
          const combined = ((scheme.eligibility_text || '') + ' ' + (scheme.scheme_name || '')).toLowerCase();
          if (selectedBeneficiary === 'sc' && !combined.includes('sc') && !combined.includes('scheduled caste')) return false;
          if (selectedBeneficiary === 'st' && !combined.includes('st') && !combined.includes('scheduled tribe')) return false;
          if (selectedBeneficiary === 'obc' && !combined.includes('obc') && !combined.includes('backward class')) return false;
          if (selectedBeneficiary === 'bpl' && !combined.includes('bpl') && !combined.includes('poverty line')) return false;
          if (selectedBeneficiary === 'minority' && !combined.includes('minority')) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') {
          return a.scheme_name.localeCompare(b.scheme_name);
        }
        if (sortBy === 'benefit_desc') {
          const amtA = Number(a.benefit_amount) || 0;
          const amtB = Number(b.benefit_amount) || 0;
          return amtB - amtA;
        }
        return 0;
      });
  }, [schemes, searchTerm, selectedJurisdiction, selectedCategory, selectedBeneficiary, sortBy]);

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedJurisdiction !== 'all' ||
    selectedCategory !== 'all' ||
    selectedBeneficiary !== 'all';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedJurisdiction('all');
    setSelectedCategory('all');
    setSelectedBeneficiary('all');
    setSortBy('name_asc');
  };

  const handleCategoryCardClick = (catName) => {
    // Find closest matching category in list
    const matched = categories.find(c => c.toLowerCase().includes(catName.toLowerCase()));
    if (matched) {
      setSelectedCategory(matched);
    } else {
      setSelectedCategory('all');
    }
    const el = document.getElementById('scheme-directory');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main>
      {/* =====================================================
           1. BENEFIT CATEGORIES HERO
      ====================================================== */}
      <section className="section-wrap benefits-section" style={{ paddingTop: '70px' }}>
        <div className="section-kicker">SUPPORT FOR DIFFERENT JOURNEYS</div>

        <div className="section-heading-row" style={{ marginTop: '16px' }}>
          <h2>
            Where could support<br />
            <em>begin for you?</em>
          </h2>
          <p>
            Start with an area of life. Each category leads you towards verified official government scheme information, eligibility rules, and document requirements.
          </p>
        </div>

        <div className="benefit-category-grid">
          {/* EDUCATION */}
          <article className="benefit-category benefit-education" onClick={() => handleCategoryCardClick('education')} style={{ cursor: 'pointer' }}>
            <div className="category-icon">🎓</div>
            <span className="category-number">01 / LEARNING</span>
            <h3>Education &amp; Scholarships</h3>
            <p>Pre-Matric, Post-Matric, and higher education assistance for eligible students.</p>
            <div className="arrow-link">
              Explore education support <span>→</span>
            </div>
          </article>

          {/* AGRICULTURE */}
          <article className="benefit-category benefit-agriculture" onClick={() => handleCategoryCardClick('agriculture')} style={{ cursor: 'pointer' }}>
            <div className="category-icon">🌾</div>
            <span className="category-number">02 / CULTIVATING</span>
            <h3>Agriculture &amp; Farmers</h3>
            <p>Direct income support, crop insurance, and equipment grants for cultivating families.</p>
            <div className="arrow-link">
              Explore agriculture support <span>→</span>
            </div>
          </article>

          {/* HEALTHCARE */}
          <article className="benefit-category benefit-health" onClick={() => handleCategoryCardClick('health')} style={{ cursor: 'pointer' }}>
            <div className="category-icon">🏥</div>
            <span className="category-number">03 / WELLBEING</span>
            <h3>Healthcare &amp; Insurance</h3>
            <p>Secondary and tertiary hospitalization coverage for vulnerable households.</p>
            <div className="arrow-link">
              Explore healthcare support <span>→</span>
            </div>
          </article>

          {/* LIVELIHOOD */}
          <article className="benefit-category benefit-livelihood" onClick={() => handleCategoryCardClick('livelihood')} style={{ cursor: 'pointer' }}>
            <div className="category-icon">💼</div>
            <span className="category-number">04 / OPPORTUNITY</span>
            <h3>Livelihood &amp; Skills</h3>
            <p>Guaranteed wage employment, credit linkage for self-help groups, and artisan grants.</p>
            <div className="arrow-link">
              Explore livelihood support <span>→</span>
            </div>
          </article>
        </div>
      </section>

      {/* =====================================================
           2. SCHEME DIRECTORY & SEARCH
      ====================================================== */}
      <section className="section-wrap" id="scheme-directory" style={{ paddingTop: '40px', paddingBottom: '90px' }}>
        <div className="section-kicker">EXPLORE GOVERNMENT PROGRAMMES</div>

        <div className="section-heading-row" style={{ marginTop: '14px' }}>
          <div>
            <h2>
              Find support that<br />
              <em>fits your journey.</em>
            </h2>
          </div>
          <p>
            Search by scheme name or keywords, or filter by category and beneficiary groups.
          </p>
        </div>

        {/* Search Bar & Filters */}
        <div
          style={{
            background: 'var(--white, #fffefa)',
            border: '1px solid var(--line, #e8e4dc)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          {/* Keyword Search */}
          <div style={{ marginBottom: '20px' }}>
            <label className="field" htmlFor="scheme-search">
              <span>Search schemes by keyword or provider</span>
              <input
                id="scheme-search"
                type="search"
                placeholder="Search PM-KISAN, NSP, Ayushman Bharat, Scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Category Filter Pills */}
            <div className="rights-categories" style={{ margin: 0 }}>
              <button
                type="button"
                className={`rights-filter ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Categories ({schemes.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`rights-filter ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Jurisdiction & Sort Dropdowns */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select
                value={selectedJurisdiction}
                onChange={(e) => setSelectedJurisdiction(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--line, #e8e4dc)',
                  background: '#faf8f3',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#45463f'
                }}
              >
                <option value="all">All Jurisdictions</option>
                <option value="central">Central Government</option>
                <option value="karnataka">Karnataka State</option>
              </select>

              <select
                value={selectedBeneficiary}
                onChange={(e) => setSelectedBeneficiary(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--line, #e8e4dc)',
                  background: '#faf8f3',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#45463f'
                }}
              >
                <option value="all">All Beneficiaries</option>
                <option value="sc">SC Category</option>
                <option value="st">ST Category</option>
                <option value="obc">OBC Category</option>
                <option value="bpl">BPL / Low Income</option>
                <option value="minority">Minority Communities</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="sample-button"
                  onClick={handleResetFilters}
                  style={{ fontSize: '12px' }}
                >
                  Reset ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#77786f' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
            <p>Loading cataloged government schemes from SQLite database...</p>
          </div>
        )}

        {/* Results Counter */}
        {!loading && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '13px', color: '#77786f' }}>
            <span>Showing <strong>{filteredSchemes.length}</strong> welfare schemes</span>
            <span>Always confirm eligibility on official government portals</span>
          </div>
        )}

        {/* Scheme Grid */}
        {!loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}
          >
            {filteredSchemes.map((scheme) => (
              <SchemeCard
                key={scheme.scheme_id}
                scheme={scheme}
                onOpenChecklist={(s) => setActiveChecklistSchemeId(s.scheme_id)}
              />
            ))}
          </div>
        )}

        {/* Empty Search State */}
        {!loading && filteredSchemes.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              borderRadius: '20px',
              background: '#fffefa',
              border: '1px solid var(--line, #e8e4dc)'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', fontWeight: 800 }}>
              No schemes match your filter
            </h3>
            <p style={{ color: '#77786f', fontSize: '14px', maxWidth: '400px', margin: '8px auto 20px' }}>
              Try searching with different terms or reset your active category filters to view all available welfare schemes.
            </p>
            <button
              type="button"
              className="button button-dark"
              onClick={handleResetFilters}
            >
              Reset all filters
            </button>
          </div>
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

export default AllSchemesPage;
