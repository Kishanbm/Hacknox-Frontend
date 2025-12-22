import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabaseClient';
import { AuthenticatedRequest } from './authMiddleware';

/**
 * Middleware to ensure the authenticated user is a participant in the specified hackathon.
 * Sources for hackathonId: req.hackathonId (previous middleware), req.body.hackathonId, req.query.hackathonId, x-hackathon-id header.
 * When present and valid, attaches `teamId` and `hackathonId` to the request object as `(req as any).teamId` and `(req as any).hackathonId`.
 */
export const requireParticipantScope = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const hackathonId = (req as any).hackathonId || (req.body?.hackathonId as string) || (req.query?.hackathonId as string) || (req.headers['x-hackathon-id'] as string) || undefined;

    if (!hackathonId) {
      return res.status(400).json({ message: 'Missing required parameter: hackathonId. Provide as query param, request body, or x-hackathon-id header.' });
    }

    // Look for a TeamMembers row for this user where the related Team has the hackathon_id
    const { data, error } = await supabase
      .from('TeamMembers')
      .select('team_id, team:Teams (hackathon_id)')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('requireParticipantScope DB error:', error.message || error);
      return res.status(500).json({ message: 'Server error' });
    }

    // `team` can be returned as an array or an object depending on the query; normalize it to an object
    const teamObj: any = Array.isArray((data as any).team) ? (data as any).team[0] : (data as any).team;

    if (!data || !teamObj || teamObj.hackathon_id !== hackathonId) {
      return res.status(403).json({ message: 'Forbidden. You are not registered for this hackathon.' });
    }

    (req as any).teamId = (data as any).team_id;
    (req as any).hackathonId = hackathonId;
    return next();
  } catch (err: any) {
    console.error('requireParticipantScope error:', err.message || err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default requireParticipantScope;
