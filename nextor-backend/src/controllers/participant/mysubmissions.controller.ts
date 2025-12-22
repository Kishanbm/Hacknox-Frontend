import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { supabase } from "../../lib/supabaseClient";

/**
 * GET /api/participant/my-submissions
 * Fetch all submissions for teams the user belongs to
 */
export const getMySubmissionsController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user!.id;

        // 1. Find all teams the user is a member of
        const { data: memberships, error: memberError } = await supabase
            .from("TeamMembers")
            .select("team_id")
            .eq("user_id", userId);

        if (memberError) throw memberError;

        if (!memberships || memberships.length === 0) {
            return res.status(200).json({
                message: "No submissions found.",
                submissions: []
            });
        }

        const teamIds = memberships.map(m => m.team_id);

        // 2. Fetch all submissions for these teams with team and hackathon details
        const { data: submissions, error: subError } = await supabase
            .from("Submissions")
            .select(`
                id,
                title,
                description,
                repo_url,
                zip_storage_path,
                status,
                submitted_at,
                created_at,
                team:Teams (
                    id,
                    name,
                    leader_id
                ),
                hackathon:Hackathons (
                    id,
                    name,
                    slug
                )
            `)
            .in("team_id", teamIds)
            .order("created_at", { ascending: false });

        if (subError) throw subError;

        // 3. Enrich submissions with permission info
        const enrichedSubmissions = (submissions || []).map((sub: any) => {
            const team = Array.isArray(sub.team) ? sub.team[0] : sub.team;
            const hackathon = Array.isArray(sub.hackathon) ? sub.hackathon[0] : sub.hackathon;
            
            return {
                id: sub.id,
                title: sub.title,
                description: sub.description,
                repoUrl: sub.repo_url,
                zipStoragePath: sub.zip_storage_path,
                status: sub.status,
                submittedAt: sub.submitted_at,
                createdAt: sub.created_at,
                team: {
                    id: team?.id,
                    name: team?.name,
                    leaderId: team?.leader_id
                },
                hackathon: {
                    id: hackathon?.id,
                    name: hackathon?.name,
                    slug: hackathon?.slug
                },
                // Permission flags
                isLeader: team?.leader_id === userId,
                canEdit: team?.leader_id === userId && sub.status === 'draft'
            };
        });

        return res.status(200).json({
            message: "Submissions retrieved successfully.",
            submissions: enrichedSubmissions
        });

    } catch (error: any) {
        console.error("Get My Submissions Error:", error.message);
        return res.status(500).json({ 
            message: "Server Error", 
            error: error.message 
        });
    }
};
