import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Square, FileSearch, AlertCircle, Sparkles } from 'lucide-react';

export default function DocumentChecklist({ documents = [], schemeId, schemeName, unavailableMessage }) {
  const navigate = useNavigate();
  const [checkedState, setCheckedState] = useState({});

  const toggleCheck = (index) => {
    setCheckedState((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleOpenDocDoctor = (docName) => {
    // Navigate to Document Doctor with query params
    navigate(`/document-doctor?schemeId=${encodeURIComponent(schemeId)}&docName=${encodeURIComponent(docName)}`);
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="card" style={{ background: '#f8fafc', borderColor: '#e2e8f0', textAlign: 'center', padding: '2rem 1.5rem' }}>
        <AlertCircle size={32} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
        <h4 style={{ fontSize: '1rem', color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
          Document Requirements Not Verified in Dataset
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', maxWidth: '550px', margin: '0 auto 1.25rem' }}>
          {unavailableMessage || 'The official checklist of required certificates for this scheme is not cataloged in the research dataset. We do not invent mandatory documents to prevent misinformation.'}
        </p>
        <button
          onClick={() => navigate(`/document-doctor?schemeId=${encodeURIComponent(schemeId)}`)}
          className="btn btn-secondary btn-sm"
        >
          <Sparkles size={14} color="#3b82f6" /> Open General Document Doctor
        </button>
      </div>
    );
  }

  const completedCount = Object.values(checkedState).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / documents.length) * 100);

  return (
    <div className="card">
      {/* Header & Readiness Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)' }}>Document Checklist & Readiness</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
            Track the required papers verified in the official scheme record.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
            {completedCount} of {documents.length} Ready ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'var(--slate-100)', borderRadius: '999px', overflow: 'hidden', marginBottom: '1.25rem' }}>
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--primary-600), var(--emerald-500))',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* Items list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {documents.map((doc, index) => {
          const isChecked = !!checkedState[index];
          const docName = typeof doc === 'string' ? doc : doc.name;

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                border: '1px solid',
                borderColor: isChecked ? 'var(--emerald-200)' : 'var(--slate-200)',
                background: isChecked ? 'var(--emerald-50)' : 'white',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                onClick={() => toggleCheck(index)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flex: 1 }}
              >
                {isChecked ? (
                  <CheckSquare size={20} color="#059669" />
                ) : (
                  <Square size={20} color="#94a3b8" />
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: isChecked ? 'var(--emerald-800)' : 'var(--slate-800)', textDecoration: isChecked ? 'line-through' : 'none' }}>
                    {docName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    Verified from official scheme record
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenDocDoctor(docName)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                title="Verify this certificate against official format rules"
              >
                <FileSearch size={14} color="#3b82f6" />
                <span>Verify in Doctor</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
