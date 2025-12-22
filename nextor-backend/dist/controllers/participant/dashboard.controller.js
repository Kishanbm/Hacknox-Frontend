"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParticipantDashboardController = void 0;
const notification_service_1 = require("../../services/participant/notification.service");
const supabaseClient_1 = require("../../lib/supabaseClient");
// Helper function to fetch the user's team details and status efficiently
const getTeamDataForDashboard = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const { data: teamData, error } = yield supabaseClient_1.supabase
        .from("TeamMembers")
        .select(`
            team:Teams (
                id, name, leader_id, verification_status,
                members:TeamMembers (
                    user_id
                ),
                submission:Submissions (
                    id, status, submitted_at
                )
            )
        `)
        .eq("user_id", userId)
        .maybeSingle();
    if (error)
        throw error;
    if (!(teamData === null || teamData === void 0 ? void 0 : teamData.team))
        return null;
    // Supabase may return the related `team` as an array when using nested selects.
    // Normalize to a single object for easier usage below.
    const team = Array.isArray(teamData.team) ? teamData.team[0] : teamData.team;
    const teamId = team === null || team === void 0 ? void 0 : team.id;
    const submission = Array.isArray(team === null || team === void 0 ? void 0 : team.submission) ? team.submission[0] : team.submission; // Get the single submission record
    return {
        teamId: teamId,
        teamName: team === null || team === void 0 ? void 0 : team.name,
        leaderId: team === null || team === void 0 ? void 0 : team.leader_id,
        memberCount: Array.isArray(team === null || team === void 0 ? void 0 : team.members) ? team.members.length : 0,
        verificationStatus: (team === null || team === void 0 ? void 0 : team.verification_status) || 'pending',
        submissionStatus: (submission === null || submission === void 0 ? void 0 : submission.status) || 'no_submission',
        submissionId: (submission === null || submission === void 0 ? void 0 : submission.id) || null,
        isLeader: (team === null || team === void 0 ? void 0 : team.leader_id) === userId
    };
});
// ------------------------------------------------------------------
// GET /api/participant/dashboard
// ------------------------------------------------------------------
const getParticipantDashboardController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        // 1. Fetch Aggregated Team & Submission Status
        const teamData = yield getTeamDataForDashboard(userId);
        // 2. Fetch Aggregated Notification/Announcement Summary
        const hackathonId = req.hackathonId;
        const notifications = yield (0, notification_service_1.getRelevantNotifications)(userId, userRole, hackathonId);
        const unreadCount = notifications.filter((n) => !n.is_read).length;
        // 3. Define Deadlines (Placeholder for production config)
        const upcomingDeadlines = [
            { name: "Submission Lock", date: "2025-12-15T23:59:00Z" },
            { name: "Judging Starts", date: "2025-12-16T09:00:00Z" }
        ];
        return res.status(200).json({
            message: "Dashboard summary retrieved.",
            dashboard: {
                teamStatus: teamData ? {
                    id: teamData.teamId,
                    name: teamData.teamName,
                    status: teamData.verificationStatus,
                    memberCount: teamData.memberCount,
                    isLeader: teamData.isLeader
                } : null,
                submissionStatus: {
                    state: (teamData === null || teamData === void 0 ? void 0 : teamData.submissionStatus) || 'no_team',
                    submissionId: (teamData === null || teamData === void 0 ? void 0 : teamData.submissionId) || null
                },
                announcementsSummary: {
                    total: notifications.length,
                    unreadCount: unreadCount,
                    latestTitle: ((_a = notifications[0]) === null || _a === void 0 ? void 0 : _a.title) || null
                },
                upcomingDeadlines: upcomingDeadlines
            }
        });
    }
    catch (error) {
        console.error("Dashboard Error:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getParticipantDashboardController = getParticipantDashboardController;
