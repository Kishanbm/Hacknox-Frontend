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
exports.checkInviteStatus = exports.getTeamDetailsController = exports.updateTeamDetailsController = exports.getMyTeamMembers = exports.getAllTeamMembers = exports.removeMember = exports.acceptInvite = exports.sendNewInvite = exports.getMyTeam = exports.joinTeam = exports.createTeam = void 0;
const crypto_1 = __importDefault(require("crypto"));
const supabaseClient_1 = require("../../lib/supabaseClient");
const constants_1 = require("../../constants");
const team_service_1 = require("../../services/participant/team.service");
// 1. CREATE TEAM (POST /api/teams)
const createTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { name } = req.body;
        const hackathonId = req.hackathonId;
        if (!hackathonId)
            return res.status(400).json({ message: "Missing required parameter: hackathonId. Provide x-hackathon-id header (middleware required)." });
        if (!name)
            return res.status(400).json({ message: "Team name is required" });
        // A. Check if user is already in a team
        const { data: existingMembership } = yield supabaseClient_1.supabase
            .from("TeamMembers")
            .select("team_id")
            .eq("user_id", userId)
            .single();
        if (existingMembership) {
            return res.status(409).json({ message: "You are already part of a team." });
        }
        // B. Generate unique Join Code (6 characters)
        const joinCode = crypto_1.default.randomBytes(3).toString("hex").toUpperCase();
        // C. Create the Team (persist hackathon context)
        const { data: teamData, error: teamError } = yield supabaseClient_1.supabase
            .from("Teams")
            .insert([
            {
                name,
                join_code: joinCode,
                leader_id: userId,
                hackathon_id: hackathonId,
            },
        ])
            .select()
            .single();
        if (teamError) {
            // Handle unique name constraint
            if (teamError.code === '23505')
                return res.status(409).json({ message: "Team name already taken." });
            throw teamError;
        }
        // D. Add the creator as the 'Leader' in TeamMembers
        const { error: memberError } = yield supabaseClient_1.supabase
            .from("TeamMembers")
            .insert([
            {
                team_id: teamData.id,
                user_id: userId,
                // role: 'leader' // We need to add a 'role' column to TeamMembers table if we want to track this explicitly in the junction table, 
                // OR we just rely on Teams.leader_id. Let's rely on Teams.leader_id for now to keep it simple.
            }
        ]);
        if (memberError) {
            // Rollback: Delete the team if adding the member fails
            yield supabaseClient_1.supabase.from("Teams").delete().eq("id", teamData.id);
            throw memberError;
        }
        return res.status(201).json({
            message: "Team created successfully!",
            team: teamData,
            joinCode: joinCode
        });
    }
    catch (error) {
        console.error("Create Team Error:", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.createTeam = createTeam;
// ------------------------------------------------------------------
// 2. JOIN TEAM (POST /api/teams/join)
// ------------------------------------------------------------------
const joinTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { joinCode } = req.body;
        if (!joinCode)
            return res.status(400).json({ message: "Join code is required" });
        // A. Find the team by code
        const { data: team, error: teamError } = yield supabaseClient_1.supabase
            .from("Teams")
            .select("id, name, is_finalized")
            .eq("join_code", joinCode)
            .single();
        if (teamError || !team)
            return res.status(404).json({ message: "Invalid join code" });
        if (team.is_finalized)
            return res.status(409).json({ message: "Team is already full." });
        // B. Check if user is already in ANY team
        const { data: existingMembership } = yield supabaseClient_1.supabase
            .from("TeamMembers")
            .select("team_id")
            .eq("user_id", userId)
            .single();
        if (existingMembership)
            return res.status(409).json({ message: "You are already in a team." });
        // C. Check current member count
        const { count } = yield supabaseClient_1.supabase
            .from("TeamMembers")
            .select("*", { count: 'exact', head: true })
            .eq("team_id", team.id);
        if (count !== null && count >= constants_1.MAX_TEAM_SIZE) {
            return res.status(409).json({ message: "Team is full (Max 4 members)." });
        }
        // D. Add user to TeamMembers
        const { error: joinError } = yield supabaseClient_1.supabase
            .from("TeamMembers")
            .insert([{ team_id: team.id, user_id: userId }]);
        if (joinError)
            throw joinError;
        // E. Check if team is now full (4 members) -> Mark as Finalized
        if ((count || 0) + 1 === constants_1.MAX_TEAM_SIZE) {
            yield supabaseClient_1.supabase.from("Teams").update({ is_finalized: true }).eq("id", team.id);
        }
        return res.status(200).json({ message: `Successfully joined team: ${team.name}` });
    }
    catch (error) {
        console.error("Join Team Error:", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.joinTeam = joinTeam;
// ------------------------------------------------------------------
// 3. GET MY TEAM (GET /api/teams/my-team)
// ------------------------------------------------------------------
const getMyTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // 1. Find which team the user belongs to
        const { data: membership, error: memError } = yield supabaseClient_1.supabase
            .from("TeamMembers")
            .select("team_id")
            .eq("user_id", userId)
            .single();
        if (memError || !membership) {
            return res.status(200).json({ message: "User is not in a team", team: null });
        }
        // 2. Fetch full team details + members + profiles
        const { data: team, error: teamError } = yield supabaseClient_1.supabase
            .from("Teams")
            .select(`
                  *,
                  members:TeamMembers (
                      user:Users (
                          id, email, role,
                          profile:Profiles (first_name, last_name, avatar_url)
                      )
                  )
              `)
            .eq("id", membership.team_id)
            .single();
        if (teamError)
            throw teamError;
        return res.status(200).json({ team });
    }
    catch (error) {
        console.error("Get Team Error:", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.getMyTeam = getMyTeam;
// ------------------------------------------------------------------
// 4. INVITE MEMBER
// ------------------------------------------------------------------
const sendNewInvite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ message: "Email is required" });
        // A. Controller Security Check: Ensure requester is the Leader
        const { data: team } = yield supabaseClient_1.supabase
            .from("Teams")
            .select("id, name, leader_id")
            .eq("leader_id", userId)
            .single();
        if (!team)
            return res.status(403).json({ message: "Forbidden. Only the Team Leader can invite members." });
        // B. Controller Check: Get current member count
        const { count } = yield supabaseClient_1.supabase
            .from("TeamMembers")
            .select("*", { count: 'exact', head: true })
            .eq("team_id", team.id);
        // C. Call the service function (Service handles max size check and DB insert)
        yield (0, team_service_1.inviteTeamMember)(team.id, team.name, email, count || 0);
        return res.status(200).json({ message: `Invitation sent to ${email}` });
    }
    catch (error) {
        // Handle custom service errors gracefully
        if (error.message.includes("Team is already full") || error.message.includes("pending invite")) {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.sendNewInvite = sendNewInvite;
// ------------------------------------------------------------------
// 5. ACCEPT INVITE (Fixed Null Check)
// ------------------------------------------------------------------
const acceptInvite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { token } = req.body;
        if (!token)
            return res.status(400).json({ message: "Invitation token is required" });
        // A. Validate Token
        const { data: invite, error: inviteError } = yield supabaseClient_1.supabase
            .from("TeamInvitations")
            .select("*")
            .eq("token", token)
            .single();
        if (inviteError || !invite)
            return res.status(404).json({ message: "Invalid invitation." });
        if (invite.status !== 'pending')
            return res.status(409).json({ message: "Invite already accepted or used." });
        if (new Date(invite.expires_at) < new Date())
            return res.status(410).json({ message: "Invitation expired." });
        // Validate hackathon scope for this acceptance
        const hackathonId = req.hackathonId;
        if (!hackathonId)
            return res.status(400).json({ message: "Missing required parameter: hackathonId. Provide x-hackathon-id header (middleware required)." });
        // B. Check if Team is full
        const { data: team, error: teamError } = yield supabaseClient_1.supabase
            .from("Teams")
            .select("is_finalized, name, hackathon_id")
            .eq("id", invite.team_id)
            .single();
        // --- FIX: Explicit null check before accessing team.is_finalized ---
        if (teamError || !team) {
            return res.status(404).json({ message: "Team associated with this invite not found." });
        }
        // Ensure the invitation is for the same hackathon the user is scoped to
        if (team.hackathon_id !== hackathonId) {
            return res.status(403).json({ message: "Forbidden. This invitation does not belong to the requested hackathon." });
        }
        if (team.is_finalized)
            return res.status(409).json({ message: "Team is full." });
        // C. Check if User is already in a team
        const { data: existing } = yield supabaseClient_1.supabase.from("TeamMembers").select("team_id").eq("user_id", userId).maybeSingle();
        if (existing)
            return res.status(409).json({ message: "You are already in a team." });
        // D. Add User to Team
        const { error: joinError } = yield supabaseClient_1.supabase
            .from("TeamMembers")
            .insert([{ team_id: invite.team_id, user_id: userId }]);
        if (joinError)
            throw joinError;
        // E. Mark Invite as Accepted
        yield supabaseClient_1.supabase.from("TeamInvitations").update({ status: 'accepted' }).eq("id", invite.id);
        return res.status(200).json({ message: `Successfully joined ${team.name}` });
    }
    catch (error) {
        console.error("Accept Invite Error:", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.acceptInvite = acceptInvite;
// 6. DELETE /api/team/:teamId/member/remove (Remove Member)
// ------------------------------------------------------------------
const removeMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const MIN_MEMBERS = 2; // Assuming minimum team size is 2
        const { teamId } = req.params;
        const { memberId } = req.body;
        const requestingUserId = req.user.id;
        // --- 1. Rule Check: Deadline Passed? (NEW LOGIC) ---
        // Fetch the global submission deadline from the Settings table
        const { data: settings } = yield supabaseClient_1.supabase
            .from("Settings")
            .select("submission_deadline")
            .single();
        if (settings === null || settings === void 0 ? void 0 : settings.submission_deadline) {
            const deadline = new Date(settings.submission_deadline);
            const now = new Date();
            if (now > deadline) {
                return res.status(403).json({
                    message: "Action forbidden. The submission deadline has passed; team composition is locked."
                });
            }
        }
        // --- 2. Security Check: Ensure requester is the Leader ---
        const { data: team } = yield supabaseClient_1.supabase.from("Teams").select("leader_id").eq("id", teamId).single();
        if (!team || team.leader_id !== requestingUserId) {
            return res.status(403).json({ message: "Forbidden. Only the Team Leader can remove members." });
        }
        // --- 3. Rule Check: Prevent Leader from removing themselves ---
        if (memberId === requestingUserId) {
            return res.status(400).json({ message: "You cannot remove yourself as the leader. Transfer leadership first." });
        }
        // --- 4. Rule Check: Check Minimum Member Count ---
        const { count } = yield supabaseClient_1.supabase
            .from("TeamMembers")
            .select("*", { count: 'exact', head: true })
            .eq("team_id", teamId);
        if (count && count <= MIN_MEMBERS) {
            return res.status(400).json({ message: `Cannot remove member. Minimum team size of ${MIN_MEMBERS} required.` });
        }
        // --- 5. Call the service function ---
        // Assuming removeTeamMember is imported from your service layer
        // await removeTeamMember(teamId, memberId); 
        // For now, executing the deletion directly here if service isn't imported
        const { error: removeError } = yield supabaseClient_1.supabase
            .from("TeamMembers")
            .delete()
            .eq("team_id", teamId)
            .eq("user_id", memberId);
        if (removeError) {
            throw removeError;
        }
        return res.status(200).json({ message: "Member removed successfully." });
    }
    catch (error) {
        console.error("Controller Error [removeMember]:", error.message);
        if (error.message.includes("Member not found")) {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.removeMember = removeMember;
// ------------------------------------------------------------------
// 7. GET ALL TEAM MEMBERS (New Read Endpoint using Service)
// ------------------------------------------------------------------
const getAllTeamMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamId } = req.params; // Expecting teamId from URL parameter
        // Call the new service function (Service handles complex JOIN query)
        const members = yield (0, team_service_1.getTeamMembers)(teamId);
        return res.status(200).json({ members });
    }
    catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.getAllTeamMembers = getAllTeamMembers;
// GET /api/teams/me/members - get members of the current user's team
const getMyTeamMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Find the team the user belongs to
        const { data: membership, error: memError } = yield supabaseClient_1.supabase
            .from("TeamMembers")
            .select("team_id")
            .eq("user_id", userId)
            .maybeSingle();
        if (memError)
            throw memError;
        if (!membership)
            return res.status(404).json({ message: "User is not in a team", members: [] });
        const teamId = membership.team_id;
        const members = yield (0, team_service_1.getTeamMembers)(teamId);
        return res.status(200).json({ members });
    }
    catch (error) {
        console.error("Service Error [getMyTeamMembers]:", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.getMyTeamMembers = getMyTeamMembers;
// 9. PATCH /api/team/update (Update Team Details)
const updateTeamDetailsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const updates = req.body;
        // A. Security Check: Find team and ensure requester is the Leader
        const { data: team } = yield supabaseClient_1.supabase.from("Teams").select("id, leader_id").eq("leader_id", userId).single();
        if (!team) {
            // User is either not a leader or doesn't have a team
            return res.status(403).json({ message: "Forbidden. Only the Team Leader can update team details." });
        }
        // B. Call Service
        const updatedTeam = yield (0, team_service_1.updateTeamDetails)(team.id, updates);
        return res.status(200).json({
            message: "Team details updated successfully.",
            team: updatedTeam
        });
    }
    catch (error) {
        if (error.message.includes("No valid fields")) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.updateTeamDetailsController = updateTeamDetailsController;
// GET /api/team/:teamId? (Get Team Details for Admin/Judge or Participant)
const getTeamDetailsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const requestedTeamId = req.params.teamId;
        const userRole = req.user.role;
        let teamIdToFetch;
        if (requestedTeamId) {
            // Case 1: ID provided (Admin/Judge lookup)
            if (userRole === 'participant') {
                return res.status(403).json({ message: "Forbidden. Participants can only view their own team." });
            }
            teamIdToFetch = requestedTeamId;
        }
        else {
            // Case 2: No ID provided (Participant looking up their own team)
            const { data: membership } = yield supabaseClient_1.supabase
                .from("TeamMembers")
                .select("team_id")
                .eq("user_id", userId)
                .maybeSingle();
            if (!membership) {
                return res.status(404).json({ message: "You do not belong to a team." });
            }
            teamIdToFetch = membership.team_id;
        }
        const { data: team, error: teamError } = yield supabaseClient_1.supabase
            .from("Teams")
            .select(`
                id, name, leader_id, verification_status, 
                members:TeamMembers (
                    user:Users (
                        id, email, role,
                        Profiles (first_name, last_name, avatar_url)
                    )
                )
            `)
            .eq("id", teamIdToFetch)
            .single();
        if (teamError || !team) {
            // Log the error to your console for RLS policy issues (usually 404 in Supabase)
            console.error("TEAM FETCH ERROR:", teamError === null || teamError === void 0 ? void 0 : teamError.message);
            return res.status(404).json({ message: "Team not found." });
        }
        return res.status(200).json({ team });
    }
    catch (error) {
        console.error("GET Team Details Error:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getTeamDetailsController = getTeamDetailsController;
// Public: Check invite status by token (used from email link)
const checkInviteStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { token } = req.params;
        if (!token)
            return res.status(400).json({ message: "Invitation token is required" });
        const { data: invite, error: inviteError } = yield supabaseClient_1.supabase
            .from("TeamInvitations")
            .select("*, team:Teams(id, name, hackathon_id)")
            .eq("token", token)
            .single();
        if (inviteError || !invite)
            return res.status(404).json({ message: "Invalid invitation." });
        if (invite.status !== 'pending')
            return res.status(409).json({ message: "Invite already accepted or used." });
        if (new Date(invite.expires_at) < new Date())
            return res.status(410).json({ message: "Invitation expired." });
        // Check if a user exists with this invite email
        const { data: existingUser } = yield supabaseClient_1.supabase.from('Users').select('id').eq('email', invite.email).maybeSingle();
        // Return invite + team + hackathon context so frontend can set x-hackathon-id and route user appropriately
        return res.status(200).json({
            valid: true,
            token: invite.token,
            email: invite.email,
            userExists: !!existingUser,
            userId: (existingUser === null || existingUser === void 0 ? void 0 : existingUser.id) || null,
            team: {
                id: invite.team_id,
                name: ((_a = invite.team) === null || _a === void 0 ? void 0 : _a.name) || null,
            },
            hackathonId: ((_b = invite.team) === null || _b === void 0 ? void 0 : _b.hackathon_id) || null,
            expiresAt: invite.expires_at,
        });
    }
    catch (error) {
        console.error("Check Invite Error:", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.checkInviteStatus = checkInviteStatus;
