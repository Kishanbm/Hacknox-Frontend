import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { Rocket, Github, ExternalLink, Clock, Edit3, Eye, FileText, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import submissionsService, { Submission } from '../services/submissions.service';
import { teamService } from '../services/team.service';
import { publicService } from '../services/public.service';

interface TeamWithHackathon {
  id: string;
  name: string;
  hackathon_id: string;
  hackathon_name?: string;
  hackathon_banner?: string;
  hackathon_slug?: string;
  submission_deadline?: string;
  is_leader?: boolean;
  status?: string;
  submission?: Submission;
}

const Submissions: React.FC = () => {
  const [teams, setTeams] = useState<TeamWithHackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    // If the page was opened with a hackathon query param (e.g. from HackathonDetail "Manage Submission"),
    // store it so API client sends `x-hackathon-id` header and the submissions endpoint can return results.
    const params = new URLSearchParams(location.search);
    const hackathonParam = params.get('hackathon');
    const teamParam = params.get('team');
    if (hackathonParam) {
      try {
        localStorage.setItem('selectedHackathonId', hackathonParam);
      } catch (e) {
        console.warn('Could not set selectedHackathonId in localStorage', e);
      }
    }

    loadTeamsAndSubmissions(hackathonParam || undefined, teamParam || undefined);
  }, []);

  const loadTeamsAndSubmissions = async (hackathonFilter?: string, teamFilter?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all teams user is part of (doesn't require hackathon header)
      const teamsResponse = await teamService.getMyTeams();
      const myTeams = Array.isArray(teamsResponse) ? teamsResponse : (teamsResponse as any)?.teams || [];
      // Log raw teams response for debugging verification status fields
      console.debug('[Submissions] Raw myTeams response:', myTeams);
      
      // For each team, fetch hackathon details and submission
      const enriched = await Promise.all(
        myTeams.map(async (team: any) => {
          try {
            // Apply optional filters: if query param provided, only include matching team/hackathon
            if (teamFilter && String(team.id) !== String(teamFilter)) return null;
            if (hackathonFilter && String(team.hackathon_id || team.hackathonId) !== String(hackathonFilter)) return null;
            const hackathonId = team.hackathon_id || team.hackathonId;
            if (!hackathonId) return null;
            
            // Store hackathon ID temporarily to fetch submission
            localStorage.setItem('selectedHackathonId', hackathonId);
            
            // Fetch hackathon details and submission in parallel
            const [hackathonDetails, submissionsResponse] = await Promise.all([
              publicService.getHackathonById(hackathonId).catch(() => null),
              submissionsService.getMySubmissions().catch(() => ({ submissions: [] })),
            ]);
            
            // Find submission for this hackathon
            const submission = submissionsResponse.submissions?.find((s: Submission) => 
              s.hackathon?.id === hackathonId || s.team?.id === team.id
            );
            
            return {
              id: team.id,
              name: team.name,
              hackathon_id: hackathonId,
              hackathon_name: hackathonDetails?.name || team.hackathon_name || 'Hackathon',
              hackathon_banner: hackathonDetails?.banner_url || hackathonDetails?.banner,
              hackathon_slug: hackathonDetails?.slug,
              submission_deadline: hackathonDetails?.submission_deadline,
              is_leader: team.leader_id === team.current_user_id || team.isLeader,
              // Preserve verification fields from the API so the UI can decide correctly
              status: team.status,
              verification_status: (team as any).verification_status,
              is_verified: (team as any).is_verified,
              submission,
            } as TeamWithHackathon;
          } catch (e) {
            console.warn('Failed to enrich team', team.id, e);
            return null;
          }
        })
      );
      // Log enriched teams to inspect verification fields returned from backend
      console.debug('[Submissions] Enriched teams:', enriched);
      
      setTeams(enriched.filter(Boolean) as TeamWithHackathon[]);
    } catch (err: any) {
      console.error('Failed to load teams and submissions:', err);
      setError(err.response?.data?.error || 'Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getDaysUntilDeadline = (deadline?: string): number => {
    if (!deadline) return 0;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleCreateSubmission = (hackathonId: string) => {
    localStorage.setItem('selectedHackathonId', hackathonId);
    // Navigate to submission detail page with create mode
    window.location.href = `/dashboard/submissions/create?hackathon=${hackathonId}`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-heading text-gray-900">Project Registry</h1>
            <p className="text-gray-500">Track your hackathon submissions and project drafts.</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-heading text-gray-900">Project Registry</h1>
            <p className="text-gray-500">Track your hackathon submissions and project drafts.</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <div>
              <h3 className="font-bold text-red-900 mb-1">Failed to load submissions</h3>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={loadTeamsAndSubmissions}
                className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-heading text-gray-900">Project Registry</h1>
            <p className="text-gray-500">Track your hackathon submissions and project drafts.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
            {teams.length > 0 ? (
              teams.map((team) => {
                const sub = team.submission;
                const daysLeft = getDaysUntilDeadline(team.submission_deadline);
                const hasSubmission = !!sub;

                return (
                  <div key={team.id} className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:shadow-md transition-shadow group">
                    <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg bg-gradient-to-tr from-[#5425FF] to-[#24FF00]`}>
                            <Rocket size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{sub?.title || `${team.hackathon_name} Submission`}</h3>
                                {hasSubmission && (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                    sub?.status === 'submitted' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                                  }`}>
                                      {sub?.status}
                                  </span>
                                )}
                            </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              {team.hackathon_name} • <span className="text-gray-400">with {team.name}</span>
                              {team.is_leader && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Team Leader</span>}
                              {
                                // Determine verification using multiple possible fields returned by backend
                                (() => {
                                  const statusRaw = (team as any).status || (team as any).verification_status || '';
                                  const isVerifiedFlag = (team as any).is_verified === true || String(statusRaw).toLowerCase() === 'verified' || String(statusRaw).toLowerCase() === 'accepted';
                                  const isRejected = String(statusRaw).toLowerCase() === 'rejected';
                                  if (isVerifiedFlag) {
                                    return (
                                      <span className="ml-2 text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded flex-inline items-center gap-1">
                                        <CheckCircle2 size={10} className="inline" /> Verified
                                      </span>
                                    );
                                  }
                                  if (isRejected) {
                                    return (
                                      <span className="ml-2 text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded flex-inline items-center gap-1">
                                        <AlertCircle size={10} className="inline" /> Rejected
                                      </span>
                                    );
                                  }
                                  return (
                                    <span className="ml-2 text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded flex-inline items-center gap-1">
                                      <Clock size={10} className="inline" /> Pending Verification
                                    </span>
                                  );
                                })()
                              }
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                <span className="flex items-center gap-1">
                                  <Clock size={12} /> {hasSubmission && sub?.updated_at ? `Updated ${formatDate(sub.updated_at)}` : (team.submission_deadline ? `${daysLeft} days left` : '')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <div className="flex gap-2">
                            {hasSubmission && sub?.repo_url && (
                                <a href={sub.repo_url} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Repository">
                                    <Github size={18} />
                                </a>
                            )}
                            {hasSubmission && sub?.demo_url && (
                                <a href={sub.demo_url} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Video Demo">
                                    <ExternalLink size={18} />
                                </a>
                            )}
                        </div>
                        
                        {hasSubmission ? (
                          <Link to={`/dashboard/submissions/${sub!.id}?hackathon=${team.hackathon_id}`} className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                            sub!.canEdit ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}>
                              {sub!.canEdit ? <><Edit3 size={16} /> Continue Edit</> : <><Eye size={16} /> View Project</>}
                          </Link>
                        ) : (
                          (() => {
                            const statusRaw = (team as any).status || (team as any).verification_status || '';
                            const isVerifiedFlag = (team as any).is_verified === true || String(statusRaw).toLowerCase() === 'verified' || String(statusRaw).toLowerCase() === 'accepted';
                            if (isVerifiedFlag) {
                              return (
                                <Link to={`/dashboard/submissions/create?hackathon=${team.hackathon_id}&team=${team.id}`} className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                                  <Plus size={16} /> Create Submission
                                </Link>
                              );
                            }
                            return (
                              <div className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gray-100 text-gray-500 font-bold flex items-center justify-center gap-2 border border-gray-200 cursor-not-allowed" title="Team must be verified by admin before submitting">
                                <AlertCircle size={16} /> Pending Verification
                              </div>
                            );
                          })()
                        )}
                    </div>
                </div>
                );
              })
            ) : (
              <div className="mt-8 p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 mx-auto mb-3 shadow-sm">
                  <FileText size={20} />
                </div>
                <p className="text-gray-500 text-sm mb-2 font-medium">No submissions yet</p>
                <p className="text-gray-400 text-xs">Want to submit a new project? Go to your active hackathon dashboard.</p>
              </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Submissions;