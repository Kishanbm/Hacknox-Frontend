import { Response } from "express";
import { supabase } from "../../lib/supabaseClient";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { 
    createJudgeAccount, 
    getJudgesList, 
    updateJudgeAccount,
    deleteJudgeAccount,
    getTeamsListAdmin,
    getTeamProfileAdmin,
    updateTeamAdmin, 
    verifyTeamAdmin,
    getJudgeAssignments,
    assignTeamsToJudges,
    reassignTeam,
    autoBalanceAssignments,
    getSubmissionsPanel,
    getSubmissionDetailAdmin,
    changeSubmissionStatus,
    generateSubmissionDownloadUrl,
    aggregateJudgeScores,
    computeFinalLeaderboard,
    getInternalLeaderboard,
    publishLeaderboardToggle,
    createAnnouncement,
    sendAnnouncementNow,
    scheduleAnnouncement,
    getAnnouncementsList,
    getAnalyticsOverview,
    getAnalyticsDetail,
    getStateCollegeBreakdown,
    getAuditLogs,
    getPlatformSettings,
    updatePlatformSettings,
    logAdminAudit,
    exportTeamsData

} from "../../services/admin/admin.service";

// ------------------------------------------------------------------
// POST /api/admin/judge (Create Judge Account)
// ------------------------------------------------------------------
export const createJudgeController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const { email, firstName, lastName } = req.body;
        
        if (!email || !firstName || !lastName) {
            return res.status(400).json({ message: "Email, first name, and last name are required." });
        }

        // Pass active hackathon (if any) so the created judge is auto-assigned
        const hackathonId = (req as any).hackathonId || null;
        const newJudge = await createJudgeAccount(email, firstName, lastName, hackathonId); // [cite: 46]

        // Note: Judges are linked to hackathons through team assignments (JudgeAssignments table requires team_id)
        // The judge will appear in hackathon-scoped lists after being assigned to at least one team

        // Best-effort audit log for judge creation
        try {
            await logAdminAudit(req.user?.id || null, 'CREATE_JUDGE', { judgeId: newJudge?.id || null, email }, hackathonId);
        } catch (e) {
            console.warn('[createJudgeController] audit log failed:', (e as any)?.message || e);
        }

        return res.status(201).json({
            message: "Judge account created successfully. Assign judge to teams to make them visible in hackathon-scoped views.",
            judge: newJudge,
            note: "Judge will appear in this hackathon after team assignment"
        });

    } catch (error: any) {
        console.error("Controller Error [createJudgeController]:", error.message);
        // Handle unique constraint error from service
        if (error.message.includes("already exists")) {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server Error" });
    }
};

// ------------------------------------------------------------------
// GET /api/admin/judges (Get Judges List)
// ------------------------------------------------------------------
export const getJudgesListController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        
        // Use middleware-attached hackathonId if present. This allows the
        // admin judges listing to be scoped to the selected hackathon.
        const hackathonId = (req as any).hackathonId;
        const { judges, totalCount } = await getJudgesList(page, limit, hackathonId); // [cite: 38]

        return res.status(200).json({
            message: "Judges list retrieved successfully.",
            judges: judges,
            page,
            limit,
            totalCount,
            returnedHackathonId: hackathonId || null
        });

    } catch (error: any) {
        console.error("Controller Error [getJudgesListController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
};

// ------------------------------------------------------------------
// PATCH /api/admin/judge/:judgeId (Update Judge Account)
// ------------------------------------------------------------------
export const updateJudgeController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const judgeId = req.params.judgeId;
        const payload = req.body;
        
        if (!judgeId) {
             return res.status(400).json({ message: "Judge ID is required for update." });
        }
        
        const updatedJudge = await updateJudgeAccount(judgeId, payload); // [cite: 49]

        // Best-effort audit log for judge update
        try {
            await logAdminAudit(req.user?.id || null, 'UPDATE_JUDGE', { judgeId, changes: payload }, (req as any).hackathonId || null);
        } catch (e) {
            console.warn('[updateJudgeController] audit log failed:', (e as any)?.message || e);
        }

        return res.status(200).json({
            message: "Judge account updated successfully.",
            judge: updatedJudge
        });

    } catch (error: any) {
        console.error("Controller Error [updateJudgeController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// ------------------------------------------------------------------
// DELETE /api/admin/judge/:judgeId (Delete/Deactivate Judge Account)
// ------------------------------------------------------------------
export const deleteJudgeController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const judgeId = req.params.judgeId;
        // Determine delete type: soft delete is preferred. Default to soft.
        const type = (req.query.type as string)?.toLowerCase() === 'hard' ? 'hard' : 'soft';
        
        if (!judgeId) {
             return res.status(400).json({ message: "Judge ID is required for deletion." });
        }
        
        const result = await deleteJudgeAccount(judgeId, type as 'soft' | 'hard'); // [cite: 54, 56]

        // Best-effort audit log for judge deletion/deactivation
        try {
            await logAdminAudit(req.user?.id || null, 'DELETE_JUDGE', { judgeId, type }, (req as any).hackathonId || null);
        } catch (e) {
            console.warn('[deleteJudgeController] audit log failed:', (e as any)?.message || e);
        }

        return res.status(200).json(result);

    } catch (error: any) {
        console.error("Controller Error [deleteJudgeController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
};

// --- TEAM MANAGEMENT CONTROLLERS ---

// ------------------------------------------------------------------
// GET /api/admin/teams (Get Teams List)
// ------------------------------------------------------------------
export const getTeamsListController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const filters = { status: req.query.status as string };
        const search = req.query.search as string || '';

        // Use middleware-attached hackathonId only
        const hackathonId = (req as any).hackathonId;

        const { teams, totalCount } = await getTeamsListAdmin(page, limit, filters, search, hackathonId);

        return res.status(200).json({
            message: "Teams list retrieved successfully.",
            teams: teams,
            page,
            limit,
            totalCount
        });

    } catch (error: any) {
        console.error("Controller Error [getTeamsListController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
};

// ------------------------------------------------------------------
// GET /api/admin/team/:teamId (Get Team Profile)
// ------------------------------------------------------------------
export const getTeamProfileAdminController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const teamId = req.params.teamId;
        
        if (!teamId) {
             return res.status(400).json({ message: "Team ID is required." });
        }
        
        const hackathonId = (req as any).hackathonId;
        const teamProfile = await getTeamProfileAdmin(teamId, hackathonId); //
        
            // If scoped lookup failed (possibly because the selected hackathon id
            // doesn't match the team's hackathon), attempt a fallback lookup
            // without the hackathon filter so admins can still inspect the team.
            let finalTeam = teamProfile;
            if (!finalTeam && hackathonId) {
                try {
                    const fallback = await getTeamProfileAdmin(teamId, undefined);
                    if (fallback) {
                        console.warn(`Admin lookup: team ${teamId} not found for hackathon ${hackathonId}, returning unscoped team.`);
                        finalTeam = fallback;
                    }
                } catch (err) {
                    // ignore fallback errors; original behavior will return 404
                }
            }

            if (!finalTeam) {
                // Debug: check whether a Teams row exists for this id and which hackathon_id it belongs to.
                try {
                    const { data: rows, error: lookupErr } = await supabase
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
                } catch (lookupEx: any) {
                    console.error('Debug Team Lookup Exception:', lookupEx.message || lookupEx);
                    return res.status(404).json({ message: "Team not found." });
                }
            }

        return res.status(200).json({
            message: "Team profile retrieved successfully.",
            team: finalTeam
        });

    } catch (error: any) {
        console.error("Controller Error [getTeamProfileAdminController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// ------------------------------------------------------------------
// PATCH /api/admin/team/:teamId (Admin Update Team Details)
// ------------------------------------------------------------------
export const updateTeamAdminController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const teamId = req.params.teamId;
        const payload = req.body;
        
        if (!teamId) {
             return res.status(400).json({ message: "Team ID is required for update." });
        }
        
        const hackathonId = (req as any).hackathonId;
        const updatedTeam = await updateTeamAdmin(teamId, payload, hackathonId); 

        // Log audit event (best-effort)
        try {
            await logAdminAudit(req.user?.id || null, 'UPDATE_TEAM', { teamId, changes: payload }, hackathonId || null);
        } catch (e) {}

        return res.status(200).json({
            message: "Team details updated successfully by Admin.",
            team: updatedTeam
        });

    } catch (error: any) {
        console.error("Controller Error [updateTeamAdminController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// ------------------------------------------------------------------
// POST /api/admin/team/:teamId/verify (Admin Verify Team)
// ------------------------------------------------------------------
export const verifyTeamAdminController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const teamId = req.params.teamId;
        const adminId = req.user!.id; // Use authenticated admin ID for logging
        const { action } = req.body; // Expects action: 'approve' or 'reject'
        
        if (!teamId || !action) {
             return res.status(400).json({ message: "Team ID and 'action' (approve/reject) are required." });
        }

        if (action !== 'approve' && action !== 'reject') {
            return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'." });
        }

        const hackathonId = (req as any).hackathonId;
        const updatedTeam = await verifyTeamAdmin(teamId, action, adminId, hackathonId); 

        // Log audit event (best-effort)
        try {
            await logAdminAudit(adminId || null, 'VERIFY_TEAM', { teamId, action }, hackathonId || null);
        } catch (e) {}

        return res.status(200).json({
            message: `Team verification status successfully set to ${updatedTeam.verification_status}.`,
            team: updatedTeam
        });

    } catch (error: any) {
        console.error("Controller Error [verifyTeamAdminController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// ------------------------------------------------------------------
// GET /api/admin/judge-assignments (Get Assignment Matrix)
// ------------------------------------------------------------------
export const getJudgeAssignmentsController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const hackathonId = (req as any).hackathonId;
        const assignmentMatrix = await getJudgeAssignments(hackathonId); 

        // Note: read-only fetch — no audit log created here.
        return res.status(200).json({
            message: "Judge assignment matrix retrieved successfully.",
            assignmentMatrix: assignmentMatrix,
            totalJudges: assignmentMatrix.length
        });

    } catch (error: any) {
        console.error("Controller Error [getJudgeAssignmentsController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// ------------------------------------------------------------------
// POST /api/admin/assignments/assign (Assign Teams to Judges)
// ------------------------------------------------------------------
export const assignTeamsToJudgesController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
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
        
        const hackathonId = (req as any).hackathonId;
        const newAssignments = await assignTeamsToJudges(assignments, hackathonId); 

        // Audit log for assignments (best-effort)
        try {
            await logAdminAudit(req.user?.id || null, 'ASSIGN_TEAMS', { created: newAssignments }, hackathonId || null);
        } catch (e) {
            console.warn('[assignTeamsToJudgesController] audit log failed:', (e as any)?.message || e);
        }

        return res.status(200).json({
            message: `${newAssignments.length} new assignments created successfully.`,
            assignments: newAssignments
        });

    } catch (error: any) {
        console.error("Controller Error [assignTeamsToJudgesController]:", error.message);
        // Map the assignment conflict error to 409
        if (error.message.includes("conflict")) {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// ------------------------------------------------------------------
// POST /api/admin/assignments/reassign (Reassign a Single Team)
// ------------------------------------------------------------------
export const reassignTeamController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const { teamId, oldJudgeId, newJudgeId } = req.body;
        
        if (!teamId || !oldJudgeId || !newJudgeId) {
            return res.status(400).json({ message: "teamId, oldJudgeId, and newJudgeId are required." });
        }
        
        const hackathonId = (req as any).hackathonId;
        const result = await reassignTeam(teamId, oldJudgeId, newJudgeId, hackathonId); 

        // Audit log for reassign
        try {
            await logAdminAudit(req.user?.id || null, 'REASSIGN_TEAM', { teamId, from: oldJudgeId, to: newJudgeId, assignment: result.newAssignment }, hackathonId || null);
        } catch (e) {
            console.warn('[reassignTeamController] audit log failed:', (e as any)?.message || e);
        }

        return res.status(200).json({
            message: `Team ${teamId} successfully reassigned from Judge ${oldJudgeId} to Judge ${newJudgeId}.`,
            assignment: result.newAssignment
        });

    } catch (error: any) {
        console.error("Controller Error [reassignTeamController]:", error.message);
        // Map the conflict error from the internal assignTeamsToJudges call to 409
        if (error.message.includes("conflict")) {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};


// ------------------------------------------------------------------
// POST /api/admin/assignments/auto-balance (Algorithmic Rebalance)
// ------------------------------------------------------------------
export const autoBalanceAssignmentsController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        // NOTE: This operation is often guarded by a confirmation modal in the UI
        const hackathonId = (req as any).hackathonId;
        const result = await autoBalanceAssignments(hackathonId); 

        // Audit log for auto-balance operation
        try {
            await logAdminAudit(req.user?.id || null, 'AUTO_BALANCE_ASSIGNMENTS', { result }, hackathonId || null);
        } catch (e) {
            console.warn('[autoBalanceAssignmentsController] audit log failed:', (e as any)?.message || e);
        }

        return res.status(200).json(result);

    } catch (error: any) {
        console.error("Controller Error [autoBalanceAssignmentsController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// --- SUBMISSIONS MANAGEMENT CONTROLLERS ---

// ------------------------------------------------------------------
// GET /api/admin/submissions (Get Submissions Panel)
// ------------------------------------------------------------------
export const getSubmissionsPanelController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const filters = { status: req.query.status as string };
        const hackathonId = (req as any).hackathonId;

        const { submissions, totalCount } = await getSubmissionsPanel(page, limit, filters, hackathonId); 

        return res.status(200).json({
            message: "Submissions list retrieved successfully.",
            submissions: submissions,
            page,
            limit,
            totalCount
        });

    } catch (error: any) {
        console.error("Controller Error [getSubmissionsPanelController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
};

// ------------------------------------------------------------------
// GET /api/admin/submission/:submissionId (Get Submission Detail)
// ------------------------------------------------------------------
export const getSubmissionDetailAdminController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const submissionId = req.params.submissionId;
        
        if (!submissionId) {
             return res.status(400).json({ message: "Submission ID is required." });
        }
        
        const hackathonId = (req as any).hackathonId;
        const submissionDetail = await getSubmissionDetailAdmin(submissionId, hackathonId); 

        if (!submissionDetail) {
            return res.status(404).json({ message: "Submission not found." });
        }

        return res.status(200).json({
            message: "Submission details retrieved successfully.",
            submission: submissionDetail
        });

    } catch (error: any) {
        console.error("Controller Error [getSubmissionDetailAdminController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};


// ------------------------------------------------------------------
// PATCH /api/admin/submission/:submissionId/status (Change Status)
// ------------------------------------------------------------------
export const changeSubmissionStatusController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const submissionId = req.params.submissionId;
        const { status: newStatus, adminNote } = req.body;

        // Debug logging: show incoming payload for diagnosis
        console.debug("Controller [changeSubmissionStatusController] received body:", req.body);
        
        if (!submissionId || !newStatus) {
             return res.status(400).json({ message: "Submission ID and new status are required." });
        }
        
        const hackathonId = (req as any).hackathonId;
        const updatedSubmission = await changeSubmissionStatus(submissionId, newStatus, adminNote, hackathonId); 

        // Attempt to write an audit log (best-effort, do not block the response on failure)
        try {
            const teamObj = updatedSubmission && updatedSubmission.team ? (Array.isArray(updatedSubmission.team) ? updatedSubmission.team[0] : updatedSubmission.team) : null;
            logAdminAudit(req.user?.id || null, 'CHANGE_SUBMISSION_STATUS', {
                submissionId,
                newStatus: updatedSubmission.status,
                adminNote: adminNote || null,
                teamId: teamObj ? teamObj.id : null,
                title: updatedSubmission.title || null
            }, hackathonId || null).catch((e: any) => console.warn('[changeSubmissionStatusController] audit log failed:', e?.message || e));
        } catch (e: any) {
            console.warn('[changeSubmissionStatusController] unexpected audit log error:', e?.message || e);
        }

        return res.status(200).json({
            message: `Submission status updated to ${updatedSubmission.status}.`,
            submission: updatedSubmission
        });

    } catch (error: any) {
        console.error("Controller Error [changeSubmissionStatusController]:", error.message);
        // Handle invalid status error
        if (error.message.includes("Invalid status")) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// ------------------------------------------------------------------
// GET /api/admin/submission/:submissionId/download (Generate Signed URL)
// ------------------------------------------------------------------
export const downloadSubmissionController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const submissionId = req.params.submissionId;
        
        if (!submissionId) {
             return res.status(400).json({ message: "Submission ID is required." });
        }
        
        const hackathonId = (req as any).hackathonId;
        const signedUrl = await generateSubmissionDownloadUrl(submissionId, hackathonId); 

        return res.status(200).json({
            message: "Signed download URL generated successfully.",
            downloadUrl: signedUrl
        });

    } catch (error: any) {
        console.error("Controller Error [downloadSubmissionController]:", error.message);
        // Handle file path missing error
        if (error.message.includes("file path is missing")) {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// --- SCORING & LEADERBOARD CONTROLLERS ---

// ------------------------------------------------------------------
// POST /api/admin/scores/aggregate (Aggregate Scores)
// ------------------------------------------------------------------
export const aggregateScoresController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const hackathonId = (req as any).hackathonId;
        const result = await aggregateJudgeScores(hackathonId); 

        return res.status(200).json(result);

    } catch (error: any) {
        console.error("Controller Error [aggregateScoresController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// ------------------------------------------------------------------
// POST /api/admin/scores/compute-leaderboard (Compute Final Leaderboard)
// ------------------------------------------------------------------
export const computeLeaderboardController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const hackathonId = (req as any).hackathonId;
        const result = await computeFinalLeaderboard(hackathonId); 

        return res.status(200).json(result);

    } catch (error: any) {
        console.error("Controller Error [computeLeaderboardController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// --- LEADERBOARD DISPLAY & CONTROL CONTROLLERS ---

// ------------------------------------------------------------------
// GET /api/admin/leaderboard (Internal View with Pagination)
// ------------------------------------------------------------------
export const getInternalLeaderboardController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        
        // Pass all relevant filters from the query string
        const filters = {
            teamName: req.query.teamName as string,
            category: req.query.category as string,
        };

        // Parse optional isPublished query param: supports 'true'|'false' or omitted
        let isPublishedFilter: boolean | undefined = undefined;
        const isPublishedQ = req.query.isPublished as string | undefined;
        if (typeof isPublishedQ === 'string') {
            if (isPublishedQ === 'true') isPublishedFilter = true;
            else if (isPublishedQ === 'false') isPublishedFilter = false;
        }

        const hackathonId = (req as any).hackathonId;
        const result = await getInternalLeaderboard(page, limit, filters, isPublishedFilter, hackathonId);

        return res.status(200).json({
            message: "Internal leaderboard retrieved successfully.",
            leaderboard: result
        });

    } catch (error: any) {
        console.error("Controller Error [getInternalLeaderboardController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// ------------------------------------------------------------------
// POST /api/admin/leaderboard/publish (Toggle Publishing Status)
// ------------------------------------------------------------------
export const publishLeaderboardToggleController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const { isPublished } = req.body;
        const adminId = req.user?.id;
        
        if (typeof isPublished !== 'boolean') {
             return res.status(400).json({ message: "The 'isPublished' boolean field is required." });
        }
        
        const hackathonId = (req as any).hackathonId;
        const result = await publishLeaderboardToggle(isPublished, adminId, hackathonId);

        // Audit log for leaderboard publish toggle
        try {
            await logAdminAudit(adminId || null, 'PUBLISH_LEADERBOARD_TOGGLE', { isPublished }, hackathonId || null);
        } catch (e) {
            console.warn('[publishLeaderboardToggleController] audit log failed:', (e as any)?.message || e);
        }

        return res.status(200).json({
            message: `Leaderboard status successfully set to ${isPublished ? 'PUBLISHED' : 'UNPUBLISHED'}.`,
            isPublished: result.isPublished
        });

    } catch (error: any) {
        console.error("Controller Error [publishLeaderboardToggleController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// --- ANNOUNCEMENTS CONTROLLERS ---

// ------------------------------------------------------------------
// POST /api/admin/announcements (Create Announcement)
// ------------------------------------------------------------------
export const createAnnouncementController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const adminId = req.user?.id;
        if (!adminId) return res.status(401).json({ message: 'Unauthorized' });
        const { title, content, targetCriteria, scheduledAt } = req.body;
        const hackathonId = (req as any).hackathonId;

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required." });
        }

        const announcement = await createAnnouncement(adminId, title, content, targetCriteria || {}, scheduledAt, hackathonId);

        // Audit log for announcement creation
        try {
            await logAdminAudit(adminId || null, 'CREATE_ANNOUNCEMENT', { announcementId: announcement?.id || null, title }, hackathonId || null);
        } catch (e) {
            console.warn('[createAnnouncementController] audit log failed:', (e as any)?.message || e);
        }

        return res.status(201).json({
            message: "Announcement created successfully.",
            announcement
        });

    } catch (error: any) {
        console.error("Controller Error [createAnnouncementController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// ------------------------------------------------------------------
// POST /api/admin/announcements/send (Send Announcement Immediately)
// ------------------------------------------------------------------
export const sendAnnouncementNowController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const { announcementId } = req.body;

        if (!announcementId) {
            return res.status(400).json({ message: "Announcement ID is required." });
        }

        const result = await sendAnnouncementNow(announcementId);

        // Audit log for sending announcement now
        try {
            await logAdminAudit(req.user?.id || null, 'SEND_ANNOUNCEMENT_NOW', { announcementId }, (req as any).hackathonId || null);
        } catch (e) {
            console.warn('[sendAnnouncementNowController] audit log failed:', (e as any)?.message || e);
        }

        return res.status(200).json(result);

    } catch (error: any) {
        console.error("Controller Error [sendAnnouncementNowController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// --- ANNOUNCEMENTS CONTROLLERS (Continued) ---

// ------------------------------------------------------------------
// POST /api/admin/announcements/schedule (Schedule Announcement)
// ------------------------------------------------------------------
export const scheduleAnnouncementController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const { announcementId, scheduledAt } = req.body;

        if (!announcementId || !scheduledAt) {
            return res.status(400).json({ message: "Announcement ID and scheduled time are required." });
        }

        const result = await scheduleAnnouncement(announcementId, scheduledAt);

        // Audit log for scheduling announcement
        try {
            await logAdminAudit(req.user?.id || null, 'SCHEDULE_ANNOUNCEMENT', { announcementId, scheduledAt }, (req as any).hackathonId || null);
        } catch (e) {
            console.warn('[scheduleAnnouncementController] audit log failed:', (e as any)?.message || e);
        }

        return res.status(200).json({
            message: `Announcement successfully scheduled for ${scheduledAt}.`,
            announcement: result
        });

    } catch (error: any) {
        console.error("Controller Error [scheduleAnnouncementController]:", error.message);
        return res.status(400).json({ message: error.message });
    }
};

// ------------------------------------------------------------------
// GET /api/admin/announcements (List Announcements)
// ------------------------------------------------------------------
export const getAnnouncementsListController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const hackathonId = (req as any).hackathonId;

        const result = await getAnnouncementsList(page, limit, hackathonId);

        return res.status(200).json({
            message: "Announcements retrieved successfully.",
            ...result
        });

    } catch (error: any) {
        console.error("Controller Error [getAnnouncementsListController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
};

// --- ANALYTICS CONTROLLERS ---

// ------------------------------------------------------------------
// GET /api/admin/analytics/overview
// ------------------------------------------------------------------
export const getAnalyticsOverviewController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const hackathonId = (req as any).hackathonId || undefined;
        const overview = await getAnalyticsOverview(hackathonId);
        return res.status(200).json(overview);
    } catch (error: any) {
        console.error("Controller Error [getAnalyticsOverviewController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// ------------------------------------------------------------------
// GET /api/admin/analytics/detail
// ------------------------------------------------------------------
export const getAnalyticsDetailController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        // Filters are passed via query parameters
        const filters = {
            city: req.query.city as string,
            college: req.query.college as string,
            dateRange: {
                start: req.query.start as string,
                end: req.query.end as string,
            }
        };
        const hackathonId = (req as any).hackathonId || undefined;
        (filters as any).hackathonId = hackathonId;
        const detail = await getAnalyticsDetail(filters as any);
        return res.status(200).json(detail);
    } catch (error: any) {
        console.error("Controller Error [getAnalyticsDetailController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// ------------------------------------------------------------------
// GET /api/admin/overview/breakdown
// ------------------------------------------------------------------
export const getStateCollegeBreakdownController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const hackathonId = (req as any).hackathonId || undefined;
        const breakdown = await getStateCollegeBreakdown(hackathonId);
        return res.status(200).json(breakdown);
    } catch (error: any) {
        console.error("Controller Error [getStateCollegeBreakdownController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
    
};


// --- SETTINGS & AUDIT CONTROLLERS ---

// ------------------------------------------------------------------
// GET /api/admin/settings
// ------------------------------------------------------------------
export const getPlatformSettingsController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const settings = await getPlatformSettings();
        return res.status(200).json(settings);
    } catch (error: any) {
        console.error("Controller Error [getPlatformSettingsController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
};

// ------------------------------------------------------------------
// PATCH /api/admin/settings
// ------------------------------------------------------------------
export const updatePlatformSettingsController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const adminId = req.user?.id;
        if (!adminId) return res.status(401).json({ message: 'Unauthorized' });
        const updates = req.body; // e.g., { "is_registration_open": false }

        // Basic validation: ensure at least one field is provided
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No settings provided to update." });
        }

        const updated = await updatePlatformSettings(adminId, updates);

        // Audit log for platform settings update (include hackathon if present)
        try {
            await logAdminAudit(adminId || null, 'UPDATE_PLATFORM_SETTINGS', { updates }, (req as any).hackathonId || null);
        } catch (e) {
            console.warn('[updatePlatformSettingsController] audit log failed:', (e as any)?.message || e);
        }

        return res.status(200).json({
            message: "Settings updated successfully.",
            settings: updated
        });

    } catch (error: any) {
        console.error("Controller Error [updatePlatformSettingsController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// ------------------------------------------------------------------
// GET /api/admin/settings/audit-logs
// ------------------------------------------------------------------
export const getAuditLogsController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const hackathonId = (req as any).hackathonId || undefined;
        const result = await getAuditLogs(page, limit, hackathonId);

        return res.status(200).json(result);

    } catch (error: any) {
        console.error("Controller Error [getAuditLogsController]:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
};

// ------------------------------------------------------------------
// GET /api/admin/teams/export
// ------------------------------------------------------------------
export const exportTeamsCSVController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const filters: any = { ...req.query };
        const hackathonId = (req as any).hackathonId || undefined;
        if (hackathonId) filters.hackathonId = hackathonId;

        const exportData = await exportTeamsData(filters);

        if (exportData.length === 0) {
            return res.status(204).send("No teams found matching the specified filters.");
        }
        
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const filename = `hackathon_teams_export_${timestamp}.csv`;

        // Inline CSV generation to avoid relying on external middleware
        const keys = Object.keys(exportData[0] || {});
        const escapeCell = (val: any) => {
            if (val === null || val === undefined) return '';
            const s = String(val);
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                return '"' + s.replace(/"/g, '""') + '"';
            }
            return s;
        };

        const header = keys.join(',');
        const rows = exportData.map((row: any) => keys.map((k: string) => escapeCell(row[k])).join(','));
        const csv = [header].concat(rows).join('\r\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(csv);

    } catch (error: any) {
        console.error("Controller Error [exportTeamsCSVController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};