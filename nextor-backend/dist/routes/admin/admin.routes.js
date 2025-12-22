"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../../controllers/admin/admin.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const roleMiddleware_1 = require("../../middlewares/roleMiddleware");
const requireHackathon_middleware_1 = require("../../middlewares/requireHackathon.middleware");
const router = (0, express_1.Router)();
// All Admin routes must be authenticated and require the 'admin' role
router.use(authMiddleware_1.verifyAuthToken);
router.use((0, roleMiddleware_1.requireRole)(["admin"]));
// --- JUDGE MANAGEMENT ROUTES ---
// 1. POST /api/admin/judge (Create Judge) [cite: 44, 45]
router.post("/judge", admin_controller_1.createJudgeController);
// 2. GET /api/admin/judges (List Judges) [cite: 39, 40]
// This route is scoped to a selected hackathon and therefore requires the header
router.get("/judges", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.getJudgesListController);
// 3. PATCH /api/admin/judge/:judgeId (Update Judge) [cite: 49, 50]
router.patch("/judge/:judgeId", admin_controller_1.updateJudgeController);
// 4. DELETE /api/admin/judge/:judgeId (Delete Judge) [cite: 54, 55]
router.delete("/judge/:judgeId", admin_controller_1.deleteJudgeController);
// 5. GET /api/admin/teams (List Teams) [cite: 13]
router.get("/teams", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.getTeamsListController);
// 6. GET /api/admin/team/:teamId (Get Team Profile) [cite: 24]
router.get("/team/:teamId", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.getTeamProfileAdminController);
// 7. PATCH /api/admin/team/:teamId (Admin Update Team Details)
router.patch("/team/:teamId", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.updateTeamAdminController);
// 8. POST /api/admin/team/:teamId/verify (Admin Verify Team)
router.post("/team/:teamId/verify", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.verifyTeamAdminController);
// --- JUDGE ASSIGNMENT ROUTES (READ) ---
// 9. GET /api/admin/judge-assignments (Get Assignment Matrix)
router.get("/judge-assignments", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.getJudgeAssignmentsController);
// --- JUDGE ASSIGNMENT ROUTES (WRITE) ---
// 10. POST /api/admin/assignments/assign (Assign Teams to Judges)
router.post("/assignments/assign", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.assignTeamsToJudgesController);
// 11. POST /api/admin/assignments/reassign (Reassign a Single Team)
router.post("/assignments/reassign", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.reassignTeamController);
// 12. POST /api/admin/assignments/auto-balance (Algorithmic Rebalance)
router.post("/assignments/auto-balance", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.autoBalanceAssignmentsController);
// 13. GET /api/admin/submissions (List Submissions Panel)
router.get("/submissions", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.getSubmissionsPanelController);
// 14. GET /api/admin/submission/:submissionId (Get Submission Detail)
router.get("/submission/:submissionId", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.getSubmissionDetailAdminController);
// 15. PATCH /api/admin/submission/:submissionId/status (Change Status)
router.patch("/submission/:submissionId/status", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.changeSubmissionStatusController);
// 16. GET /api/admin/submission/:submissionId/download (Generate Download Link)
router.get("/submission/:submissionId/download", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.downloadSubmissionController);
// 17. POST /api/admin/scores/aggregate (Aggregate Scores)
router.post("/scores/aggregate", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.aggregateScoresController);
// 18. POST /api/admin/scores/compute-leaderboard (Compute Final Leaderboard)
router.post("/scores/compute-leaderboard", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.computeLeaderboardController);
// 19. GET /api/admin/leaderboard (Get Internal Leaderboard)
router.get("/leaderboard", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.getInternalLeaderboardController);
// 20. POST /api/admin/leaderboard/publish (Toggle Publishing Status)
router.post("/leaderboard/publish", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.publishLeaderboardToggleController);
// --- ANNOUNCEMENTS ROUTES ---
// 21. POST /api/admin/announcements (Create Announcement)
router.post("/announcements", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.createAnnouncementController);
// 22. POST /api/admin/announcements/send (Send Announcement)
router.post("/announcements/send", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.sendAnnouncementNowController);
// 23. POST /api/admin/announcements/schedule (Schedule Announcement)
router.post("/announcements/schedule", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.scheduleAnnouncementController);
// 24. GET /api/admin/announcements (List Announcements)
router.get("/announcements", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.getAnnouncementsListController);
// --- ANALYTICS & REPORTING ROUTES ---
// 25. GET /api/admin/analytics/overview
router.get("/analytics/overview", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.getAnalyticsOverviewController);
// 26. GET /api/admin/analytics/detail
router.get("/analytics/detail", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.getAnalyticsDetailController);
// 27. GET /api/admin/overview/breakdown
router.get("/overview/breakdown", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.getStateCollegeBreakdownController);
// 29. PATCH /api/admin/settings (Update Config)
router.patch("/settings", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.updatePlatformSettingsController);
// 30. GET /api/admin/settings/audit-logs (View History)
router.get("/settings/audit-logs", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.getAuditLogsController);
// 31. GET /api/admin/teams/export (Export Teams Data as CSV)
router.get("/teams/export", requireHackathon_middleware_1.requireHackathonId, admin_controller_1.exportTeamsCSVController);
exports.default = router;
