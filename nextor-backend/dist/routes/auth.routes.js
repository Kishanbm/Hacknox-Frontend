"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth/auth.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const resetPassword_controller_1 = require("../controllers/resetPassword.controller");
const recaptcha_middleware_1 = require("../middlewares/recaptcha.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const router = (0, express_1.Router)();
// Public routes (Validation -> reCAPTCHA -> Controller)
router.post("/signup", (0, validation_middleware_1.validate)(validation_middleware_1.signupValidation), recaptcha_middleware_1.verifyRecaptcha, auth_controller_1.signup);
router.post("/login", (0, validation_middleware_1.validate)(validation_middleware_1.loginValidation), auth_controller_1.login);
router.post("/verify-email", auth_controller_1.verifyEmail);
// Protected routes (Token required)
router.post("/logout", auth_controller_1.logout);
router.get("/me", authMiddleware_1.verifyAuthToken, auth_controller_1.me);
// Password Reset routes
router.post("/forgot-password", resetPassword_controller_1.sendResetLink);
router.post("/reset-password", resetPassword_controller_1.resetPassword);
// User profile routes
router.post("/user/edit", authMiddleware_1.verifyAuthToken, auth_controller_1.editMyProfile);
// --- Settings Routes (All Protected) ---
// Note: We are using '/auth' prefix in index.ts, so the path is /api/auth/settings/...
router.patch("/settings/password", authMiddleware_1.verifyAuthToken, auth_controller_1.updatePasswordController);
router.patch("/settings/email-preferences", authMiddleware_1.verifyAuthToken, auth_controller_1.updateEmailPreferencesController);
// Example of Admin protected route (requires token AND 'admin' role)
// router.get("/admin/dashboard", verifyAuthToken, requireRole(["admin"]), (req, res) => res.send("Welcome, Admin!")); 
exports.default = router;
