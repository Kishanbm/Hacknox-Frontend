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
exports.updateEmailPreferencesController = exports.updatePasswordController = exports.editMyProfile = exports.verifyEmail = exports.me = exports.logout = exports.login = exports.signup = exports.COOKIE_OPTIONS = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const supabaseClient_1 = require("../../lib/supabaseClient");
const redisClient_1 = __importDefault(require("../../lib/redisClient"));
const email_1 = require("../../utils/email"); // Reuse from Accrefin
const jwt_1 = require("../../utils/jwt");
dotenv_1.default.config();
// Standard JWT options for the HTTP-Only cookie (7 days)
const sameSiteValue = process.env.NODE_ENV === "production" ? "none" : "lax";
exports.COOKIE_OPTIONS = {
    httpOnly: true,
    // In production we need Secure + SameSite=None for cross-site cookies to work.
    // During local development, Secure cannot be true on http://localhost, and
    // browsers will reject SameSite=None without Secure. Use 'lax' locally.
    secure: process.env.NODE_ENV === "production",
    sameSite: sameSiteValue,
    path: "/",
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in milliseconds
};
// 1. SIGNUP CONTROLLER (POST /api/auth/signup)
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // A. Check if user exists
        const { data: existingUsers, error: checkError } = yield supabaseClient_1.supabase
            .from("Users")
            .select("id, is_verified")
            .eq("email", email);
        if (checkError)
            throw checkError;
        if (existingUsers && existingUsers.length > 0) {
            if (!existingUsers[0].is_verified) {
                return res.status(409).json({ message: "Account exists but not verified. Check your email." });
            }
            return res.status(409).json({ message: "User already exists" });
        }
        // B. Hash Password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // C. Create User (Auth Data ONLY)
        console.log("Attempting to insert user...");
        const { data: insertedUsers, error: insertUserError } = yield supabaseClient_1.supabase
            .from("Users")
            .insert([
            {
                email,
                password: hashedPassword,
                role: 'participant',
                is_verified: false,
            },
        ])
            .select("id, email, role");
        if (insertUserError) {
            console.error("Error during User Insert:", insertUserError.message);
            throw insertUserError;
        }
        const user = insertedUsers[0];
        console.log("User inserted successfully. ID:", user === null || user === void 0 ? void 0 : user.id);
        // D. Create Profile (Personal Data) - Linked by User ID
        const { error: insertProfileError } = yield supabaseClient_1.supabase
            .from("Profiles")
            .insert([
            {
                user_id: user.id,
                first_name: firstName,
                last_name: lastName,
            },
        ]);
        if (insertProfileError) {
            // Rollback: Delete the user if profile creation fails
            yield supabaseClient_1.supabase.from("Users").delete().eq("id", user.id);
            throw insertProfileError;
        }
        // E. Generate Verification Token & Store in Redis (24 hours)
        const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
        const expires_in_seconds = 86400;
        yield redisClient_1.default.set(`verify_email:${verificationToken}`, user.id, "EX", expires_in_seconds);
        // F. Send Email
        const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
        yield (0, email_1.sendEmail)({
            to: user.email,
            subject: "Verify your HackOnX Account",
            html: `<p>Welcome to HackOnX! Click below to verify your email and start your team registration:</p>
             <a href="${verificationLink}">${verificationLink}</a>`,
        });
        return res.status(201).json({
            message: "Success! User created. Please check your email to verify your account."
        });
    }
    catch (error) {
        console.error("Signup Error:", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.signup = signup;
// 2. LOGIN CONTROLLER (POST /api/auth/login)
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email and password are required" });
        // A. Fetch User + Profile Joined
        const { data: users, error } = yield supabaseClient_1.supabase
            .from("Users")
            .select(`
        id, email, password, role, is_verified,
        Profiles (first_name, last_name, avatar_url)
      `)
            .eq("email", email)
            .limit(1);
        if (error)
            throw error;
        const user = users === null || users === void 0 ? void 0 : users[0];
        if (!user)
            return res.status(404).json({ message: "Email not found" });
        // B. Check if user is verified
        if (!user.is_verified) {
            return res.status(403).json({
                message: "Account not verified. Please check your email for a verification link."
            });
        }
        // C. Compare input password with hashed password
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid password" });
        // Flatten the profile data for the frontend response
        const profile = Array.isArray(user.Profiles) ? user.Profiles[0] : user.Profiles;
        // D. Generate Token (Payload includes user ID and essential role for RBAC)
        const token = (0, jwt_1.generateToken)({
            uid: user.id,
            email: user.email,
            role: user.role, // Essential for requireRole middleware
        });
        // E. Set the token as an HttpOnly cookie
        res.cookie("token", token, exports.COOKIE_OPTIONS);
        // Log the Set-Cookie header for debugging local dev cookie issues
        try {
            const setCookieHeader = res.getHeader('Set-Cookie');
            console.log('Login response Set-Cookie header:', setCookieHeader);
        }
        catch (err) {
            // ignore
        }
        // F. Respond with user/profile data (excluding password hash)
        // In development provide the raw token in the JSON response as a
        // fallback so the client can use Authorization header when cookies
        // are blocked by browser SameSite/Secure requirements.
        const responsePayload = {
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: profile === null || profile === void 0 ? void 0 : profile.first_name,
                lastName: profile === null || profile === void 0 ? void 0 : profile.last_name,
                avatar: profile === null || profile === void 0 ? void 0 : profile.avatar_url,
            },
        };
        if (process.env.NODE_ENV !== "production") {
            responsePayload.token = token;
        }
        return res.status(200).json(responsePayload);
    }
    catch (error) {
        console.error("Login Error:", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.login = login;
// 3. LOGOUT CONTROLLER (POST /api/auth/logout)
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Clear the HttpOnly cookie that stores the JWT
    res.clearCookie("token", exports.COOKIE_OPTIONS);
    return res.status(200).json({ message: "Logged out successfully" });
});
exports.logout = logout;
// 5. ME CONTROLLER (GET /api/auth/me)
// Requires verifyAuthToken middleware
const me = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // The user data is already attached by verifyAuthToken middleware
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: User session invalid." });
        }
        // Fetch full user details from the database
        const { data: userRecord, error } = yield supabaseClient_1.supabase
            .from("Users")
            .select(`
                id, email, role,
                Profiles (first_name, last_name, avatar_url, bio, github_url)
            `)
            .eq("id", req.user.id)
            .single();
        if (error || !userRecord) {
            console.error("ME fetch error:", error);
            return res.status(404).json({ message: "User not found." });
        }
        return res.status(200).json({
            message: "User details retrieved successfully.",
            user: userRecord, // Frontend will access user.Profiles.first_name
        });
    }
    catch (err) {
        return res.status(500).json({ message: "Server error during profile retrieval." });
    }
});
exports.me = me;
// 4. VERIFY EMAIL CONTROLLER (POST /api/auth/verify-email)
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }
        // A. Find the user ID associated with this token in Redis
        const userId = yield redisClient_1.default.get(`verify_email:${token}`);
        if (!userId) {
            return res.status(404).json({ message: "Invalid or expired verification token." });
        }
        // B. Update the user to mark them as verified in the database
        const { error: updateError } = yield supabaseClient_1.supabase
            .from("Users")
            .update({
            is_verified: true,
        })
            .eq("id", userId);
        if (updateError)
            throw updateError;
        // C. Delete the token from Redis so it can't be reused
        yield redisClient_1.default.del(`verify_email:${token}`);
        // Frontend handles the final redirect after a successful verification
        return res.status(200).json({ message: "Email verified successfully. You can now log in." });
    }
    catch (error) {
        console.error("Email verification error:", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.verifyEmail = verifyEmail;
// 5. EDIT MY PROFILE (POST /api/auth/user/edit)
const editMyProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const updates = req.body;
        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No changes provided." });
        }
        // 1. Define Allowed Fields (Security Layer)
        // We only allow updating fields present in the 'Profiles' table.
        const allowedFields = [
            "first_name",
            "last_name",
            "avatar_url",
            "bio",
            "phone",
            "linkedin_url",
            "github_url"
        ];
        // 2. Filter the Input
        // Only keep keys that are in the allowedFields list
        const filteredUpdates = {};
        Object.keys(updates).forEach((key) => {
            if (allowedFields.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });
        if (Object.keys(filteredUpdates).length === 0) {
            return res.status(400).json({ message: "Invalid fields provided. You can only edit profile details." });
        }
        // 2. Fetch Existing Profile (Required to ensure NOT NULL fields are present)
        const { data: existingProfile, error: fetchError } = yield supabaseClient_1.supabase
            .from("Profiles")
            .select("first_name, last_name") // Only need the required fields
            .eq("id", userId)
            .maybeSingle(); // Use maybeSingle to get null if 0 rows
        if (fetchError)
            throw fetchError;
        // 3. Create the Final Payload for UPSERT
        let upsertPayload = Object.assign({ id: userId }, filteredUpdates);
        if (!existingProfile) {
            // SCENARIO: Profile is MISSING (user migrated or profile creation failed)
            // We must ensure first_name and last_name are provided, or fail.
            if (!updates.first_name || !updates.last_name) {
                return res.status(400).json({
                    message: "Profile is missing. Please provide both 'first_name' and 'last_name' to initialize your profile before saving other details."
                });
            }
        }
        else {
            // SCENARIO: Profile EXISTS (standard update)
            // If the update doesn't include the name, we merge the old name back in 
            // to prevent upsert from setting it to NULL.
            upsertPayload.first_name = updates.first_name || existingProfile.first_name;
            upsertPayload.last_name = updates.last_name || existingProfile.last_name;
        }
        // 4. Perform UPSERT
        upsertPayload.updated_at = new Date().toISOString(); // Add timestamp last
        const { data: updatedProfile, error: updateError } = yield supabaseClient_1.supabase
            .from("Profiles")
            .upsert(upsertPayload)
            .select()
            .single();
        if (updateError)
            throw updateError;
        return res.status(200).json({
            message: "Profile updated successfully.",
            profile: updatedProfile,
        });
    }
    catch (error) {
        console.error("Edit Profile Error:", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.editMyProfile = editMyProfile;
// 7. PATCH /api/auth/settings/password (Update Password)
const updatePasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both oldPassword and newPassword are required." });
        }
        // 1. Fetch current user data (including hashed password)
        const { data: users, error: fetchError } = yield supabaseClient_1.supabase
            .from("Users")
            .select("password")
            .eq("id", userId)
            .single();
        if (fetchError || !users) {
            return res.status(404).json({ message: "User not found." });
        }
        const user = users;
        // 2. Verify Old Password
        const isMatch = yield bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid old password." });
        }
        // 3. Hash New Password
        const newHashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        // 4. Update Database
        const { error: updateError } = yield supabaseClient_1.supabase
            .from("Users")
            .update({ password: newHashedPassword })
            .eq("id", userId);
        if (updateError)
            throw updateError;
        // Log the user out for a clean slate, forcing a login with the new password
        // (You should also clear the JWT cookie here, handled by a separate logout function usually)
        return res.status(200).json({ message: "Password updated successfully. Please log in again." });
    }
    catch (error) {
        console.error("Update Password Error:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.updatePasswordController = updatePasswordController;
// 8. PATCH /api/auth/settings/email-preferences (Update Email Preferences)
const updateEmailPreferencesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { allowMarketingEmails } = req.body;
        if (allowMarketingEmails === undefined || typeof allowMarketingEmails !== 'boolean') {
            return res.status(400).json({ message: "Invalid value for allowMarketingEmails." });
        }
        // Assumption: 'allow_marketing' column exists in the Users table
        const { error: updateError } = yield supabaseClient_1.supabase
            .from("Users")
            .update({ allow_marketing: allowMarketingEmails })
            .eq("id", userId);
        if (updateError)
            throw updateError;
        return res.status(200).json({
            message: "Email preferences updated successfully.",
            allowMarketingEmails
        });
    }
    catch (error) {
        console.error("Update Email Preferences Error:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.updateEmailPreferencesController = updateEmailPreferencesController;
