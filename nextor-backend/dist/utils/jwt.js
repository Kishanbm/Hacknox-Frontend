"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
exports.getEnvVar = getEnvVar;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Helper to safely get environment variables
function getEnvVar(key) {
    var _a;
    const raw = (_a = process.env[key]) !== null && _a !== void 0 ? _a : "";
    // Trim whitespace, then remove surrounding single or double quotes
    return raw.trim().replace(/^['"]+|['"]+$/g, "");
}
const JWT_SECRET = getEnvVar("JWT_SECRET");
// Generates a new JWT token, expiring in 7 days (as per Accrefin)
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};
exports.generateToken = generateToken;
