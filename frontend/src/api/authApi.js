import { apiClient } from './client';

export async function loginUser(credentials, isDemoMode = true) {
  return apiClient(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(credentials)
    },
    isDemoMode,
    () => {
      // Clearly labelled mock login response
      return {
        status: 'success',
        is_mock: true,
        token: 'demo-practice-token-12345',
        user: {
          id: 'USR_DEMO_001',
          email: credentials.email || 'citizen@adhikar.demo',
          name: 'Demo Citizen',
          role: 'citizen'
        },
        message: 'Mock login successful (Demo practice mode active)'
      };
    }
  );
}
