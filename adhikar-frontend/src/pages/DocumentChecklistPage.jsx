import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { schemesApi } from '../api/schemesApi';

const DocumentChecklistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState(id || 'GOV001');
  const [schemeData, setSchemeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Checkbox tracking state
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    schemesApi
      .getAllSchemes()
      .then((res) => {
        const list = res?.data || res?.schemes || [];
        setSchemes(list);
        if (id) {
          setSelectedSchemeId(id);
        } else if (list.length > 0) {
          setSelectedSchemeId(list[0].scheme_id);
        }
      })
      .catch((err) => console.error('Error fetching schemes for checklist:', err));
  }, [id]);

  useEffect(() => {
    if (selectedSchemeId) {
      setLoading(true);
      schemesApi
        .getSchemeDocuments(selectedSchemeId)
        .then((res) => {
          setSchemeData(res?.data || res);
          setCheckedItems({});
        })
        .catch((err) => console.error('Error fetching scheme documents:', err))
        .finally(() => setLoading(false));
    }
  }, [selectedSchemeId]);

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const docs = schemeData?.required_documents || schemeData?.documents || [];
  const totalCount = docs.length;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <main>
      <div className="section-wrap" style={{ paddingTop: '50px', paddingBottom: '90px' }}>
        {/* Breadcrumbs */}
        <div className="profile-breadcrumb" style={{ marginBottom: '20px' }}>
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to="/schemes">Explore Benefits</Link>
          <span>›</span>
          <strong>Document Checklist</strong>
        </div>

        {/* Section Heading */}
        <div className="section-kicker">PRE-APPLICATION PREPARATION</div>
        <div className="section-heading-row" style={{ marginTop: '12px', marginBottom: '28px' }}>
          <div>
            <h2>
              Check your application<br />
              <em>documents in advance.</em>
            </h2>
          </div>
          <p>
            Verify and assemble required identity, income, and category certificates before approaching public facilitation centers.
          </p>
        </div>

        {/* Scheme Selector Card */}
        <div
          style={{
            background: 'var(--white, #fffefa)',
            border: '1px solid var(--line, #e8e4dc)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '28px',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <label className="field" style={{ flex: 1, minWidth: '280px', margin: 0 }}>
              <span>Select Scheme to View Required Documents</span>
              <select
                value={selectedSchemeId}
                onChange={(e) => setSelectedSchemeId(e.target.value)}
              >
                {schemes.map((s) => (
                  <option key={s.scheme_id} value={s.scheme_id}>
                    {s.scheme_name} ({s.category || 'General'})
                  </option>
                ))}
              </select>
            </label>

            {schemeData && (
              <Link
                to={`/schemes/${selectedSchemeId}`}
                className="button button-dark"
                style={{ padding: '10px 18px', fontSize: '13px' }}
              >
                View Scheme Details <span>→</span>
              </Link>
            )}
          </div>

          {/* Readiness Progress Bar */}
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--line, #e8e4dc)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="tiny-label">DOCUMENT READINESS PROGRESS</span>
              <strong style={{ fontSize: '13px', color: '#254c3c' }}>
                {checkedCount} of {totalCount} ready ({progressPercent}%)
              </strong>
            </div>

            <div className="progress-track" style={{ background: '#e8e4dc' }}>
              <span style={{ width: `${progressPercent}%`, background: '#254c3c' }}></span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#77786f' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>⏳</div>
            <p>Loading document requirements checklist from database...</p>
          </div>
        )}

        {/* Document Checklist Items */}
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {docs.map((doc, idx) => {
              const docName = typeof doc === 'string' ? doc : doc.document_name || doc.name;
              const isMandatory = typeof doc === 'object' ? doc.is_mandatory !== false : true;
              const docDesc = typeof doc === 'object' ? doc.description || doc.notes : '';
              const isChecked = Boolean(checkedItems[idx]);

              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  style={{
                    background: isChecked ? '#f1f5e8' : '#fffefa',
                    border: `1px solid ${isChecked ? '#c8e5cc' : '#e8e4dc'}`,
                    borderRadius: '16px',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    cursor: 'pointer',
                    transition: 'all .2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    style={{ width: '20px', height: '20px', marginTop: '3px', accentColor: '#254c3c', cursor: 'pointer' }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '16px', fontFamily: 'Manrope, sans-serif', color: '#20211f', textDecoration: isChecked ? 'line-through' : 'none' }}>
                        {docName}
                      </strong>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: isMandatory ? '#eeebff' : '#faf8f3',
                          border: `1px solid ${isMandatory ? '#ded3fa' : '#e8e4dc'}`,
                          color: isMandatory ? '#44317a' : '#77786f'
                        }}
                      >
                        {isMandatory ? 'Mandatory' : 'Conditional / If Applicable'}
                      </span>
                    </div>

                    {docDesc && (
                      <p style={{ margin: '4px 0 0', color: '#77786f', fontSize: '13px' }}>
                        {docDesc}
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/document-doctor?scheme=${selectedSchemeId}&docName=${encodeURIComponent(docName)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="arrow-link"
                    style={{ fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}
                  >
                    Pre-verify <span>→</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && docs.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '50px 20px',
              borderRadius: '20px',
              background: '#fffefa',
              border: '1px solid var(--line, #e8e4dc)'
            }}
          >
            <p style={{ color: '#77786f', margin: 0 }}>
              No document records found for this scheme. Check official guidelines on the portal.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default DocumentChecklistPage;
