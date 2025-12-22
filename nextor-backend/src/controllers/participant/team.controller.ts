import { Response } from "express";
import crypto from "crypto";
import { supabase } from "../../lib/supabaseClient";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { MAX_TEAM_SIZE } from "../../constants";
import { sendEmail } from "../../utils/email";
import { getTeamMembers, removeTeamMember, inviteTeamMember, updateTeamDetails } from "../../services/participant/team.service";
import { Request } from "express";

// GET /api/teams/my-teams - list all teams the user belongs to (across hackathons)
export const getMyTeams = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user!.id;

        // 1. Find all team_ids the user is a member of
        const { data: memberships, error: memError } = await supabase
            .from('TeamMembers')
            .select('team_id')
            .eq('user_id', userId);

        if (memError) throw memError;

        const teamIds = (memberships || []).map((m: any) => m.team_id).filter(Boolean);

        if (teamIds.length === 0) return res.status(200).json({ teams: [] });

        // 2. Fetch teams with members + profiles + hackathon title
        const { data: teamsRaw, error: teamsError } = await supabase
            .from('Teams')
            .select(`
                id, name, hackathon_id, leader_id, is_finalized, verification_status, join_code, description,
                members:TeamMembers (
                    user:Users (
                        id, email, role,
                        profile:Profiles (first_name, last_name, avatar_url)
                    )
                ),
                hackathon:Hackathons (id, slug, start_date, end_date)
            `)
            .in('id', teamIds);

        if (teamsError) throw teamsError;

        // Normalize to expected frontend shape: add boolean `is_verified` and hackathon_title
        const teams = (teamsRaw || []).map((t: any) => {
            const vs = t.verification_status;
            const is_verified = (typeof vs === 'string') ? (vs.toLowerCase() === 'verified' || vs.toLowerCase() === 'true') : Boolean(vs);
            const hackathon = Array.isArray(t.hackathon) ? t.hackathon[0] : t.hackathon;
            return {
                ...t,
                is_verified,
                hackathon_title: hackathon?.slug || null,
                hackathon_phase: hackathon?.current_phase ?? hackathon?.phase ?? null,
                hackathon_start_date: hackathon?.start_date || null,
                hackathon_end_date: hackathon?.end_date || null,
            };
        });

        if (teamsError) throw teamsError;

        return res.status(200).json({ teams });
    } catch (error: any) {
        console.error('Get My Teams Error:', error.message);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// GET /api/teams/invitations - list pending invitations for current user (by email)
export const getMyInvitations = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userEmail = req.user!.email;

        if (!userEmail) return res.status(400).json({ message: 'User email not available' });

        const { data: invites, error: invitesError } = await supabase
            .from('TeamInvitations')
            .select(`
                id, token, email, status, created_at,
                team:Teams (
                    id, name, hackathon_id, leader_id,
                    hackathon:Hackathons (id, slug),
                    leader:Users!Teams_leader_id_fkey (
                        id, email,
                        profile:Profiles (first_name, last_name, avatar_url)
                    )
                )
            `)
            .eq('email', userEmail)
            .eq('status', 'pending');

        if (invitesError) throw invitesError;

        // Normalize the response to include inviter name and hackathon title at top level
        const normalizedInvites = (invites || []).map((inv: any) => {
            const team = Array.isArray(inv.team) ? inv.team[0] : inv.team;
            const hackathon = team?.hackathon ? (Array.isArray(team.hackathon) ? team.hackathon[0] : team.hackathon) : null;
            const leader = team?.leader ? (Array.isArray(team.leader) ? team.leader[0] : team.leader) : null;
            const leaderProfile = leader?.profile ? (Array.isArray(leader.profile) ? leader.profile[0] : leader.profile) : null;
            const inviterName = leaderProfile?.first_name ? `${leaderProfile.first_name} ${leaderProfile.last_name || ''}`.trim() : (leader?.email || 'Team Leader');

            return {
                id: inv.id,
                token: inv.token,
                email: inv.email,
                status: inv.status,
                created_at: inv.created_at,
                team_id: team?.id,
                team_name: team?.name,
                hackathon_id: team?.hackathon_id,
                hackathon_title: hackathon?.slug || 'Hackathon',
                inviter_name: inviterName,
                inviter_avatar: leaderProfile?.avatar_url || null,
            };
        });

        return res.status(200).json({ invitations: normalizedInvites });
    } catch (error: any) {
        console.error('Get My Invitations Error:', error.message);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 1. CREATE TEAM (POST /api/teams)
export const createTeam = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;
        const { name } = req.body;
        const hackathonId = (req as any).hackathonId;

        if (!hackathonId) return res.status(400).json({ message: "Missing required parameter: hackathonId. Provide x-hackathon-id header (middleware required)." });

    if (!name) return res.status(400).json({ message: "Team name is required" });

        // NOTE: Allow users to create multiple teams. Do not block creation if they belong to other teams.

    // B. Generate unique Join Code (6 characters)
    const joinCode = crypto.randomBytes(3).toString("hex").toUpperCase();

        // C. Create the Team (persist hackathon context)
        const { data: teamData, error: teamError } = await supabase
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
        if (teamError.code === '23505') return res.status(409).json({ message: "Team name already taken." });
        throw teamError;
    }

    // D. Add the creator as the 'Leader' in TeamMembers
    const { error: memberError } = await supabase
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
        await supabase.from("Teams").delete().eq("id", teamData.id);
        throw memberError;
    }

    return res.status(201).json({
      message: "Team created successfully!",
      team: teamData,
      joinCode: joinCode 
    });

  } catch (error: any) {
    console.error("Create Team Error:", error.message);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ------------------------------------------------------------------
// 2. JOIN TEAM (POST /api/teams/join)
// ------------------------------------------------------------------
export const joinTeam = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { joinCode } = req.body;

    if (!joinCode) return res.status(400).json({ message: "Join code is required" });

    // A. Find the team by code
    const { data: team, error: teamError } = await supabase
      .from("Teams")
      .select("id, name, is_finalized")
      .eq("join_code", joinCode)
      .single();

    if (teamError || !team) return res.status(404).json({ message: "Invalid join code" });

    if (team.is_finalized) return res.status(409).json({ message: "Team is already full." });

    // B. Check if user is already in ANY team
    const { data: existingMembership } = await supabase
      .from("TeamMembers")
      .select("team_id")
      .eq("user_id", userId)
      .single();

    if (existingMembership) return res.status(409).json({ message: "You are already in a team." });

    // C. Check current member count
    const { count } = await supabase
      .from("TeamMembers")
      .select("*", { count: 'exact', head: true })
      .eq("team_id", team.id);

    if (count !== null && count >= MAX_TEAM_SIZE) {
        return res.status(409).json({ message: "Team is full (Max 4 members)." });
    }

    // D. Add user to TeamMembers
    const { error: joinError } = await supabase
      .from("TeamMembers")
      .insert([{ team_id: team.id, user_id: userId }]);

    if (joinError) throw joinError;

    // E. Check if team is now full (4 members) -> Mark as Finalized
    if ((count || 0) + 1 === MAX_TEAM_SIZE) {
        await supabase.from("Teams").update({ is_finalized: true }).eq("id", team.id);
    }

    return res.status(200).json({ message: `Successfully joined team: ${team.name}` });

  } catch (error: any) {
    console.error("Join Team Error:", error.message);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ------------------------------------------------------------------
// 3. GET MY TEAM (GET /api/teams/my-team)
// ------------------------------------------------------------------
export const getMyTeam = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user!.id;

        // 1. Find which team the user belongs to
        const { data: membership, error: memError } = await supabase
            .from("TeamMembers")
            .select("team_id")
            .eq("user_id", userId)
            .single();

        if (memError || !membership) {
            return res.status(200).json({ message: "User is not in a team", team: null });
        }

        // 2. Fetch full team details + members + profiles
          const { data: team, error: teamError } = await supabase
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

        if (teamError) throw teamError;

        return res.status(200).json({ team });

    } catch (error: any) {
        console.error("Get Team Error:", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

// ------------------------------------------------------------------
// 4. INVITE MEMBER
// ------------------------------------------------------------------
export const sendNewInvite = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user!.id;
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: "Email is required" });

        // A. Controller Security Check: Ensure requester is the Leader
        const { data: team } = await supabase
          .from("Teams")
          .select("id, name, leader_id")
          .eq("leader_id", userId)
          .single();

        if (!team) return res.status(403).json({ message: "Forbidden. Only the Team Leader can invite members." });

        // B. Controller Check: Get current member count
        const { count } = await supabase
          .from("TeamMembers")
          .select("*", { count: 'exact', head: true })
          .eq("team_id", team.id);

        // C. Call the service function (Service handles max size check and DB insert)
        await inviteTeamMember(team.id, team.name, email, count || 0);

        return res.status(200).json({ message: `Invitation sent to ${email}` });
    } catch (error: any) {
        // Handle custom service errors gracefully
        if (error.message.includes("Team is already full") || error.message.includes("pending invite")) {
             return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};
    

// ------------------------------------------------------------------
// 5. ACCEPT INVITE (Fixed Null Check)
// ------------------------------------------------------------------
export const acceptInvite = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { token } = req.body;

    if (!token) return res.status(400).json({ message: "Invitation token is required" });

    // A. Validate Token
    const { data: invite, error: inviteError } = await supabase
      .from("TeamInvitations")
      .select("*")
      .eq("token", token)
      .single();

    if (inviteError || !invite) return res.status(404).json({ message: "Invalid invitation." });
    if (invite.status !== 'pending') return res.status(409).json({ message: "Invite already accepted or used." });
    if (new Date(invite.expires_at) < new Date()) return res.status(410).json({ message: "Invitation expired." });

        // Validate hackathon scope for this acceptance
        const hackathonId = (req as any).hackathonId;
        if (!hackathonId) return res.status(400).json({ message: "Missing required parameter: hackathonId. Provide x-hackathon-id header (middleware required)." });

    // B. Check if Team is full
    const { data: team, error: teamError } = await supabase
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

    if (team.is_finalized) return res.status(409).json({ message: "Team is full." });

    // C. Check if User is already in a team
    const { data: existing } = await supabase.from("TeamMembers").select("team_id").eq("user_id", userId).maybeSingle();
    if (existing) return res.status(409).json({ message: "You are already in a team." });

    // D. Add User to Team
    const { error: joinError } = await supabase
      .from("TeamMembers")
      .insert([{ team_id: invite.team_id, user_id: userId }]);

    if (joinError) throw joinError;

    // E. Mark Invite as Accepted
    await supabase.from("TeamInvitations").update({ status: 'accepted' }).eq("id", invite.id);

    return res.status(200).json({ message: `Successfully joined ${team.name}` });

  } catch (error: any) {
    console.error("Accept Invite Error:", error.message);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 6. DELETE /api/team/:teamId/member/remove (Remove Member)
// ------------------------------------------------------------------
export const removeMember = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const MIN_MEMBERS = 2; // Assuming minimum team size is 2

        const { teamId } = req.params;
        const { memberId } = req.body;
        const requestingUserId = req.user!.id;

        // --- 1. Rule Check: Deadline Passed? (NEW LOGIC) ---
        // Fetch the global submission deadline from the Settings table
        const { data: settings } = await supabase
            .from("Settings")
            .select("submission_deadline")
            .single();

        if (settings?.submission_deadline) {
            const deadline = new Date(settings.submission_deadline);
            const now = new Date();

            if (now > deadline) {
                return res.status(403).json({ 
                    message: "Action forbidden. The submission deadline has passed; team composition is locked." 
                });
            }
        }

        // --- 2. Security Check: Ensure requester is the Leader ---
        const { data: team } = await supabase.from("Teams").select("leader_id").eq("id", teamId).single();
        if (!team || team.leader_id !== requestingUserId) {
            return res.status(403).json({ message: "Forbidden. Only the Team Leader can remove members." });
        }
        
        // --- 3. Rule Check: Prevent Leader from removing themselves ---
        if (memberId === requestingUserId) {
            return res.status(400).json({ message: "You cannot remove yourself as the leader. Transfer leadership first." });
        }

        // --- 4. Rule Check: Check Minimum Member Count ---
        const { count } = await supabase
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
        const { error: removeError } = await supabase
            .from("TeamMembers")
            .delete()
            .eq("team_id", teamId)
            .eq("user_id", memberId);

        if (removeError) {
             throw removeError;
        }

        return res.status(200).json({ message: "Member removed successfully." });

    } catch (error: any) {
        console.error("Controller Error [removeMember]:", error.message);
        if (error.message.includes("Member not found")) {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};
// ------------------------------------------------------------------
// 7. GET ALL TEAM MEMBERS (New Read Endpoint using Service)
// ------------------------------------------------------------------
export const getAllTeamMembers = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const { teamId } = req.params; // Expecting teamId from URL parameter

        // Call the new service function (Service handles complex JOIN query)
        const members = await getTeamMembers(teamId);

        return res.status(200).json({ members });
    } catch (error: any) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// GET /api/teams/me/members - get members of the current user's team
export const getMyTeamMembers = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user!.id;

        // Find the team the user belongs to
        const { data: membership, error: memError } = await supabase
            .from("TeamMembers")
            .select("team_id")
            .eq("user_id", userId)
            .maybeSingle();

        if (memError) throw memError;
        if (!membership) return res.status(404).json({ message: "User is not in a team", members: [] });

        const teamId = membership.team_id;

        const members = await getTeamMembers(teamId);

        return res.status(200).json({ members });
    } catch (error: any) {
        console.error("Service Error [getMyTeamMembers]:", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 9. PATCH /api/team/update (Update Team Details)
export const updateTeamDetailsController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user!.id;
        const updates = req.body;

        // A. Security Check: Find team and ensure requester is the Leader
        const { data: team } = await supabase.from("Teams").select("id, leader_id").eq("leader_id", userId).single();

        if (!team) {
            // User is either not a leader or doesn't have a team
            return res.status(403).json({ message: "Forbidden. Only the Team Leader can update team details." });
        }

        // B. Call Service
        const updatedTeam = await updateTeamDetails(team.id, updates);

        return res.status(200).json({ 
            message: "Team details updated successfully.", 
            team: updatedTeam 
        });

    } catch (error: any) {
        if (error.message.includes("No valid fields")) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// GET /api/team/:teamId? (Get Team Details for Admin/Judge or Participant)
export const getTeamDetailsController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user!.id;
        const requestedTeamId = req.params.teamId; 
        const userRole = req.user!.role;

        console.debug('[getTeamDetails] request:', { userId, requestedTeamId, userRole });

        // Quick check: does the team exist at all? (diagnostic)
        const { data: teamCheck, error: teamCheckErr } = await supabase
            .from('Teams')
            .select('id, name, leader_id')
            .eq('id', requestedTeamId || 'no-id')
            .maybeSingle();
        console.debug('[getTeamDetails] teamCheck:', { teamCheck, teamCheckErr: teamCheckErr?.message });

        let teamIdToFetch: string | undefined;

        if (requestedTeamId) {
            // Case 1: ID provided (Admin/Judge lookup)
            if (userRole === 'participant') {
                // Allow participant to fetch the team by ID only if they belong to it
                const { data: membership, error: membershipErr } = await supabase
                    .from('TeamMembers')
                    .select('team_id')
                    .eq('user_id', userId)
                    .limit(1)
                    .maybeSingle();

                if (membershipErr) console.debug('[getTeamDetails] membershipErr:', membershipErr?.message);

                // Normalize comparison to strings (defensive against type differences)
                const memberTeamId = membership?.team_id ? String(membership.team_id) : null;
                const requestedIdStr = requestedTeamId ? String(requestedTeamId) : null;

                let isAllowed = (memberTeamId && requestedIdStr && memberTeamId === requestedIdStr);

                // Edge case: the Team Leader might not have an explicit TeamMembers row
                // (e.g., race or migration). Allow access when the user is the leader.
                if (!isAllowed) {
                    const { data: teamRecord, error: teamRecordErr } = await supabase
                        .from('Teams')
                        .select('leader_id')
                        .eq('id', requestedTeamId)
                        .maybeSingle();

                    if (teamRecordErr) console.debug('[getTeamDetails] teamRecordErr:', teamRecordErr?.message);

                    if (!teamRecordErr && teamRecord && String(teamRecord.leader_id) === String(userId)) {
                        isAllowed = true;
                    }
                }

                if (!isAllowed) {
                    return res.status(403).json({ message: "Forbidden. Participants can only view their own team." });
                }
            }
            teamIdToFetch = requestedTeamId;
        } else {
            // Case 2: No ID provided (Participant looking up their own team)
            const { data: membership } = await supabase
                .from("TeamMembers")
                .select("team_id")
                .eq("user_id", userId)
                .limit(1)
                .maybeSingle(); 
            
            if (!membership) {
                return res.status(404).json({ message: "You do not belong to a team." });
            }
            teamIdToFetch = membership.team_id;
        }

        const { data: team, error: teamError } = await supabase
            .from("Teams")
            .select(`
                id, name, leader_id, verification_status, join_code, description, hackathon_id,
                members:TeamMembers (
                    user:Users (
                        id, email, role,
                        Profiles (first_name, last_name, avatar_url, bio, github_url, linkedin_url, phone)
                    )
                ),
                hackathon:Hackathons (id, slug, start_date, end_date)
            `)
            .eq("id", teamIdToFetch)
            .maybeSingle();

        if (teamError || !team) {
            // Log the error to your console for RLS policy issues (usually 404 in Supabase)
            console.error('[getTeamDetails] TEAM FETCH ERROR:', teamError?.message, 'team:', team);
            return res.status(404).json({ message: "Team not found." });
        }

        return res.status(200).json({ team });

    } catch (error: any) {
        console.error("GET Team Details Error:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Public: Check invite status by token (used from email link)
export const checkInviteStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const { token } = req.params;
        if (!token) return res.status(400).json({ message: "Invitation token is required" });

        const { data: invite, error: inviteError } = await supabase
            .from("TeamInvitations")
            .select("*, team:Teams(id, name, hackathon_id)")
            .eq("token", token)
            .single();

        if (inviteError || !invite) return res.status(404).json({ message: "Invalid invitation." });
        if (invite.status !== 'pending') return res.status(409).json({ message: "Invite already accepted or used." });
        if (new Date(invite.expires_at) < new Date()) return res.status(410).json({ message: "Invitation expired." });

        // Check if a user exists with this invite email
        const { data: existingUser } = await supabase.from('Users').select('id').eq('email', invite.email).maybeSingle();

        // Return invite + team + hackathon context so frontend can set x-hackathon-id and route user appropriately
        return res.status(200).json({
            valid: true,
            token: invite.token,
            email: invite.email,
            userExists: !!existingUser,
            userId: existingUser?.id || null,
            team: {
                id: invite.team_id,
                name: invite.team?.name || null,
            },
            hackathonId: invite.team?.hackathon_id || null,
            expiresAt: invite.expires_at,
        });
    } catch (error: any) {
        console.error("Check Invite Error:", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};