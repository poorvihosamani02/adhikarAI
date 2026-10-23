import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DemoModeProvider } from './context/DemoModeContext';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';

import DemoBanner from './components/DemoBanner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import FindSchemesPage from './pages/FindSchemesPage';
import AllSchemesPage from './pages/AllSchemesPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import DocumentDoctorPage from './pages/DocumentDoctorPage';
import ScamShieldPage from './pages/ScamShieldPage';
import KnowYourRightsPage from './pages/KnowYourRightsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <DemoModeProvider>
      <AuthProvider>
        <ProfileProvider>
          <BrowserRouter>
            <div className="app-container">
              <DemoBanner />
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/find-schemes" element={<FindSchemesPage />} />
                  <Route path="/schemes" element={<AllSchemesPage />} />
                  <Route path="/schemes/:id" element={<SchemeDetailPage />} />
                  <Route path="/document-doctor" element={<DocumentDoctorPage />} />
                  <Route path="/scam-shield" element={<ScamShieldPage />} />
                  <Route path="/know-your-rights" element={<KnowYourRightsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </ProfileProvider>
      </AuthProvider>
    </DemoModeProvider>
  );
}
