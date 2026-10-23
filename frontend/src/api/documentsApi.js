/**
 * AdhikarAI - Documents API Bridge
 * 
 * Re-exports documentDoctorService methods to ensure full compatibility
 * with existing modules while communicating directly with the backend.
 */

import { checkDocument, checkDocumentHealth, getDocumentRules } from '../services/documentDoctorService';

export { checkDocument, checkDocumentHealth, getDocumentRules };

export default {
  checkDocument,
  checkDocumentHealth,
  getDocumentRules
};

