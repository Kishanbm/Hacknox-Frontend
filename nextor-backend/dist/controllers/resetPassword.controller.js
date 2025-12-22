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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.sendResetLink = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const supabaseClient_1 = require("../lib/supabaseClient");
const redisClient_1 = __importDefault(require("../lib/redisClient"));
const email_1 = require("../utils/email");
const TOKEN_EXPIRY_SECONDS = 900; // 15 minutes for security
// 1. FORGOT PASSWORD (POST /api/auth/forgot-password)
const sendResetLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        // A. Find the user by email
        const { data: users, error } = yield supabaseClient_1.supabase
            .from("Users")
            .select("id, email")
            .eq("email", email)
            .limit(1);
        if (error || !(users === null || users === void 0 ? void 0 : users.length)) {
            // NOTE: For security, we often send a 200 OK response even if the email doesn't exist 
            // to avoid leaking account existence status.
            return res.status(200).json({ message: "If an account exists, a password reset link has been sent to your email." });
        }
        const user = users[0];
        // B. Generate and Store Token in Redis (15 minutes)
        const token = crypto_1.default.randomBytes(32).toString("hex");
        // Key format: 'reset_token:<token>' holds the user's ID
        yield redisClient_1.default.set(`reset_token:${token}`, user.id, 'EX', TOKEN_EXPIRY_SECONDS);
        // C. Send Reset Email
        const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
        yield (0, email_1.sendEmail)({
            to: user.email,
            subject: "HackOnX Password Reset Request",
            html: `<p>You requested a password reset for your HackOnX account.</p>
             <p>Click the link below to set a new password. This link will expire in 15 minutes:</p>
             <a href="${resetLink}">${resetLink}</a>`,
        });
        return res.status(200).json({ message: "If an account exists, a password reset link has been sent to your email." });
    }
    catch (error) {
        console.error("sendResetLink error:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.sendResetLink = sendResetLink;
// 2. RESET PASSWORD (POST /api/auth/reset-password)
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and new password are required" });
        }
        // A. Get the user ID from Redis using the token
        const userId = yield redisClient_1.default.get(`reset_token:${token}`);
        const redisTokenKey = `reset_token:${token}`;
        if (!userId) {
            return res.status(404).json({ message: "Invalid or expired token." });
        }
        // B. Hash and update password
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        const { error: updateError } = yield supabaseClient_1.supabase
            .from("Users")
            .update({ password: hashedPassword })
            .eq("id", userId);
        if (updateError)
            throw updateError;
        // C. Delete the token from Redis
        yield redisClient_1.default.del(redisTokenKey);
        return res.status(200).json({ message: "Password reset successful. You can now log in with your new password." });
    }
    catch (error) {
        console.error("resetPassword error:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.resetPassword = resetPassword;
