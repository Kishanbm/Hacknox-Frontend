import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabaseClient';
import { AuthenticatedRequest } from './authMiddleware';

/**
 * Middleware to ensure the authenticated user is a judge and has assignments
 * within the requested hackathon (`hackathonId`).
 * Sources: req.hackathonId, req.query.hackathonId, req.body.hackathonId, x-hackathon-id header.
 */
export const requireJudgeScope = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (role !== 'judge') return res.status(403).json({ message: 'Forbidden: Judge role required.' });

    const hackathonId = (req as any).hackathonId || (req.query?.hackathonId as string) || (req.body?.hackathonId as string) || (req.headers['x-hackathon-id'] as string) || undefined;

    if (!hackathonId) {
      return res.status(400).json({ message: 'Missing required parameter: hackathonId. Provide as query param, request body, or x-hackathon-id header.' });
    }

    // Check JudgeAssignments for this judge and hackathon
    const { count, error } = await supabase
      .from('JudgeAssignments')
      .select('id', { count: 'exact', head: true })
      .eq('judge_id', userId)
      .eq('hackathon_id', hackathonId);

    if (error) {
      console.error('requireJudgeScope DB error:', error.message || error);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!count || count === 0) {
      return res.status(403).json({ message: 'Forbidden. You have no assignments for this hackathon.' });
    }

    // Attach hackathonId for downstream handlers
    (req as any).hackathonId = hackathonId;
    return next();
  } catch (err: any) {
    console.error('requireJudgeScope error:', err.message || err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default requireJudgeScope;
