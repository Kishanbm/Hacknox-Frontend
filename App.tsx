import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/ToastProvider';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import MyTeams from './pages/MyTeams';
import TeamDetail from './pages/TeamDetail';
import Hackathons from './pages/Hackathons';
import HackathonDetail from './pages/HackathonDetail';
import Submissions from './pages/Submissions';
import SubmissionDetail from './pages/SubmissionDetail';
import NotificationsPage from './pages/Notifications';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import OrganizerProfile from './pages/OrganizerProfile';
import CreateTeam from './pages/CreateTeam';
import JoinTeam from './pages/JoinTeam';
import Leaderboard from './pages/Leaderboard';
import JudgeDashboard from './pages/judge/JudgeDashboard';
import JudgeAssignments from './pages/judge/JudgeAssignments';
import JudgeEvaluation from './pages/judge/JudgeEvaluation';
import JudgeHackathons from './pages/judge/JudgeHackathons';
import JudgeProfile from './pages/judge/JudgeProfile';
import JudgeSettings from './pages/judge/JudgeSettings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHackathons from './pages/admin/AdminHackathons';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';
import AdminCreateHackathon from './pages/admin/AdminCreateHackathon';
import AdminHackathonDetail from './pages/admin/AdminHackathonDetail';
import AdminParticipants from './pages/admin/AdminParticipants';
import AdminTeamDetail from './pages/admin/AdminTeamDetail';
import AdminJudges from './pages/admin/AdminJudges';
import AdminAssignments from './pages/admin/AdminAssignments';
import AdminSubmissions from './pages/admin/AdminSubmissions';
import AdminSubmissionDetail from './pages/admin/AdminSubmissionDetail';
import AdminAudit from './pages/admin/AdminAudit';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminReports from './pages/admin/AdminReports';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />
          {/* Auth pages */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          
          {/* Participant Routes - Protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/teams" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <MyTeams />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/teams/create" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <CreateTeam />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/teams/join" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <JoinTeam />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/teams/:id" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <TeamDetail />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/hackathons" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <Hackathons />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/hackathons/:id" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <HackathonDetail />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/organizer/:id" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <OrganizerProfile />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/submissions" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <Submissions />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/submissions/:id" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <SubmissionDetail />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/notifications" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/profile" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/profile/edit" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/user/:id" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/settings" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/leaderboard" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <Leaderboard />
            </ProtectedRoute>
          } />

          {/* Judge Routes - Protected */}
          <Route path="/judge/dashboard" element={
            <ProtectedRoute allowedRoles={['judge']}>
              <JudgeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/judge/notifications" element={
            <ProtectedRoute allowedRoles={['judge']}>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          <Route path="/judge/hackathons" element={
            <ProtectedRoute allowedRoles={['judge']}>
              <JudgeHackathons />
            </ProtectedRoute>
          } />
          <Route path="/judge/assignments" element={
            <ProtectedRoute allowedRoles={['judge']}>
              <JudgeAssignments />
            </ProtectedRoute>
          } />
          <Route path="/judge/evaluate/:submissionId" element={
            <ProtectedRoute allowedRoles={['judge']}>
              <JudgeEvaluation />
            </ProtectedRoute>
          } />
          <Route path="/judge/profile" element={
            <ProtectedRoute allowedRoles={['judge']}>
              <JudgeProfile />
            </ProtectedRoute>
          } />
          <Route path="/judge/settings" element={
            <ProtectedRoute allowedRoles={['judge']}>
              <JudgeSettings />
            </ProtectedRoute>
          } />
          <Route path="/judge/*" element={<Navigate to="/judge/dashboard" replace />} />
          
          {/* Admin Routes - Protected */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/hackathons" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminHackathons />
            </ProtectedRoute>
          } />
          <Route path="/admin/hackathons/create" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCreateHackathon />
            </ProtectedRoute>
          } />
          <Route path="/admin/hackathons/:id/edit" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCreateHackathon />
            </ProtectedRoute>
          } />
          <Route path="/admin/hackathons/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminHackathonDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/leaderboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLeaderboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/participants" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminParticipants />
            </ProtectedRoute>
          } />
          <Route path="/admin/teams/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminTeamDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/judges" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminJudges />
            </ProtectedRoute>
          } />
          <Route path="/admin/assignments" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAssignments />
            </ProtectedRoute>
          } />
          <Route path="/admin/submissions" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSubmissions />
            </ProtectedRoute>
          } />
          <Route path="/admin/submissions/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSubmissionDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/audit" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAudit />
            </ProtectedRoute>
          } />
          <Route path="/admin/announcements" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnnouncements />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminReports />
            </ProtectedRoute>
          } />
          <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Redirect unknown routes to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;