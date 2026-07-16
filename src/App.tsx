import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { InterviewProvider } from './context/InterviewContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { WorkspaceLayout } from './layouts/WorkspaceLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardPage } from './pages/DashboardPage';
import { InterviewSetupPage } from './pages/InterviewSetupPage';
import { InterviewSessionPage } from './pages/InterviewSessionPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { ProfilePage } from './pages/ProfilePage';
import { ROUTES } from './constants/routes';

function App() {
  return (
    <AppProvider>
      <InterviewProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.LANDING} element={<LandingPage />} />

            {/* Guest Only Routes (Login/Signup guarded) */}
            <Route element={<AuthLayout />}>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
            </Route>

            {/* Guarded Workspace Routes */}
            <Route element={<WorkspaceLayout />}>
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route path={ROUTES.INTERVIEW_SETUP} element={<InterviewSetupPage />} />
              <Route path={ROUTES.INTERVIEW_SESSION} element={<InterviewSessionPage />} />
              <Route path={ROUTES.FEEDBACK} element={<FeedbackPage />} />
              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            </Route>

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
          </Routes>
        </BrowserRouter>
      </InterviewProvider>
    </AppProvider>
  );
}

export default App;
