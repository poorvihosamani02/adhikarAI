import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Send,
  Mic,
  MicOff,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
  RefreshCw,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { mockChatService } from '../data/mockService';
import Badge from '../components/ui/Badge';
import HealthBadge from '../components/common/HealthBadge';

const SUGGESTED_PROMPTS = [
  'How do I file an RTI application online?',
  'Who qualifies for free legal aid under NALSA?',
  'How do I report online financial fraud to 1930?',
  'What is the time limit for an RTI reply?'
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'bot',
    text: `Namaste! I am the **AdhikarAI Legal Rights Assistant**.\n\nI provide statutory answers grounded in verified legislation and official procedures covering:\n- **Right to Information Act, 2005** (Online filing & appeals)\n- **Legal Services Authorities Act, 1987** (Free legal aid under NALSA)\n- **Information Technology Act, 2000** (Cybercrime reporting via 1930)\n\nHow can I assist your civic rights inquiry today?`,
    sources: [],
    timestamp: 'Just now'
  }
];

const KnowYourRightsPage = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState('English');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [coverageOpen, setCoverageOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'Hindi' ? 'hi-IN' : language === 'Kannada' ? 'kn-IN' : 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
        setIsRecording(false);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const question = (textToSend || inputText).trim();
    if (!question || question.length < 2 || question.length > 1000) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await mockChatService.askQuestion(question, language);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.answer,
        sources: response.sources || [],
        suggested_questions: response.suggested_questions || [],
        is_mock: response.is_mock,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Sorry, I encountered an issue retrieving statutory datasets. Please try asking again.',
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleToggleVoice = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please type your query in the input box.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        setIsRecording(false);
      }
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  const charCount = inputText.length;
  const isCharWarning = charCount > 900;
  const isCharError = charCount > 1000;

  return (
    <div className="container" style={{ maxWidth: '980px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Header with Status & Language */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="eyebrow-text">STATUTORY ASSISTANT</span>
          <h1 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.75rem)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.035em' }}>
            Know Your Rights.
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Statutory legal guidance for Indian citizens, cited directly from published legislation.
          </p>
        </div>

        {/* Controls: Language and Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '150px', background: '#ffffff', borderRadius: 'var(--radius-full)', padding: '0.45rem 1rem' }}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi (हिन्दी)</option>
            <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
          </select>

          <button
            type="button"
            onClick={handleResetChat}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <RefreshCw size={13} />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Chat Window (Otto Aesthetic) */}
      <div className="chat-window" style={{ borderRadius: 'var(--radius-xl)' }}>
        {/* Messages Stream */}
        <div className="chat-messages">
          {messages.map((m) => (
            <div
              key={m.id}
              className={m.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}
            >
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{m.text}</div>

              {/* Verified Sources Box */}
              {m.sources && m.sources.length > 0 && (
                <div
                  style={{
                    marginTop: '0.85rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--charcoal-200)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.8125rem'
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--charcoal-800)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldCheck size={14} style={{ color: 'var(--emerald-600)' }} /> Verified Statutory Sources:
                  </div>
                  {m.sources.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--charcoal-200)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.5rem 0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--charcoal-900)' }}>{s.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--charcoal-500)' }}>
                          {s.authority} &bull; <em>{s.legal_basis}</em>
                        </div>
                      </div>
                      {s.source_url && (
                        <a
                          href={s.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: 'var(--charcoal-100)',
                            color: 'var(--charcoal-800)',
                            padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <span>Portal</span>
                          <ArrowUpRight size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{
                  textAlign: 'right',
                  fontSize: '0.7rem',
                  opacity: 0.7,
                  marginTop: '0.35rem'
                }}
              >
                {m.timestamp}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-bubble-bot" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} style={{ color: 'var(--coral-600)', animation: 'spin 2s linear infinite' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--charcoal-600)' }}>
                Consulting statutory datasets...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Pills */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            background: 'var(--charcoal-50)',
            borderTop: '1px solid var(--charcoal-100)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--charcoal-500)', flexShrink: 0 }}>
            Quick Prompts:
          </span>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              disabled={isTyping}
              style={{
                background: '#ffffff',
                border: '1px solid var(--charcoal-200)',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                color: 'var(--charcoal-800)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--coral-600)';
                e.currentTarget.style.color = 'var(--coral-600)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--charcoal-200)';
                e.currentTarget.style.color = 'var(--charcoal-800)';
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '1rem 1.25rem',
            background: '#ffffff',
            borderTop: '1px solid var(--charcoal-100)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            style={{
              padding: '0.7rem',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              flexShrink: 0,
              background: isRecording ? 'var(--danger-500)' : 'var(--charcoal-100)',
              color: isRecording ? '#ffffff' : 'var(--charcoal-700)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isRecording ? 'Listening... Click to stop' : 'Click to speak via Web Speech API'}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Text Input */}
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className={`form-input ${isCharError ? 'has-error' : ''}`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about RTI procedures, NALSA legal aid, or cyber fraud reporting..."
              disabled={isTyping}
              style={{ paddingRight: '4.5rem', borderRadius: 'var(--radius-full)' }}
            />
            <span
              style={{
                position: 'absolute',
                right: '0.95rem',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.72rem',
                color: isCharError ? 'var(--danger-600)' : isCharWarning ? 'var(--coral-600)' : 'var(--charcoal-400)',
                fontWeight: 700
              }}
            >
              {charCount}/1000
            </span>
          </div>

          {/* Send Button (Terracotta Pill) */}
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping || isCharError}
            className="btn"
            style={{
              background: 'var(--coral-600)',
              color: '#ffffff',
              height: '42px',
              padding: '0 1.35rem',
              borderRadius: 'var(--radius-full)'
            }}
          >
            <span>Send</span>
            <Send size={15} />
          </button>
        </form>
      </div>

      {/* 3. Knowledge Base Coverage Disclosure Accordion */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <button
          type="button"
          onClick={() => setCoverageOpen(!coverageOpen)}
          style={{
            background: 'none',
            border: 'none',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--charcoal-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={18} style={{ color: 'var(--coral-600)' }} />
            Statutory Knowledge Base Coverage &amp; Grounded Legislation
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--coral-600)', fontWeight: 700 }}>
            {coverageOpen ? 'Hide Scope' : 'View Scope'}
          </span>
        </button>

        {coverageOpen && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--charcoal-100)', fontSize: '0.85rem', color: 'var(--charcoal-600)', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '0.5rem' }}>
              AdhikarAI's RAG system answers queries strictly derived from verified statutory legislation:
            </p>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>
                <strong>Right to Information Act, 2005 (Act 22 of 2005):</strong> Central online submission, fee exemptions for BPL citizens, timelines (30 days), and First Appeal guidelines under Section 19(1).
              </li>
              <li>
                <strong>Legal Services Authorities Act, 1987:</strong> Free legal services via NALSA / DSLSA under Section 12 for women, children, SC/ST, and low-income individuals.
              </li>
              <li>
                <strong>Information Technology Act, 2000 &amp; MHA Cyber Crime Guidelines:</strong> Financial fraud reporting to the National Helpline 1930 and cybercrime.gov.in incident filing.
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowYourRightsPage;
