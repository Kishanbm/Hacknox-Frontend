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
exports.getJudgeEvents = exports.getMyReviews = exports.updateSubmittedEvaluation = exports.submitFinalEvaluation = exports.getEvaluationByTeamId = exports.getAssignmentId = exports.saveEvaluationDraft = exports.getSubmissionForEvaluation = exports.getJudgeDashboardSummary = exports.getAssignedTeams = void 0;
const supabaseClient_1 = require("../../lib/supabaseClient");
const notification_service_1 = require("../participant/notification.service");
/**
 * Fetches all teams assigned to a specific judge, including necessary team and submission metadata.
 */
// Update the function signature to include pagination parameters
const getAssignedTeams = (judgeId_1, ...args_1) => __awaiter(void 0, [judgeId_1, ...args_1], void 0, function* (judgeId, page = 1, limit = 10, // Defaulting values for safety
hackathonId) {
    // 1. Calculate the OFFSET (skip)
    const offset = (page - 1) * limit;
    // 2. Join JudgeAssignments with Teams and Submissions
    // Request the total count using { count: 'exact' }
    const baseAssignmentsQuery = supabaseClient_1.supabase
        .from("JudgeAssignments")
        .select(`
            team:Teams (
                id, name, leader_id, verification_status,
                
                submission:Submissions!left (
                    id, status, submitted_at, repo_url, zip_storage_path
                )
            ),
            
            evaluation:Evaluations!left ( 
                id, status, submitted_at
            )
            `, { count: 'exact' } // <-- CRITICAL: Requests the total count of matching rows
    );
    let assignmentsQuery = baseAssignmentsQuery.eq("judge_id", judgeId);
    if (hackathonId)
        assignmentsQuery = assignmentsQuery.eq('hackathon_id', hackathonId);
    // --- PAGINATION APPLIED HERE ---
    const { data, error, count: totalCount } = yield assignmentsQuery
        .range(offset, offset + limit - 1) // Apply the range: Supabase range is inclusive
        // -------------------------------
        .order('created_at', { ascending: false });
    if (error) {
        console.error("Service Error [getAssignedTeams]:", error.message);
        throw new Error("Failed to retrieve judge assignments.");
    }
    // 3. Format the response
    const teams = (data || []).map((assignment) => {
        var _a;
        const team = (_a = assignment === null || assignment === void 0 ? void 0 : assignment.team) !== null && _a !== void 0 ? _a : null;
        // The submission logic needs to handle Supabase array/object return structure
        const submission = (team === null || team === void 0 ? void 0 : team.submission) ? (Array.isArray(team.submission) ? team.submission[0] : team.submission) : null;
        const evaluation = (assignment === null || assignment === void 0 ? void 0 : assignment.evaluation) ? (Array.isArray(assignment.evaluation) ? assignment.evaluation[0] : assignment.evaluation) : null;
        return {
            teamId: (team === null || team === void 0 ? void 0 : team.id) || null,
            teamName: (team === null || team === void 0 ? void 0 : team.name) || null,
            verificationStatus: (team === null || team === void 0 ? void 0 : team.verification_status) || 'unknown',
            // Submission Details
            submissionId: (submission === null || submission === void 0 ? void 0 : submission.id) || null,
            submissionStatus: (submission === null || submission === void 0 ? void 0 : submission.status) || 'no_submission',
            submittedAt: (submission === null || submission === void 0 ? void 0 : submission.submitted_at) || null,
            // Judge's Evaluation Status
            evaluationId: (evaluation === null || evaluation === void 0 ? void 0 : evaluation.id) || null,
            evaluationStatus: (evaluation === null || evaluation === void 0 ? void 0 : evaluation.status) || 'none', // 'none', 'draft', 'submitted'
            evaluationSubmittedAt: (evaluation === null || evaluation === void 0 ? void 0 : evaluation.submitted_at) || null,
            isReadyForEvaluation: (submission === null || submission === void 0 ? void 0 : submission.status) === 'submitted'
        };
    });
    // 4. Return the paginated assignments AND the total count
    return {
        teams: teams,
        totalCount: totalCount || 0,
    };
});
exports.getAssignedTeams = getAssignedTeams;
/**
 * Fetches aggregated data for the Judge Dashboard.
 */
const getJudgeDashboardSummary = (judgeId, hackathonId) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Get all assignments for the judge
    const { teams: assignments } = yield (0, exports.getAssignedTeams)(judgeId, 1, 10, hackathonId);
    const userRole = 'judge';
    // We fetch all relevant announcements and include the read status via the service helper
    const relevantNotifications = yield (0, notification_service_1.getRelevantNotifications)(judgeId, userRole, hackathonId);
    // Filter to find unread notifications
    const unreadNotifications = relevantNotifications.filter((n) => {
        var _a;
        // The service returns the read_status as a nested array/object or null
        const readStatus = (_a = n.read_status) === null || _a === void 0 ? void 0 : _a[0];
        return !readStatus || readStatus.is_read === false;
    });
    const unreadCount = unreadNotifications.length;
    const latestNotification = relevantNotifications.length > 0 ? relevantNotifications[0] : null;
    const announcementsSummary = {
        unreadCount: unreadCount,
        latestTitle: latestNotification ? latestNotification.title : null,
        latestDate: latestNotification ? latestNotification.created_at : null,
    };
    const totalAssigned = assignments.length;
    let completedCount = 0;
    let pendingCount = 0;
    let readyForEvaluationCount = 0;
    assignments.forEach((assignment) => {
        if (assignment.evaluationStatus === 'submitted') {
            completedCount++;
        }
        else if (assignment.evaluationStatus === 'draft') {
            // Count drafts as pending (not fully completed)
            pendingCount++;
        }
        if (assignment.isReadyForEvaluation) {
            readyForEvaluationCount++;
        }
    });
    // Final Calculation: Pending is Total - Completed
    const actualPendingCount = totalAssigned - completedCount;
    return {
        totalAssigned,
        readyForEvaluationCount,
        completedCount,
        pendingCount: actualPendingCount, announcementsSummary,
    };
});
exports.getJudgeDashboardSummary = getJudgeDashboardSummary;
/**
 * Fetches the submitted project files/links for a specific team,
 * ONLY if the requesting judge is assigned to that team.
 */
const getSubmissionForEvaluation = (judgeId, teamId, hackathonId) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Judge Assignment (CRITICAL SECURITY CHECK)
    let assignmentQuery = supabaseClient_1.supabase
        .from("JudgeAssignments")
        .select("*", { count: 'exact', head: true })
        .eq("judge_id", judgeId)
        .eq("team_id", teamId);
    if (hackathonId)
        assignmentQuery = assignmentQuery.eq('hackathon_id', hackathonId);
    const { count, error: assignmentError } = yield assignmentQuery;
    if (assignmentError) {
        console.error("Assignment Check Error:", assignmentError.message);
        throw new Error("Database error during assignment check.");
    }
    // If the count is 0, the judge is not assigned to this team.
    if (count === 0) {
        // Return a custom error that the controller can map to 403
        throw new Error("Forbidden. Judge not assigned to this team.");
    }
    // 2. Fetch the Submitted Submission Data
    let submissionQuery = supabaseClient_1.supabase
        .from("Submissions")
        .select(`
            id, 
            status, 
            submitted_at, 
            repo_url, 
            zip_storage_path,
            team_id
        `)
        .eq("team_id", teamId)
        .eq("status", "submitted"); // Only fetch finalized submissions
    if (hackathonId)
        submissionQuery = submissionQuery.eq('hackathon_id', hackathonId);
    const { data: submissionData, error: submissionError } = yield submissionQuery
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single(); // Use single since we limit(1)
    if (submissionError || !submissionData) {
        // This is okay if the team hasn't submitted yet.
        console.warn(`Submission not found for Team ${teamId} or not submitted.`);
        return null;
    }
    return submissionData;
});
exports.getSubmissionForEvaluation = getSubmissionForEvaluation;
/**
 * Saves or updates an evaluation draft using UPSERT.
 */
const saveEvaluationDraft = (judgeId, teamId, submissionId, assignmentId, payload, hackathonId) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Prepare data for UPSERT
    // We rely on the controller to handle assignment and validation checks.
    const evaluationData = {
        judge_id: judgeId,
        team_id: teamId,
        submission_id: submissionId,
        assignment_id: assignmentId,
        hackathon_id: hackathonId || null,
        // Scores (Map directly to the new database columns)
        score_innovation: payload.score_innovation,
        score_feasibility: payload.score_feasibility,
        score_execution: payload.score_execution,
        score_presentation: payload.score_presentation,
        comments: payload.comments,
        status: 'draft', // Always set to draft for this endpoint
        // These fields are only set on submit/update, not draft
        submitted_at: null,
        is_locked_by_admin: false,
    };
    // 2. Perform UPSERT (Insert ON CONFLICT Update)
    const { data: evaluation, error } = yield supabaseClient_1.supabase
        .from("Evaluations")
        .upsert(evaluationData, {
        onConflict: 'judge_id, team_id', // Conflict resolution key (from schema)
        ignoreDuplicates: false
    })
        .select()
        .single();
    if (error) {
        console.error("Service Error [saveEvaluationDraft]:", error.message);
        throw new Error("Failed to save evaluation draft.");
    }
    return evaluation;
});
exports.saveEvaluationDraft = saveEvaluationDraft;
/**
 * Retrieves the JudgeAssignment ID for a specific judge/team combination.
 * This ID is needed for the Evaluations table.
 */
const getAssignmentId = (judgeId, teamId, hackathonId) => __awaiter(void 0, void 0, void 0, function* () {
    let assignmentIdQuery = supabaseClient_1.supabase
        .from("JudgeAssignments")
        .select("id")
        .eq("judge_id", judgeId)
        .eq("team_id", teamId);
    if (hackathonId)
        assignmentIdQuery = assignmentIdQuery.eq('hackathon_id', hackathonId);
    const { data, error } = yield assignmentIdQuery.maybeSingle();
    if (error) {
        console.error("Service Error [getAssignmentId]:", error.message);
        throw new Error("Failed to look up assignment ID.");
    }
    return data ? data.id : null;
});
exports.getAssignmentId = getAssignmentId;
/**
 * Retrieves a judge's evaluation record (draft or submitted) for a specific team.
 */
const getEvaluationByTeamId = (judgeId, teamId, hackathonId) => __awaiter(void 0, void 0, void 0, function* () {
    // We already checked assignment in previous steps, so we just fetch the record.
    let evalQuery = supabaseClient_1.supabase
        .from("Evaluations")
        .select(`
            id, status, comments, submitted_at, is_locked_by_admin, 
            score_innovation, score_feasibility, score_execution, score_presentation
        `)
        .eq("judge_id", judgeId)
        .eq("team_id", teamId);
    if (hackathonId)
        evalQuery = evalQuery.eq('hackathon_id', hackathonId);
    const { data, error } = yield evalQuery.maybeSingle();
    if (error) {
        console.error("Service Error [getEvaluationByTeamId]:", error.message);
        throw new Error("Failed to retrieve evaluation record.");
    }
    // Return the data or null if not found
    return data;
});
exports.getEvaluationByTeamId = getEvaluationByTeamId;
/**
 * Finalizes the evaluation record by setting status to 'submitted'.
 */
const submitFinalEvaluation = (judgeId, teamId, submissionId, // Needed to ensure we are submitting against a valid record
payload, hackathonId) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Prepare data for update
    const submissionData = {
        // Scores (Must be present due to validateScoreRanges middleware)
        score_innovation: payload.score_innovation,
        score_feasibility: payload.score_feasibility,
        score_execution: payload.score_execution,
        score_presentation: payload.score_presentation,
        comments: payload.comments,
        status: 'submitted', // CRITICAL: Final status flag
        submitted_at: new Date().toISOString(),
    };
    // 2. Perform UPDATE based on unique key
    let submitQuery = supabaseClient_1.supabase
        .from("Evaluations")
        .update(submissionData)
        .eq("judge_id", judgeId)
        .eq("team_id", teamId);
    if (hackathonId)
        submitQuery = submitQuery.eq('hackathon_id', hackathonId);
    const { data: evaluation, error } = yield submitQuery
        .select()
        .single();
    if (error) {
        console.error("Service Error [submitFinalEvaluation]:", error.message);
        throw new Error("Failed to submit final evaluation.");
    }
    return evaluation;
});
exports.submitFinalEvaluation = submitFinalEvaluation;
/**
 * Updates a submitted evaluation. Requires the judge/team record exists
 * and is NOT locked by admin.
 */
const updateSubmittedEvaluation = (judgeId, teamId, payload, hackathonId) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Prepare data for update (only scores and comments are updated)
    const updateData = {
        score_innovation: payload.score_innovation,
        score_feasibility: payload.score_feasibility,
        score_execution: payload.score_execution,
        score_presentation: payload.score_presentation,
        comments: payload.comments,
        updated_at: new Date().toISOString(), // Manual update is okay, but the trigger should catch this too
    };
    // 2. Perform UPDATE based on unique key and ensure it's NOT locked
    let updateQuery = supabaseClient_1.supabase
        .from("Evaluations")
        .update(updateData)
        .eq("judge_id", judgeId)
        .eq("team_id", teamId)
        .eq("is_locked_by_admin", false); // CRITICAL: Only update if not locked
    if (hackathonId)
        updateQuery = updateQuery.eq('hackathon_id', hackathonId);
    const { data: evaluation, error } = yield updateQuery
        .select()
        .single();
    if (error) {
        console.error("Service Error [updateSubmittedEvaluation]:", error.message);
        throw new Error("Failed to update submitted evaluation.");
    }
    // Check if the update succeeded (it returns null if the record exists but the WHERE clause failed)
    if (!evaluation) {
        // This will be caught if the record was locked OR if the record simply didn't exist/wasn't submitted
        throw new Error("Update failed. Evaluation may be locked by an Administrator or not submitted.");
    }
    return evaluation;
});
exports.updateSubmittedEvaluation = updateSubmittedEvaluation;
/**
 * Lists all evaluations (drafts and submitted) created by the judge.
 */
const getMyReviews = (judgeId, hackathonId) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Fetch Evaluations, joining to get the Team name and Submission status
    let myReviewsQuery = supabaseClient_1.supabase
        .from("Evaluations")
        .select(`
            id, status, submitted_at, updated_at, is_locked_by_admin,
            
            team:Teams (
                id, name, verification_status
            ),
            submission:Submissions!inner (
                status
            )
        `)
        .eq("judge_id", judgeId);
    if (hackathonId)
        myReviewsQuery = myReviewsQuery.eq('hackathon_id', hackathonId);
    const { data, error } = yield myReviewsQuery.order('updated_at', { ascending: false }); // Show most recently modified first
    if (error) {
        console.error("Service Error [getMyReviews]:", error.message);
        throw new Error("Failed to retrieve judge reviews list.");
    }
    // 2. Format the response for a clean list view
    const reviews = (data || []).map((review) => {
        const team = (review === null || review === void 0 ? void 0 : review.team) ? (Array.isArray(review.team) ? review.team[0] : review.team) : null;
        const submission = (review === null || review === void 0 ? void 0 : review.submission) ? (Array.isArray(review.submission) ? review.submission[0] : review.submission) : null;
        return {
            evaluationId: review.id,
            teamId: (team === null || team === void 0 ? void 0 : team.id) || null,
            teamName: (team === null || team === void 0 ? void 0 : team.name) || null,
            evaluationStatus: review.status, // 'draft', 'submitted'
            isLocked: review.is_locked_by_admin,
            submittedAt: review.submitted_at,
            lastUpdatedAt: review.updated_at,
            submissionStatus: (submission === null || submission === void 0 ? void 0 : submission.status) || null
        };
    });
    return reviews;
});
exports.getMyReviews = getMyReviews;
/**
 * Returns a list of hackathons (events) where the given judge has at least one assignment.
 */
const getJudgeEvents = (judgeId) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Find distinct hackathon_ids from JudgeAssignments for this judge
    const { data: assignRows, error: assignErr } = yield supabaseClient_1.supabase
        .from('JudgeAssignments')
        .select('hackathon_id')
        .eq('judge_id', judgeId);
    if (assignErr) {
        console.error('Service Error [getJudgeEvents - assignments]:', assignErr.message);
        throw new Error('Failed to retrieve judge assignments.');
    }
    const hackathonIds = Array.from(new Set((assignRows || []).map((r) => r.hackathon_id).filter(Boolean)));
    if (hackathonIds.length === 0)
        return [];
    // 2. Fetch Hackathon details
    const { data: hackathons, error: hackErr } = yield supabaseClient_1.supabase
        .from('Hackathons')
        .select('id, name, slug, status, submission_deadline')
        .in('id', hackathonIds);
    if (hackErr) {
        console.error('Service Error [getJudgeEvents - hackathons]:', hackErr.message);
        throw new Error('Failed to retrieve hackathon details.');
    }
    return hackathons || [];
});
exports.getJudgeEvents = getJudgeEvents;
