/**
 * AdhikarAI AI Microservices API Gateway Client
 * 
 * Secure frontend client interacting with the Node.js Express Gateway
 * for all three verified AI microservices:
 * 
 * 1. Ask Genie / Know Your Rights (RAG statutory legal Q&A, Port 8001 via /api/chat)
 * 2. Document Doctor (Pre-verification document rule engine, Port 8002 via /api/documents)
 * 3. Scam Shield (Heuristic cyber threat & scam analyzer, Port 8003 via /api/scam)
 * 
 * Cleanly handles timeouts, service-unreachable states, and transparent demo fallbacks.
 */

import { apiClient } from './client';
import {
  mockChatService,
  mockDocumentDoctorService,
  mockScamShieldService
} from '../data/mockService';

export const aiApi = {
  /* ==========================================================================
     1. Ask Genie / Know Your Rights Chatbot (Port 8001 Gateway)
     ========================================================================== */

  /**
   * Probes connectivity of the Legal Rights Python RAG service via the Node gateway.
   */
  async getChatHealth() {
    return await apiClient(
      '/api/chat/health',
      { method: 'GET' },
      {
        timeoutMs: 4000,
        demoFallbackFn: () => mockChatService.getHealth()
      }
    );
  },

  /**
   * Submit a citizen rights question to the verified statutory RAG microservice.
   * 
   * @param {string} question - Citizen query (e.g., "How to file RTI online?")
   * @param {string} [language='English'] - Optional language specification
   * @returns {Promise<Object>} { status, answer, sources, suggested_questions, is_mock }
   */
  async askQuestion(question, language = 'English') {
    return await apiClient(
      '/api/chat',
      {
        method: 'POST',
        body: JSON.stringify({
          question: question.trim(),
          language: (language || 'English').trim()
        })
      },
      {
        timeoutMs: 12000,
        demoFallbackFn: () => mockChatService.askQuestion(question, language)
      }
    );
  },

  /* ==========================================================================
     2. Document Doctor (Port 8002 Gateway)
     ========================================================================== */

  /**
   * Probes connectivity of Document Doctor Python service via the Node gateway.
   */
  async getDocumentHealth() {
    return await apiClient(
      '/api/documents/health',
      { method: 'GET' },
      {
        timeoutMs: 4000,
        demoFallbackFn: () => ({ status: 'success', is_demo: true, doc_service: { status: 'healthy', service: 'document-doctor' } })
      }
    );
  },

  /**
   * Fetches official document verification rules from the microservice catalog.
   * 
   * @returns {Promise<Object>} { status, count, rules: [...] }
   */
  async getDocumentRules() {
    return await apiClient(
      '/api/documents/rules',
      { method: 'GET' },
      {
        timeoutMs: 5000,
        demoFallbackFn: () => mockDocumentDoctorService.getRules()
      }
    );
  },

  /**
   * Run heuristic document pre-verification and requirement checks.
   * 
   * @param {Object} params
   * @param {string} [params.scheme_id] - Optional scheme identifier
   * @param {string} params.document_type - Category (e.g., 'Income Certificate')
   * @param {string} params.document_name - Display name of the certificate
   * @param {string} [params.file_name] - Name of uploaded file
   * @param {number} [params.file_size_kb] - File size in KB
   * @param {string} [params.user_notes] - User context or notes
   * @returns {Promise<Object>} Structured verification output
   */
  async checkDocument({
    scheme_id = null,
    document_type,
    document_name,
    file_name = 'sample_document.pdf',
    file_size_kb = 150,
    user_notes = ''
  }) {
    return await apiClient(
      '/api/documents/check',
      {
        method: 'POST',
        body: JSON.stringify({
          scheme_id: scheme_id ? String(scheme_id).trim() : null,
          document_type: (document_type || 'Income Certificate').trim(),
          document_name: (document_name || 'Income Certificate').trim(),
          file_name: (file_name || 'document.pdf').trim(),
          file_size_kb: Number(file_size_kb) || 150,
          user_notes: user_notes ? String(user_notes).trim() : ''
        })
      },
      {
        timeoutMs: 12000,
        demoFallbackFn: () => mockDocumentDoctorService.checkDocument({
          scheme_id,
          document_type,
          document_name,
          file_name,
          file_size_kb,
          user_notes
        })
      }
    );
  },

  /* ==========================================================================
     3. Scam Shield (Port 8003 Gateway)
     ========================================================================== */

  /**
   * Probes connectivity of Scam Shield Python service via the Node gateway.
   */
  async getScamHealth() {
    return await apiClient(
      '/api/scam/health',
      { method: 'GET' },
      {
        timeoutMs: 4000,
        demoFallbackFn: () => ({ status: 'success', is_demo: true, scam_service: { status: 'healthy', service: 'scam-shield' } })
      }
    );
  },

  /**
   * Analyze suspicious civic, utility, or scholarship communication.
   * 
   * @param {string} messageText - Content of suspicious message or SMS
   * @param {string} [url=''] - Optional URL contained in message
   * @returns {Promise<Object>} { status, risk_level, scam_type, confidence_score, matched_patterns, warning_signs, recommended_actions, advisory_sources }
   */
  async analyzeScam(messageText, url = '') {
    return await apiClient(
      '/api/scam/analyze',
      {
        method: 'POST',
        body: JSON.stringify({
          message_text: messageText.trim(),
          url: url && url.trim() ? url.trim() : null
        })
      },
      {
        timeoutMs: 12000,
        demoFallbackFn: () => mockScamShieldService.analyzeScam(messageText, url)
      }
    );
  },

  /**
   * Helper to retrieve sample scams for threat education.
   */
  getSampleScams() {
    return mockScamShieldService.getSampleScams();
  }
};
