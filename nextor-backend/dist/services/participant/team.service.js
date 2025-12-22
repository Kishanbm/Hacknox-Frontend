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
exports.updateTeamDetails = exports.inviteTeamMember = exports.removeTeamMember = exports.getTeamMembers = void 0;
const supabaseClient_1 = require("../../lib/supabaseClient");
const constants_1 = require("../../constants");
const crypto_1 = __importDefault(require("crypto"));
const email_1 = require("../../utils/email");
// 1. GET TEAM MEMBERS
//Retrieves all members of a specific team with their full profile details.
const getTeamMembers = (teamId) => __awaiter(void 0, void 0, void 0, function* () {
    // Perform a complex JOIN query: TeamMembers -> Users -> Profiles
    const { data: teamMembersData, error } = yield supabaseClient_1.supabase
        .from("TeamMembers")
        .select(`
            user:Users (
                id, email, role,
                Profiles (first_name, last_name, avatar_url)
            )
        `)
        .eq("team_id", teamId);
    if (error) {
        console.error("Service Error [getTeamMembers]:", error.message);
        throw new Error("Failed to fetch team members.");
    }
    // B. Filter, map, and flatten the result
    // We cast the data to the expected shape before mapping to make TypeScript happy.
    const nestedData = teamMembersData;
    return nestedData
        .map(member => member.user)
        .filter((user) => user !== null); // Use a type guard to filter out nulls safely
});
exports.getTeamMembers = getTeamMembers;
// 2. REMOVE TEAM MEMBER
// Removes a member from a team by deleting their TeamMembers entry.
const removeTeamMember = (teamId, memberId) => __awaiter(void 0, void 0, void 0, function* () {
    // A. Security Check: Ensure the member is actually linked to this team
    const { data: membership, error: checkError } = yield supabaseClient_1.supabase
        .from("TeamMembers")
        .select("team_id")
        .eq("team_id", teamId)
        .eq("user_id", memberId)
        .maybeSingle();
    if (checkError)
        throw checkError;
    if (!membership) {
        throw new Error("Member not found in the specified team.");
    }
    // B. Delete the membership link
    const { error: deleteError } = yield supabaseClient_1.supabase
        .from("TeamMembers")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", memberId);
    if (deleteError) {
        console.error("Service Error [removeTeamMember]:", deleteError.message);
        throw new Error("Failed to remove member from team.");
    }
});
exports.removeTeamMember = removeTeamMember;
// 3. INVITE TEAM MEMBER
//Creates an invite token and sends an email. Reuses logic from team.controller.
const inviteTeamMember = (teamId, teamName, email, currentMemberCount) => __awaiter(void 0, void 0, void 0, function* () {
    if (currentMemberCount >= constants_1.MAX_TEAM_SIZE) {
        throw new Error("Team is already full (Max 4 members).");
    }
    // A. Create Invitation Token
    const inviteToken = crypto_1.default.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
    const { error: inviteError } = yield supabaseClient_1.supabase
        .from("TeamInvitations")
        .insert([{
            team_id: teamId,
            email: email,
            token: inviteToken,
            expires_at: expiresAt.toISOString(),
            status: 'pending'
        }]);
    if (inviteError) {
        if (inviteError.code === '23505')
            throw new Error("User already has a pending invite for this team.");
        throw inviteError;
    }
    // B. Send Invite Email
    const inviteLink = `${process.env.FRONTEND_URL}/join-team?token=${inviteToken}`;
    yield (0, email_1.sendEmail)({
        to: email,
        subject: `Invitation to join ${teamName} on HackOnX`,
        html: `<p>You have been invited to join the team <strong>${teamName}</strong>.</p>
             <p>Click the link below to accept:</p>
             <a href="${inviteLink}">${inviteLink}</a>
             <p>This link expires in 48 hours.</p>`,
    });
});
exports.inviteTeamMember = inviteTeamMember;
const updateTeamDetails = (teamId, updates) => __awaiter(void 0, void 0, void 0, function* () {
    // Only update allowed fields
    const validUpdates = {
        name: updates.name,
        // project_category: updates.project_category, // Uncomment when column is added
    };
    // Remove undefined properties to prevent errors during update
    Object.keys(validUpdates).forEach((key) => {
        const typedKey = key;
        if (validUpdates[typedKey] === undefined) {
            delete validUpdates[typedKey];
        }
    });
    if (Object.keys(validUpdates).length === 0) {
        throw new Error("No valid fields provided for update.");
    }
    const { data: updatedTeam, error } = yield supabaseClient_1.supabase
        .from("Teams")
        .update(validUpdates)
        .eq("id", teamId)
        .select()
        .single();
    if (error) {
        console.error("Service Error [updateTeamDetails]:", error.message);
        throw new Error("Failed to update team details.");
    }
    return updatedTeam;
});
exports.updateTeamDetails = updateTeamDetails;
