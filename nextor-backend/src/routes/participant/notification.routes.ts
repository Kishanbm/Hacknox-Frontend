import { Router } from "express";
import { 
    getNotificationsController, 
    markNotificationReadController,
    getEventInfoController
} from "../../controllers/participant/notification.controller";
import { verifyAuthToken } from "../../middlewares/authMiddleware";
import { requireRole } from "../../middlewares/roleMiddleware";
import { requireHackathonId } from "../../middlewares/requireHackathon.middleware";
import { from } from "form-data";

const router = Router();

// Routes for Notifications and Event Info (Protected for all logged-in users)
router.use(verifyAuthToken);
router.use(requireHackathonId);

// 4. Event Information (GET /api/event/info)
// Route is mounted under '/api/event' in index.ts -> final path: /api/event/info
router.get("/info", getEventInfoController);

// 4. Notifications (GET /api/notifications)
router.get("/", requireHackathonId, getNotificationsController);

// 4. Mark Notification Read (PATCH /api/notifications/read)
router.patch("/read", requireHackathonId, markNotificationReadController);

export default router;