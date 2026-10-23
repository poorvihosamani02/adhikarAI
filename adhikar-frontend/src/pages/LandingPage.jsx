import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Play,
  CheckCircle2,
  Compass,
  BookOpen,
  FileCheck2,
  AlertTriangle,
  UserCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeStagePill, setActiveStagePill] = useState(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4.5rem' }}>
      {/* 1. Hero Section (Otto Visual Hierarchy on Warm Sand Drift) */}
      <section className="container">
        <div
          style={{
            position: 'relative',
            paddingTop: '2.5rem',
            paddingBottom: '3.5rem',
            minHeight: '680px',
            display: 'grid',
            gridTemplateColumns: '1.15fr 1fr',
            alignItems: 'center',
            gap: '2.5rem'
          }}
          className="hero-grid"
        >
          {/* Left Column: Oversized Punchy Typography (Deep Espresso on Sand Drift) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', zIndex: 2 }}>
            <span className="eyebrow-text">
              A LITTLE INTELLIGENCE. A LOT OF CIVIC POWER.
            </span>

            <h1
              style={{
                fontSize: 'clamp(3.1rem, 5.8vw, 5.25rem)',
                fontWeight: 900,
                color: 'var(--charcoal-900)',
                lineHeight: 1.02,
                letterSpacing: '-0.04em',
                marginBottom: '1.5rem'
              }}
            >
              Less red tape.<br />
              More entitlement.
            </h1>

            <p
              style={{
                fontSize: 'clamp(1.05rem, 1.8vw, 1.2rem)',
                color: 'var(--charcoal-700)',
                lineHeight: 1.55,
                marginBottom: '2.5rem',
                maxWidth: '520px',
                fontWeight: 450
              }}
            >
              Meet the AI platform that turns complex legal acts into instant entitlements.
              One calm place to discover, verify, and protect.
            </p>

            {/* Action Buttons (Pill styling matching reference) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn"
                onClick={() => navigate(isAuthenticated ? '/find-schemes' : '/login?redirect=find-schemes')}
                style={{
                  background: 'var(--coral-600)',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(216, 109, 78, 0.28)',
                  fontSize: '1rem',
                  padding: '0.85rem 1.85rem'
                }}
              >
                <span>Find your schemes</span>
                <ArrowUpRight size={18} />
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/schemes')}
                style={{
                  border: '1.5px solid rgba(139, 115, 85, 0.35)',
                  color: 'var(--charcoal-800)',
                  background: 'rgba(255, 255, 255, 0.65)',
                  fontSize: '1rem',
                  padding: '0.85rem 1.75rem'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--coral-50)',
                    color: 'var(--coral-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '0.25rem'
                  }}
                >
                  <Play size={11} fill="currentColor" />
                </div>
                <span>See Adhikar in action</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Stage with Orbit Rings & Floating Pills */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '520px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Outer Subtle Orbit Circle */}
            <div
              style={{
                position: 'absolute',
                width: '440px',
                height: '440px',
                borderRadius: '50%',
                border: '1.5px dashed rgba(139, 115, 85, 0.25)',
                pointerEvents: 'none'
              }}
            />

            {/* Inner Concentric Orbit Ring */}
            <div
              style={{
                position: 'absolute',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                border: '1px solid rgba(139, 115, 85, 0.18)',
                pointerEvents: 'none'
              }}
            />

            {/* Top-Right Micro Superpower Tag */}
            <div
              style={{
                position: 'absolute',
                top: '15px',
                right: '10px',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: 'var(--charcoal-500)',
                textTransform: 'uppercase',
                textAlign: 'right'
              }}
            >
              01 / YOUR EVERYDAY<br />CIVIC SUPERPOWER
            </div>

            {/* Floating Pill Badge 1: Top-Left */}
            <div
              style={{
                position: 'absolute',
                top: '60px',
                left: '20px',
                background: '#ffffff',
                color: 'var(--charcoal-900)',
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-md)',
                border: '1px solid rgba(139, 115, 85, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                zIndex: 3,
                animation: 'floatSlow 4s ease-in-out infinite'
              }}
            >
              <CheckCircle2 size={15} style={{ color: 'var(--emerald-600)' }} />
              <span>7 Schemes matched. 100% Eligible.</span>
            </div>

            {/* Floating Pill Badge 2: Bottom-Right */}
            <div
              style={{
                position: 'absolute',
                bottom: '100px',
                right: '15px',
                background: '#ffffff',
                color: 'var(--charcoal-900)',
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-md)',
                border: '1px solid rgba(139, 115, 85, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                zIndex: 3,
                animation: 'floatSlow 4.5s ease-in-out infinite 1s'
              }}
            >
              <CheckCircle2 size={15} style={{ color: 'var(--emerald-600)' }} />
              <span>Statutory legal aid &amp; 1930 ready.</span>
            </div>

            {/* Central Reserved Hero Visual Stage Frame */}
            <div
              style={{
                width: '320px',
                height: '320px',
                borderRadius: '36px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 20px 40px rgba(70, 45, 25, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              {/* Decorative Spherical Orb Accent */}
              <div
                style={{
                  position: 'absolute',
                  left: '-18px',
                  bottom: '80px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #ffd166 0%, #e09f3e 70%, #9e6417 100%)',
                  boxShadow: '0 6px 14px rgba(70, 45, 25, 0.2)'
                }}
              />

              {/* Minimalist Civic Emblem Icon */}
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '26px',
                  background: '#ffffff',
                  boxShadow: '0 14px 28px rgba(70, 45, 25, 0.1)',
                  border: '1px solid rgba(139, 115, 85, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--coral-600)',
                  marginBottom: '1rem'
                }}
              >
                <div className="brand-dots" style={{ transform: 'scale(1.6)' }}>
                  <div className="brand-dot" style={{ backgroundColor: 'var(--coral-600)' }} />
                  <div className="brand-dot" style={{ backgroundColor: 'var(--coral-600)' }} />
                  <div className="brand-dot" style={{ backgroundColor: 'var(--coral-600)' }} />
                  <div className="brand-dot" style={{ backgroundColor: 'var(--coral-600)' }} />
                </div>
              </div>

              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--charcoal-900)', letterSpacing: '-0.02em' }}>
                AdhikarAI Civic Core
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--charcoal-600)', marginTop: '0.25rem' }}>
                Stage reserved for your visual asset
              </div>
            </div>

            {/* Bottom Stage Pill */}
            <div
              style={{
                position: 'absolute',
                bottom: '18px',
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(139, 115, 85, 0.2)',
                color: 'var(--charcoal-800)',
                padding: '0.35rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                backdropFilter: 'blur(8px)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              20 Central &amp; State Schemes Verified &bull; Real-Time Matching
            </div>
          </div>
        </div>

        {/* Bottom Hero Ticker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(139, 115, 85, 0.18)',
            fontSize: '0.75rem',
            color: 'var(--charcoal-500)',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}
        >
          <div>01 / MEET ADHIKAR</div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ width: '18px', height: '2px', background: 'rgba(139, 115, 85, 0.3)' }} />
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--coral-600)' }} />
            <span style={{ width: '18px', height: '2px', background: 'rgba(139, 115, 85, 0.3)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>SCROLL TO EXPLORE</span>
            <span>&darr;</span>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Ticker (Refined Clean White Cards on Sand Drift) */}
      <section className="container">
        <div className="grid-4">
          <div className="card card-hover" style={{ padding: '1.5rem', borderRadius: '20px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--charcoal-500)' }}>
              01 &bull; Cataloged Schemes
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--charcoal-900)', margin: '0.2rem 0', letterSpacing: '-0.04em' }}>
              20
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--charcoal-600)' }}>
              Central &amp; Karnataka State
            </div>
          </div>

          <div className="card card-hover" style={{ padding: '1.5rem', borderRadius: '20px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--charcoal-500)' }}>
              02 &bull; Document Rules
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--charcoal-900)', margin: '0.2rem 0', letterSpacing: '-0.04em' }}>
              30
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--charcoal-600)' }}>
              Pre-verification guidelines
            </div>
          </div>

          <div className="card card-hover" style={{ padding: '1.5rem', borderRadius: '20px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--charcoal-500)' }}>
              03 &bull; Fraud Typologies
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--charcoal-900)', margin: '0.2rem 0', letterSpacing: '-0.04em' }}>
              22
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--charcoal-600)' }}>
              Monitored scam patterns
            </div>
          </div>

          <div className="card card-hover" style={{ padding: '1.5rem', borderRadius: '20px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--charcoal-500)' }}>
              04 &bull; Civic Guarantee
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--emerald-600)', margin: '0.2rem 0', letterSpacing: '-0.04em' }}>
              100%
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--charcoal-600)' }}>
              Free &amp; Zero Hallucinations
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Four Core Pillars (Clean, Human-Made White Cards with Hover Elevation) */}
      <section className="container">
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="eyebrow-text">02 / CORE PILLARS</span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--charcoal-900)', letterSpacing: '-0.035em' }}>
            Four pillars of citizen empowerment.
          </h2>
          <p style={{ color: 'var(--charcoal-600)', fontSize: '1.05rem', maxWidth: '640px', marginTop: '0.5rem' }}>
            Everything a citizen, student, farmer, or senior needs to identify statutory entitlements and avoid bureaucracy.
          </p>
        </div>

        <div className="grid-2">
          {/* Pillar 1 */}
          <div className="card card-hover" style={{ borderRadius: '22px', padding: '2.25rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: 'var(--coral-50)',
                  color: 'var(--coral-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Compass size={24} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--charcoal-300)', letterSpacing: '0.08em' }}>
                01
              </span>
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--charcoal-900)', marginBottom: '0.5rem' }}>
              Scheme Eligibility Engine
            </h3>
            <p style={{ color: 'var(--charcoal-600)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', flex: 1 }}>
              Cross-references age, state residency, social category, and family income against full welfare guidelines.
              See transparently why you match and which criteria remain unmet.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => navigate('/find-schemes')}
                style={{ background: 'var(--coral-600)', color: '#ffffff' }}
              >
                <span>Find My Schemes</span>
                <ArrowUpRight size={14} />
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => navigate('/schemes')}
                style={{ background: 'var(--charcoal-100)', color: 'var(--charcoal-900)' }}
              >
                Browse All 20
              </button>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="card card-hover" style={{ borderRadius: '22px', padding: '2.25rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: 'var(--coral-50)',
                  color: 'var(--coral-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <BookOpen size={24} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--charcoal-300)', letterSpacing: '0.08em' }}>
                02
              </span>
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--charcoal-900)', marginBottom: '0.5rem' }}>
              Legal Rights AI (Ask Genie)
            </h3>
            <p style={{ color: 'var(--charcoal-600)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', flex: 1 }}>
              Inquire about Central RTI Online appeals, free legal aid eligibility under NALSA, and cyber fraud reporting.
              Every statutory explanation cites verified legislative acts.
            </p>

            <div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => navigate('/know-your-rights')}
                style={{ background: 'var(--coral-600)', color: '#ffffff' }}
              >
                <span>Consult Legal Rights AI</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="card card-hover" style={{ borderRadius: '22px', padding: '2.25rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: 'var(--coral-50)',
                  color: 'var(--coral-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FileCheck2 size={24} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--charcoal-300)', letterSpacing: '0.08em' }}>
                03
              </span>
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--charcoal-900)', marginBottom: '0.5rem' }}>
              Document Doctor
            </h3>
            <p style={{ color: 'var(--charcoal-600)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', flex: 1 }}>
              Inspect your income certificate, caste certificate, or Aadhaar credentials against 30 official rules to catch
              expired financial years or missing tahsildar seals before application.
            </p>

            <div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => navigate('/document-doctor')}
                style={{ background: 'var(--coral-600)', color: '#ffffff' }}
              >
                <span>Pre-Verify Document</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="card card-hover" style={{ borderRadius: '22px', padding: '2.25rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: 'var(--coral-50)',
                  color: 'var(--coral-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--charcoal-300)', letterSpacing: '0.08em' }}>
                04
              </span>
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--charcoal-900)', marginBottom: '0.5rem' }}>
              Scam Shield Defense
            </h3>
            <p style={{ color: 'var(--charcoal-600)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', flex: 1 }}>
              Paste suspicious electricity disconnection notices, fake scholarship APK download links, or lottery claims
              to detect fraud mechanisms and get direct protective actions.
            </p>

            <div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => navigate('/scam-shield')}
                style={{ background: 'var(--coral-600)', color: '#ffffff' }}
              >
                <span>Scan Suspicious Message</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Easy Steps to Apply for Government Schemes (Matching Picture 2 with Special Hovering Effect) */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="eyebrow-text" style={{ marginBottom: '0.45rem' }}>
            HOW IT WORKS
          </span>
          <h2 style={{ fontSize: 'clamp(2.1rem, 4vw, 3rem)', fontWeight: 850, color: 'var(--charcoal-900)', letterSpacing: '-0.035em' }}>
            Easy steps to apply for Government Schemes
          </h2>
          <p style={{ color: 'var(--charcoal-600)', fontSize: '1.05rem', maxWidth: '600px', margin: '0.5rem auto 0' }}>
            A smooth, citizen-friendly journey with built-in document verification before portal submission.
          </p>
        </div>

        {/* 4 Connected Step Cards with Special Hover Effect */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            alignItems: 'stretch'
          }}
        >
          {/* Step 1: Enter Details */}
          <div className="step-card">
            <div className="step-icon-box">
              <UserCheck size={30} />
            </div>
            <div className="step-title" style={{ color: '#10b981' }}>
              Enter Details
            </div>
            <p className="step-description">
              Start by entering your <strong>basic demographic details</strong>!
            </p>
          </div>

          {/* Step 2: Search & Match */}
          <div className="step-card">
            <div className="step-icon-box">
              <Search size={30} />
            </div>
            <div className="step-title" style={{ color: '#10b981' }}>
              Search
            </div>
            <p className="step-description">
              Our search engine will <strong>find the relevant schemes</strong>!
            </p>
          </div>

          {/* Step 3: Document Doctor (User's specific step) */}
          <div className="step-card">
            <div className="step-icon-box">
              <FileCheck2 size={30} />
            </div>
            <div className="step-title" style={{ color: 'var(--coral-600)' }}>
              Document Doctor
            </div>
            <p className="step-description">
              Pre-check certificates to <strong>prevent official rejection</strong>!
            </p>
          </div>

          {/* Step 4: Select & Apply */}
          <div className="step-card">
            <div className="step-icon-box">
              <ExternalLink size={30} />
            </div>
            <div className="step-title" style={{ color: '#10b981' }}>
              Select &amp; Apply
            </div>
            <p className="step-description">
              Select and <strong>apply for the best suited scheme</strong>!
            </p>
          </div>
        </div>
      </section>

      {/* 5. Civic Trust & Helpline Strip */}
      <section className="container">
        <div
          className="card card-hover"
          style={{
            background: '#ffffff',
            color: 'var(--charcoal-900)',
            borderRadius: '24px',
            padding: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
            flexWrap: 'wrap',
            boxShadow: '0 8px 28px rgba(70, 45, 25, 0.08)'
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--danger-50)',
                  color: 'var(--danger-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <PhoneCall size={16} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--charcoal-900)' }}>
                National Cyber Crime Helpline: 1930
              </h3>
            </div>
            <p style={{ color: 'var(--charcoal-600)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              If you or anyone you know has been targeted by financial cyber fraud or extortion, call <strong>1930</strong> immediately
              or report incidents directly at <strong>cybercrime.gov.in</strong>.
            </p>
          </div>

          <button
            type="button"
            className="btn"
            onClick={() => navigate('/scam-shield')}
            style={{ background: 'var(--coral-600)', color: '#ffffff' }}
          >
            <span>Open Scam Shield</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
