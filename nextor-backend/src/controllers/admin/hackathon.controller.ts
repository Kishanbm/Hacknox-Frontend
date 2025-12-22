import { Request, Response } from 'express';
import { supabase } from '../../lib/supabaseClient';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';
import { requireHackathonId } from '../../middlewares/requireHackathon.middleware';

// 1. Create a New Hackathon
export const createHackathonController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.id; // Auth middleware populates this
    const { name, submission_deadline, max_team_size, event_info_json } = req.body;

    if (!name || !submission_deadline) {
      return res.status(400).json({ message: "Name and Deadline are required." });
    }

    // Normalize event_info_json: accept object or string. If string, try parse, otherwise wrap.
    let normalizedEventInfo: any = null;
    if (event_info_json !== undefined) {
      if (typeof event_info_json === 'string') {
        try {
          normalizedEventInfo = JSON.parse(event_info_json);
        } catch (e) {
          // Not valid JSON — store as simple text field
          normalizedEventInfo = { text: event_info_json };
        }
      } else {
        normalizedEventInfo = event_info_json;
      }
    }

    // Call the RPC Transaction
    const { data, error } = await supabase.rpc('create_hackathon_transaction', {
      p_admin_id: adminId,
      p_name: name,
      p_deadline: submission_deadline,
      p_max_team_size: max_team_size || 4,
      p_event_info_json: normalizedEventInfo
    });

    if (error) throw error;

    // If frontend provided a banner URL, persist it on the created hackathon record
    const bannerUrl = req.body?.banner;
    let finalHackathon = data;
    if (bannerUrl && data && (data as any).id) {
      try {
        const { data: updated, error: upErr } = await supabase
          .from('Hackathons')
          .update({ banner: bannerUrl, updated_at: new Date().toISOString() })
          .eq('id', (data as any).id)
          .select()
          .single();
        if (upErr) console.warn('Failed to persist banner after RPC:', upErr.message || upErr);
        else finalHackathon = updated;
      } catch (e: any) {
        console.warn('Banner update failed:', e?.message || e);
      }
    }

    return res.status(201).json({
      message: "Hackathon created successfully!",
      hackathon: finalHackathon
    });

  } catch (error: any) {
    console.error("Create Hackathon Error:", error.message);
    return res.status(500).json({ message: "Failed to create hackathon", error: error.message });
  }
};

// 2. Get My Managed Hackathons
export const getMyHackathonsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    // Fetch all hackathons this admin manages. This is an entry-point route
    // and should not require an x-hackathon-id header.
    const { data, error } = await supabase
      .from('HackathonAdmins')
      .select(`
        hackathon:Hackathons (
          id, name, status, submission_deadline, max_team_size, created_at, banner
        )
      `)
      .eq('admin_id', adminId);

    if (error) throw error;

    // Flatten the response structure for the frontend
    const hackathons = data.map((entry: any) => entry.hackathon);

    return res.status(200).json({
      message: "Hackathons retrieved successfully.",
      hackathons: hackathons
    });

  } catch (error: any) {
    console.error("Get Hackathons Error:", error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

// 3. Update an Existing Hackathon
export const updateHackathonController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // The Hackathon ID from the URL
    // The request will only contain fields the Admin wants to change
    const updatePayload = req.body; 

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ message: "No update fields provided." });
    }

    // Optimization: Prevent accidental slug changes via API
    if (updatePayload.slug) {
        delete updatePayload.slug;
    }
    
    // Perform the update
    const { data, error } = await supabase
      .from('Hackathons')
      .update({ ...updatePayload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
        return res.status(404).json({ message: "Hackathon not found or update failed." });
    }

    return res.status(200).json({
      message: "Hackathon updated successfully.",
      hackathon: data
    });

  } catch (error: any) {
    console.error("Update Hackathon Error:", error.message);
    return res.status(500).json({ message: "Failed to update hackathon", error: error.message });
  }
};

// 4. Delete Hackathon (Hard Delete)
// NOTE: Due to CASCADE rules in SQL, this will delete ALL Teams, Submissions, 
// and Scores linked to this event. Use with caution!


// 4. Delete an Existing Hackathon
export const deleteHackathonController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // The Hackathon ID from the URL
    
    // The ownership check is already done by the requireHackathonOwner middleware.
    
    // Perform the deletion
    const { error, count } = await supabase
      .from('Hackathons')
      .delete()
      .eq('id', id)
      // count will be the number of rows deleted (should be 1)
      .limit(1); 

    if (error) throw error;

    if (count === 0) {
        return res.status(404).json({ message: "Hackathon not found or deletion failed." });
    }

    return res.status(200).json({
      message: `Hackathon with ID ${id} and all related data deleted successfully.`,
      deletedId: id
    });

  } catch (error: any) {
    console.error("Delete Hackathon Error:", error.message);
    return res.status(500).json({ message: "Failed to delete hackathon", error: error.message });
  }
};