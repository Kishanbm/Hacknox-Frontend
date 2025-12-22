import { Request, Response, CookieOptions } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { supabase } from "../../lib/supabaseClient";
import redisClient from "../../lib/redisClient";
import { sendEmail } from "../../utils/email";   // Reuse from Accrefin
import { getEnvVar, generateToken } from "../../utils/jwt";
import { Role } from "../../constants";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";

dotenv.config();

// Standard JWT options for the HTTP-Only cookie (7 days)
const sameSiteValue: boolean | "none" | "lax" | "strict" =
  process.env.NODE_ENV === "production" ? "none" : "lax";

export const COOKIE_OPTIONS: CookieOptions = {
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

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { firstName, lastName, email, password} = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // A. Check if user exists
    const { data: existingUsers, error: checkError } = await supabase
      .from("Users")
      .select("id, is_verified")
      .eq("email", email);

    if (checkError) throw checkError;

    if (existingUsers && existingUsers.length > 0) {
      if (!existingUsers[0].is_verified) {
        return res.status(409).json({ message: "Account exists but not verified. Check your email." });
      }
      return res.status(409).json({ message: "User already exists" });
    }

    // B. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // C. Create User (Auth Data ONLY)
    console.log("Attempting to insert user...");
    const { data: insertedUsers, error: insertUserError } = await supabase
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

    if (insertUserError){
      console.error("Error during User Insert:", insertUserError.message);
      throw insertUserError;
    } 
    const user = insertedUsers[0];
    console.log("User inserted successfully. ID:", user?.id);


    // D. Create Profile (Personal Data) - Linked by User ID
    const { error: insertProfileError } = await supabase
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
      await supabase.from("Users").delete().eq("id", user.id);
      throw insertProfileError;
    }

    // E. Generate Verification Token & Store in Redis (24 hours)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expires_in_seconds = 86400; 

    await redisClient.set(
      `verify_email:${verificationToken}`, 
      user.id, 
      "EX", 
      expires_in_seconds
    );

    // F. Send Email
    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
    
    await sendEmail({
      to: user.email,
      subject: "Verify your HackOnX Account",
      html: `<p>Welcome to HackOnX! Click below to verify your email and start your team registration:</p>
             <a href="${verificationLink}">${verificationLink}</a>`,
    });

    return res.status(201).json({
      message: "Success! User created. Please check your email to verify your account."
    });

  } catch (error: any) {
    console.error("Signup Error:", error.message);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// 2. LOGIN CONTROLLER (POST /api/auth/login)

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    // A. Fetch User + Profile Joined
    const { data: users, error } = await supabase
      .from("Users")
      .select(`
        id, email, password, role, is_verified,
        Profiles (first_name, last_name, avatar_url)
      `)
      .eq("email", email)
      .limit(1);

    if (error) throw error;
    const user = users?.[0];

    if (!user) return res.status(404).json({ message: "Email not found" });

    // B. Check if user is verified
    if (!user.is_verified) {
      return res.status(403).json({
        message: "Account not verified. Please check your email for a verification link."
      });
    }

    // C. Compare input password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    // Flatten the profile data for the frontend response
    const profile = Array.isArray(user.Profiles) ? user.Profiles[0] : user.Profiles;

    // D. Generate Token (Payload includes user ID and essential role for RBAC)
    const token = generateToken({
      uid: user.id,
      email: user.email,
      role: user.role, // Essential for requireRole middleware
    });

    // E. Set the token as an HttpOnly cookie
    res.cookie("token", token, COOKIE_OPTIONS as any);
        
      // Log the Set-Cookie header for debugging local dev cookie issues
      try {
        const setCookieHeader = res.getHeader('Set-Cookie');
        console.log('Login response Set-Cookie header:', setCookieHeader);
      } catch (err) {
        // ignore
      }

    // F. Respond with user/profile data (excluding password hash)
      // In development provide the raw token in the JSON response as a
      // fallback so the client can use Authorization header when cookies
      // are blocked by browser SameSite/Secure requirements.
      const responsePayload: any = {
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: profile?.first_name,
          lastName: profile?.last_name,
          avatar: profile?.avatar_url,
        },
      };

      if (process.env.NODE_ENV !== "production") {
        responsePayload.token = token;
      }

      return res.status(200).json(responsePayload);

  } catch (error: any) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// 3. LOGOUT CONTROLLER (POST /api/auth/logout)

export const logout = async (req: Request, res: Response): Promise<any> => {
  // Clear the HttpOnly cookie that stores the JWT
  res.clearCookie("token", COOKIE_OPTIONS as any);
  
  return res.status(200).json({ message: "Logged out successfully" });
};

// 5. ME CONTROLLER (GET /api/auth/me)

// Requires verifyAuthToken middleware

export const me = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    // The user data is already attached by verifyAuthToken middleware
    try {
        if (!req.user || !req.user.id) {
             return res.status(401).json({ message: "Unauthorized: User session invalid." });
        }

        // Fetch full user details from the database
        const { data: userRecord, error } = await supabase
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

    } catch (err) {
        return res.status(500).json({ message: "Server error during profile retrieval." });
    }
};

// 4. VERIFY EMAIL CONTROLLER (POST /api/auth/verify-email)
export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // A. Find the user ID associated with this token in Redis
    const userId = await redisClient.get(`verify_email:${token}`);

    if (!userId) {
      return res.status(404).json({ message: "Invalid or expired verification token." });
    }

    // B. Update the user to mark them as verified in the database
    const { error: updateError } = await supabase
      .from("Users")
      .update({
        is_verified: true,
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    // C. Delete the token from Redis so it can't be reused
    await redisClient.del(`verify_email:${token}`);

    // Frontend handles the final redirect after a successful verification
    return res.status(200).json({ message: "Email verified successfully. You can now log in." });

  } catch (error: any) {
    console.error("Email verification error:", error.message);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 5. EDIT MY PROFILE (POST /api/auth/user/edit)
export const editMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;
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
    const filteredUpdates: Record<string, any> = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ message: "Invalid fields provided. You can only edit profile details." });
    }

    // 2. Fetch Existing Profile (Required to ensure NOT NULL fields are present)
    const { data: existingProfile, error: fetchError } = await supabase
      .from("Profiles")
      .select("first_name, last_name") // Only need the required fields
      .eq("user_id", userId)
      .maybeSingle(); // Use maybeSingle to get null if 0 rows

    if (fetchError) throw fetchError;
    
    // 3. Create the Final Payload for UPSERT
    let upsertPayload: Record<string, any> = { user_id: userId, ...filteredUpdates };

    if (!existingProfile) {
        // SCENARIO: Profile is MISSING (user migrated or profile creation failed)
        // We must ensure first_name and last_name are provided, or fail.
        if (!updates.first_name || !updates.last_name) {
            return res.status(400).json({ 
                message: "Profile is missing. Please provide both 'first_name' and 'last_name' to initialize your profile before saving other details." 
            });
        }
    } else {
        // SCENARIO: Profile EXISTS (standard update)
        // If the update doesn't include the name, we merge the old name back in 
        // to prevent upsert from setting it to NULL.
        upsertPayload.first_name = updates.first_name || existingProfile.first_name;
        upsertPayload.last_name = updates.last_name || existingProfile.last_name;
    }
    
    // 4. Perform update or insert to avoid unique constraint conflicts on user_id
    const timestamp = new Date().toISOString();

    if (existingProfile) {
      // Update existing profile by user_id
      const { data: updatedProfile, error: updateError } = await supabase
        .from("Profiles")
        .update({ ...filteredUpdates, first_name: upsertPayload.first_name, last_name: upsertPayload.last_name, updated_at: timestamp })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      return res.status(200).json({
        message: "Profile updated successfully.",
        profile: updatedProfile,
      });
    } else {
      // Insert new profile row with user_id
      const insertPayload = { user_id: userId, ...filteredUpdates, first_name: upsertPayload.first_name, last_name: upsertPayload.last_name, updated_at: timestamp };
      const { data: insertedProfile, error: insertError } = await supabase
        .from('Profiles')
        .insert(insertPayload)
        .select()
        .single();

      if (insertError) throw insertError;

      return res.status(200).json({
        message: 'Profile created successfully.',
        profile: insertedProfile,
      });
    }

  } catch (error: any) {
    console.error("Edit Profile Error:", error.message);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 7. PATCH /api/auth/settings/password (Update Password)
export const updatePasswordController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user!.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both oldPassword and newPassword are required." });
        }

        // 1. Fetch current user data (including hashed password)
        const { data: users, error: fetchError } = await supabase
            .from("Users")
            .select("password")
            .eq("id", userId)
            .single();

        if (fetchError || !users) {
            return res.status(404).json({ message: "User not found." });
        }

        const user = users;

        // 2. Verify Old Password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid old password." });
        }
        
        // 3. Hash New Password
        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        
        // 4. Update Database
        const { error: updateError } = await supabase
            .from("Users")
            .update({ password: newHashedPassword })
            .eq("id", userId);

        if (updateError) throw updateError;

        // Log the user out for a clean slate, forcing a login with the new password
        // (You should also clear the JWT cookie here, handled by a separate logout function usually)
        return res.status(200).json({ message: "Password updated successfully. Please log in again." });

    } catch (error: any) {
        console.error("Update Password Error:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
};

// 8. PATCH /api/auth/settings/email-preferences (Update Email Preferences)
export const updateEmailPreferencesController = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user!.id;
        const { allowMarketingEmails } = req.body;

        if (allowMarketingEmails === undefined || typeof allowMarketingEmails !== 'boolean') {
             return res.status(400).json({ message: "Invalid value for allowMarketingEmails." });
        }
        
        // Assumption: 'allow_marketing' column exists in the Users table
        const { error: updateError } = await supabase
            .from("Users")
            .update({ allow_marketing: allowMarketingEmails })
            .eq("id", userId);

        if (updateError) throw updateError;
        
        return res.status(200).json({ 
            message: "Email preferences updated successfully.",
            allowMarketingEmails
        });

    } catch (error: any) {
        console.error("Update Email Preferences Error:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
};

// GET /api/auth/user/:id - fetch a user's public profile (protected)
export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'User id is required' });

    const { data: userRecord, error: fetchError } = await supabase
      .from('Users')
      .select('id, email, role, is_verified, created_at, Profiles (first_name, last_name, avatar_url, bio, github_url, linkedin_url, phone)')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!userRecord) return res.status(404).json({ message: 'User not found' });

    const profile = Array.isArray(userRecord.Profiles) ? userRecord.Profiles[0] : userRecord.Profiles || null;

    const result = {
      id: userRecord.id,
      email: userRecord.email,
      role: userRecord.role,
      is_verified: userRecord.is_verified,
      first_name: profile?.first_name || null,
      last_name: profile?.last_name || null,
      avatar_url: profile?.avatar_url || null,
      bio: profile?.bio || null,
      github_url: profile?.github_url || null,
      linkedin_url: profile?.linkedin_url || null,
      phone: profile?.phone || null,
      created_at: userRecord.created_at,
    };

    return res.status(200).json({ user: result });
  } catch (error: any) {
    console.error('Get User By Id Error:', error.message);
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};