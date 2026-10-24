import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { schemesApi } from '../api/schemesApi';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [matchSummary, setMatchSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setLoading(true);
      schemesApi
        .getMatchedSchemes(profile)
        .then((res) => setMatchSummary(res?.summary || null))
        .catch((err) => console.error('Failed to load dashboard match summary:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [profile]);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const fullName = user?.name || profile?.name || 'Citizen';

  // Profile completeness
  const profileFields = ['age', 'gender', 'state', 'category', 'annual_income', 'occupation'];
  const filledCount = profile
    ? profileFields.filter((f) => {
        const v = profile[f];
        if (v === undefined || v === null) return false;
        const str = String(v).trim();
        if (str === '' || str === 'null' || str === 'undefined') return false;
        if (f === 'age') return Number(v) > 0;
        if (f === 'annual_income') return !isNaN(Number(v)) && Number(v) >= 0;
        return true;
      }).length
    : 0;
  const completenessPercent = Math.round((filledCount / profileFields.length) * 100);

  const profileSummaryText = completenessPercent === 0
    ? '⚠️ Profile not set up yet (0% Complete)'
    : [profile?.category, profile?.state, profile?.occupation].filter(Boolean).join(' • ') || 'Citizen';

  return (
    <main>
      <div className="section-wrap" style={{ paddingTop: '50px', paddingBottom: '90px' }}>
        {/* Welcome Banner Card */}
        <div
          style={{
            background: 'var(--white, #fffefa)',
            border: '1px solid var(--line, #e8e4dc)',
            borderRadius: '24px',
            padding: '36px',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div className="pd-avatar-large" style={{ width: '68px', height: '68px', fontSize: '26px' }}>
                {initials}
              </div>
              <div>
                <div className="section-kicker" style={{ marginBottom: '4px' }}>
                  YOUR CIVIC DASHBOARD
                </div>
                <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-.035em' }}>
                  Namaste, {fullName}.
                </h1>
                <p style={{ color: completenessPercent === 0 ? '#b45309' : '#77786f', fontWeight: completenessPercent === 0 ? 600 : 400, fontSize: '14px', margin: 0 }}>
                  {profileSummaryText}
                </p>
              </div>
            </div>

            {/* Profile Completeness */}
            <div style={{ textAlign: 'right', minWidth: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="tiny-label">PROFILE COMPLETION</span>
                <strong style={{ fontSize: '13px', color: completenessPercent === 0 ? '#b45309' : '#254c3c' }}>
                  {completenessPercent}%
                </strong>
              </div>
              <div className="progress-track" style={{ background: '#e8e4dc', width: '200px' }}>
                <span style={{ width: `${completenessPercent}%`, background: completenessPercent === 0 ? '#b45309' : '#254c3c' }}></span>
              </div>
              <Link
                to="/profile"
                className="arrow-link"
                style={{
                  fontSize: '12px',
                  marginTop: '8px',
                  display: 'inline-flex',
                  fontWeight: completenessPercent === 0 ? 700 : 500,
                  color: completenessPercent === 0 ? '#b45309' : 'inherit'
                }}
              >
                {completenessPercent === 0 ? 'Set up profile now →' : 'Edit profile details →'}
              </Link>
            </div>
          </div>
        </div>

        {/* Action Prompt Banner when profile is 0% */}
        {completenessPercent === 0 && (
          <div
            style={{
              background: 'linear-gradient(135deg, #fff9f0 0%, #fff4e5 100%)',
              border: '1.5px solid #f6d3a2',
              borderRadius: '20px',
              padding: '24px 28px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap',
              boxShadow: '0 4px 14px rgba(246, 211, 162, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ffe6c4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                📋
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', color: '#8c4300', marginBottom: '4px' }}>
                  Please set up your Citizen Profile (0% Complete)
                </strong>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#68401a', lineHeight: 1.5 }}>
                  Your profile is currently 0% configured. Share your state, social category, and occupation so we can match you with eligible government schemes.
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="button button-dark"
              style={{
                background: '#254c3c',
                color: '#fff',
                padding: '11px 22px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '13.5px',
                whiteSpace: 'nowrap'
              }}
            >
              Set up profile now →
            </Link>
          </div>
        )}

        {/* Quick Action Navigation Grid (Pastel Cards from Friend's Style) */}
        <div className="section-kicker" style={{ marginBottom: '14px' }}>
          CITIZEN TOOLS &amp; ACTIONS
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '18px',
            marginBottom: '40px'
          }}
        >
          {/* My Schemes */}
          <Link
            to={completenessPercent === 0 ? "/profile" : "/my-schemes"}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '24px',
              borderRadius: '20px',
              background: '#eeebff',
              border: '1px solid #ded3fa',
              color: 'inherit'
            }}
          >
            <span style={{ fontSize: '28px' }}>🎯</span>
            <strong style={{ fontFamily: 'Manrope, sans-serif', fontSize: '17px', letterSpacing: '-.03em' }}>
              My Schemes
            </strong>
            <span style={{ color: '#6f6e7b', fontSize: '13px', lineHeight: 1.6 }}>
              {completenessPercent === 0
                ? 'Please set up your citizen profile to unlock and view matching welfare schemes.'
                : matchSummary
                ? `${matchSummary.eligible_count} schemes currently match your demographic qualifications.`
                : 'Evaluate your profile against 20+ national and state schemes.'}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#57428f', marginTop: 'auto' }}>
              {completenessPercent === 0 ? 'Set up profile to view →' : 'View My Schemes →'}
            </span>
          </Link>

          {/* Document Doctor */}
          <Link
            to="/document-doctor"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '24px',
              borderRadius: '20px',
              background: '#fff0e7',
              border: '1px solid #f4d8c5',
              color: 'inherit'
            }}
          >
            <span style={{ fontSize: '28px' }}>📄</span>
            <strong style={{ fontFamily: 'Manrope, sans-serif', fontSize: '17px', letterSpacing: '-.03em' }}>
              Document Doctor
            </strong>
            <span style={{ color: '#7a5840', fontSize: '13px', lineHeight: 1.6 }}>
              Pre-verify your certificates and IDs before applying to prevent rejections.
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#9d5835', marginTop: 'auto' }}>
              Pre-verify documents →
            </span>
          </Link>

          {/* Scam Shield */}
          <Link
            to="/scam-shield"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '24px',
              borderRadius: '20px',
              background: '#dfeaff',
              border: '1px solid #cbdcf8',
              color: 'inherit'
            }}
          >
            <span style={{ fontSize: '28px' }}>🛡️</span>
            <strong style={{ fontFamily: 'Manrope, sans-serif', fontSize: '17px', letterSpacing: '-.03em' }}>
              Scam Shield Defense
            </strong>
            <span style={{ color: '#4a5e80', fontSize: '13px', lineHeight: 1.6 }}>
              Review suspicious messages, SMS, or fake scholarship links before clicking.
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#38568c', marginTop: 'auto' }}>
              Check messages →
            </span>
          </Link>

          {/* Know Your Rights */}
          <Link
            to="/know-your-rights"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '24px',
              borderRadius: '20px',
              background: '#e1f1e3',
              border: '1px solid #c8e5cc',
              color: 'inherit'
            }}
          >
            <span style={{ fontSize: '28px' }}>⚖️</span>
            <strong style={{ fontFamily: 'Manrope, sans-serif', fontSize: '17px', letterSpacing: '-.03em' }}>
              Know Your Rights
            </strong>
            <span style={{ color: '#4f6b52', fontSize: '13px', lineHeight: 1.6 }}>
              Ask Legal Genie statutory questions with real citations under RTI, NALSA, and IT Acts.
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#325c38', marginTop: 'auto' }}>
              Ask Legal Genie →
            </span>
          </Link>
        </div>

        {/* Explore All Schemes Shortcut */}
        <div
          style={{
            background: 'var(--white, #fffefa)',
            border: '1px solid var(--line, #e8e4dc)',
            borderRadius: '20px',
            padding: '28px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', fontWeight: 800, margin: '0 0 6px' }}>
              Browse Complete Government Schemes Directory
            </h3>
            <p style={{ color: '#77786f', fontSize: '14px', margin: 0 }}>
              Search across 20+ cataloged central and state welfare programs by keyword and category.
            </p>
          </div>

          <Link to="/schemes" className="button button-dark" style={{ padding: '10px 20px', fontSize: '13px' }}>
            Explore All Schemes <span>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
