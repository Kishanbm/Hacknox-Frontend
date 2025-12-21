import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { Rocket, Github, ExternalLink, Clock, Edit3, Eye, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import submissionsService, { Submission } from '../services/submissions.service';

const Submissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await submissionsService.getMySubmissions();
      setSubmissions(response.submissions);
    } catch (err: any) {
      console.error('Failed to load submissions:', err);
      setError(err.response?.data?.error || 'Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-400 shadow-gray-200';
      case 'submitted':
        return 'bg-blue-500 shadow-blue-200';
      case 'evaluating':
        return 'bg-purple-500 shadow-purple-200';
      case 'winner':
        return 'bg-yellow-500 shadow-yellow-200';
      default:
        return 'bg-gray-400 shadow-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'submitted':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'evaluating':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'winner':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
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
                onClick={loadSubmissions}
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
            {submissions.length > 0 ? (
              submissions.map((sub) => (
                <div key={sub.id} className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:shadow-md transition-shadow group">
                    <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${getStatusColor(sub.status)}`}>
                            <Rocket size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{sub.title}</h3>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusBadgeColor(sub.status)}`}>
                                    {sub.status}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              {sub.hackathon.name} • <span className="text-gray-400">with {sub.team.name}</span>
                              {sub.isLeader && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Team Leader</span>}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                <span className="flex items-center gap-1">
                                  <Clock size={12} /> Updated {formatDate(sub.updated_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <div className="flex gap-2">
                            {sub.repo_url && (
                                <a href={sub.repo_url} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Repository">
                                    <Github size={18} />
                                </a>
                            )}
                            {sub.demo_url && (
                                <a href={sub.demo_url} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Video Demo">
                                    <ExternalLink size={18} />
                                </a>
                            )}
                        </div>
                        
                        <Link to={`/dashboard/submissions/${sub.id}?hackathon=${sub.hackathon.id}`} className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                            sub.canEdit
                            ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20' 
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}>
                            {sub.canEdit ? <><Edit3 size={16} /> Continue Edit</> : <><Eye size={16} /> View Project</>}
                        </Link>
                    </div>
                </div>
              ))
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