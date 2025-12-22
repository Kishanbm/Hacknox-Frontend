import { Router } from "express";
import { 
    createJudgeController,
    getJudgesListController,
    updateJudgeController,
    deleteJudgeController,
    getTeamsListController,
    getTeamProfileAdminController,
    updateTeamAdminController,
    verifyTeamAdminController,
    getJudgeAssignmentsController,
    assignTeamsToJudgesController,
    reassignTeamController,
    autoBalanceAssignmentsController,
    getSubmissionDetailAdminController,
    getSubmissionsPanelController,
    changeSubmissionStatusController,
    downloadSubmissionController,
    aggregateScoresController,
    computeLeaderboardController,
    getInternalLeaderboardController,
    publishLeaderboardToggleController,
    createAnnouncementController,
    sendAnnouncementNowController,
    scheduleAnnouncementController,
    getAnnouncementsListController,
    getAnalyticsOverviewController,   
    getAnalyticsDetailController,    
    getStateCollegeBreakdownController,
    getAuditLogsController,
    updatePlatformSettingsController,
    getPlatformSettingsController,
    exportTeamsCSVController
} from "../../controllers/admin/admin.controller";
import { verifyAuthToken } from "../../middlewares/authMiddleware";
import { requireRole } from "../../middlewares/roleMiddleware";
import { requireHackathonId, optionalHackathonId } from "../../middlewares/requireHackathon.middleware";

const router = Router();

// All Admin routes must be authenticated and require the 'admin' role
router.use(verifyAuthToken);
router.use(requireRole(["admin"]));


// --- JUDGE MANAGEMENT ROUTES ---

// 1. POST /api/admin/judge (Create Judge) [cite: 44, 45]
router.post("/judge", createJudgeController); 

// 2. GET /api/admin/judges (List Judges) [cite: 39, 40]
// This route can work with or without hackathon ID (for viewing all or filtered)
router.get("/judges", optionalHackathonId, getJudgesListController); 

// 3. PATCH /api/admin/judge/:judgeId (Update Judge) [cite: 49, 50]
router.patch("/judge/:judgeId", updateJudgeController);

// 4. DELETE /api/admin/judge/:judgeId (Delete Judge) [cite: 54, 55]
router.delete("/judge/:judgeId", deleteJudgeController);

// 5. GET /api/admin/teams (List Teams) [cite: 13]
router.get("/teams", optionalHackathonId, getTeamsListController); 

// 6. GET /api/admin/team/:teamId (Get Team Profile) [cite: 24]
router.get("/team/:teamId", requireHackathonId, getTeamProfileAdminController);

// 7. PATCH /api/admin/team/:teamId (Admin Update Team Details)
router.patch("/team/:teamId", requireHackathonId, updateTeamAdminController); 

// 8. POST /api/admin/team/:teamId/verify (Admin Verify Team)
router.post("/team/:teamId/verify", requireHackathonId, verifyTeamAdminController);

// --- JUDGE ASSIGNMENT ROUTES (READ) ---
// 9. GET /api/admin/judge-assignments (Get Assignment Matrix)
router.get("/judge-assignments", optionalHackathonId, getJudgeAssignmentsController);

// --- JUDGE ASSIGNMENT ROUTES (WRITE) ---
// 10. POST /api/admin/assignments/assign (Assign Teams to Judges)
router.post("/assignments/assign", requireHackathonId, assignTeamsToJudgesController);

// 11. POST /api/admin/assignments/reassign (Reassign a Single Team)
router.post("/assignments/reassign", requireHackathonId, reassignTeamController);

// 12. POST /api/admin/assignments/auto-balance (Algorithmic Rebalance)
router.post("/assignments/auto-balance", requireHackathonId, autoBalanceAssignmentsController);

// 13. GET /api/admin/submissions (List Submissions Panel)
router.get("/submissions", requireHackathonId, getSubmissionsPanelController); 

// 14. GET /api/admin/submission/:submissionId (Get Submission Detail)
router.get("/submission/:submissionId", requireHackathonId, getSubmissionDetailAdminController);

// 15. PATCH /api/admin/submission/:submissionId/status (Change Status)
router.patch("/submission/:submissionId/status", requireHackathonId, changeSubmissionStatusController); 

// 16. GET /api/admin/submission/:submissionId/download (Generate Download Link)
router.get("/submission/:submissionId/download", requireHackathonId, downloadSubmissionController);

// 17. POST /api/admin/scores/aggregate (Aggregate Scores)
router.post("/scores/aggregate", requireHackathonId, aggregateScoresController); 

// 18. POST /api/admin/scores/compute-leaderboard (Compute Final Leaderboard)
router.post("/scores/compute-leaderboard", requireHackathonId, computeLeaderboardController);

// 19. GET /api/admin/leaderboard (Get Internal Leaderboard)
// Allow requesting internal leaderboard for "All" hackathons by making the hackathon id optional here.
router.get("/leaderboard", optionalHackathonId, getInternalLeaderboardController); 

// 20. POST /api/admin/leaderboard/publish (Toggle Publishing Status)
router.post("/leaderboard/publish", requireHackathonId, publishLeaderboardToggleController);

// --- ANNOUNCEMENTS ROUTES ---

// 21. POST /api/admin/announcements (Create Announcement)
router.post("/announcements", requireHackathonId, createAnnouncementController);

// 22. POST /api/admin/announcements/send (Send Announcement)
router.post("/announcements/send", requireHackathonId, sendAnnouncementNowController);

// 23. POST /api/admin/announcements/schedule (Schedule Announcement)
router.post("/announcements/schedule", requireHackathonId, scheduleAnnouncementController);

// 24. GET /api/admin/announcements (List Announcements)
router.get("/announcements", requireHackathonId, getAnnouncementsListController);

// --- ANALYTICS & REPORTING ROUTES ---

// 25. GET /api/admin/analytics/overview
router.get("/analytics/overview", requireHackathonId, getAnalyticsOverviewController);

// 26. GET /api/admin/analytics/detail
router.get("/analytics/detail", requireHackathonId, getAnalyticsDetailController);

// 27. GET /api/admin/overview/breakdown
router.get("/overview/breakdown",  requireHackathonId, getStateCollegeBreakdownController);

// 29. PATCH /api/admin/settings (Update Config)
router.patch("/settings", requireHackathonId, updatePlatformSettingsController);

// 30. GET /api/admin/settings/audit-logs (View History)
router.get("/settings/audit-logs", requireHackathonId, getAuditLogsController);

// 31. GET /api/admin/teams/export (Export Teams Data as CSV)
router.get("/teams/export", requireHackathonId, exportTeamsCSVController);
export default router;