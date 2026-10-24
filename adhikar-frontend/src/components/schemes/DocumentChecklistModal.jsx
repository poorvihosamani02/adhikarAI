import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import { schemesApi } from '../../api/schemesApi';

const DocumentChecklistModal = ({ schemeId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (schemeId && isOpen) {
      setLoading(true);
      schemesApi
        .getSchemeDocuments(schemeId)
        .then((res) => {
          setData(res?.data || res);
        })
        .catch((err) => console.error('Error in DocumentChecklistModal:', err))
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [schemeId, isOpen]);

  const handleInspectDoc = (doc) => {
    onClose();
    navigate(`/document-doctor?scheme=${schemeId}&docName=${encodeURIComponent(doc.name || doc.document_name)}`);
  };

  const docs = data?.required_documents || data?.documents || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Required Document Checklist"
      maxWidth="640px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          {data?.official_portal_url && (
            <a
              href={data.official_portal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="arrow-link"
              style={{ fontSize: '13px' }}
            >
              Official Portal <span>↗</span>
            </a>
          )}
          <button
            type="button"
            className="sample-button"
            onClick={onClose}
            style={{ marginLeft: 'auto' }}
          >
            Close
          </button>
        </div>
      }
    >
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#77786f' }}>
          Loading official document specifications...
        </div>
      ) : data ? (
        <div>
          {/* Scheme Info Strip */}
          <div style={{ marginBottom: '16px' }}>
            <span className="tiny-label">SELECTED WELFARE SCHEME</span>
            <h4 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', fontWeight: 800, margin: '4px 0 6px', color: '#20211f' }}>
              {data.scheme_name}
            </h4>
            <div style={{ fontSize: '13px', color: '#77786f' }}>
              Provider: {data.provider_name} • Jurisdiction: {data.jurisdiction}
            </div>
          </div>

          <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#faf8f3', border: '1px solid #e8e4dc', fontSize: '13px', color: '#45463f', marginBottom: '16px' }}>
            💡 <strong>Pre-Submission Checklist:</strong> Ensure all certificates are valid for the current academic / financial year before initiating your portal application.
          </div>

          {/* Documents List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {docs.map((doc, idx) => {
              const docName = typeof doc === 'string' ? doc : doc.document_name || doc.name;
              const isMandatory = typeof doc === 'object' ? doc.is_mandatory !== false : true;
              const docNotes = typeof doc === 'object' ? doc.notes || doc.description : '';

              return (
                <div
                  key={idx}
                  style={{
                    border: '1px solid #e8e4dc',
                    borderRadius: '14px',
                    padding: '14px 18px',
                    background: '#fffefa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', fontFamily: 'Manrope, sans-serif', color: '#20211f' }}>
                        {docName}
                      </strong>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '999px',
                          background: isMandatory ? '#eeebff' : '#faf8f3',
                          border: `1px solid ${isMandatory ? '#ded3fa' : '#e8e4dc'}`,
                          color: isMandatory ? '#44317a' : '#77786f'
                        }}
                      >
                        {isMandatory ? 'Mandatory' : 'Conditional'}
                      </span>
                    </div>

                    {docNotes && (
                      <div style={{ fontSize: '12px', color: '#77786f', marginTop: '2px' }}>
                        {docNotes}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="arrow-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                    onClick={() => handleInspectDoc(doc)}
                  >
                    Pre-verify <span>→</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default DocumentChecklistModal;
