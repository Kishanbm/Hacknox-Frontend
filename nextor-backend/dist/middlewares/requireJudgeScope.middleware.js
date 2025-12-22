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
exports.requireJudgeScope = void 0;
const supabaseClient_1 = require("../lib/supabaseClient");
/**
 * Middleware to ensure the authenticated user is a judge and has assignments
 * within the requested hackathon (`hackathonId`).
 * Sources: req.hackathonId, req.query.hackathonId, req.body.hackathonId, x-hackathon-id header.
 */
const requireJudgeScope = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        if (role !== 'judge')
            return res.status(403).json({ message: 'Forbidden: Judge role required.' });
        const hackathonId = req.hackathonId || ((_c = req.query) === null || _c === void 0 ? void 0 : _c.hackathonId) || ((_d = req.body) === null || _d === void 0 ? void 0 : _d.hackathonId) || req.headers['x-hackathon-id'] || undefined;
        if (!hackathonId) {
            return res.status(400).json({ message: 'Missing required parameter: hackathonId. Provide as query param, request body, or x-hackathon-id header.' });
        }
        // Check JudgeAssignments for this judge and hackathon
        const { count, error } = yield supabaseClient_1.supabase
            .from('JudgeAssignments')
            .select('id', { count: 'exact', head: true })
            .eq('judge_id', userId)
            .eq('hackathon_id', hackathonId);
        if (error) {
            console.error('requireJudgeScope DB error:', error.message || error);
            return res.status(500).json({ message: 'Server error' });
        }
        if (!count || count === 0) {
            return res.status(403).json({ message: 'Forbidden. You have no assignments for this hackathon.' });
        }
        // Attach hackathonId for downstream handlers
        req.hackathonId = hackathonId;
        return next();
    }
    catch (err) {
        console.error('requireJudgeScope error:', err.message || err);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.requireJudgeScope = requireJudgeScope;
exports.default = exports.requireJudgeScope;
