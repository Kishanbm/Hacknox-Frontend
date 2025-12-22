"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireHackathonId = void 0;
/**
 * Middleware to ensure `hackathonId` is provided on admin requests.
 * Sources checked (in order): `req.query.hackathonId`, `req.body.hackathonId`, `x-hackathon-id` header.
 * When present, attaches `hackathonId` to the request as `req.hackathonId`.
 */
const requireHackathonId = (req, res, next) => {
    var _a;
    const hackathonId = req.query.hackathonId || ((_a = req.body) === null || _a === void 0 ? void 0 : _a.hackathonId) || req.headers['x-hackathon-id'] || undefined;
    if (!hackathonId) {
        return res.status(400).json({ message: 'Missing required parameter: hackathonId. Provide as query param, request body, or x-hackathon-id header.' });
    }
    // Attach to request for downstream handlers (use any to avoid changing global typings here)
    req.hackathonId = hackathonId;
    next();
};
exports.requireHackathonId = requireHackathonId;
