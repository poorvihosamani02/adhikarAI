import React, { useState, useEffect } from 'react';
import { useDemoMode } from '../context/DemoModeContext';
import { getAllSchemes } from '../api/schemesApi';
import SchemeCard from '../components/SchemeCard';
import { Search, Filter, RefreshCw, AlertCircle, Database } from 'lucide-react';

export default function AllSchemesPage() {
  const { isDemoMode } = useDemoMode();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');

  useEffect(() => {
    async function loadSchemes() {
      try {
        setLoading(true);
        setError(null);
        const res = await getAllSchemes(
          {
            search: searchTerm,
            category: selectedCategory,
            jurisdiction: selectedJurisdiction
          },
          isDemoMode
        );
        setSchemes(res.schemes || []);
      } catch (err) {
        setError(err.message || 'Failed to load schemes from backend.');
      } finally {
        setLoading(false);
      }
    }

    loadSchemes();
  }, [searchTerm, selectedCategory, selectedJurisdiction, isDemoMode]);

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Database size={28} color="#2563eb" />
          <h1 style={{ fontSize: '1.8rem', color: 'var(--slate-900)' }}>
            All Government Schemes
          </h1>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)' }}>
          Browse all 20 verified schemes from the research dataset across central ministries and Karnataka state.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <div>
            <strong>Backend Error:</strong> {error}
            <div style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
              Preparing for <code>GET /api/schemes</code> on your Node.js backend.
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              color="#94a3b8"
              style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by scheme name, provider, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="scholarship">Scholarships</option>
              <option value="women welfare">Women Welfare</option>
              <option value="farmer income support">Farmer Support</option>
              <option value="health insurance">Health Insurance</option>
              <option value="pension">Pension</option>
              <option value="electricity subsidy">Electricity Subsidy</option>
              <option value="unemployment allowance">Unemployment Allowance</option>
            </select>
          </div>

          {/* Jurisdiction Filter */}
          <div>
            <select
              className="form-control"
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
            >
              <option value="all">All Jurisdictions</option>
              <option value="central">Central (Pan-India)</option>
              <option value="Karnataka">Karnataka State</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <RefreshCw size={32} color="#3b82f6" style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-700)' }}>Loading Schemes...</h3>
        </div>
      ) : schemes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <AlertCircle size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>No schemes match your filters</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
            Try clearing the search query or selecting 'All Categories'.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedJurisdiction('all');
            }}
            className="btn btn-secondary btn-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            Showing <strong>{schemes.length}</strong> cataloged schemes from dataset
          </div>
          <div className="grid-3">
            {schemes.map((scheme) => (
              <SchemeCard key={scheme.scheme_id} scheme={scheme} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
