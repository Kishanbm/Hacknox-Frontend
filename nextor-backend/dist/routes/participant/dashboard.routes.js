"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../../controllers/participant/dashboard.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const roleMiddleware_1 = require("../../middlewares/roleMiddleware");
const requireHackathon_middleware_1 = require("../../middlewares/requireHackathon.middleware");
const router = (0, express_1.Router)();
// GET /api/participant/dashboard
router.get("/dashboard", authMiddleware_1.verifyAuthToken, (0, roleMiddleware_1.requireRole)(["participant"]), requireHackathon_middleware_1.requireHackathonId, dashboard_controller_1.getParticipantDashboardController);
exports.default = router;
