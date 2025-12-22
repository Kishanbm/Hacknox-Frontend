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
exports.exportTeamsCSVController = exports.getAuditLogsController = exports.updatePlatformSettingsController = exports.getPlatformSettingsController = exports.getStateCollegeBreakdownController = exports.getAnalyticsDetailController = exports.getAnalyticsOverviewController = exports.getAnnouncementsListController = exports.scheduleAnnouncementController = exports.sendAnnouncementNowController = exports.createAnnouncementController = exports.publishLeaderboardToggleController = exports.getInternalLeaderboardController = exports.computeLeaderboardController = exports.aggregateScoresController = exports.downloadSubmissionController = exports.changeSubmissionStatusController = exports.getSubmissionDetailAdminController = exports.getSubmissionsPanelController = exports.autoBalanceAssignmentsController = exports.reassignTeamController = exports.assignTeamsToJudgesController = exports.getJudgeAssignmentsController = exports.verifyTeamAdminController = exports.updateTeamAdminController = exports.getTeamProfileAdminController = exports.getTeamsListController = exports.deleteJudgeController = exports.updateJudgeController = exports.getJudgesListController = exports.createJudgeController = void 0;
const supabaseClient_1 = require("../../lib/supabaseClient");
const admin_service_1 = require("../../services/admin/admin.service");
// ------------------------------------------------------------------
// POST /api/admin/judge (Create Judge Account)
// ------------------------------------------------------------------
const createJudgeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, firstName, lastName } = req.body;
        if (!email || !firstName || !lastName) {
            return res.status(400).json({ message: "Email, first name, and last name are required." });
        }
        // Pass active hackathon (if any) so the created judge is auto-assigned
        const hackathonId = req.hackathonId || null;
        const newJudge = yield (0, admin_service_1.createJudgeAccount)(email, firstName, lastName, hackathonId); // [cite: 46]
        return res.status(201).json({
            message: "Judge account created successfully. Admin should follow up with a password reset link.",
            judge: newJudge
        });
    }
    catch (error) {
        console.error("Controller Error [createJudgeController]:", error.message);
        // Handle unique constraint error from service
        if (error.message.includes("already exists")) {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.createJudgeController = createJudgeController;
// ------------------------------------------------------------------
// GET /api/admin/judges (Get Judges List)
// ------------------------------------------------------------------
const getJudgesListController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // Use middleware-attached hackathonId if present. This allows the
        // admin judges listing to be scoped to the selected hackathon.
        const hackathonId = req.hackathonId;
        const { judges, totalCount } = yield (0, admin_service_1.getJudgesList)(page, limit, hackathonId); // [cite: 38]
        return res.status(200).json({
            message: "Judges list retrieved successfully.",
            judges: judges,
            page,
            limit,
            totalCount,
            returnedHackathonId: hackathonId || null
        });
    }
    catch (error) {
        console.error("Controller Error [getJudgesListController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getJudgesListController = getJudgesListController;
// ------------------------------------------------------------------
// PATCH /api/admin/judge/:judgeId (Update Judge Account)
// ------------------------------------------------------------------
const updateJudgeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const judgeId = req.params.judgeId;
        const payload = req.body;
        if (!judgeId) {
            return res.status(400).json({ message: "Judge ID is required for update." });
        }
        const updatedJudge = yield (0, admin_service_1.updateJudgeAccount)(judgeId, payload); // [cite: 49]
        return res.status(200).json({
            message: "Judge account updated successfully.",
            judge: updatedJudge
        });
    }
    catch (error) {
        console.error("Controller Error [updateJudgeController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.updateJudgeController = updateJudgeController;
// ------------------------------------------------------------------
// DELETE /api/admin/judge/:judgeId (Delete/Deactivate Judge Account)
// ------------------------------------------------------------------
const deleteJudgeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const judgeId = req.params.judgeId;
        // Determine delete type: soft delete is preferred. Default to soft.
        const type = ((_a = req.query.type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'hard' ? 'hard' : 'soft';
        if (!judgeId) {
            return res.status(400).json({ message: "Judge ID is required for deletion." });
        }
        const result = yield (0, admin_service_1.deleteJudgeAccount)(judgeId, type); // [cite: 54, 56]
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Controller Error [deleteJudgeController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.deleteJudgeController = deleteJudgeController;
// --- TEAM MANAGEMENT CONTROLLERS ---
// ------------------------------------------------------------------
// GET /api/admin/teams (Get Teams List)
// ------------------------------------------------------------------
const getTeamsListController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = { status: req.query.status };
        const search = req.query.search || '';
        // Use middleware-attached hackathonId only
        const hackathonId = req.hackathonId;
        const { teams, totalCount } = yield (0, admin_service_1.getTeamsListAdmin)(page, limit, filters, search, hackathonId);
        return res.status(200).json({
            message: "Teams list retrieved successfully.",
            teams: teams,
            page,
            limit,
            totalCount
        });
    }
    catch (error) {
        console.error("Controller Error [getTeamsListController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getTeamsListController = getTeamsListController;
// ------------------------------------------------------------------
// GET /api/admin/team/:teamId (Get Team Profile)
// ------------------------------------------------------------------
const getTeamProfileAdminController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teamId = req.params.teamId;
        if (!teamId) {
            return res.status(400).json({ message: "Team ID is required." });
        }
        const hackathonId = req.hackathonId;
        const teamProfile = yield (0, admin_service_1.getTeamProfileAdmin)(teamId, hackathonId); //
        // If scoped lookup failed (possibly because the selected hackathon id
        // doesn't match the team's hackathon), attempt a fallback lookup
        // without the hackathon filter so admins can still inspect the team.
        let finalTeam = teamProfile;
        if (!finalTeam && hackathonId) {
            try {
                const fallback = yield (0, admin_service_1.getTeamProfileAdmin)(teamId, undefined);
                if (fallback) {
                    console.warn(`Admin lookup: team ${teamId} not found for hackathon ${hackathonId}, returning unscoped team.`);
                    finalTeam = fallback;
                }
            }
            catch (err) {
                // ignore fallback errors; original behavior will return 404
            }
        }
        if (!finalTeam) {
            // Debug: check whether a Teams row exists for this id and which hackathon_id it belongs to.
            try {
                const { data: rows, error: lookupErr } = yield supabaseClient_1.supabase
                    .from('Teams')
                    .select('id, hackathon_id')
                    .eq('id', teamId);
                if (lookupErr) {
                    console.error('Debug Team Lookup Error:', lookupErr.message);
                }
                const exists = Array.isArray(rows) ? rows.length > 0 : !!rows;
                const teamRow = Array.isArray(rows) ? rows[0] : rows || null;
                return res.status(404).json({
                    message: "Team not found.",
                    debug: {
                        requestedTeamId: teamId,
                        scopedHackathonId: hackathonId || null,
                        exists: exists,
                        teamHackathonId: teamRow ? teamRow.hackathon_id : null,
                    }
                });
            }
            catch (lookupEx) {
                console.error('Debug Team Lookup Exception:', lookupEx.message || lookupEx);
                return res.status(404).json({ message: "Team not found." });
            }
        }
        return res.status(200).json({
            message: "Team profile retrieved successfully.",
            team: finalTeam
        });
    }
    catch (error) {
        console.error("Controller Error [getTeamProfileAdminController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.getTeamProfileAdminController = getTeamProfileAdminController;
// ------------------------------------------------------------------
// PATCH /api/admin/team/:teamId (Admin Update Team Details)
// ------------------------------------------------------------------
const updateTeamAdminController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teamId = req.params.teamId;
        const payload = req.body;
        if (!teamId) {
            return res.status(400).json({ message: "Team ID is required for update." });
        }
        const hackathonId = req.hackathonId;
        const updatedTeam = yield (0, admin_service_1.updateTeamAdmin)(teamId, payload, hackathonId);
        return res.status(200).json({
            message: "Team details updated successfully by Admin.",
            team: updatedTeam
        });
    }
    catch (error) {
        console.error("Controller Error [updateTeamAdminController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.updateTeamAdminController = updateTeamAdminController;
// ------------------------------------------------------------------
// POST /api/admin/team/:teamId/verify (Admin Verify Team)
// ------------------------------------------------------------------
const verifyTeamAdminController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teamId = req.params.teamId;
        const adminId = req.user.id; // Use authenticated admin ID for logging
        const { action } = req.body; // Expects action: 'approve' or 'reject'
        if (!teamId || !action) {
            return res.status(400).json({ message: "Team ID and 'action' (approve/reject) are required." });
        }
        if (action !== 'approve' && action !== 'reject') {
            return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'." });
        }
        const hackathonId = req.hackathonId;
        const updatedTeam = yield (0, admin_service_1.verifyTeamAdmin)(teamId, action, adminId, hackathonId);
        return res.status(200).json({
            message: `Team verification status successfully set to ${updatedTeam.verification_status}.`,
            team: updatedTeam
        });
    }
    catch (error) {
        console.error("Controller Error [verifyTeamAdminController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.verifyTeamAdminController = verifyTeamAdminController;
// ------------------------------------------------------------------
// GET /api/admin/judge-assignments (Get Assignment Matrix)
// ------------------------------------------------------------------
const getJudgeAssignmentsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hackathonId = req.hackathonId;
        const assignmentMatrix = yield (0, admin_service_1.getJudgeAssignments)(hackathonId);
        return res.status(200).json({
            message: "Judge assignment matrix retrieved successfully.",
            assignmentMatrix: assignmentMatrix,
            totalJudges: assignmentMatrix.length
        });
    }
    catch (error) {
        console.error("Controller Error [getJudgeAssignmentsController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.getJudgeAssignmentsController = getJudgeAssignmentsController;
// ------------------------------------------------------------------
// POST /api/admin/assignments/assign (Assign Teams to Judges)
// ------------------------------------------------------------------
const assignTeamsToJudgesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assignments = req.body.assignments; // Expected format: [{ judgeId, teamId }, ...]
        if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
            return res.status(400).json({ message: "Assignment payload must be a non-empty array of {judgeId, teamId} objects." });
        }
        // Basic payload validation
        const isValid = assignments.every(a => a.judgeId && a.teamId);
        if (!isValid) {
            return res.status(400).json({ message: "All assignment objects must contain 'judgeId' and 'teamId'." });
        }
        const hackathonId = req.hackathonId;
        const newAssignments = yield (0, admin_service_1.assignTeamsToJudges)(assignments, hackathonId);
        return res.status(200).json({
            message: `${newAssignments.length} new assignments created successfully.`,
            assignments: newAssignments
        });
    }
    catch (error) {
        console.error("Controller Error [assignTeamsToJudgesController]:", error.message);
        // Map the assignment conflict error to 409
        if (error.message.includes("conflict")) {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.assignTeamsToJudgesController = assignTeamsToJudgesController;
// ------------------------------------------------------------------
// POST /api/admin/assignments/reassign (Reassign a Single Team)
// ------------------------------------------------------------------
const reassignTeamController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamId, oldJudgeId, newJudgeId } = req.body;
        if (!teamId || !oldJudgeId || !newJudgeId) {
            return res.status(400).json({ message: "teamId, oldJudgeId, and newJudgeId are required." });
        }
        const hackathonId = req.hackathonId;
        const result = yield (0, admin_service_1.reassignTeam)(teamId, oldJudgeId, newJudgeId, hackathonId);
        return res.status(200).json({
            message: `Team ${teamId} successfully reassigned from Judge ${oldJudgeId} to Judge ${newJudgeId}.`,
            assignment: result.newAssignment
        });
    }
    catch (error) {
        console.error("Controller Error [reassignTeamController]:", error.message);
        // Map the conflict error from the internal assignTeamsToJudges call to 409
        if (error.message.includes("conflict")) {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.reassignTeamController = reassignTeamController;
// ------------------------------------------------------------------
// POST /api/admin/assignments/auto-balance (Algorithmic Rebalance)
// ------------------------------------------------------------------
const autoBalanceAssignmentsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // NOTE: This operation is often guarded by a confirmation modal in the UI
        const hackathonId = req.hackathonId;
        const result = yield (0, admin_service_1.autoBalanceAssignments)(hackathonId);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Controller Error [autoBalanceAssignmentsController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.autoBalanceAssignmentsController = autoBalanceAssignmentsController;
// --- SUBMISSIONS MANAGEMENT CONTROLLERS ---
// ------------------------------------------------------------------
// GET /api/admin/submissions (Get Submissions Panel)
// ------------------------------------------------------------------
const getSubmissionsPanelController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = { status: req.query.status };
        const hackathonId = req.hackathonId;
        const { submissions, totalCount } = yield (0, admin_service_1.getSubmissionsPanel)(page, limit, filters, hackathonId);
        return res.status(200).json({
            message: "Submissions list retrieved successfully.",
            submissions: submissions,
            page,
            limit,
            totalCount
        });
    }
    catch (error) {
        console.error("Controller Error [getSubmissionsPanelController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getSubmissionsPanelController = getSubmissionsPanelController;
// ------------------------------------------------------------------
// GET /api/admin/submission/:submissionId (Get Submission Detail)
// ------------------------------------------------------------------
const getSubmissionDetailAdminController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const submissionId = req.params.submissionId;
        if (!submissionId) {
            return res.status(400).json({ message: "Submission ID is required." });
        }
        const hackathonId = req.hackathonId;
        const submissionDetail = yield (0, admin_service_1.getSubmissionDetailAdmin)(submissionId, hackathonId);
        if (!submissionDetail) {
            return res.status(404).json({ message: "Submission not found." });
        }
        return res.status(200).json({
            message: "Submission details retrieved successfully.",
            submission: submissionDetail
        });
    }
    catch (error) {
        console.error("Controller Error [getSubmissionDetailAdminController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.getSubmissionDetailAdminController = getSubmissionDetailAdminController;
// ------------------------------------------------------------------
// PATCH /api/admin/submission/:submissionId/status (Change Status)
// ------------------------------------------------------------------
const changeSubmissionStatusController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const submissionId = req.params.submissionId;
        const { status: newStatus, adminNote } = req.body;
        if (!submissionId || !newStatus) {
            return res.status(400).json({ message: "Submission ID and new status are required." });
        }
        const hackathonId = req.hackathonId;
        const updatedSubmission = yield (0, admin_service_1.changeSubmissionStatus)(submissionId, newStatus, adminNote, hackathonId);
        return res.status(200).json({
            message: `Submission status updated to ${updatedSubmission.status}.`,
            submission: updatedSubmission
        });
    }
    catch (error) {
        console.error("Controller Error [changeSubmissionStatusController]:", error.message);
        // Handle invalid status error
        if (error.message.includes("Invalid status")) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.changeSubmissionStatusController = changeSubmissionStatusController;
// ------------------------------------------------------------------
// GET /api/admin/submission/:submissionId/download (Generate Signed URL)
// ------------------------------------------------------------------
const downloadSubmissionController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const submissionId = req.params.submissionId;
        if (!submissionId) {
            return res.status(400).json({ message: "Submission ID is required." });
        }
        const hackathonId = req.hackathonId;
        const signedUrl = yield (0, admin_service_1.generateSubmissionDownloadUrl)(submissionId, hackathonId);
        return res.status(200).json({
            message: "Signed download URL generated successfully.",
            downloadUrl: signedUrl
        });
    }
    catch (error) {
        console.error("Controller Error [downloadSubmissionController]:", error.message);
        // Handle file path missing error
        if (error.message.includes("file path is missing")) {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.downloadSubmissionController = downloadSubmissionController;
// --- SCORING & LEADERBOARD CONTROLLERS ---
// ------------------------------------------------------------------
// POST /api/admin/scores/aggregate (Aggregate Scores)
// ------------------------------------------------------------------
const aggregateScoresController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hackathonId = req.hackathonId;
        const result = yield (0, admin_service_1.aggregateJudgeScores)(hackathonId);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Controller Error [aggregateScoresController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.aggregateScoresController = aggregateScoresController;
// ------------------------------------------------------------------
// POST /api/admin/scores/compute-leaderboard (Compute Final Leaderboard)
// ------------------------------------------------------------------
const computeLeaderboardController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hackathonId = req.hackathonId;
        const result = yield (0, admin_service_1.computeFinalLeaderboard)(hackathonId);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Controller Error [computeLeaderboardController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.computeLeaderboardController = computeLeaderboardController;
// --- LEADERBOARD DISPLAY & CONTROL CONTROLLERS ---
// ------------------------------------------------------------------
// GET /api/admin/leaderboard (Internal View with Pagination)
// ------------------------------------------------------------------
const getInternalLeaderboardController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        // Pass all relevant filters from the query string
        const filters = {
            teamName: req.query.teamName,
            category: req.query.category,
        };
        const hackathonId = req.hackathonId;
        const result = yield (0, admin_service_1.getInternalLeaderboard)(page, limit, filters, false, hackathonId); // false for isPublishedFilter
        return res.status(200).json({
            message: "Internal leaderboard retrieved successfully.",
            leaderboard: result
        });
    }
    catch (error) {
        console.error("Controller Error [getInternalLeaderboardController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.getInternalLeaderboardController = getInternalLeaderboardController;
// ------------------------------------------------------------------
// POST /api/admin/leaderboard/publish (Toggle Publishing Status)
// ------------------------------------------------------------------
const publishLeaderboardToggleController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { isPublished } = req.body;
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (typeof isPublished !== 'boolean') {
            return res.status(400).json({ message: "The 'isPublished' boolean field is required." });
        }
        const hackathonId = req.hackathonId;
        const result = yield (0, admin_service_1.publishLeaderboardToggle)(isPublished, adminId, hackathonId);
        return res.status(200).json({
            message: `Leaderboard status successfully set to ${isPublished ? 'PUBLISHED' : 'UNPUBLISHED'}.`,
            isPublished: result.isPublished
        });
    }
    catch (error) {
        console.error("Controller Error [publishLeaderboardToggleController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.publishLeaderboardToggleController = publishLeaderboardToggleController;
// --- ANNOUNCEMENTS CONTROLLERS ---
// ------------------------------------------------------------------
// POST /api/admin/announcements (Create Announcement)
// ------------------------------------------------------------------
const createAnnouncementController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!adminId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { title, content, targetCriteria, scheduledAt } = req.body;
        const hackathonId = req.hackathonId;
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required." });
        }
        const announcement = yield (0, admin_service_1.createAnnouncement)(adminId, title, content, targetCriteria || {}, scheduledAt, hackathonId);
        return res.status(201).json({
            message: "Announcement created successfully.",
            announcement
        });
    }
    catch (error) {
        console.error("Controller Error [createAnnouncementController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.createAnnouncementController = createAnnouncementController;
// ------------------------------------------------------------------
// POST /api/admin/announcements/send (Send Announcement Immediately)
// ------------------------------------------------------------------
const sendAnnouncementNowController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { announcementId } = req.body;
        if (!announcementId) {
            return res.status(400).json({ message: "Announcement ID is required." });
        }
        const result = yield (0, admin_service_1.sendAnnouncementNow)(announcementId);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Controller Error [sendAnnouncementNowController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.sendAnnouncementNowController = sendAnnouncementNowController;
// --- ANNOUNCEMENTS CONTROLLERS (Continued) ---
// ------------------------------------------------------------------
// POST /api/admin/announcements/schedule (Schedule Announcement)
// ------------------------------------------------------------------
const scheduleAnnouncementController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { announcementId, scheduledAt } = req.body;
        if (!announcementId || !scheduledAt) {
            return res.status(400).json({ message: "Announcement ID and scheduled time are required." });
        }
        const result = yield (0, admin_service_1.scheduleAnnouncement)(announcementId, scheduledAt);
        return res.status(200).json({
            message: `Announcement successfully scheduled for ${scheduledAt}.`,
            announcement: result
        });
    }
    catch (error) {
        console.error("Controller Error [scheduleAnnouncementController]:", error.message);
        return res.status(400).json({ message: error.message });
    }
});
exports.scheduleAnnouncementController = scheduleAnnouncementController;
// ------------------------------------------------------------------
// GET /api/admin/announcements (List Announcements)
// ------------------------------------------------------------------
const getAnnouncementsListController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const hackathonId = req.hackathonId;
        const result = yield (0, admin_service_1.getAnnouncementsList)(page, limit, hackathonId);
        return res.status(200).json(Object.assign({ message: "Announcements retrieved successfully." }, result));
    }
    catch (error) {
        console.error("Controller Error [getAnnouncementsListController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getAnnouncementsListController = getAnnouncementsListController;
// --- ANALYTICS CONTROLLERS ---
// ------------------------------------------------------------------
// GET /api/admin/analytics/overview
// ------------------------------------------------------------------
const getAnalyticsOverviewController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hackathonId = req.hackathonId || undefined;
        const overview = yield (0, admin_service_1.getAnalyticsOverview)(hackathonId);
        return res.status(200).json(overview);
    }
    catch (error) {
        console.error("Controller Error [getAnalyticsOverviewController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.getAnalyticsOverviewController = getAnalyticsOverviewController;
// ------------------------------------------------------------------
// GET /api/admin/analytics/detail
// ------------------------------------------------------------------
const getAnalyticsDetailController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Filters are passed via query parameters
        const filters = {
            city: req.query.city,
            college: req.query.college,
            dateRange: {
                start: req.query.start,
                end: req.query.end,
            }
        };
        const hackathonId = req.hackathonId || undefined;
        filters.hackathonId = hackathonId;
        const detail = yield (0, admin_service_1.getAnalyticsDetail)(filters);
        return res.status(200).json(detail);
    }
    catch (error) {
        console.error("Controller Error [getAnalyticsDetailController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.getAnalyticsDetailController = getAnalyticsDetailController;
// ------------------------------------------------------------------
// GET /api/admin/overview/breakdown
// ------------------------------------------------------------------
const getStateCollegeBreakdownController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hackathonId = req.hackathonId || undefined;
        const breakdown = yield (0, admin_service_1.getStateCollegeBreakdown)(hackathonId);
        return res.status(200).json(breakdown);
    }
    catch (error) {
        console.error("Controller Error [getStateCollegeBreakdownController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.getStateCollegeBreakdownController = getStateCollegeBreakdownController;
// --- SETTINGS & AUDIT CONTROLLERS ---
// ------------------------------------------------------------------
// GET /api/admin/settings
// ------------------------------------------------------------------
const getPlatformSettingsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield (0, admin_service_1.getPlatformSettings)();
        return res.status(200).json(settings);
    }
    catch (error) {
        console.error("Controller Error [getPlatformSettingsController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getPlatformSettingsController = getPlatformSettingsController;
// ------------------------------------------------------------------
// PATCH /api/admin/settings
// ------------------------------------------------------------------
const updatePlatformSettingsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!adminId)
            return res.status(401).json({ message: 'Unauthorized' });
        const updates = req.body; // e.g., { "is_registration_open": false }
        // Basic validation: ensure at least one field is provided
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No settings provided to update." });
        }
        const updated = yield (0, admin_service_1.updatePlatformSettings)(adminId, updates);
        return res.status(200).json({
            message: "Settings updated successfully.",
            settings: updated
        });
    }
    catch (error) {
        console.error("Controller Error [updatePlatformSettingsController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.updatePlatformSettingsController = updatePlatformSettingsController;
// ------------------------------------------------------------------
// GET /api/admin/settings/audit-logs
// ------------------------------------------------------------------
const getAuditLogsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const hackathonId = req.hackathonId || undefined;
        const result = yield (0, admin_service_1.getAuditLogs)(page, limit, hackathonId);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Controller Error [getAuditLogsController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getAuditLogsController = getAuditLogsController;
// ------------------------------------------------------------------
// GET /api/admin/teams/export
// ------------------------------------------------------------------
const exportTeamsCSVController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = Object.assign({}, req.query);
        const hackathonId = req.hackathonId || undefined;
        if (hackathonId)
            filters.hackathonId = hackathonId;
        const exportData = yield (0, admin_service_1.exportTeamsData)(filters);
        if (exportData.length === 0) {
            return res.status(204).send("No teams found matching the specified filters.");
        }
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const filename = `hackathon_teams_export_${timestamp}.csv`;
        // Inline CSV generation to avoid relying on external middleware
        const keys = Object.keys(exportData[0] || {});
        const escapeCell = (val) => {
            if (val === null || val === undefined)
                return '';
            const s = String(val);
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                return '"' + s.replace(/"/g, '""') + '"';
            }
            return s;
        };
        const header = keys.join(',');
        const rows = exportData.map((row) => keys.map((k) => escapeCell(row[k])).join(','));
        const csv = [header].concat(rows).join('\r\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(csv);
    }
    catch (error) {
        console.error("Controller Error [exportTeamsCSVController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.exportTeamsCSVController = exportTeamsCSVController;
