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
exports.getEventInfoController = exports.markNotificationReadController = exports.getNotificationsController = void 0;
const notification_service_1 = require("../../services/participant/notification.service");
const supabaseClient_1 = require("../../lib/supabaseClient");
const notification_service_2 = require("../../services/participant/notification.service");
// ------------------------------------------------------------------
// 1. GET /api/notifications (Fetch Announcements)
// ------------------------------------------------------------------
const getNotificationsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        // 1. Get filtered announcements (Service handles Role + City/Team filtering)
        const hackathonId = req.hackathonId;
        const rawNotifications = yield (0, notification_service_1.getRelevantNotifications)(userId, userRole, hackathonId);
        // 2. Fetch the read status for this user (Manual Join)
        // We do this in the controller because we need to join user-specific state 
        // with the public content fetched above.
        // Fetch read statuses for the announcements we fetched above
        const announcementIds = rawNotifications.map((n) => n.id).filter(Boolean);
        let readStatuses = [];
        if (announcementIds.length > 0) {
            const { data } = yield supabaseClient_1.supabase
                .from("UserNotifications")
                .select("notification_id, is_read")
                .eq("user_id", userId)
                .in("notification_id", announcementIds);
            readStatuses = data || [];
        }
        const readStatusMap = new Map(readStatuses === null || readStatuses === void 0 ? void 0 : readStatuses.map((r) => [r.notification_id, r.is_read]));
        // 3. Merge read status into the final response
        const notifications = rawNotifications.map((notification) => (Object.assign(Object.assign({}, notification), { is_read: readStatusMap.get(notification.id) || false })));
        return res.status(200).json({
            message: "Notifications retrieved.",
            notifications,
            count: notifications.length
        });
    }
    catch (error) {
        console.error("Controller Error [getNotifications]:", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.getNotificationsController = getNotificationsController;
// ------------------------------------------------------------------
// 2. PATCH /api/notifications/read (Mark Read)
// ------------------------------------------------------------------
const markNotificationReadController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { notificationIds, markAll } = req.body; // Expect an array of IDs or a 'markAll' flag
        const hackathonId = req.hackathonId;
        if (markAll) {
            // A. Mark ALL unread notifications as read
            // Requires fetching all unread IDs first, then batch upserting them.
            // This is complex, so for simplicity: just mark the single ones provided.
            return res.status(400).json({ message: "Batch update (markAll) is not yet implemented." });
        }
        else if (Array.isArray(notificationIds) && notificationIds.length > 0) {
            // B. Mark specific IDs as read
            yield Promise.all(notificationIds.map(id => (0, notification_service_2.markNotificationRead)(userId, id, hackathonId)));
            return res.status(200).json({ message: "Notifications marked as read." });
        }
        else {
            return res.status(400).json({ message: "Must provide notificationIds array or markAll: true." });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.markNotificationReadController = markNotificationReadController;
// ------------------------------------------------------------------
// 3. GET /api/event/info
// ------------------------------------------------------------------
const getEventInfoController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch the single Settings record
        const { data: settings, error } = yield supabaseClient_1.supabase
            .from("Settings")
            .select("event_name, submission_deadline, max_team_size")
            .single();
        if (error) {
            console.error("Error fetching settings:", error);
            // Fallback to a default message if DB fails
            return res.status(500).json({ message: "Failed to retrieve event configuration." });
        }
        // NOTE: If you store rules_url, timeline, and judging_criteria in the Settings table (e.g., as JSONB columns), 
        // you would return those directly. Since we only stored basic data, we structure the response:
        return res.status(200).json({
            message: "Event details retrieved.",
            eventInfo: {
                event_name: (settings === null || settings === void 0 ? void 0 : settings.event_name) || "Hackathon X",
                // This deadline is dynamic now
                submission_deadline: settings === null || settings === void 0 ? void 0 : settings.submission_deadline,
                max_team_size: settings === null || settings === void 0 ? void 0 : settings.max_team_size,
                // Static fields we didn't store in the database (replace with DB fetch if stored)
                timeline: [
                    { stage: "Registration", date: "2025-01-01" },
                    { stage: "Submission Deadline", date: settings === null || settings === void 0 ? void 0 : settings.submission_deadline },
                ],
                rules_url: "http://hackonx.com/rules",
                judging_criteria: [
                    { name: "Innovation", weight: 30 },
                    { name: "Feasibility", weight: 20 }
                ],
                venue: "Online / Virtual",
            }
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.getEventInfoController = getEventInfoController;
