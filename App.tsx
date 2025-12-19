import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import MyTeams from './pages/MyTeams';
import TeamDetail from './pages/TeamDetail';
import Hackathons from './pages/Hackathons';
import HackathonDetail from './pages/HackathonDetail';
import Submissions from './pages/Submissions';
import SubmissionDetail from './pages/SubmissionDetail';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import OrganizerProfile from './pages/OrganizerProfile';
import CreateTeam from './pages/CreateTeam';
import JoinTeam from './pages/JoinTeam';
import JudgeDashboard from './pages/judge/JudgeDashboard';
import JudgeAssignments from './pages/judge/JudgeAssignments';
import JudgeEvaluation from './pages/judge/JudgeEvaluation';
import JudgeHackathons from './pages/judge/JudgeHackathons';
import JudgeProfile from './pages/judge/JudgeProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHackathons from './pages/admin/AdminHackathons';
import AdminCreateHackathon from './pages/admin/AdminCreateHackathon';
import AdminParticipants from './pages/admin/AdminParticipants';
import AdminJudges from './pages/admin/AdminJudges';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Participant Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/teams" element={<MyTeams />} />
        <Route path="/dashboard/teams/create" element={<CreateTeam />} />
        <Route path="/dashboard/teams/join" element={<JoinTeam />} />
        <Route path="/dashboard/teams/:id" element={<TeamDetail />} />
        <Route path="/dashboard/hackathons" element={<Hackathons />} />
        <Route path="/dashboard/hackathons/:id" element={<HackathonDetail />} />
        <Route path="/dashboard/organizer/:id" element={<OrganizerProfile />} />
        <Route path="/dashboard/submissions" element={<Submissions />} />
        <Route path="/dashboard/submissions/:id" element={<SubmissionDetail />} />
        <Route path="/dashboard/profile" element={<Profile />} />
        <Route path="/dashboard/profile/edit" element={<EditProfile />} />
        <Route path="/dashboard/user/:id" element={<UserProfile />} />
        <Route path="/dashboard/settings" element={<Settings />} />

        {/* Judge Routes */}
        <Route path="/judge/dashboard" element={<JudgeDashboard />} />
        <Route path="/judge/hackathons" element={<JudgeHackathons />} />
        <Route path="/judge/assignments" element={<JudgeAssignments />} />
        <Route path="/judge/evaluate/:submissionId" element={<JudgeEvaluation />} />
        <Route path="/judge/profile" element={<JudgeProfile />} />
        {/* Fallbacks for judge routes not yet fully implemented can redirect to dashboard */}
        <Route path="/judge/*" element={<Navigate to="/judge/dashboard" replace />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/hackathons" element={<AdminHackathons />} />
        <Route path="/admin/hackathons/create" element={<AdminCreateHackathon />} />
        <Route path="/admin/participants" element={<AdminParticipants />} />
        <Route path="/admin/judges" element={<AdminJudges />} />
        {/* Fallback for admin routes */}
        <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Redirect unknown routes to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;