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
exports.requireParticipantScope = void 0;
const supabaseClient_1 = require("../lib/supabaseClient");
/**
 * Middleware to ensure the authenticated user is a participant in the specified hackathon.
 * Sources for hackathonId: req.hackathonId (previous middleware), req.body.hackathonId, req.query.hackathonId, x-hackathon-id header.
 * When present and valid, attaches `teamId` and `hackathonId` to the request object as `(req as any).teamId` and `(req as any).hackathonId`.
 */
const requireParticipantScope = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const hackathonId = req.hackathonId || ((_b = req.body) === null || _b === void 0 ? void 0 : _b.hackathonId) || ((_c = req.query) === null || _c === void 0 ? void 0 : _c.hackathonId) || req.headers['x-hackathon-id'] || undefined;
        if (!hackathonId) {
            return res.status(400).json({ message: 'Missing required parameter: hackathonId. Provide as query param, request body, or x-hackathon-id header.' });
        }
        // Look for a TeamMembers row for this user where the related Team has the hackathon_id
        const { data, error } = yield supabaseClient_1.supabase
            .from('TeamMembers')
            .select('team_id, team:Teams (hackathon_id)')
            .eq('user_id', userId)
            .maybeSingle();
        if (error) {
            console.error('requireParticipantScope DB error:', error.message || error);
            return res.status(500).json({ message: 'Server error' });
        }
        // `team` can be returned as an array or an object depending on the query; normalize it to an object
        const teamObj = Array.isArray(data.team) ? data.team[0] : data.team;
        if (!data || !teamObj || teamObj.hackathon_id !== hackathonId) {
            return res.status(403).json({ message: 'Forbidden. You are not registered for this hackathon.' });
        }
        req.teamId = data.team_id;
        req.hackathonId = hackathonId;
        return next();
    }
    catch (err) {
        console.error('requireParticipantScope error:', err.message || err);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.requireParticipantScope = requireParticipantScope;
exports.default = exports.requireParticipantScope;
