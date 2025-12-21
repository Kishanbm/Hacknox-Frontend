import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import submissionsService, { SubmissionDetail as SubmissionDetailType } from '../services/submissions.service';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, Save, Send, Github, Video, ExternalLink, FileText, UploadCloud, Users, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const SubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [submission, setSubmission] = useState<SubmissionDetailType | null>(null);
  const [searchParams] = useSearchParams();
  const [hackathonIdParam, setHackathonIdParam] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
      title: '',
      description: '',
      repo_url: '',
      demo_url: ''
  });

  // Derived states
  const isLeader = submission?.team?.leader_id === user?.id;
  const isDraft = submission?.status === 'draft';
  const canEdit = isLeader && isDraft;

  useEffect(() => {
      const h = searchParams.get('hackathon') || searchParams.get('hackathonId');
      if (h) setHackathonIdParam(h);
      if (id) {
        loadSubmissionDetails(h || undefined);
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

      if (!id) return;

      await submissionsService.updateSubmission(id, formData, hackathonIdParam || submission?.hackathon_id || undefined);
      setSuccessMessage('Draft saved successfully!');
      
      // Reload submission to get updated data
      await loadSubmissionDetails();
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
                            <FileText size={16} /> Submission Archive
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
                            <p className="text-gray-400 text-sm">No archive uploaded</p>
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
                            <Users size={16} className="text-primary"/> {submission.team.members?.length || 0} members
                        </div>
                    </div>

                    {canEdit ? (
                        <div className="space-y-3">
                            <button 
                                onClick={handleSaveDraft}
                                disabled={isSaving}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {isSaving ? 'Saving...' : 'Save Draft'}
                            </button>
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.title.trim() || !formData.repo_url.trim()}
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
                          submission.status === 'evaluating' ? 'bg-purple-50 border-purple-200' :
                          'bg-yellow-50 border-yellow-200'
                        } border rounded-xl p-4 text-center`}>
                            <div className={`w-12 h-12 ${
                              submission.status === 'submitted' ? 'bg-blue-100 text-blue-600' :
                              submission.status === 'evaluating' ? 'bg-purple-100 text-purple-600' :
                              'bg-yellow-100 text-yellow-600'
                            } rounded-full flex items-center justify-center mx-auto mb-2`}>
                                <CheckCircle2 size={24} />
                            </div>
                            <h3 className={`font-bold ${
                              submission.status === 'submitted' ? 'text-blue-800' :
                              submission.status === 'evaluating' ? 'text-purple-800' :
                              'text-yellow-800'
                            }`}>
                              {submission.status === 'submitted' ? 'Submitted Successfully' :
                               submission.status === 'evaluating' ? 'Under Evaluation' :
                               'Winner! 🎉'}
                            </h3>
                            <p className={`text-xs mt-1 ${
                              submission.status === 'submitted' ? 'text-blue-600' :
                              submission.status === 'evaluating' ? 'text-purple-600' :
                              'text-yellow-600'
                            }`}>
                              {submission.status === 'winner' ? 'Congratulations on your achievement!' : 'Edits are locked.'}
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
