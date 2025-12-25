import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import submissionsService, { SubmissionDetail as SubmissionDetailType } from '../services/submissions.service';
import { teamService } from '../services/team.service';
import { publicService } from '../services/public.service';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, Save, Send, Github, Video, ExternalLink, FileText, UploadCloud, Users, CheckCircle2, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';

const SubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [submission, setSubmission] = useState<SubmissionDetailType | null>(null);
  const [searchParams] = useSearchParams();
  const [hackathonIdParam, setHackathonIdParam] = useState<string | null>(null);
  const creating = id === 'create' || id === 'new';
  const [teamIdParam, setTeamIdParam] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
      title: '',
      description: '',
      repo_url: '',
      demo_url: ''
  });
  const [deadlinePassed, setDeadlinePassed] = useState(false);
  const [hackathonInfo, setHackathonInfo] = useState<any>(null);

  // Derived states
  const isLeader = submission?.team?.leader_id === user?.id;
  const isDraft = submission?.status === 'draft';
  const canEdit = isLeader && isDraft && !deadlinePassed;

  // Fetch hackathon info to check deadline
  useEffect(() => {
    const fetchHackathonInfo = async (hackathonId: string) => {
      try {
        const info = await publicService.getHackathonById(hackathonId);
        setHackathonInfo(info);
        
        const deadline = info?.submission_deadline || info?.submissionDeadline;
        if (deadline) {
          const now = new Date();
          const deadlineDate = new Date(deadline);
          setDeadlinePassed(now > deadlineDate);
        }
      } catch (err) {
        console.debug('Could not fetch hackathon info:', err);
      }
    };

    const hId = hackathonIdParam || submission?.hackathon_id;
    if (hId) {
      fetchHackathonInfo(hId);
    }
  }, [hackathonIdParam, submission?.hackathon_id]);

  useEffect(() => {
      const h = searchParams.get('hackathon') || searchParams.get('hackathonId');
      const t = searchParams.get('team');
      if (h) setHackathonIdParam(h);
      if (t) setTeamIdParam(t);

      if (id && !creating) {
        loadSubmissionDetails(h || undefined);
      } else if (creating) {
        // initialize create mode (empty form) — provide a fallback submission object
        setIsLoading(false);
        const fallback = {
          id: 'new',
          title: '',
          description: '',
          repo_url: '',
          demo_url: '',
          status: 'draft',
          team: { id: t || '', name: 'Your Team', members: [], leader_id: user?.id },
          zip_storage_path: null,
          updated_at: new Date().toISOString(),
          hackathon_id: h || undefined,
        } as SubmissionDetailType;
        setSubmission(fallback);
        setFormData({ title: '', description: '', repo_url: '', demo_url: '' });

        // If a team id is provided in query params, fetch its details and prefill the project title with the team name
        (async () => {
          try {
            if (t) {
              const team = await teamService.getTeamById(t);
              const teamName = (team && (team.name || team.team_name)) ? (team.name || team.team_name) : null;
              const teamMembers = team?.members || [];
              const memberCount = teamMembers.length || (team?.member_count ?? 1);
              if (teamName) {
                setFormData(prev => ({ ...prev, title: teamName }));
                setSubmission(prev => prev ? ({ 
                  ...prev, 
                  team: { 
                    ...(prev.team || {}), 
                    name: teamName,
                    members: teamMembers,
                    leader_id: team?.leader_id || prev.team?.leader_id
                  } 
                }) : prev);
              }
            }
          } catch (err) {
            // ignore: fetching team name is best-effort for prefill
            console.debug('Could not prefill submission title from team:', err);
          }
        })();
      }
  }, [id]);

    const loadSubmissionDetails = async (hackathonId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!id) {
        setError('No submission ID provided');
        return;
      }

      const response = await submissionsService.getSubmissionDetails(id, hackathonId || hackathonIdParam || undefined);
      setSubmission(response.submission);
      
      // Populate form with current data
      setFormData({
        title: response.submission.title || '',
        description: response.submission.description || '',
        repo_url: response.submission.repo_url || '',
        demo_url: response.submission.demo_url || ''
      });
    } catch (err: any) {
      console.error('Failed to load submission details:', err);
      setError(err.response?.data?.message || 'Failed to load submission details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Check if deadline has passed
      if (deadlinePassed) {
        setError('Submission deadline has passed. You can no longer save or edit submissions.');
        return;
      }

      if (creating) {
        // creating a new submission: need team id from query params
        if (!teamIdParam) {
          setError('No team specified for submission');
          return;
        }

        // Client-side safety: verify current user belongs to the team
        try {
          const team = await teamService.getTeamById(teamIdParam);
          const currentUserId = user?.id;
          const isMember = !!(
            team && (
              team.leader_id === currentUserId ||
              (Array.isArray(team.members) && team.members.some((m: any) => (m.user && (m.user.id === currentUserId)) || m.user_id === currentUserId))
            )
          );
          if (!isMember) {
            setError('You must belong to the specified team to create a submission.');
            return;
          }
        } catch (e) {
          console.debug('Could not verify team membership on client:', e);
        }
        // If a zip file is selected, send multipart/form-data
        let created;
        if (zipFile) {
          created = await submissionsService.createSubmissionWithFile({
            team_id: teamIdParam,
            title: formData.title,
            description: formData.description,
            repo_url: formData.repo_url,
            demo_url: formData.demo_url,
          }, zipFile, hackathonIdParam || undefined, (p) => setUploadProgress(p));
        } else {
          const data = {
            team_id: teamIdParam,
            title: formData.title,
            description: formData.description,
            repo_url: formData.repo_url,
            demo_url: formData.demo_url,
          };
          created = await submissionsService.createSubmission(data, hackathonIdParam || undefined);
        }
        if (created && created.submission && created.submission.id) {
          // navigate to the created submission details page
          navigate(`/dashboard/submissions/${created.submission.id}?hackathon=${hackathonIdParam || ''}`);
          return;
        }
        setSuccessMessage('Draft saved successfully!');
      } else {
        if (!id) return;
        await submissionsService.updateSubmission(id, formData, hackathonIdParam || submission?.hackathon_id || undefined);
        setSuccessMessage('Draft saved successfully!');

        // Reload submission to get updated data
        await loadSubmissionDetails();
      }
    } catch (err: any) {
      console.error('Failed to save draft:', err);
      setError(err.response?.data?.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

        // Check if deadline has passed
        if (deadlinePassed) {
          setError('Submission deadline has passed. You can no longer submit.');
          return;
        }

        if (creating) {
          if (!teamIdParam) {
            setError('No team specified for submission');
            return;
          }

          // Client-side safety: verify current user belongs to the team
          try {
            const team = await teamService.getTeamById(teamIdParam);
            const currentUserId = user?.id;
            const isMember = !!(
              team && (
                team.leader_id === currentUserId ||
                (Array.isArray(team.members) && team.members.some((m: any) => (m.user && (m.user.id === currentUserId)) || m.user_id === currentUserId))
              )
            );
            if (!isMember) {
              setError('You must belong to the specified team to create a submission.');
              return;
            }
          } catch (e) {
            console.debug('Could not verify team membership on client:', e);
          }

          if (!formData.title.trim()) {
            setError('Project title is required');
            return;
          }
          if (!formData.repo_url.trim()) {
            setError('GitHub repository URL is required');
            return;
          }

          // Require a ZIP archive for new submissions
          if (!zipFile && !submission?.zip_storage_path) {
            setError('A ZIP archive (.zip) is required to submit this project');
            return;
          }

          // create draft first (use multipart if there's a zip file)
        let created;
        if (zipFile) {
          created = await submissionsService.createSubmissionWithFile({
            team_id: teamIdParam,
            title: formData.title,
            description: formData.description,
            repo_url: formData.repo_url,
            demo_url: formData.demo_url,
          }, zipFile, hackathonIdParam || undefined, (p) => setUploadProgress(p));
        } else {
          created = await submissionsService.createSubmission({
            team_id: teamIdParam,
            title: formData.title,
            description: formData.description,
            repo_url: formData.repo_url,
            demo_url: formData.demo_url,
          }, hackathonIdParam || undefined);
        }

        if (created && created.submission && created.submission.id) {
          // finalize
          await submissionsService.finalizeSubmission(created.submission.id, hackathonIdParam || undefined);
          navigate(`/dashboard/submissions/${created.submission.id}?hackathon=${hackathonIdParam || ''}`);
          return;
        }

        setError('Failed to create submission');
      } else {
        if (!id) return;

        // Validate required fields
        if (!formData.title.trim()) {
          setError('Project title is required');
          return;
        }
        if (!formData.repo_url.trim()) {
          setError('GitHub repository URL is required');
          return;
        }

        // Save current changes first
        await submissionsService.updateSubmission(id, formData);
        
        // Then finalize the submission
        await submissionsService.finalizeSubmission(id, hackathonIdParam || submission?.hackathon_id || undefined);
        
        setSuccessMessage('Submission finalized successfully!');
        
        // Reload to show submitted state
        await loadSubmissionDetails();
      }
    } catch (err: any) {
      console.error('Failed to submit:', err);
      setError(err.response?.data?.message || 'Failed to submit project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto pb-12">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-gray-500">Loading submission details...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !submission) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto pb-12">
          <div className="mb-8">
            <Link to="/dashboard/submissions" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold text-sm">
              <ChevronLeft size={20} /> Back to Registry
            </Link>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <div>
              <h3 className="font-bold text-red-900 mb-1">Failed to load submission</h3>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => loadSubmissionDetails()}
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

  if (!submission) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-12">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
            <Link to="/dashboard/submissions" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold text-sm">
                <ChevronLeft size={20} /> Back to Registry
            </Link>
            <div className="flex items-center gap-2">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    submission.status === 'draft' ? 'bg-gray-100 text-gray-600 border-gray-200' : 
                    submission.status === 'submitted' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    submission.status === 'evaluating' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                 }`}>
                    {submission.status}
                 </span>
                 {isLeader && (
                   <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary border border-primary/20">
                     Team Leader
                   </span>
                 )}
            </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="text-green-500 shrink-0" size={20} />
            <p className="text-sm text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Deadline Warning */}
        {deadlinePassed && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
            <div>
              <h3 className="font-bold text-amber-800">Submission Deadline Passed</h3>
              <p className="text-sm text-amber-700">The deadline for this hackathon has passed. You can view your submission but cannot make any changes.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Editor / Viewer */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="font-heading text-xl text-gray-900 flex items-center gap-2">
                            <FileText size={20} className="text-primary"/> Project Details
                        </h2>
                    </div>
                    
                    <div className="p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Project Name <span className="text-red-500">*</span></label>
                            {canEdit ? (
                                <input 
                                    type="text" 
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors font-bold text-lg text-gray-900"
                                    placeholder="Enter project name"
                                />
                            ) : (
                                <div className="text-2xl font-bold text-gray-900">{formData.title || 'Untitled Project'}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description (Markdown Supported)</label>
                            {canEdit ? (
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full h-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-gray-700 resize-none"
                                    placeholder="Describe your project, tech stack, challenges, and impact..."
                                />
                            ) : (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-600 whitespace-pre-wrap">
                                    {formData.description || "No description provided."}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Media Links */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                        <h2 className="font-heading text-xl text-gray-900 flex items-center gap-2">
                            <UploadCloud size={20} className="text-purple-500"/> Submission Assets
                        </h2>
                    </div>
                    <div className="p-8 space-y-6">
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Github size={16} /> GitHub Repository URL <span className="text-red-500">*</span>
                             </label>
                             {canEdit ? (
                                 <input 
                                    type="url" 
                                    value={formData.repo_url}
                                    onChange={(e) => setFormData({...formData, repo_url: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-gray-900"
                                    placeholder="https://github.com/username/repo"
                                 />
                             ) : (
                                 formData.repo_url ? (
                                   <a href={formData.repo_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary font-bold hover:underline">
                                       {formData.repo_url} <ExternalLink size={14}/>
                                   </a>
                                 ) : (
                                   <p className="text-gray-400 text-sm">No repository link provided</p>
                                 )
                             )}
                        </div>
                        {/* Submission Archive (zip) */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <FileText size={16} /> Submission Archive {creating && <span className="text-red-500">*</span>}
                          </label>
                          {submission.zip_storage_path ? (
                            (() => {
                              const path = submission.zip_storage_path as string;
                              const url = path.startsWith('http')
                                ? path
                                : path.startsWith('/')
                                  ? path
                                  : `/uploads/${path}`;
                              const fileName = url.split('/').pop();
                              return (
                                <div className="flex items-center justify-between gap-4">
                                  <div className="text-sm text-gray-700">{fileName}</div>
                                  <a href={url} target="_blank" rel="noreferrer" download className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Download
                                  </a>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="space-y-2">
                              <p className="text-gray-400 text-sm">No archive uploaded</p>
                              <div className="flex items-center gap-3">
                                <input
                                  id="zipFile"
                                  type="file"
                                  accept=".zip,application/zip"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0] || null;
                                    setZipFile(f);
                                  }}
                                  className="hidden"
                                />
                                <button
                                  onClick={() => {
                                    // trigger hidden file input
                                    const el = document.getElementById('zipFile') as HTMLInputElement | null;
                                    el?.click();
                                  }}
                                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90"
                                >
                                  {zipFile ? 'Change ZIP' : 'Upload ZIP'}
                                </button>
                                {zipFile ? (
                                  <div className="text-sm text-gray-700">
                                    {zipFile.name}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-400">No file selected</div>
                                )}
                                {uploadProgress !== null && (
                                  <div className="text-sm text-gray-500">{uploadProgress}%</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Video size={16} /> Demo Video URL
                             </label>
                             {canEdit ? (
                                 <input 
                                    type="url" 
                                    value={formData.demo_url}
                                    onChange={(e) => setFormData({...formData, demo_url: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-gray-900"
                                    placeholder="https://youtu.be/..."
                                 />
                             ) : (
                                 formData.demo_url ? (
                                   <a href={formData.demo_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary font-bold hover:underline">
                                       {formData.demo_url} <ExternalLink size={14}/>
                                   </a>
                                 ) : (
                                   <p className="text-gray-400 text-sm">No demo video provided</p>
                                 )
                             )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Controls */}
            <div className="space-y-6">
                
                {/* Status Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="mb-6">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Team</div>
                        <div className="font-bold text-gray-900 text-lg mb-1">{submission.team.name}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <Users size={16} className="text-primary"/> {(submission.team.members?.length ?? 0) || 1} member{((submission.team.members?.length ?? 0) || 1) !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {canEdit ? (
                        <div className="space-y-3">
                            <button 
                                onClick={handleSaveDraft}
                                disabled={isSaving || deadlinePassed}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {isSaving ? 'Saving...' : 'Save Draft'}
                            </button>
                            <button 
                              onClick={handleSubmit}
                              disabled={isSubmitting || !formData.title.trim() || !formData.repo_url.trim() || (creating && !zipFile && !submission?.zip_storage_path) || deadlinePassed}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                {isSubmitting ? 'Submitting...' : 'Submit Project'}
                            </button>
                            <p className="text-xs text-center text-gray-400 mt-2">
                                By submitting, you agree to the hackathon rules. Submissions cannot be edited after submission.
                            </p>
                        </div>
                    ) : isDraft && !isLeader ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                            <h3 className="font-bold text-yellow-800">View Only</h3>
                            <p className="text-xs text-yellow-600 mt-1">Only the team leader can edit drafts.</p>
                        </div>
                    ) : (
                        <div className={`${
                          submission.status === 'submitted' ? 'bg-blue-50 border-blue-200' :
                          submission.status === 'evaluating' || submission.status === 'under-review' ? 'bg-purple-50 border-purple-200' :
                          submission.status === 'winner' ? 'bg-yellow-50 border-yellow-200' :
                          submission.status === 'evaluated' || submission.status === 'accepted' ? 'bg-green-50 border-green-200' :
                          submission.status === 'rejected' ? 'bg-red-50 border-red-200' :
                          'bg-gray-50 border-gray-200'
                        } border rounded-xl p-4 text-center`}>
                            <div className={`w-12 h-12 ${
                              submission.status === 'submitted' ? 'bg-blue-100 text-blue-600' :
                              submission.status === 'evaluating' || submission.status === 'under-review' ? 'bg-purple-100 text-purple-600' :
                              submission.status === 'winner' ? 'bg-yellow-100 text-yellow-600' :
                              submission.status === 'evaluated' || submission.status === 'accepted' ? 'bg-green-100 text-green-600' :
                              submission.status === 'rejected' ? 'bg-red-100 text-red-600' :
                              'bg-gray-100 text-gray-600'
                            } rounded-full flex items-center justify-center mx-auto mb-2`}>
                                <CheckCircle2 size={24} />
                            </div>
                            <h3 className={`font-bold ${
                              submission.status === 'submitted' ? 'text-blue-800' :
                              submission.status === 'evaluating' || submission.status === 'under-review' ? 'text-purple-800' :
                              submission.status === 'winner' ? 'text-yellow-800' :
                              submission.status === 'evaluated' || submission.status === 'accepted' ? 'text-green-800' :
                              submission.status === 'rejected' ? 'text-red-800' :
                              'text-gray-800'
                            }`}>
                              {submission.status === 'submitted' ? 'Submitted Successfully' :
                               submission.status === 'evaluating' || submission.status === 'under-review' ? 'Under Evaluation' :
                               submission.status === 'winner' ? 'Winner! 🎉' :
                               submission.status === 'evaluated' || submission.status === 'accepted' ? 'Evaluation Complete' :
                               submission.status === 'rejected' ? 'Submission Rejected' :
                               'Submitted'}
                            </h3>
                            <p className={`text-xs mt-1 ${
                              submission.status === 'submitted' ? 'text-blue-600' :
                              submission.status === 'evaluating' || submission.status === 'under-review' ? 'text-purple-600' :
                              submission.status === 'winner' ? 'text-yellow-600' :
                              submission.status === 'evaluated' || submission.status === 'accepted' ? 'text-green-600' :
                              submission.status === 'rejected' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {submission.status === 'winner' ? 'Congratulations on your achievement!' : 
                               submission.status === 'evaluated' || submission.status === 'accepted' ? 'Your project has been evaluated.' :
                               submission.status === 'rejected' ? 'Your submission was not accepted.' :
                               'Edits are locked.'}
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-2">Submission Checklist</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.repo_url ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                                <CheckCircle2 size={12}/>
                            </div>
                            Public Repository
                        </li>
                        <li className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.demo_url ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                                <CheckCircle2 size={12}/>
                            </div>
                            Video Demo
                        </li>
                        <li className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.description ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                                <CheckCircle2 size={12}/>
                            </div>
                            Project Description
                        </li>
                        <li className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.title ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                                <CheckCircle2 size={12}/>
                            </div>
                            Project Name
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubmissionDetail;
