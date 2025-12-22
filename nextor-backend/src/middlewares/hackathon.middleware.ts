import { Response, NextFunction } from 'express';
import { supabase } from '../lib/supabaseClient';
import { AuthenticatedRequest } from './authMiddleware';
export const requireHackathonOwner = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user?.id;
    
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
    const { data, error } = await supabase
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

  } catch (err) {
    console.error("Owner Middleware Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};