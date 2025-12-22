import { Router } from "express";
import { getPublicLeaderboardController, getActiveHackathonsController, getAllHackathonsController, getHackathonDetailController } from "../controllers/public.controller";

const router = Router();

// This route uses NO authentication middleware.

// 1. GET /api/public/leaderboard (Get Published Leaderboard)
router.get("/leaderboard", getPublicLeaderboardController); 

// 2. GET /api/public/hackathons/active (Get List of Active Hackathons)
router.get("/hackathons/active", getActiveHackathonsController);

// 3. GET /api/public/hackathons/:id (Get hackathon details)
router.get("/hackathons/:id", getHackathonDetailController);

// 4. GET /api/public/hackathons (Get All Hackathons with optional status filter)
router.get("/hackathons", getAllHackathonsController);

export default router;