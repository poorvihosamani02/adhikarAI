import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '../api/aiApi';
import HealthBadge from '../components/common/HealthBadge';

const RIGHTS_TOPICS = [
  {
    category: 'rti',
    label: 'TRANSPARENCY',
    icon: '📄',
    iconClass: 'icon-lilac',
    title: 'Right to Information (RTI)',
    desc: 'How citizens can request records and information from public authorities under RTI Act, 2005.',
    suggestedQ: 'How do I file an RTI application online?'
  },
  {
    category: 'legal',
    label: 'LEGAL SUPPORT',
    icon: '⚖️',
    iconClass: 'icon-blue',
    title: 'Free Legal Aid (NALSA)',
    desc: 'Statutory provisions for free legal representation under the Legal Services Authorities Act, 1987.',
    suggestedQ: 'Who qualifies for free legal aid under NALSA?'
  },
  {
    category: 'consumer',
    label: 'CONSUMER SUPPORT',
    icon: '🛡️',
    iconClass: 'icon-mint',
    title: 'Consumer Rights & Complaints',
    desc: 'Protection against unfair trade practices and filing claims through National Consumer Helpline.',
    suggestedQ: 'How do I file a consumer complaint for defective goods?'
  },
  {
    category: 'cyber',
    label: 'CYBER FRAUD',
    icon: '🔒',
    iconClass: 'icon-peach',
    title: 'Cybercrime Reporting (1930)',
    desc: 'Filing complaints on cybercrime.gov.in and emergency freezing of defrauded funds under IT Act.',
    suggestedQ: 'How do I report online financial fraud to 1930?'
  }
];

const SUGGESTED_QUESTIONS = [
  'How do I file an RTI application online?',
  'Who qualifies for free legal aid under NALSA?',
  'How do I report online financial fraud to 1930?',
  'What is the time limit for an RTI reply?',
  'What are citizen rights when stopped by traffic police?'
];

const KnowYourRightsPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Namaste! I am Ask Genie, your statutory legal assistant. Ask any question regarding RTI Act 2005, NALSA Free Legal Aid, Consumer Protection, or Cyber Fraud defense to receive statutory citations.',
      sources: ['RTI Act 2005', 'Legal Services Authorities Act 1987', 'IT Act 2000'],
      suggestedQuestions: []
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState('English');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (questionText) => {
    const q = (questionText || inputText).trim();
    if (!q) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: q
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await aiApi.askQuestion(q, language);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.answer || 'Response generated from verified statutory sources.',
        sources: response.sources || [],
        suggestedQuestions: response.suggested_questions || []
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: `⚠️ Connectivity Notice: ${err.message || 'Unable to connect to legal RAG microservice. Using fallback statutory database.'}`,
          sources: []
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTopicClick = (suggestedQ) => {
    setInputText(suggestedQ);
    handleSend(suggestedQ);
  };

  const filteredTopics = RIGHTS_TOPICS.filter(
    item => activeFilter === 'all' || item.category === activeFilter
  );

  return (
    <main>
      {/* =====================================================
           1. RIGHTS HEADER SECTION (Deep Violet Friend Aesthetic)
      ====================================================== */}
      <section className="rights-section" id="rights" style={{ paddingTop: '50px', paddingBottom: '70px' }}>
        <div className="section-wrap rights-layout">
          {/* Left Column: Copy, Filters, Topics */}
          <div className="rights-copy">
            <div className="section-kicker light-kicker" style={{ color: '#b8d88f' }}>
              INFORMATION IS CITIZEN POWER
            </div>

            <h2>
              Know your rights.<br />
              <em>Know your next step.</em>
            </h2>

            <p style={{ color: '#c4cec2', fontSize: '15px', lineHeight: 1.7, marginBottom: '24px' }}>
              Statutory guidance grounded in verified Acts and published gazettes — zero hallucinations. Ask Legal Genie any civic question.
            </p>

            {/* Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', color: '#c4cec2', fontWeight: 600 }}>RESPONSE LANGUAGE:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontSize: '13px'
                }}
              >
                <option value="English" style={{ color: '#20211f' }}>English</option>
                <option value="Hindi" style={{ color: '#20211f' }}>हिन्दी (Hindi)</option>
                <option value="Kannada" style={{ color: '#20211f' }}>ಕನ್ನಡ (Kannada)</option>
              </select>

              <HealthBadge
                probeFn={() => aiApi.getChatHealth()}
                label="Legal RAG Service"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="rights-categories">
              <button
                type="button"
                className={`rights-filter ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All Topics
              </button>
              <button
                type="button"
                className={`rights-filter ${activeFilter === 'rti' ? 'active' : ''}`}
                onClick={() => setActiveFilter('rti')}
              >
                RTI Transparency
              </button>
              <button
                type="button"
                className={`rights-filter ${activeFilter === 'legal' ? 'active' : ''}`}
                onClick={() => setActiveFilter('legal')}
              >
                Free Legal Aid
              </button>
              <button
                type="button"
                className={`rights-filter ${activeFilter === 'consumer' ? 'active' : ''}`}
                onClick={() => setActiveFilter('consumer')}
              >
                Consumer Rights
              </button>
              <button
                type="button"
                className={`rights-filter ${activeFilter === 'cyber' ? 'active' : ''}`}
                onClick={() => setActiveFilter('cyber')}
              >
                Cybercrime 1930
              </button>
            </div>

            {/* Quick Topic Cards */}
            <div className="rights-cards" style={{ marginTop: '24px' }}>
              {filteredTopics.map((topic, idx) => (
                <article
                  key={idx}
                  className="rights-card"
                  onClick={() => handleTopicClick(topic.suggestedQ)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className={`rights-card-icon ${topic.iconClass}`}>
                    {topic.icon}
                  </span>
                  <div>
                    <span className="rights-card-label">{topic.label}</span>
                    <h3>{topic.title}</h3>
                    <p>{topic.desc}</p>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#c9f26c' }}>
                      Ask question →
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Chat Conversation Box */}
          <div
            style={{
              background: '#fffefa',
              border: '1px solid #e8e4dc',
              borderRadius: '24px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '560px',
              maxHeight: '720px',
              boxShadow: 'var(--shadow-soft)'
            }}
          >
            {/* Chat Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '16px',
                borderBottom: '1px solid #e8e4dc',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>✨</span>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: '17px', fontWeight: 800 }}>
                    Ask Genie (Legal Rights AI)
                  </h3>
                  <small style={{ color: '#77786f' }}>Verified citations grounded in law</small>
                </div>
              </div>

              <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', background: '#e1f1e3', color: '#254c3c' }}>
                ● Active
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                paddingRight: '6px',
                marginBottom: '16px'
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: msg.sender === 'user' ? '80%' : '90%',
                    background: msg.sender === 'user' ? '#20211f' : '#f7f5ed',
                    color: msg.sender === 'user' ? '#ffffff' : '#20211f',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: '14px 18px',
                    fontSize: '14px',
                    lineHeight: 1.6
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                  {/* Sources & Citations if provided */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.08)', fontSize: '11px', color: '#55564f' }}>
                      <strong style={{ display: 'block', color: '#254c3c' }}>Statutory Citations:</strong>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {msg.sources.map((src, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '2px 6px',
                              borderRadius: '6px',
                              background: '#e8e4dc',
                              color: '#20211f',
                              fontWeight: 600
                            }}
                          >
                            § {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested follow-up questions */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                      <small style={{ fontWeight: 700, color: '#77786f' }}>Suggested Follow-ups:</small>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                        {msg.suggestedQuestions.map((q, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleTopicClick(q)}
                            style={{
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              color: '#3b5c32',
                              fontSize: '12px',
                              cursor: 'pointer',
                              padding: 0,
                              textDecoration: 'underline'
                            }}
                          >
                            → {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div style={{ alignSelf: 'flex-start', background: '#f7f5ed', borderRadius: '18px', padding: '12px 18px', fontSize: '13px', color: '#77786f' }}>
                  Searching statutory gazettes &amp; drafting response...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Bar */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
              {SUGGESTED_QUESTIONS.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  className="sample-button"
                  style={{ whiteSpace: 'nowrap', fontSize: '11px', padding: '4px 8px' }}
                  onClick={() => handleTopicClick(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                type="text"
                placeholder="Ask about RTI, consumer rights, NALSA aid..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '14px',
                  border: '1px solid #e8e4dc',
                  background: '#faf8f3',
                  fontSize: '14px'
                }}
              />
              <button
                type="submit"
                className="button button-dark"
                disabled={isTyping || !inputText.trim()}
                style={{ padding: '12px 18px' }}
              >
                Ask <span>→</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default KnowYourRightsPage;
