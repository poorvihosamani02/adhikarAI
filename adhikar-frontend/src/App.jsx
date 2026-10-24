import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingChatbot from './components/layout/FloatingChatbot';
import SandDriftBackground from './components/ui/SandDriftBackground';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AllSchemesPage from './pages/AllSchemesPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import FindSchemesPage from './pages/FindSchemesPage';
import KnowYourRightsPage from './pages/KnowYourRightsPage';
import DocumentDoctorPage from './pages/DocumentDoctorPage';
import ScamShieldPage from './pages/ScamShieldPage';
import DocumentChecklistPage from './pages/DocumentChecklistPage';
import NotFoundPage from './pages/NotFoundPage';

// Layout wrapper with SandDriftBackground and persistent bottom-right FloatingChatbot
const Layout = () => {
  return (
    <SandDriftBackground>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
        <FloatingChatbot />
      </div>
    </SandDriftBackground>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Core Pages */}
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<LoginPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="schemes" element={<AllSchemesPage />} />
        <Route path="schemes/:id" element={<SchemeDetailPage />} />
        <Route path="schemes/:id/documents" element={<DocumentChecklistPage />} />
        <Route path="documents" element={<DocumentChecklistPage />} />
        <Route path="my-schemes" element={<FindSchemesPage />} />
        <Route path="find-schemes" element={<FindSchemesPage />} />
        <Route path="know-your-rights" element={<KnowYourRightsPage />} />
        <Route path="document-doctor" element={<DocumentDoctorPage />} />
        <Route path="scam-shield" element={<ScamShieldPage />} />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
