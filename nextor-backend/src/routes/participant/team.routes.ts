import { Router } from "express";
import { createTeam, joinTeam, getMyTeam, getMyTeams, getMyInvitations, acceptInvite, getAllTeamMembers, getMyTeamMembers, removeMember, sendNewInvite, updateTeamDetailsController, getTeamDetailsController, checkInviteStatus } from "../../controllers/participant/team.controller";
import { verifyAuthToken } from "../../middlewares/authMiddleware";
import { requireRole } from "../../middlewares/roleMiddleware";
import { requireHackathonId } from "../../middlewares/requireHackathon.middleware";
import { requireParticipantScope } from "../../middlewares/requireParticipantScope.middleware";

const router = Router();

// Public invite-check route (no auth required) - placed before auth middleware
router.get('/invite/check/:token', checkInviteStatus);

// Apply authentication to all other team routes
router.use(verifyAuthToken);
// Public participant-level listing routes that should NOT require a hackathon scope
router.get('/my-teams', verifyAuthToken, getMyTeams);
router.get('/invitations', verifyAuthToken, getMyInvitations);
// Allow participants or admins/judges to fetch team details without requiring x-hackathon-id
router.get('/my-details', verifyAuthToken, getTeamDetailsController);
router.get('/:teamId', verifyAuthToken, getTeamDetailsController);
// NOTE: We register real handlers after imports are updated in controller file.
router.use(requireHackathonId);

// Create a team (Any participant can do this, provided they aren't in a team)
router.post("/", requireRole(['participant']), requireHackathonId, createTeam);

// Join a team using a code
router.post("/join", requireRole(['participant']), requireHackathonId, joinTeam);

// 3. updateTeamDetails (PATCH)
router.patch("/update", requireRole(['participant']), requireHackathonId, requireParticipantScope, updateTeamDetailsController);

// Get my current team details
// router.get("/my-team", getMyTeam);

// 4. addTeamMember (POST /member/add)
router.post("/member/add", requireRole(['participant']), requireHackathonId, requireParticipantScope, sendNewInvite); 
router.post("/accept-invite", requireRole(['participant']), requireHackathonId, acceptInvite);

// Team CRUD Management Routes
// Provide a dedicated route for the current user's team members to avoid 'me' being interpreted as a UUID
router.get("/me/members", requireRole(['participant', 'admin', 'judge']), requireHackathonId, getMyTeamMembers);

router.get("/:teamId/members", requireRole(['participant', 'admin', 'judge']), getAllTeamMembers); // Read
// router.post("/:teamId/remove-member", requireRole(['participant']), removeMember); // Delete

// 5. removeTeamMember (DELETE /member/remove) - Changing method and URL structure
router.delete("/:teamId/member/remove", requireRole(['participant']), requireHackathonId, requireParticipantScope, removeMember);

// getTeamDetails
// GET /api/team (for participant's own team)
router.get("/my-details", getTeamDetailsController);
// GET /api/team/:teamId (for admin lookup) 
router.get("/:teamId", getTeamDetailsController); 

export default router;