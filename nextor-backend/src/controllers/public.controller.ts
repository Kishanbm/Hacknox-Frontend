import { Request, Response } from "express";
import { getInternalLeaderboard } from "../services/admin/admin.service"; // Reuse service function
import {supabase} from "../lib/supabaseClient";

// ------------------------------------------------------------------
// GET /api/public/leaderboard (Public, Unauthenticated Endpoint)
// ------------------------------------------------------------------

export const getPublicLeaderboardController = async (req: Request, res: Response): Promise<any> => {
    try {
        // --- PUBLIC ENDPOINT HARDENING ---
        // 1. Set defaults for public use (prevents DOS via large requests)
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50; // Max 50 per page for public
        
        // 2. Allow limited public filters (e.g., by category, not team name)
        const filters = {
            category: req.query.category as string,
            // DO NOT expose teamName filtering for public view unless necessary
        };
        
        // 3. CRITICAL: Pass true for isPublishedFilter
        const result = await getInternalLeaderboard(page, limit, filters, true); 

        // Return a consistent object shape with leaderboard array
        return res.status(200).json({
          message: 'Public leaderboard retrieved successfully.',
          leaderboard: result
        });

    } catch (error: any) {
        console.error("Controller Error [getPublicLeaderboardController]:", error.message);
        return res.status(500).json({ message: "Server Error", details: error.message });
    }
};


// 1. Get List of Active Hackathons
export const getActiveHackathonsController = async (req: Request, res: Response) => {
  try {
    // We only want events that are currently 'active' and whose submission deadline has NOT passed.
    const { data, error } = await supabase
      .from('Hackathons')
      .select('id, name, slug, max_team_size, submission_deadline, status')
      .eq('status', 'active')
      .gte('submission_deadline', new Date().toISOString()) // Only future deadlines
      .order('submission_deadline', { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      message: "Active hackathons retrieved successfully.",
      hackathons: data
    });

  } catch (error: any) {
    console.error("Get Active Hackathons Error:", error.message);
    return res.status(500).json({ message: "Failed to retrieve hackathons" });
  }
};

// 2. Get All Hackathons with optional status filtering
export const getAllHackathonsController = async (req: Request, res: Response) => {
  try {
    const statusFilter = req.query.status as string;

    // The DB schema stores flexible event details inside `event_info_json`.
    // Select only stable top-level columns and the JSON blob, then
    // map/flatten fields in application code to avoid mismatches.
    const { data, error } = await supabase
      .from('Hackathons')
      .select(`
        id,
        name,
        slug,
        status,
        submission_deadline,
        max_team_size,
        event_info_json,
        banner,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const raw = data || [];

    // Normalize and flatten fields from event_info_json for the frontend
    const normalized = raw.map((h: any) => {
      const info = h.event_info_json || {};

      const start_date = info.start_date || null;
      const end_date = info.end_date || null;
      const registration_deadline = info.registration_deadline || null;

      return {
        id: h.id,
        name: h.name,
        slug: h.slug,
        status: h.status,
        submission_deadline: h.submission_deadline,
        max_team_size: h.max_team_size,
        created_at: h.created_at,
        updated_at: h.updated_at,
        // Flattened from JSONB
        start_date,
        end_date,
        registration_deadline,
        organizer_name: info.organizer_name || info.organizer || null,
        organizer_logo: info.organizer_logo || info.organizer_logo_url || null,
        organizer_handle: info.organizer_handle || info.organizer_twitter || null,
        organizer_profile_slug: info.organizer_profile_slug || info.organizer_slug || null,
        location: info.location || info.city || null,
        venue: info.venue || null,
        timezone: info.timezone || null,
        mode: info.mode || null,
        description: info.description || null,
        theme: info.theme || info.themes || [],
        prizes: info.prizes || null,
        requirements: info.requirements || null,
        // UI / presentation helpers (fallback to top-level banner column)
        banner_url: info.banner_url || h.banner || info.hero_image || null,
        banner_gradient: info.banner_gradient || null,
        discord_url: info.discord_url || info.discord || null,
        registration_url: info.registration_url || info.registration_link || null,
        is_registration_open: (typeof info.is_registration_open === 'boolean') ? info.is_registration_open : null,
        // counts / stats (may be populated by background jobs or admin panel)
        registrations_count: (info.registrations_count !== undefined) ? info.registrations_count : null,
        teams_count: (info.teams_count !== undefined) ? info.teams_count : null,
        acceptance_rate: (info.acceptance_rate !== undefined) ? info.acceptance_rate : null,
        social_links: info.social_links || info.social || null,
        schedule: info.schedule || null,
        rules: info.rules || info.rules_text || null,
        raw_event_info: info
      };
    });

    // Apply status filter in application code (safer given flexible schema)
    const now = new Date();
    const filtered = (statusFilter && statusFilter !== 'All')
      ? normalized.filter((h: any) => {
          const s = h.start_date ? new Date(h.start_date) : null;
          const e = h.end_date ? new Date(h.end_date) : null;
          const r = h.registration_deadline ? new Date(h.registration_deadline) : null;

          if (statusFilter === 'Live') {
            return s && e && s <= now && e >= now;
          }
          if (statusFilter === 'Upcoming') {
            return s && s > now;
          }
          if (statusFilter === 'Registration Open') {
            return r && r >= now && s && s > now;
          }
          if (statusFilter === 'Past') {
            return e && e < now;
          }
          return true;
        })
      : normalized;

    return res.status(200).json({
      message: "Hackathons retrieved successfully.",
      hackathons: filtered
    });

  } catch (error: any) {
    console.error("Get All Hackathons Error:", error.message);
    return res.status(500).json({ message: "Failed to retrieve hackathons", details: error.message });
  }
};

// 3. Get Hackathon Detail by ID
export const getHackathonDetailController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const headerHackathonId = req.header('x-hackathon-id');

    // Optional: log if header differs
    if (headerHackathonId && headerHackathonId !== id) {
      console.warn(`Header hackathon id (${headerHackathonId}) differs from param id (${id})`);
    }

    const { data, error } = await supabase
      .from('Hackathons')
      .select(`
        id,
        name,
        slug,
        status,
        submission_deadline,
        max_team_size,
        event_info_json,
        banner,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Hackathon not found' });

    const info = data.event_info_json || {};
    const mapped = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      status: data.status,
      submission_deadline: data.submission_deadline,
      max_team_size: data.max_team_size,
      created_at: data.created_at,
      updated_at: data.updated_at,
      start_date: info.start_date || null,
      end_date: info.end_date || null,
      registration_deadline: info.registration_deadline || null,
      organizer_name: info.organizer_name || info.organizer || null,
      organizer_logo: info.organizer_logo || info.organizer_logo_url || null,
      location: info.location || info.city || null,
      venue: info.venue || null,
      timezone: info.timezone || null,
      mode: info.mode || null,
      description: info.description || null,
      theme: info.theme || info.themes || [],
      prizes: info.prizes || null,
      requirements: info.requirements || null,
      banner_url: info.banner_url || data.banner || info.hero_image || null,
      banner_gradient: info.banner_gradient || null,
      discord_url: info.discord_url || info.discord || null,
      registration_url: info.registration_url || info.registration_link || null,
      is_registration_open: (typeof info.is_registration_open === 'boolean') ? info.is_registration_open : null,
      registrations_count: (info.registrations_count !== undefined) ? info.registrations_count : null,
      teams_count: (info.teams_count !== undefined) ? info.teams_count : null,
      acceptance_rate: (info.acceptance_rate !== undefined) ? info.acceptance_rate : null,
      social_links: info.social_links || info.social || null,
      schedule: info.schedule || null,
      rules: info.rules || info.rules_text || null,
      raw_event_info: info
    };

    return res.status(200).json({ message: 'Hackathon retrieved successfully', hackathon: mapped });

  } catch (error: any) {
    console.error('Get Hackathon Detail Error:', error.message);
    return res.status(500).json({ message: 'Failed to retrieve hackathon', details: error.message });
  }
};