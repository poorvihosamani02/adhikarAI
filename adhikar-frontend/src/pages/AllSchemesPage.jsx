import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  Compass,
  Info
} from 'lucide-react';
import { mockSchemesService } from '../data/mockService';
import SchemeCard from '../components/schemes/SchemeCard';
import DocumentChecklistModal from '../components/schemes/DocumentChecklistModal';
import Badge from '../components/ui/Badge';

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
    mockSchemesService
      .getAllSchemes()
      .then((res) => {
        setSchemes(res.data);
      })
      .catch((err) => console.error(err))
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

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Title & Eyebrow */}
      <div>
        <span className="eyebrow-text">PUBLIC CIVIC DIRECTORY</span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em' }}>
          Government Scheme Catalog.
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.05rem', maxWidth: '780px', marginTop: '0.4rem' }}>
          Explore cataloged welfare schemes across central ministries and Karnataka state departments with comprehensive
          statutory guidelines, benefit limits, and required document checklists.
        </p>
      </div>

      {/* Search and Filters Bar (Clean White Card) */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        {/* Top row: search bar & sort */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by scheme name, ministry, keyword, or course..."
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search
              size={17}
              style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--charcoal-400)' }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--charcoal-400)'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div style={{ minWidth: '190px' }}>
            <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name_asc">Sort: Name (A to Z)</option>
              <option value="benefit_desc">Sort: Benefit (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Second row: dropdown filter controls */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--charcoal-500)', fontSize: '0.85rem', fontWeight: 700 }}>
            <Filter size={15} /> Filters:
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '150px', padding: '0.45rem 0.85rem' }}
            value={selectedJurisdiction}
            onChange={(e) => setSelectedJurisdiction(e.target.value)}
          >
            <option value="all">All Jurisdictions</option>
            <option value="central">Central Schemes</option>
            <option value="karnataka">Karnataka State</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '160px', padding: '0.45rem 0.85rem' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '160px', padding: '0.45rem 0.85rem' }}
            value={selectedBeneficiary}
            onChange={(e) => setSelectedBeneficiary(e.target.value)}
          >
            <option value="all">All Beneficiaries</option>
            <option value="sc">Scheduled Caste (SC)</option>
            <option value="st">Scheduled Tribe (ST)</option>
            <option value="obc">Other Backward Class (OBC)</option>
            <option value="minority">Minorities</option>
            <option value="bpl">BPL / Low Income</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              style={{
                background: 'var(--danger-50)',
                border: 'none',
                color: 'var(--danger-600)',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <X size={13} /> Clear filters
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--charcoal-500)', fontWeight: 700 }}>
            Showing {filteredSchemes.length} of {schemes.length} Schemes
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div style={{ padding: '4rem 1rem', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Loading Government Scheme Catalog...</div>
          <p style={{ opacity: 0.8 }}>Indexing central and state welfare entitlements.</p>
        </div>
      ) : filteredSchemes.length > 0 ? (
        <div className="grid-3">
          {filteredSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.scheme_id}
              scheme={scheme}
              onOpenChecklist={(s) => setActiveChecklistSchemeId(s.scheme_id)}
            />
          ))}
        </div>
      ) : (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--charcoal-100)',
              color: 'var(--charcoal-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Search size={28} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--charcoal-900)' }}>
            No Schemes Found Matching Criteria
          </h3>
          <p style={{ color: 'var(--charcoal-600)', fontSize: '0.9rem', maxWidth: '440px' }}>
            Try clearing search keywords or loosening the category and beneficiary filters.
          </p>
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleResetFilters}
            style={{ background: 'var(--coral-600)', color: '#ffffff' }}
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Catalog Disclosures Box */}
      <div
        className="card"
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem'
        }}
      >
        <Info size={20} style={{ color: 'var(--coral-600)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.8125rem', color: 'var(--charcoal-700)', lineHeight: 1.6 }}>
          <strong>Dataset Provenance &amp; Verification Notice:</strong> The schemes displayed above are cataloged from
          official central and state open gazettes for Academic / Financial Year 2026-2027. Application windows, fee
          concessions, and deadlines are subject to periodic ministry notification updates. Always complete final
          submissions directly on verified portals like{' '}
          <a href="https://scholarships.gov.in" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'inherit', fontWeight: 700 }}>
            scholarships.gov.in
          </a>.
        </div>
      </div>

      {/* Document Checklist Modal */}
      <DocumentChecklistModal
        schemeId={activeChecklistSchemeId}
        isOpen={!!activeChecklistSchemeId}
        onClose={() => setActiveChecklistSchemeId(null)}
      />
    </div>
  );
};

export default AllSchemesPage;
