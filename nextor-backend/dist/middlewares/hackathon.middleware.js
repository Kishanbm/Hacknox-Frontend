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
exports.requireHackathonOwner = void 0;
const supabaseClient_1 = require("../lib/supabaseClient");
const requireHackathonOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // 1. Get Hackathon ID from Params (URL) OR Body
        // We check both because some requests might use URL (:id) and others Body
        const hackathonId = req.params.id || req.body.hackathonId || req.query.hackathonId;
        if (!adminId) {
            return res.status(401).json({ message: "Unauthorized: No user found." });
        }
        if (!hackathonId) {
            return res.status(400).json({ message: "Hackathon ID is required for this action." });
        }
        // 2. Check the Database Link
        // We look for a row in 'HackathonAdmins' matching both IDs
        const { data, error } = yield supabaseClient_1.supabase
            .from('HackathonAdmins')
            .select('hackathon_id')
            .eq('hackathon_id', hackathonId)
            .eq('admin_id', adminId)
            .maybeSingle(); // Returns null if not found, instead of throwing error
        if (error) {
            console.error("Middleware DB Error:", error.message);
            return res.status(500).json({ message: "Server error verifying ownership." });
        }
        // 3. Decision
        if (!data) {
            // If no record found, this Admin does NOT own this Hackathon
            return res.status(403).json({ message: "Forbidden: You do not manage this Hackathon." });
        }
        // Success! Proceed to controller
        next();
    }
    catch (err) {
        console.error("Owner Middleware Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.requireHackathonOwner = requireHackathonOwner;
