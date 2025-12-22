"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const judge_controller_1 = require("../../controllers/judge/judge.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const roleMiddleware_1 = require("../../middlewares/roleMiddleware");
const requireJudgeScope_middleware_1 = require("../../middlewares/requireJudgeScope.middleware");
const requireHackathon_middleware_1 = require("../../middlewares/requireHackathon.middleware");
const evaluation_validation_1 = require("../../utils/evaluation.validation");
const router = (0, express_1.Router)();
// All judge routes must be authenticated and require the 'judge' role
router.use(authMiddleware_1.verifyAuthToken);
router.use((0, roleMiddleware_1.requireRole)(["judge"]));
// Allow judges to list the events they belong to without requiring a currently-selected hackathon
router.get("/events", judge_controller_1.getJudgeEventsController);
// The remaining judge routes expect a selected hackathon (in header/localStorage)
router.use(requireHackathon_middleware_1.requireHackathonId);
// 1. GET /api/judge/assignments (Get Assigned Teams)
router.get("/assignments", requireJudgeScope_middleware_1.requireJudgeScope, judge_controller_1.getAssignedTeamsController);
// 2. GET /api/judge/dashboard (Judge Dashboard)
router.get("/dashboard", judge_controller_1.getJudgeDashboardController);
// 3. GET /api/judge/submission/:teamId (Get Submission for Evaluation)
router.get("/submission/:teamId", requireJudgeScope_middleware_1.requireJudgeScope, judge_controller_1.getSubmissionForEvaluationController);
// Evaluation Routes
// 4. POST /api/judge/evaluation/:teamId/draft (Save Evaluation Draft)
router.post("/evaluation/:teamId/draft", requireJudgeScope_middleware_1.requireJudgeScope, evaluation_validation_1.validateScoreRanges, judge_controller_1.saveEvaluationDraftController);
// 5. GET /api/judge/evaluation/:teamId (Retrieve Saved/In-Progress Draft)
router.get("/evaluation/:teamId", requireJudgeScope_middleware_1.requireJudgeScope, judge_controller_1.getEvaluationDraftController);
// 6. GET /api/judge/evaluation/:teamId/status (Get Evaluation Status Only)
router.get("/evaluation/:teamId/status", requireJudgeScope_middleware_1.requireJudgeScope, judge_controller_1.getEvaluationStatusController);
// 7. POST /api/judge/evaluation/:teamId/submit (Submit Final Evaluation)
router.post("/evaluation/:teamId/submit", requireJudgeScope_middleware_1.requireJudgeScope, evaluation_validation_1.validateScoreRanges, judge_controller_1.submitFinalEvaluationController);
// 8. PATCH /api/judge/evaluation/:teamId/update (Update Submitted Evaluation)
// Uses the same validation rules as submit (scores/comments must be valid)
router.patch("/evaluation/:teamId/update", requireJudgeScope_middleware_1.requireJudgeScope, evaluation_validation_1.validateScoreRanges, judge_controller_1.updateSubmittedEvaluationController);
// 9. GET /api/judge/my-reviews (List Completed and Draft Reviews)
router.get("/my-reviews", requireJudgeScope_middleware_1.requireJudgeScope, judge_controller_1.getMyReviewsController);
exports.default = router;
