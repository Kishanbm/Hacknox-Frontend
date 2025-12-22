import { Router } from "express";
import { getParticipantDashboardController } from "../../controllers/participant/dashboard.controller";
import { getMySubmissionsController } from "../../controllers/participant/mysubmissions.controller";
import { verifyAuthToken } from "../../middlewares/authMiddleware";
import { requireRole } from "../../middlewares/roleMiddleware";
import { requireHackathonId } from "../../middlewares/requireHackathon.middleware";

const router = Router();

// GET /api/participant/dashboard
router.get("/dashboard", verifyAuthToken, requireRole(["participant"]), requireHackathonId, getParticipantDashboardController);

// GET /api/participant/my-submissions
router.get("/my-submissions", verifyAuthToken, requireRole(["participant"]), getMySubmissionsController);

export default router;