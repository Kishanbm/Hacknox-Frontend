import { supabase } from "../../lib/supabaseClient";

// ------------------------------------------------------------------
// 1. GET NOTIFICATIONS (Filtering and Joining Read Status)
// ------------------------------------------------------------------
/**
 * Fetches notifications relevant to the user, joined with their read status.
 */
// --- HELPER: Get User Context for Filtering ---
/**
 * Fetches relevant attributes for the user (City, College, Team ID) 
 * to compare against notification criteria.
 */
const getUserContext = async (userId: string) => {
    // Fetch team details if the user is in a team
    const { data: membership } = await supabase
        .from("TeamMembers")
        .select(`
            team_id,
            team:Teams (
                id,
                city,
                college,
                project_category
            )
        `)
        .eq("user_id", userId)
        .maybeSingle();

    // If no team (e.g., user is a Judge or individual), return empty context
    if (!membership || !membership.team) return {};

    // Handle Supabase response structure (array vs object)
    const team = Array.isArray(membership.team) ? membership.team[0] : membership.team;

    return {
        teamId: team.id,
        city: team.city,
        college: team.college,
        category: team.project_category
    };
};

// --- SERVICE: Get Relevant Notifications ---
export const getRelevantNotifications = async (userId: string, userRole: string, hackathonId?: string): Promise<any[]> => {
    
    // 1. Get the user's specific attributes (Context)
    const userContext = await getUserContext(userId);
    console.log('[Notifications Service] User context:', userContext);

    // 2. Fetch Candidates from Announcements table (case-insensitive status check)
    // Try both 'sent' and 'Sent' to handle case variations
    let query: any = supabase
        .from("Announcements")
        .select("*")
        .order('created_at', { ascending: false });

    // Don't filter by hackathon if not provided - show all announcements
    if (hackathonId) {
        query = query.eq('hackathon_id', hackathonId);
    }

    const { data: notifications, error } = await query;

    if (error) {
        console.error("Service Error [getRelevantNotifications]:", error.message);
        throw new Error("Failed to retrieve notifications.");
    }
    
    console.log('[Notifications Service] Total announcements from DB:', notifications?.length || 0);
    
    // Filter by status case-insensitively (sent/Sent/active/Active)
    const validStatuses = ['sent', 'active'];
    const statusFiltered = (notifications || []).filter((n: any) => 
        n.status && validStatuses.includes(n.status.toLowerCase())
    );
    
    console.log('[Notifications Service] After status filter:', statusFiltered.length);

    // 3. Apply Criteria Filtering (In-Memory)
    //    We filter out notifications where the user doesn't match the specific 'target_criteria'
    const filteredNotifications = statusFiltered.filter((notification: any) => {
        
        // A. Direct Targeting (Allow if target_user_id specifically matches)
        if (notification.target_user_id && notification.target_user_id === userId) return true;

        // B. No Criteria (Broadcast) -> Allow
        // If target_criteria is null, undefined, empty object, or empty array, it's a broadcast
        if (!notification.target_criteria) return true;
        
        // Handle if target_criteria is stored as JSON string
        let criteria = notification.target_criteria;
        if (typeof criteria === 'string') {
            try {
                criteria = JSON.parse(criteria);
            } catch (e) {
                // If parsing fails, treat as no criteria (broadcast)
                return true;
            }
        }
        
        // Empty object or array means broadcast
        if (typeof criteria === 'object' && Object.keys(criteria).length === 0) return true;
        if (Array.isArray(criteria) && criteria.length === 0) return true;

        // C. Check Criteria Matches
        // target_criteria is expected to be an object (e.g., { role: 'participant', city: 'X' })
        for (const key of Object.keys(criteria)) {
            const requiredValue = criteria[key];
            
            // Skip null or undefined criteria values (treat as wildcard)
            if (requiredValue === null || requiredValue === undefined) continue;
            
            const userValue = userContext[key as keyof typeof userContext] || (key === 'role' ? userRole : undefined);

            // 1. If user doesn't have the attribute (e.g. not in a team) but criteria requires it -> Exclude
            if (!userValue) return false;

            // 2. Perform comparison (Case-insensitive for strings, strict for IDs)
            if (typeof requiredValue === 'string' && typeof userValue === 'string') {
                if (requiredValue.toLowerCase() !== userValue.toLowerCase()) return false;
            } else {
                if (requiredValue != userValue) return false;
            }
        }

        return true;
    });

    console.log('[Notifications Service] After criteria filter:', filteredNotifications.length);

    return filteredNotifications;
};

// ------------------------------------------------------------------
// 2. MARK NOTIFICATION READ
// ------------------------------------------------------------------
/**
 * Inserts or updates a record in the UserNotifications table to mark a notification as read.
 */
export const markNotificationRead = async (userId: string, notificationId: string, hackathonId?: string): Promise<void> => {
    // Validate the announcement exists and (if provided) belongs to the hackathon
    let notifQuery: any = supabase
        .from("Announcements")
        .select("id")
        .eq("id", notificationId)
        .maybeSingle();

    if (hackathonId) notifQuery = notifQuery.eq('hackathon_id', hackathonId);

    const { data: notif, error: fetchError } = await notifQuery;

    if (fetchError || !notif) {
        console.error("Service Error [markNotificationRead/validation]:", fetchError?.message || 'Announcement not found for this hackathon');
        throw new Error("Announcement not found for this hackathon.");
    }

    // Upsert ensures we create the record if it doesn't exist, or update it if it does
    const { error } = await supabase
        .from("UserNotifications")
        .upsert({
            user_id: userId,
            notification_id: notificationId,
            is_read: true,
            read_at: new Date().toISOString()
        }, { onConflict: 'user_id, notification_id' }); // Conflict resolution key

    if (error) {
        console.error("Service Error [markNotificationRead]:", error.message);
        throw new Error("Failed to update notification read status.");
    }
};