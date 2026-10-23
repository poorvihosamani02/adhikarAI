import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import StatCard from '../components/StatCard';
import {
  Compass,
  Search,
  FileText,
  AlertTriangle,
  MessageSquare,
  UserCheck,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  BookOpen,
  Award
} from 'lucide-react';
import schemesData from '../data/schemes.json';
import docsData from '../data/documents.json';
import scamsData from '../data/scams.json';
import rightsData from '../data/rights.json';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, hasProfile } = useProfile();

  const handleFindSchemesClick = () => {
    if (!hasProfile) {
      navigate('/profile?redirect=find-schemes');
    } else {
      navigate('/find-schemes');
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Welcome Hero */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #0f172a 100%)',
          color: 'white',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-xl)',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '750px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', marginBottom: '1rem', fontWeight: 600 }}>
            <Sparkles size={14} color="#fbbf24" />
            AdhikarAI Practice Platform &bull; Citizen Empowerment
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'white', marginBottom: '0.75rem', lineHeight: 1.2 }}>
            Welcome, {user ? user.name : 'Citizen'}
          </h1>
          <p style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '2rem', lineHeight: 1.6 }}>
            Discover government welfare schemes matched to your profile, inspect application documents against official criteria, detect fraudulent messages, and understand your constitutional & statutory rights.
          </p>

          {/* TWO PROMINENT ACTIONS (Phase 3.B) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              onClick={handleFindSchemesClick}
              className="btn btn-accent btn-lg"
              style={{ fontWeight: 700 }}
            >
              <Compass size={20} />
              <span>Find My Schemes</span>
            </button>

            <Link
              to="/schemes"
              className="btn btn-secondary btn-lg"
              style={{ background: 'rgba(255,255,255,0.12)', color: 'white', borderColor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)' }}
            >
              <Search size={20} />
              <span>Browse All Schemes ({schemesData.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Dataset & Module Stats */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <StatCard
          icon={Award}
          title="Cataloged Schemes"
          value={schemesData.length}
          subtitle="Central & Karnataka"
          color="primary"
        />
        <StatCard
          icon={FileText}
          title="Document Rules"
          value={docsData.length}
          subtitle="Verified criteria"
          color="emerald"
        />
        <StatCard
          icon={ShieldAlert}
          title="Scam Patterns"
          value={scamsData.length}
          subtitle="PIB & Cybercrime"
          color="saffron"
        />
        <StatCard
          icon={BookOpen}
          title="Legal Protections"
          value={rightsData.length}
          subtitle="RTI, Legal Aid, 1930"
          color="slate"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', color: 'var(--slate-900)' }}>
          Core AdhikarAI Modules
        </h2>
        <div className="grid-2">
          {/* Card 1: Profile Setup */}
          <div className="card card-interactive" onClick={() => navigate('/profile')}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserCheck size={24} color="#2563eb" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Citizen Profile</h3>
                  <span className={`badge ${hasProfile ? 'badge-emerald' : 'badge-saffron'}`}>
                    {hasProfile ? 'Configured' : 'Needs Setup'}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '0.85rem' }}>
                  Manage income, caste category, residence state, and educational qualifications for tailored scheme matching.
                </p>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>Update Profile</span> <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Document Doctor */}
          <div className="card card-interactive" onClick={() => navigate('/document-doctor')}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--emerald-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={24} color="#059669" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Document Doctor</h3>
                  <span className="badge badge-emerald">FastAPI Port 8002</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '0.85rem' }}>
                  Pre-verify certificates against 30 official Indian rules before government portal submission to prevent rejection.
                </p>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--emerald-700)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>Run Document Check</span> <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Scam Shield */}
          <div className="card card-interactive" onClick={() => navigate('/scam-shield')}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--saffron-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={24} color="#ea580c" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Scam Shield</h3>
                  <span className="badge badge-saffron">FastAPI Port 8003</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '0.85rem' }}>
                  Paste suspicious SMS, WhatsApp offers, or fake scholarship links to check against verified Indian fraud advisories.
                </p>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--saffron-700)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>Analyze Suspicious Message</span> <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Know Your Rights */}
          <div className="card card-interactive" onClick={() => navigate('/know-your-rights')}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageSquare size={24} color="#334155" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Know Your Rights (RAG)</h3>
                  <span className="badge badge-primary">FastAPI Port 8001</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '0.85rem' }}>
                  Chat with the grounded AI legal guide for RTI filing, NALSA free legal assistance, and cybercrime reporting.
                </p>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>Open Legal Q&A Chat</span> <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
