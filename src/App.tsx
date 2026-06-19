import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { WorkspaceLayout } from './components/layout/WorkspaceLayout';
import { DashboardPage } from './pages/DashboardPage';
import { InterviewSetupPage } from './pages/InterviewSetupPage';
import { InterviewSessionPage } from './pages/InterviewSessionPage';
import { FeedbackReportPage } from './pages/FeedbackReportPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Guarded Workspace Routes */}
          <Route element={<WorkspaceLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/interview/setup" element={<InterviewSetupPage />} />
            <Route path="/interview/session" element={<InterviewSessionPage />} />
            <Route path="/feedback/:reportId" element={<FeedbackReportPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
