"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const public_controller_1 = require("../controllers/public.controller");
const public_controller_2 = require("../controllers/public.controller");
const router = (0, express_1.Router)();
// This route uses NO authentication middleware.
// 1. GET /api/public/leaderboard (Get Published Leaderboard)
router.get("/leaderboard", public_controller_1.getPublicLeaderboardController);
// 2. GET /api/public/hackathons/active (Get List of Active Hackathons)
router.get("/hackathons/active", public_controller_2.getActiveHackathonsController);
exports.default = router;
