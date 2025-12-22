"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submission_controller_1 = require("../../controllers/participant/submission.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const roleMiddleware_1 = require("../../middlewares/roleMiddleware");
const requireHackathon_middleware_1 = require("../../middlewares/requireHackathon.middleware");
const requireParticipantScope_middleware_1 = require("../../middlewares/requireParticipantScope.middleware");
const router = (0, express_1.Router)();
// Apply base security: must be logged in and must be a participant
router.use(authMiddleware_1.verifyAuthToken);
router.use((0, roleMiddleware_1.requireRole)(["participant"]));
router.use(requireHackathon_middleware_1.requireHackathonId);
// Create/Update Draft
router.post("/", requireParticipantScope_middleware_1.requireParticipantScope, submission_controller_1.uploadMiddleware, submission_controller_1.handleSubmissionDraft);
// Finalize Submission
router.put("/:id/finalize", requireParticipantScope_middleware_1.requireParticipantScope, submission_controller_1.finalizeSubmission);
// GET and PATCH routes need to be accessible to Admins/Judges as well as Participants
router.get("/:id", authMiddleware_1.verifyAuthToken, submission_controller_1.getSubmissionDetails);
router.patch("/:id", requireParticipantScope_middleware_1.requireParticipantScope, submission_controller_1.updateSubmissionDetailsController); // PATCH /api/submissions/:id
exports.default = router;
