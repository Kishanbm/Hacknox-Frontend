"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../../controllers/participant/notification.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const requireHackathon_middleware_1 = require("../../middlewares/requireHackathon.middleware");
const router = (0, express_1.Router)();
// Routes for Notifications and Event Info (Protected for all logged-in users)
router.use(authMiddleware_1.verifyAuthToken);
router.use(requireHackathon_middleware_1.requireHackathonId);
// 4. Event Information (GET /api/event/info)
// Route is mounted under '/api/event' in index.ts -> final path: /api/event/info
router.get("/info", notification_controller_1.getEventInfoController);
// 4. Notifications (GET /api/notifications)
router.get("/", requireHackathon_middleware_1.requireHackathonId, notification_controller_1.getNotificationsController);
// 4. Mark Notification Read (PATCH /api/notifications/read)
router.patch("/read", requireHackathon_middleware_1.requireHackathonId, notification_controller_1.markNotificationReadController);
exports.default = router;
