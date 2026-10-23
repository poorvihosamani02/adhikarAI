import { apiClient } from './client';
import scamsData from '../data/scams.json';

export async function analyzeScamMessage(payload, isDemoMode = true) {
  return apiClient(
    '/api/scam/analyze',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    isDemoMode,
    () => {
      const text = (payload.message_text || '').toLowerCase();
      const url = (payload.url || '').toLowerCase();

      // Check similarity with dataset examples
      const words = new Set(text.match(/\w+/g) || []);
      let bestMatch = null;
      let highestOverlap = 0;

      scamsData.forEach((example) => {
        const exWords = new Set((example.message_text || '').toLowerCase().match(/\w+/g) || []);
        let overlap = 0;
        words.forEach((w) => {
          if (exWords.has(w)) overlap++;
        });
        if (overlap > highestOverlap) {
          highestOverlap = overlap;
          bestMatch = example;
        }
      });

      const urgencyTerms = ['disconnected', '2 hours', 'immediately', 'urgent', 'blocked', 'last date'];
      const hasUrgency = urgencyTerms.some((t) => text.includes(t));
      const hasSuspiciousUrl = url.includes('.xyz') || url.includes('.club') || url.includes('tinyurl') || url.includes('bit.ly');
      const isOfficialGov = url.includes('.gov.in') || url.includes('.nic.in');

      let riskLevel = 'low';
      let scamType = 'Unclassified Inquiry';
      const warningSigns = [];
      const matchedPatterns = [];

      if (bestMatch && highestOverlap >= 4) {
        scamType = bestMatch.scam_type;
        if (bestMatch.label === 'scam') {
          riskLevel = 'high';
          warningSigns.push(`Matches known pattern: ${bestMatch.warning_signs}`);
          matchedPatterns.push('Identified in PIB Fact Check / Cybercrime Repository');
        } else if (bestMatch.label === 'suspicious') {
          riskLevel = 'medium';
          warningSigns.push(bestMatch.warning_signs);
        } else if (bestMatch.label === 'genuine' && !hasUrgency) {
          riskLevel = 'safe';
          scamType = 'Standard Service Notification';
        }
      } else {
        if (hasUrgency) {
          riskLevel = 'high';
          scamType = 'Urgency-based Phishing';
          warningSigns.push('Severe urgency indicators or threat of disconnection/penalties');
          matchedPatterns.push('Coercive Urgency Pattern');
        }
        if (hasSuspiciousUrl) {
          riskLevel = 'high';
          warningSigns.push(`Suspicious unverified domain extension in link: ${url}`);
          matchedPatterns.push('Untrusted Domain Pattern');
        }
      }

      if (isOfficialGov) {
        riskLevel = 'safe';
        warningSigns.length = 0; // Clear false positives if verified official gov link
        matchedPatterns.push('Verified Government Domain (.gov.in / .nic.in)');
      }

      return {
        status: 'success',
        is_mock: true,
        is_demo: true,
        risk_level: riskLevel,
        scam_type: scamType,
        confidence_score: riskLevel === 'high' ? 0.91 : riskLevel === 'medium' ? 0.68 : 0.85,
        matched_patterns: matchedPatterns,
        warning_signs: warningSigns.length > 0 ? warningSigns : ['No overt scam flags detected'],
        recommended_actions:
          riskLevel === 'high' || riskLevel === 'medium'
            ? [
                'Do NOT click any unverified links or enter OTP/UPI credentials.',
                'Do NOT transfer advance fees or registration amounts via personal numbers.',
                'Report fraudulent transactions immediately on the National Cybercrime Helpline: 1930.',
                'Lodge an incident report on the official portal: https://cybercrime.gov.in/'
              ]
            : [
                'Always verify information directly on official ministry portals (.gov.in).',
                'Never disclose your NetBanking password, OTP, or UPI PIN.'
              ],
        advisory_sources: [
          'https://factcheck.pib.gov.in/',
          'https://cybercrime.gov.in/'
        ],
        disclaimer: 'This is an educational heuristic analysis based on 22 verified Indian advisory records. Always verify through official channels.'
      };
    }
  );
}

/**
 * Checks connectivity and health of the Scam Shield gateway and Python microservice.
 * 
 * @returns {Promise<Object>} Health status details
 */
export async function checkScamHealth() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const endpoint = `${API_BASE_URL}/api/scam/health`;
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
      return {
        isHealthy: false,
        message: `Scam Shield health check returned status ${response.status}`
      };
    }

    const data = await response.json();
    return {
      isHealthy: data.status === 'success' && data.scam_service?.status === 'healthy',
      data: data
    };
  } catch (err) {
    return {
      isHealthy: false,
      message: `Backend is unreachable at ${API_BASE_URL}: ${err.message}`
    };
  }
}

export function getSampleScamMessages() {
  return scamsData;
}
