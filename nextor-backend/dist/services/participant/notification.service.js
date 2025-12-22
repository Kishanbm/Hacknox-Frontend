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
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationRead = exports.getRelevantNotifications = void 0;
const supabaseClient_1 = require("../../lib/supabaseClient");
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
const getUserContext = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch team details if the user is in a team
    const { data: membership } = yield supabaseClient_1.supabase
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
    if (!membership || !membership.team)
        return {};
    // Handle Supabase response structure (array vs object)
    const team = Array.isArray(membership.team) ? membership.team[0] : membership.team;
    return {
        teamId: team.id,
        city: team.city,
        college: team.college,
        category: team.project_category
    };
});
// --- SERVICE: Get Relevant Notifications ---
const getRelevantNotifications = (userId, userRole, hackathonId) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Get the user's specific attributes (Context)
    const userContext = yield getUserContext(userId);
    // 2. Fetch Candidates from Announcements table (only sent announcements)
    // Participants should only see announcements with status 'sent'.
    let query = supabaseClient_1.supabase
        .from("Announcements")
        .select("*")
        .eq('status', 'sent')
        .order('created_at', { ascending: false });
    if (hackathonId)
        query = query.eq('hackathon_id', hackathonId);
    const { data: notifications, error } = yield query;
    if (error) {
        console.error("Service Error [getRelevantNotifications]:", error.message);
        throw new Error("Failed to retrieve notifications.");
    }
    // 3. Apply Criteria Filtering (In-Memory)
    //    We filter out notifications where the user doesn't match the specific 'target_criteria'
    const filteredNotifications = (notifications || []).filter((notification) => {
        // A. Direct Targeting (Allow if target_user_id specifically matches)
        if (notification.target_user_id && notification.target_user_id === userId)
            return true;
        // B. No Criteria (Broadcast) -> Allow
        // If target_criteria is null or empty, it's a general announcement for all users.
        if (!notification.target_criteria || Object.keys(notification.target_criteria).length === 0) {
            return true;
        }
        // C. Check Criteria Matches
        // target_criteria is expected to be an object (e.g., { role: 'participant', city: 'X' })
        const criteria = notification.target_criteria;
        for (const key of Object.keys(criteria)) {
            const requiredValue = criteria[key];
            const userValue = userContext[key] || (key === 'role' ? userRole : undefined);
            // 1. If user doesn't have the attribute (e.g. not in a team) -> Exclude
            if (!userValue)
                return false;
            // 2. Perform comparison (Case-insensitive for strings, strict for IDs)
            if (typeof requiredValue === 'string' && typeof userValue === 'string') {
                if (requiredValue.toLowerCase() !== userValue.toLowerCase())
                    return false;
            }
            else {
                if (requiredValue != userValue)
                    return false;
            }
        }
        return true;
    });
    return filteredNotifications;
});
exports.getRelevantNotifications = getRelevantNotifications;
// ------------------------------------------------------------------
// 2. MARK NOTIFICATION READ
// ------------------------------------------------------------------
/**
 * Inserts or updates a record in the UserNotifications table to mark a notification as read.
 */
const markNotificationRead = (userId, notificationId, hackathonId) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate the announcement exists and (if provided) belongs to the hackathon
    let notifQuery = supabaseClient_1.supabase
        .from("Announcements")
        .select("id")
        .eq("id", notificationId)
        .maybeSingle();
    if (hackathonId)
        notifQuery = notifQuery.eq('hackathon_id', hackathonId);
    const { data: notif, error: fetchError } = yield notifQuery;
    if (fetchError || !notif) {
        console.error("Service Error [markNotificationRead/validation]:", (fetchError === null || fetchError === void 0 ? void 0 : fetchError.message) || 'Announcement not found for this hackathon');
        throw new Error("Announcement not found for this hackathon.");
    }
    // Upsert ensures we create the record if it doesn't exist, or update it if it does
    const { error } = yield supabaseClient_1.supabase
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
});
exports.markNotificationRead = markNotificationRead;
