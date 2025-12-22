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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubmissionDetailsController = exports.getSubmissionDetails = exports.finalizeSubmission = exports.handleSubmissionDraft = exports.uploadMiddleware = void 0;
const submission_service_1 = require("../../services/participant/submission.service");
const supabaseClient_1 = require("../../lib/supabaseClient");
const multer_1 = __importDefault(require("multer"));
const file_service_1 = require("../../services/file.service");
const file_util_1 = require("../../utils/file.util");
const deadline_util_1 = require("../../utils/deadline.util");
// --- MULTER SETUP ---
// Multer configuration for in-memory storage (allowing us to get the buffer for AV scan)
const storage = multer_1.default.memoryStorage();
exports.uploadMiddleware = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
}).single('zipFile'); // Assuming the frontend field name is 'zipFile'
const getTeamMembershipDetails = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Find the team the user belongs to
    const { data: membership } = yield supabaseClient_1.supabase
        .from("TeamMembers")
        .select("team_id")
        .eq("user_id", userId)
        .maybeSingle();
    if (!membership)
        return null;
    // 2. Get the Leader ID for that team
    const { data: team } = yield supabaseClient_1.supabase
        .from("Teams")
        .select("leader_id")
        .eq("id", membership.team_id)
        .maybeSingle();
    if (!team)
        return null;
    return {
        teamId: membership.team_id,
        leaderId: team.leader_id
    };
});
// moved getExtension to src/utils/file.util.ts and imported above
// 1. POST /api/submissions (Create/Update Draft)
const handleSubmissionDraft = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { title, description, repoUrl } = req.body;
        const file = req.file; // Multer attached file
        const hackathonId = req.hackathonId;
        // --- DEADLINE CHECK: Prefer hackathon-specific deadline, fallback to global settings ---
        if (hackathonId) {
            const { data: hackathon } = yield supabaseClient_1.supabase.from('Hackathons').select('submission_deadline').eq('id', hackathonId).maybeSingle();
            const deadline = hackathon === null || hackathon === void 0 ? void 0 : hackathon.submission_deadline;
            if (deadline) {
                const now = new Date();
                const deadlineDate = new Date(deadline);
                if (now > deadlineDate) {
                    return res.status(403).json({ message: "Action forbidden. The submission deadline for this hackathon has passed." });
                }
            }
            else {
                // Fallback to global deadline if hackathon-specific not set
                if (yield (0, deadline_util_1.isDeadlinePassed)()) {
                    return res.status(403).json({ message: "Action forbidden. The submission deadline has passed." });
                }
            }
        }
        else {
            if (yield (0, deadline_util_1.isDeadlinePassed)()) {
                return res.status(403).json({ message: "Action forbidden. The submission deadline has passed." });
            }
        }
        // A. Security Check: Use the consolidated helper
        const details = yield getTeamMembershipDetails(userId); // returns { teamId: string, leaderId: string }
        if (!details) {
            return res.status(403).json({ message: "Forbidden. You must belong to a team to create a submission." });
        }
        if (!title) {
            return res.status(400).json({ message: "Project title is required." });
        }
        let zipStoragePath;
        if (file) {
            // A. File Validation (Adapted from Accrefin)
            const ext = (0, file_util_1.getExtension)(file.originalname);
            // Allow .zip files for submission (update if needed)
            if (ext.toLowerCase() !== '.zip') {
                return res.status(400).json({ message: "Invalid file type. Only .zip archives are permitted." });
            }
            // B. CALL FILE SERVICE FOR SCAN AND UPLOAD
            const filename = `${details.teamId}-${Date.now()}${ext}`; // Build unique filename
            // The service handles the AV scan, then the S3 upload
            const fileUrl = yield file_service_1.FileService.uploadSubmissionZip(details.teamId, filename, file.buffer, file.mimetype);
            // The file service returns the path/URL
            zipStoragePath = fileUrl;
        }
        // B. Call Service - Accessing the teamId string property
        const submissionData = {
            teamId: details.teamId, // <-- Accessing the string property
            title,
            description,
            repoUrl,
            zipStoragePath,
            hackathonId
        };
        const submission = yield (0, submission_service_1.createSubmission)(submissionData, hackathonId);
        return res.status(201).json({
            message: "Submission draft saved successfully.",
            submission
        });
    }
    catch (error) {
        // Handle specific errors from file service (AV or Upload failure)
        if (error.message.includes("FileService: buffer flagged as infected")) {
            return res.status(403).json({ message: "Upload failed: Security risk detected (Virus).", code: "VIRUS_DETECTED" });
        }
        if (error.message.includes("Upload failed")) {
            return res.status(500).json({ message: "File upload failed due to cloud storage error.", code: "STORAGE_FAILURE" });
        }
        console.error("Submission Draft Error:", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.handleSubmissionDraft = handleSubmissionDraft;
// 2. PUT /api/submissions/:id/finalize (Lock Submission)
const finalizeSubmission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const hackathonId = req.hackathonId;
        const submissionId = req.params.id;
        // A. Security Check: Find team and verify ownership / role
        const details = yield getTeamMembershipDetails(userId);
        if (!details) {
            return res.status(403).json({ message: "Forbidden. You must belong to a team to finalize submissions." });
        }
        // --- CRITICAL CHECK: ONLY LEADER CAN SUBMIT ---
        if (userId !== details.leaderId) {
            return res.status(403).json({ message: "Forbidden. Only the Team Leader can finalize the submission." });
        }
        // ---------------------------------------------
        // B. Update the submission status and record submitted_at time
        const { data: updatedSubmission, error: updateError } = yield supabaseClient_1.supabase
            .from("Submissions")
            .update({
            status: 'submitted',
            submitted_at: new Date().toISOString()
        })
            .eq("id", submissionId)
            .eq("team_id", details.teamId) // Ensure submission belongs to the user's team
            .eq("hackathon_id", hackathonId)
            .select()
            .single();
        if (updateError || !updatedSubmission) {
            return res.status(404).json({ message: "Submission not found or you do not have permission to finalize it." });
        }
        return res.status(200).json({
            message: "Submission finalized!",
            submission: updatedSubmission
        });
    }
    catch (error) {
        console.error("Submission Finalize Error:", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.finalizeSubmission = finalizeSubmission;
// 3. GET /api/submissions/:id (Get Submission Details)
const getSubmissionDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const submissionId = req.params.id;
        // Security check: Ensure user is either Admin/Judge OR a member of the team
        const details = yield getTeamMembershipDetails(req.user.id);
        const isAdminOrJudge = req.user.role !== 'participant';
        if (!isAdminOrJudge && (!details || !details.teamId)) {
            return res.status(403).json({ message: "Forbidden. You must be an admin, judge, or team member." });
        }
        const hackathonId = req.hackathonId;
        const submission = yield (0, submission_service_1.getSubmissionById)(submissionId, hackathonId);
        if (!submission) {
            return res.status(404).json({ message: "Submission not found." });
        }
        // Final security check for participants: Must be their team
        if (!isAdminOrJudge && submission.team_id !== details.teamId) {
            return res.status(403).json({ message: "Forbidden. You can only view your own team's submission." });
        }
        return res.status(200).json({ submission });
    }
    catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.getSubmissionDetails = getSubmissionDetails;
// 4. PATCH /api/submissions/:id (Update Submission Details)
const updateSubmissionDetailsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const submissionId = req.params.id;
        const updates = req.body; // Contains title, description, repoUrl, etc.
        if (yield (0, deadline_util_1.isDeadlinePassed)()) {
            return res.status(403).json({
                message: "Action forbidden. The submission deadline has passed, and submission details cannot be changed."
            });
        }
        // A. Security Check: Only Team Leaders can update submissions
        const details = yield getTeamMembershipDetails(userId);
        if (!details || userId !== details.leaderId) {
            return res.status(403).json({ message: "Forbidden. Only the Team Leader can update submission details." });
        }
        // B. Check Submission Status: Cannot edit finalized submissions
        const hackathonId = req.hackathonId;
        const { data: currentSubmission } = yield supabaseClient_1.supabase
            .from("Submissions")
            .select("status")
            .eq("id", submissionId)
            .eq("hackathon_id", hackathonId)
            .single();
        if ((currentSubmission === null || currentSubmission === void 0 ? void 0 : currentSubmission.status) === 'submitted') {
            return res.status(403).json({ message: "Cannot edit a finalized submission." });
        }
        // C. Call Service
        const updatedSubmission = yield (0, submission_service_1.updateSubmissionDetails)(submissionId, details.teamId, updates, hackathonId);
        return res.status(200).json({
            message: "Submission updated successfully.",
            submission: updatedSubmission
        });
    }
    catch (error) {
        if (error.message.includes("Submission not found")) {
            return res.status(404).json({ message: "Submission not found or permission denied." });
        }
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.updateSubmissionDetailsController = updateSubmissionDetailsController;
