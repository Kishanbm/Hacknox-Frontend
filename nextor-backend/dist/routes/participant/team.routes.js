"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const team_controller_1 = require("../../controllers/participant/team.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const roleMiddleware_1 = require("../../middlewares/roleMiddleware");
const requireHackathon_middleware_1 = require("../../middlewares/requireHackathon.middleware");
const requireParticipantScope_middleware_1 = require("../../middlewares/requireParticipantScope.middleware");
const router = (0, express_1.Router)();
// Public invite-check route (no auth required) - placed before auth middleware
router.get('/invite/check/:token', team_controller_1.checkInviteStatus);
// Apply authentication to all other team routes
router.use(authMiddleware_1.verifyAuthToken);
router.use(requireHackathon_middleware_1.requireHackathonId);
// Create a team (Any participant can do this, provided they aren't in a team)
router.post("/", (0, roleMiddleware_1.requireRole)(['participant']), requireHackathon_middleware_1.requireHackathonId, team_controller_1.createTeam);
// Join a team using a code
router.post("/join", (0, roleMiddleware_1.requireRole)(['participant']), requireHackathon_middleware_1.requireHackathonId, team_controller_1.joinTeam);
// 3. updateTeamDetails (PATCH)
router.patch("/update", (0, roleMiddleware_1.requireRole)(['participant']), requireHackathon_middleware_1.requireHackathonId, requireParticipantScope_middleware_1.requireParticipantScope, team_controller_1.updateTeamDetailsController);
// Get my current team details
// router.get("/my-team", getMyTeam);
// 4. addTeamMember (POST /member/add)
router.post("/member/add", (0, roleMiddleware_1.requireRole)(['participant']), requireHackathon_middleware_1.requireHackathonId, requireParticipantScope_middleware_1.requireParticipantScope, team_controller_1.sendNewInvite);
router.post("/accept-invite", (0, roleMiddleware_1.requireRole)(['participant']), requireHackathon_middleware_1.requireHackathonId, team_controller_1.acceptInvite);
// Team CRUD Management Routes
// Provide a dedicated route for the current user's team members to avoid 'me' being interpreted as a UUID
router.get("/me/members", (0, roleMiddleware_1.requireRole)(['participant', 'admin', 'judge']), requireHackathon_middleware_1.requireHackathonId, team_controller_1.getMyTeamMembers);
router.get("/:teamId/members", (0, roleMiddleware_1.requireRole)(['participant', 'admin', 'judge']), team_controller_1.getAllTeamMembers); // Read
// router.post("/:teamId/remove-member", requireRole(['participant']), removeMember); // Delete
// 5. removeTeamMember (DELETE /member/remove) - Changing method and URL structure
router.delete("/:teamId/member/remove", (0, roleMiddleware_1.requireRole)(['participant']), requireHackathon_middleware_1.requireHackathonId, requireParticipantScope_middleware_1.requireParticipantScope, team_controller_1.removeMember);
// getTeamDetails
// GET /api/team (for participant's own team)
router.get("/my-details", team_controller_1.getTeamDetailsController);
// GET /api/team/:teamId (for admin lookup) 
router.get("/:teamId", team_controller_1.getTeamDetailsController);
exports.default = router;
