"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getJudgeEventsController = exports.getMyReviewsController = exports.updateSubmittedEvaluationController = exports.submitFinalEvaluationController = exports.getEvaluationStatusController = exports.getEvaluationDraftController = exports.saveEvaluationDraftController = exports.getSubmissionForEvaluationController = exports.getJudgeDashboardController = exports.getAssignedTeamsController = void 0;
const judge_service_1 = require("../../services/judge/judge.service");
const judge_service_2 = require("../../services/judge/judge.service");
// GET /api/judge/assignments (Get Assigned Teams List)
const getAssignedTeamsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const judgeId = req.user.id;
        const hackathonId = req.hackathonId;
        // 1. Pagination and Filtering logic (UNCOMMENTED AND EXTRACTED)
        // Default page is 1, default limit is 10.
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // 2. Call Service with Pagination Parameters
        // The service MUST return both the paged teams and the total count.
        const { teams, totalCount } = yield (0, judge_service_1.getAssignedTeams)(judgeId, page, limit, hackathonId);
        // 3. Calculate Pagination Metadata
        const totalPages = Math.ceil(totalCount / limit);
        // 4. Return Response with Metadata
        return res.status(200).json({
            message: "Assigned teams retrieved successfully.",
            teams: teams,
            pagination: {
                totalItems: totalCount,
                totalPages: totalPages,
                currentPage: page,
                itemsPerPage: limit,
            }
        });
    }
    catch (error) {
        console.error("Controller Error [getAssignedTeamsController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getAssignedTeamsController = getAssignedTeamsController;
// ------------------------------------------------------------------
// GET /api/judge/dashboard (Get Judge Dashboard Summary)
// ------------------------------------------------------------------
const getJudgeDashboardController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const judgeId = req.user.id;
        const hackathonId = req.hackathonId;
        // 1. Call Service to get counts
        const summary = yield (0, judge_service_1.getJudgeDashboardSummary)(judgeId, hackathonId);
        // 2. Return Response
        return res.status(200).json({
            message: "Dashboard summary retrieved.",
            dashboard: {
                assignedTeamsCount: summary.totalAssigned,
                evaluationProgress: {
                    completed: summary.completedCount,
                    pending: summary.pendingCount,
                    readyForEvaluation: summary.readyForEvaluationCount
                },
                // announcementsSummary: summary.announcementsSummary // Uncomment when Notification service is linked
            }
        });
    }
    catch (error) {
        console.error("Controller Error [getJudgeDashboardController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getJudgeDashboardController = getJudgeDashboardController;
// GET /api/judge/submission/:teamId (Fetch Submission Details)
const getSubmissionForEvaluationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const judgeId = req.user.id;
        const teamId = req.params.teamId;
        const hackathonId = req.hackathonId;
        if (!teamId) {
            return res.status(400).json({ message: "Team ID is required." });
        }
        // 1. Call Service (Performs assignment check and data fetch)
        const submission = yield (0, judge_service_1.getSubmissionForEvaluation)(judgeId, teamId, hackathonId);
        if (!submission) {
            return res.status(404).json({ message: "No final submission found for this team." });
        }
        // 2. Return Response
        return res.status(200).json({
            message: "Submission details retrieved.",
            submission: submission
        });
    }
    catch (error) {
        // Map the security error from the service to a 403 Forbidden
        if (error.message.includes("Forbidden")) {
            return res.status(403).json({ message: error.message });
        }
        console.error("Controller Error [getSubmissionForEvaluationController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getSubmissionForEvaluationController = getSubmissionForEvaluationController;
// POST /api/judge/evaluation/:teamId/draft (Save Evaluation Draft)
// ------------------------------------------------------------------
const saveEvaluationDraftController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const judgeId = req.user.id;
        const teamId = req.params.teamId;
        const payload = req.body;
        const hackathonId = req.hackathonId;
        if (!teamId) {
            return res.status(400).json({ message: "Team ID is required." });
        }
        // 1. Security Check: Verify Assignment & Get Submission ID
        // Reuse getSubmissionForEvaluation service logic to perform assignment check (403 error)
        const submission = yield (0, judge_service_1.getSubmissionForEvaluation)(judgeId, teamId, hackathonId);
        if (!submission || submission.status !== 'submitted') {
            return res.status(400).json({ message: "Cannot draft evaluation: Team has not submitted a final project." });
        }
        // **NEW LOGIC: Fetch the required assignment_id**
        const assignmentId = yield (0, judge_service_1.getAssignmentId)(judgeId, teamId, hackathonId); // <-- NEW CALL
        if (!assignmentId) {
            // This should be caught by getSubmissionForEvaluation, but acts as a safeguard
            return res.status(403).json({ message: "Assignment not found for this judge and team." });
        }
        // 2. Data Validation: validateScoreRanges middleware handles range checks
        // 3. Call Service
        const savedDraft = yield (0, judge_service_1.saveEvaluationDraft)(judgeId, teamId, submission.id, assignmentId, payload, hackathonId);
        return res.status(200).json({
            message: "Evaluation draft saved successfully.",
            evaluation: savedDraft
        });
    }
    catch (error) {
        if (error.message.includes("Forbidden")) {
            return res.status(403).json({ message: error.message });
        }
        console.error("Controller Error [saveEvaluationDraftController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.saveEvaluationDraftController = saveEvaluationDraftController;
// GET /api/judge/evaluation/:teamId (Retrieve Saved/In-Progress Draft)
const getEvaluationDraftController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const judgeId = req.user.id;
        const teamId = req.params.teamId;
        const hackathonId = req.hackathonId;
        // This implicitly performs an assignment check by only querying the judge's record.
        const evaluation = yield (0, judge_service_1.getEvaluationByTeamId)(judgeId, teamId, hackathonId);
        if (!evaluation) {
            // Return an empty template if no record exists
            return res.status(200).json({
                message: "No draft found. Returning empty template.",
                evaluation: {
                    status: 'none',
                    is_locked_by_admin: false,
                    scores: { /* scores will be null */},
                    comments: ""
                }
            });
        }
        return res.status(200).json({
            message: "Evaluation draft retrieved.",
            evaluation: evaluation
        });
    }
    catch (error) {
        console.error("Controller Error [getEvaluationDraftController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getEvaluationDraftController = getEvaluationDraftController;
// GET /api/judge/evaluation/:teamId/status (Get Evaluation Status Only)
const getEvaluationStatusController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const judgeId = req.user.id;
        const teamId = req.params.teamId;
        const hackathonId = req.hackathonId;
        const evaluation = yield (0, judge_service_1.getEvaluationByTeamId)(judgeId, teamId, hackathonId);
        const status = evaluation ? evaluation.status : 'none';
        const isLocked = evaluation ? evaluation.is_locked_by_admin : false;
        return res.status(200).json({
            message: "Evaluation status retrieved.",
            status: status, // 'none', 'draft', 'submitted', 'locked'
            isLocked: isLocked
        });
    }
    catch (error) {
        console.error("Controller Error [getEvaluationStatusController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getEvaluationStatusController = getEvaluationStatusController;
// POST /api/judge/evaluation/:teamId/submit (Submit Final Evaluation)
const submitFinalEvaluationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const judgeId = req.user.id;
        const teamId = req.params.teamId;
        const payload = req.body;
        const hackathonId = req.hackathonId;
        if (!teamId) {
            return res.status(400).json({ message: "Team ID is required." });
        }
        // 1. Security Check: Verify Assignment & Get Submission ID
        // This reuse ensures assignment is checked and team has submitted.
        const submission = yield (0, judge_service_1.getSubmissionForEvaluation)(judgeId, teamId, hackathonId);
        if (!submission || submission.status !== 'submitted') {
            return res.status(400).json({ message: "Cannot submit: Team has not submitted a final project." });
        }
        // 2. Lock Check: Ensure evaluation is not already submitted (Idempotency check)
        // Although the service performs an update, we should prevent multiple submissions.
        const existingEvaluation = yield (0, judge_service_1.getEvaluationByTeamId)(judgeId, teamId, hackathonId);
        if (existingEvaluation && existingEvaluation.status === 'submitted') {
            return res.status(400).json({ message: "Evaluation has already been submitted for this team." });
        }
        // 3. Data Validation: validateScoreRanges middleware handles range checks and required comments
        // 4. Call Service to finalize submission
        const finalEvaluation = yield (0, judge_service_1.submitFinalEvaluation)(judgeId, teamId, submission.id, payload, hackathonId);
        // Trigger aggregation so leaderboards update in near-real-time.
        try {
            // Dynamic import to avoid static circular/import resolution issues at compile time
            const adminMod = yield Promise.resolve().then(() => __importStar(require('../../services/admin/admin.service')));
            if (adminMod && typeof adminMod.aggregateJudgeScores === 'function') {
                yield adminMod.aggregateJudgeScores(hackathonId);
            }
        }
        catch (aggErr) {
            console.error("Aggregation Error [submitFinalEvaluationController]:", (_a = aggErr === null || aggErr === void 0 ? void 0 : aggErr.message) !== null && _a !== void 0 ? _a : String(aggErr));
            // Do not fail the submission if aggregation fails; it's a best-effort background step.
        }
        return res.status(200).json({
            message: "Evaluation submitted successfully. Thank you for your review!",
            evaluation: finalEvaluation
        });
    }
    catch (error) {
        if (error.message.includes("Forbidden")) {
            return res.status(403).json({ message: error.message });
        }
        console.error("Controller Error [submitFinalEvaluationController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.submitFinalEvaluationController = submitFinalEvaluationController;
// PATCH /api/judge/evaluation/:teamId/update (Update Submitted Evaluation)
const updateSubmittedEvaluationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const judgeId = req.user.id;
        const teamId = req.params.teamId;
        const payload = req.body;
        const hackathonId = req.hackathonId;
        if (!teamId) {
            return res.status(400).json({ message: "Team ID is required." });
        }
        // 1. Check if the evaluation is submitted and NOT locked
        const existingEvaluation = yield (0, judge_service_1.getEvaluationByTeamId)(judgeId, teamId, hackathonId);
        if (!existingEvaluation || existingEvaluation.status !== 'submitted') {
            return res.status(400).json({ message: "Only submitted evaluations can be updated." });
        }
        if (existingEvaluation.is_locked_by_admin) {
            return res.status(423).json({ message: "Forbidden. Evaluation is locked by an Administrator." }); // 423 Locked
        }
        // 2. Data Validation: Re-use validation middleware (scores and comments must be present and valid)
        // Note: We skip submission check here as the update is only for scores/comments.
        // 3. Call Service
        const updatedEvaluation = yield (0, judge_service_1.updateSubmittedEvaluation)(judgeId, teamId, payload, hackathonId);
        return res.status(200).json({
            message: "Submitted evaluation updated successfully.",
            evaluation: updatedEvaluation
        });
    }
    catch (error) {
        if (error.message.includes("Evaluation may be locked by an Administrator")) {
            return res.status(423).json({ message: error.message });
        }
        console.error("Controller Error [updateSubmittedEvaluationController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.updateSubmittedEvaluationController = updateSubmittedEvaluationController;
// GET /api/judge/my-reviews (List Completed and Draft Reviews)
const getMyReviewsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const judgeId = req.user.id;
        const hackathonId = req.hackathonId;
        // 1. Call Service
        const reviews = yield (0, judge_service_1.getMyReviews)(judgeId, hackathonId);
        // 2. Return Response
        return res.status(200).json({
            message: "Judge reviews list retrieved successfully.",
            reviews: reviews,
            totalCount: reviews.length
        });
    }
    catch (error) {
        console.error("Controller Error [getMyReviewsController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.getMyReviewsController = getMyReviewsController;
// GET /api/judge/events (List hackathons this judge has assignments in)
const getJudgeEventsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const judgeId = req.user.id;
        const events = yield (0, judge_service_2.getJudgeEvents)(judgeId);
        return res.status(200).json({ message: 'Judge events retrieved successfully.', events });
    }
    catch (error) {
        console.error('Controller Error [getJudgeEventsController]:', error.message);
        return res.status(500).json({ message: 'Server Error', details: error.message });
    }
});
exports.getJudgeEventsController = getJudgeEventsController;
