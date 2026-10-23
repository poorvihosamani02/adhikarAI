import React, { useState, useEffect } from 'react';
import { sendQuestion, checkChatHealth } from '../services/chatService';
import {
  MessageSquare,
  Send,
  Sparkles,
  ExternalLink,
  BookOpen,
  HelpCircle,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Scale,
  CheckCircle2,
  XCircle
} from 'lucide-react';

/**
 * Safely parses bold markdown formatting (**bold**) into React <strong> nodes
 * without injecting untrusted raw HTML or risking XSS.
 */
function renderSafeContent(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} style={{ fontWeight: 700, color: 'inherit' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function KnowYourRightsPage() {
  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'bot',
      text: "Namaste! I am your **AdhikarAI Legal Rights Assistant**. I provide citizen guidance grounded in verified legal datasets. You can ask me about **filing central RTIs online**, **free legal aid eligibility under NALSA**, or **reporting online financial fraud via 1930**.",
      sources: [],
      timestamp: 'Just now'
    }
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState('checking'); // 'checking' | 'healthy' | 'unhealthy'
  const [healthDetail, setHealthDetail] = useState('');

  const [suggestedQuestions, setSuggestedQuestions] = useState([
    'How do I file an RTI application online?',
    'Who is eligible for free legal aid under NALSA?',
    'How do I report online financial fraud via helpline 1930?',
    'What is the procedure for an RTI first appeal?'
  ]);

  // Check backend and Python RAG health on mount
  useEffect(() => {
    let isMounted = true;

    async function verifyHealth() {
      try {
        const res = await checkChatHealth();
        if (isMounted) {
          if (res.isHealthy) {
            setHealthStatus('healthy');
            setHealthDetail('Connected to live RAG microservice (Port 3000 → Port 8001)');
          } else {
            setHealthStatus('unhealthy');
            setHealthDetail(res.message || 'AI service is currently unreachable.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setHealthStatus('unhealthy');
          setHealthDetail(err.message || 'Cannot contact backend.');
        }
      }
    }

    verifyHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSend = async (qToSend) => {
    const rawQuery = qToSend !== undefined ? qToSend : inputQuestion;
    const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';

    if (!query) {
      setError('Please type a question before sending.');
      return;
    }

    if (query.length < 2) {
      setError('Your question must be at least 2 characters long.');
      return;
    }

    if (loading) return; // Prevent duplicate submissions

    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);
    setError(null);

    try {
      // Send question to Node.js backend POST /api/chat
      const res = await sendQuestion(query, 'English');

      const botMsg = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: res.answer || 'No answer was returned by the service.',
        sources: Array.isArray(res.sources) ? res.sources : [],
        isMock: Boolean(res.is_mock),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);

      // If the backend returns contextually relevant follow-up questions, update suggestions
      if (Array.isArray(res.suggested_questions) && res.suggested_questions.length > 0) {
        setSuggestedQuestions(res.suggested_questions);
      }
    } catch (err) {
      console.error('[KnowYourRightsPage] Chat submission error:', err);
      setError(err.message || 'An unexpected error occurred while communicating with the chat service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: '900px' }}>
      {/* Title & Connection Status */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Scale size={28} color="#2563eb" />
            <h1 style={{ fontSize: '1.8rem', color: 'var(--slate-900)' }}>
              Know Your Rights (RAG Assistant)
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)' }}>
            Grounded legal assistance for Indian citizens backed by verified statutory records.
          </p>
        </div>

        {/* Live Service Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderRadius: '999px', background: healthStatus === 'healthy' ? '#ecfdf5' : healthStatus === 'unhealthy' ? '#fef2f2' : '#f8fafc', border: `1px solid ${healthStatus === 'healthy' ? '#a7f3d0' : healthStatus === 'unhealthy' ? '#fecaca' : '#e2e8f0'}`, color: healthStatus === 'healthy' ? '#047857' : healthStatus === 'unhealthy' ? '#b91c1c' : '#64748b' }} title={healthDetail}>
          {healthStatus === 'healthy' ? (
            <>
              <CheckCircle2 size={13} color="#059669" />
              <span>RAG Service Connected</span>
            </>
          ) : healthStatus === 'unhealthy' ? (
            <>
              <XCircle size={13} color="#dc2626" />
              <span>Service Offline</span>
            </>
          ) : (
            <>
              <RefreshCw size={13} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
              <span>Checking AI service...</span>
            </>
          )}
        </div>
      </div>

      {/* Transparent Grounding Notice */}
      <div className="alert alert-info" style={{ fontSize: '0.82rem', marginBottom: '1.25rem' }}>
        <Sparkles size={18} color="#2563eb" style={{ flexShrink: 0 }} />
        <div>
          <strong>Verified Statutory Knowledge:</strong> Answers are retrieved from verified statutory records in <code>know_your_rights.csv</code> and official guides in <code>rag_documents.csv</code>. Every answer includes verifiable source citations.
        </div>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="alert alert-danger" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Service Error:</strong> {error}
            <div style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
              Verify that the Node.js backend (port 3000) and Python RAG microservice (port 8001) are running.
            </div>
          </div>
        </div>
      )}

      {/* Suggested Follow-up / Starter Questions */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, marginBottom: '0.4rem' }}>
          Suggested Citizen Questions:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {suggestedQuestions.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(sq)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', cursor: loading ? 'not-allowed' : 'pointer' }}
              disabled={loading}
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div
        className="card"
        style={{
          minHeight: '440px',
          maxHeight: '600px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          padding: '1.5rem',
          backgroundColor: '#ffffff',
          marginBottom: '1rem'
        }}
      >
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '100%'
              }}
            >
              <div
                style={{
                  maxWidth: '82%',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: isUser ? 'var(--primary-600)' : 'var(--slate-50)',
                  color: isUser ? 'white' : 'var(--slate-900)',
                  border: isUser ? 'none' : '1px solid var(--slate-200)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '0.92rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line'
                }}
              >
                <div>{renderSafeContent(m.text)}</div>

                {/* Verified Source Citations */}
                {m.sources && m.sources.length > 0 && (
                  <div
                    style={{
                      marginTop: '0.85rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--slate-200)',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <BookOpen size={14} color="#2563eb" /> Verified Official Citations:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {m.sources.map((src, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.35rem 0.55rem',
                            background: '#ffffff',
                            borderRadius: '6px',
                            border: '1px solid var(--slate-200)'
                          }}
                        >
                          <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                            &bull; {src.title || src.document_id}
                          </span>
                          {src.authority && (
                            <span style={{ color: 'var(--slate-500)' }}>({src.authority})</span>
                          )}
                          {src.legal_basis && (
                            <span style={{ color: 'var(--slate-600)', background: 'var(--slate-100)', padding: '1px 6px', borderRadius: '4px', fontSize: '0.74rem' }}>
                              {src.legal_basis}
                            </span>
                          )}
                          {src.verification_status && (
                            <span style={{ color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 600, fontSize: '0.72rem' }}>
                              <ShieldCheck size={12} /> {src.verification_status}
                            </span>
                          )}
                          {src.source_url && (
                            <a
                              href={src.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: 'var(--primary-600)',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                                fontWeight: 600,
                                marginLeft: 'auto'
                              }}
                            >
                              Official Portal <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: '0.25rem', padding: '0 0.5rem' }}>
                {isUser ? 'You' : 'AdhikarAI Grounded Assistant'} &bull; {m.timestamp}
              </span>
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-600)', fontSize: '0.85rem', padding: '0.5rem' }}>
            <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span>Consulting verified statutory database via RAG service...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: 'flex', gap: '0.75rem' }}
      >
        <input
          type="text"
          className="form-control"
          placeholder="Ask a question about RTI filing, legal aid, or cybercrime reporting..."
          value={inputQuestion}
          onChange={(e) => {
            setInputQuestion(e.target.value);
            if (error) setError(null);
          }}
          disabled={loading}
          style={{ padding: '0.85rem 1.1rem', fontSize: '0.95rem' }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !inputQuestion.trim()}
          style={{ padding: '0 1.5rem', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Send size={18} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}

