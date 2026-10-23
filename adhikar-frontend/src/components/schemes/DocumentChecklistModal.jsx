import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, Shield, ExternalLink, ArrowRight, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { mockSchemesService } from '../../data/mockService';

const DocumentChecklistModal = ({ schemeId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (schemeId && isOpen) {
      setLoading(true);
      mockSchemesService
        .getSchemeDocuments(schemeId)
        .then((res) => {
          setData(res);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [schemeId, isOpen]);

  const handleInspectDoc = (doc) => {
    onClose();
    navigate(`/document-doctor?schemeId=${schemeId}&docName=${encodeURIComponent(doc.name)}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Required Document Checklist"
      maxWidth="680px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          {data?.official_portal_url && (
            <a
              href={data.official_portal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>Official Portal</span>
              <ExternalLink size={14} />
            </a>
          )}
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          Loading official document specifications...
        </div>
      ) : data ? (
        <div>
          {/* Scheme Info Strip */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
              {data.scheme_name}
            </h4>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
              Provider: {data.provider_name} &bull; Jurisdiction: {data.jurisdiction}
            </div>
          </div>

          <div className="alert alert-info" style={{ fontSize: '0.8125rem', padding: '0.75rem 1rem' }}>
            <div>
              <strong>Pre-Submission Checklist:</strong> Ensure each certificate is updated for the current academic / financial year before initiating your portal application.
            </div>
          </div>

          {/* Documents List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {data.documents && data.documents.length > 0 ? (
              data.documents.map((doc, idx) => (
                <div
                  key={doc.id || idx}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    background: 'var(--slate-50)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileCheck size={18} style={{ color: 'var(--primary-600)' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                        {doc.name}
                      </span>
                    </div>
                    <Badge variant="blue">{doc.category || 'Certificate'}</Badge>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', margin: 0 }}>
                    {doc.guidance}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '0.5rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px dashed var(--slate-200)',
                      fontSize: '0.75rem',
                      color: 'var(--slate-500)'
                    }}
                  >
                    <span>Issuing: {doc.issuing_authority}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInspectDoc(doc)}
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
                    >
                      <span>Check with Document Doctor</span>
                      <ArrowRight size={12} />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--slate-500)', fontSize: '0.875rem' }}>
                No specific documents enumerated in dataset. Basic identity proof (Aadhaar) and income declaration standardly apply.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default DocumentChecklistModal;
