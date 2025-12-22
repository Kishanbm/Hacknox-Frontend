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
exports.getActiveHackathonsController = exports.getPublicLeaderboardController = void 0;
const admin_service_1 = require("../services/admin/admin.service"); // Reuse service function
const supabaseClient_1 = require("../lib/supabaseClient");
// ------------------------------------------------------------------
// GET /api/public/leaderboard (Public, Unauthenticated Endpoint)
// ------------------------------------------------------------------
const getPublicLeaderboardController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // --- PUBLIC ENDPOINT HARDENING ---
        // 1. Set defaults for public use (prevents DOS via large requests)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50; // Max 50 per page for public
        // 2. Allow limited public filters (e.g., by category, not team name)
        const filters = {
            category: req.query.category,
            // DO NOT expose teamName filtering for public view unless necessary
        };
        // 3. CRITICAL: Pass true for isPublishedFilter
        const result = yield (0, admin_service_1.getInternalLeaderboard)(page, limit, filters, true);
        // Return a consistent object shape with leaderboard array
        return res.status(200).json({
            message: 'Public leaderboard retrieved successfully.',
            leaderboard: result
        });
    }
    catch (error) {
        console.error("Controller Error [getPublicLeaderboardController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
});
exports.getPublicLeaderboardController = getPublicLeaderboardController;
// 1. Get List of Active Hackathons
const getActiveHackathonsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // We only want events that are currently 'active' and whose submission deadline has NOT passed.
        const { data, error } = yield supabaseClient_1.supabase
            .from('Hackathons')
            .select('id, name, slug, max_team_size, submission_deadline, status')
            .eq('status', 'active')
            .gte('submission_deadline', new Date().toISOString()) // Only future deadlines
            .order('submission_deadline', { ascending: true });
        if (error)
            throw error;
        return res.status(200).json({
            message: "Active hackathons retrieved successfully.",
            hackathons: data
        });
    }
    catch (error) {
        console.error("Get Active Hackathons Error:", error.message);
        return res.status(500).json({ message: "Failed to retrieve hackathons" });
    }
});
exports.getActiveHackathonsController = getActiveHackathonsController;
