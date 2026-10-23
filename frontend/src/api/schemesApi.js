import { apiClient } from './client';
import schemesData from '../data/schemes.json';

export async function getAllSchemes(filters = {}, isDemoMode = true) {
  return apiClient(
    '/api/schemes',
    { method: 'GET' },
    isDemoMode,
    () => {
      let filtered = [...schemesData];

      if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(
          (sc) =>
            sc.scheme_name.toLowerCase().includes(s) ||
            sc.provider_name.toLowerCase().includes(s) ||
            sc.benefit_description.toLowerCase().includes(s)
        );
      }

      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter((sc) => sc.category === filters.category);
      }

      if (filters.jurisdiction && filters.jurisdiction !== 'all') {
        filtered = filtered.filter((sc) => sc.jurisdiction === filters.jurisdiction);
      }

      return {
        status: 'success',
        is_mock: true,
        count: filtered.length,
        schemes: filtered
      };
    }
  );
}

export async function getSchemeById(id, isDemoMode = true) {
  return apiClient(
    `/api/schemes/${id}`,
    { method: 'GET' },
    isDemoMode,
    () => {
      const found = schemesData.find((s) => s.scheme_id === id);
      if (!found) {
        throw new Error(`Scheme with ID ${id} not found in dataset.`);
      }
      return {
        status: 'success',
        is_mock: true,
        scheme: found
      };
    }
  );
}

export async function getSchemeDocuments(id, isDemoMode = true) {
  return apiClient(
    `/api/schemes/${id}/documents`,
    { method: 'GET' },
    isDemoMode,
    () => {
      const found = schemesData.find((s) => s.scheme_id === id);
      if (!found) {
        throw new Error(`Scheme with ID ${id} not found.`);
      }

      // Check if dataset actually provides required documents
      const docs = found.required_documents || [];
      return {
        status: 'success',
        is_mock: true,
        scheme_id: id,
        scheme_name: found.scheme_name,
        has_verified_docs: docs.length > 0,
        documents: docs.map((d, index) => ({
          id: `DOC_${id}_${index + 1}`,
          name: d,
          status: 'verified_in_dataset',
          notes: 'Derived from official scheme research dataset.'
        })),
        unavailable_message:
          docs.length === 0
            ? 'Official required documents are not explicitly cataloged in this dataset record. Please consult the official guideline URL.'
            : null
      };
    }
  );
}

export async function getMyEligibleSchemes(profile, isDemoMode = true) {
  return apiClient(
    '/api/eligibility/my-schemes',
    {
      method: 'POST',
      body: JSON.stringify(profile || {})
    },
    isDemoMode,
    () => {
      if (!profile) {
        return {
          status: 'success',
          is_mock: true,
          matched_count: 0,
          schemes: [],
          notice: 'No profile provided. Complete profile to view indicative matches.'
        };
      }

      // Heuristic demo eligibility based on actual dataset fields
      const results = schemesData.map((scheme) => {
        let matchScore = 0;
        const reasons = [];
        const warnings = [];

        // Income criteria check
        const userIncome = Number(profile.annualIncome) || 0;
        if (scheme.max_family_income) {
          if (userIncome <= scheme.max_family_income) {
            matchScore += 30;
            reasons.push(`Income ₹${userIncome.toLocaleString('en-IN')} within ceiling of ₹${scheme.max_family_income.toLocaleString('en-IN')}`);
          } else {
            warnings.push(`Annual income exceeds ceiling of ₹${scheme.max_family_income.toLocaleString('en-IN')}`);
          }
        }

        // State / Jurisdiction check
        if (scheme.jurisdiction === 'Karnataka') {
          if (profile.state?.toLowerCase() === 'karnataka') {
            matchScore += 30;
            reasons.push('Resident of Karnataka (State Scheme)');
          } else {
            warnings.push('Restricted to Karnataka state residents');
          }
        } else {
          matchScore += 20;
          reasons.push('Central Jurisdiction (Pan-India Scheme)');
        }

        // Category match
        if (profile.category && profile.category !== 'General') {
          if (scheme.scheme_name.toLowerCase().includes(profile.category.toLowerCase()) ||
              scheme.eligibility_text.toLowerCase().includes(profile.category.toLowerCase())) {
            matchScore += 25;
            reasons.push(`Targeted category (${profile.category}) matched in eligibility`);
          }
        }

        // Course / Education match
        if (profile.educationLevel && scheme.eligible_course) {
          if (scheme.eligible_course.toLowerCase().includes('graduation') &&
              ['undergraduate', 'postgraduate'].includes(profile.educationLevel.toLowerCase())) {
            matchScore += 20;
            reasons.push('Educational stage meets regular degree requirement');
          }
        }

        const isLikelyEligible = matchScore >= 40 && warnings.length === 0;

        return {
          ...scheme,
          demo_match: {
            is_likely_eligible: isLikelyEligible,
            match_score: matchScore,
            reasons: reasons.length > 0 ? reasons : ['General public benefit'],
            warnings: warnings,
            disclaimer: 'Indicative demo evaluation. The authoritative eligibility engine will run in the Node.js backend.'
          }
        };
      });

      // Sort by match score descending
      results.sort((a, b) => b.demo_match.match_score - a.demo_match.match_score);

      return {
        status: 'success',
        is_mock: true,
        matched_count: results.filter((r) => r.demo_match.is_likely_eligible).length,
        total_evaluated: results.length,
        schemes: results
      };
    }
  );
}
