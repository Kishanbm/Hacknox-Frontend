"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAuthToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("../utils/jwt"); // Utility to get JWT_SECRET
const JWT_SECRET = (0, jwt_1.getEnvVar)("JWT_SECRET");
/**
 * Middleware to verify the JWT token from the cookie.
 * If valid, it attaches the user data (id, email, role) to req.user.
 */
const verifyAuthToken = (req, res, next) => {
    var _a;
    // 1. Get token from the 'token' HTTP-Only cookie first.
    // Note: cookie-parser must be registered in index.ts for this to work.
    // If no cookie is present (common in dev due to SameSite/Secure), fall
    // back to Authorization: Bearer <token> header to allow local testing.
    let token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
    if (!token) {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice('Bearer '.length).trim();
        }
    }
    if (!token) {
        // If no token, terminate request as Unauthorized
        res.status(401).json({ message: "Authentication required: No session token provided." });
        return;
    }
    try {
        // 2. Verify the token signature and expiration
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // 3. Attach decoded user payload to the request
        req.user = {
            id: decoded.uid,
            email: decoded.email,
            role: decoded.role,
        };
        // Proceed to the next middleware/controller
        next();
    }
    catch (err) {
        console.error("Auth middleware error:", err.message);
        // Token is expired, invalid, or corrupted
        res.status(403).json({ message: "Session expired or invalid token." });
        return;
    }
};
exports.verifyAuthToken = verifyAuthToken;
