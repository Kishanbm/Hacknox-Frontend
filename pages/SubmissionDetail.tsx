import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { ENDPOINTS } from '../config/endpoints';
import { ChevronLeft, Save, Send, Github, Video, ExternalLink, FileText, UploadCloud, Users, CheckCircle2 } from 'lucide-react';

const SubmissionDetail: React.FC = () => {
  const { id } = useParams();
  
  // Mock Data - In reality, fetch based on 'id'
  const isDraft = id === 's1'; // Simulate draft status for 's1'
  
  const [formData, setFormData] = useState({
      title: isDraft ? 'NeuroNet' : 'EcoTrack',
      tagline: isDraft ? 'AI-driven neural network visualization' : 'Sustainable supply chain tracking via Blockchain',
      description: isDraft ? '' : 'Full project description goes here...',
      repo: isDraft ? 'https://github.com/alex/neuronet' : 'https://github.com/alex/ecotrack',
      demo: isDraft ? '' : 'https://youtu.be/xyz',
      team: isDraft ? 'Alpha Squad' : 'GreenGen',
      hackathon: isDraft ? 'HackOnX 2025' : 'Sustainable Future'
  });

  // 🔗 API INTEGRATION POINT
  useEffect(() => {
      // if (id) {
      //    // LINK: Fetch Submission Details
      //    fetch(ENDPOINTS.SUBMISSIONS.DETAIL(id)).then(...) 
      // }
  }, [id]);

  const handleSaveDraft = () => {
      // 🔗 API LINK: POST or PUT Draft
      // fetch(ENDPOINTS.SUBMISSIONS.UPDATE(id), { method: 'PUT', body: JSON.stringify({...formData, status: 'Draft'}) })
      console.log('Saving Draft...', ENDPOINTS.SUBMISSIONS.UPDATE(id || 'new'));
  };

  const handleSubmit = () => {
      // 🔗 API LINK: Submit Final
      // fetch(ENDPOINTS.SUBMISSIONS.UPDATE(id), { method: 'PUT', body: JSON.stringify({...formData, status: 'Submitted'}) })
      console.log('Submitting...', ENDPOINTS.SUBMISSIONS.UPDATE(id || 'new'));
  };

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
                    isDraft ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-green-50 text-green-600 border-green-200'
                 }`}>
                    {isDraft ? 'Draft Status' : 'Submitted'}
                 </span>
            </div>
        </div>

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
                            <label className="block text-sm font-bold text-gray-700 mb-2">Project Name</label>
                            {isDraft ? (
                                <input 
                                    type="text" 
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors font-bold text-lg text-gray-900"
                                />
                            ) : (
                                <div className="text-2xl font-bold text-gray-900">{formData.title}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tagline</label>
                            {isDraft ? (
                                <input 
                                    type="text" 
                                    value={formData.tagline}
                                    onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-gray-700"
                                    placeholder="Short pitch (max 140 chars)"
                                />
                            ) : (
                                <div className="text-lg text-gray-600">{formData.tagline}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description (Markdown Supported)</label>
                            {isDraft ? (
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full h-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-gray-700 resize-none"
                                    placeholder="Describe your project, tech stack, and challenges..."
                                />
                            ) : (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-600">
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
                             {isDraft ? (
                                 <input 
                                    type="url" 
                                    value={formData.repo}
                                    onChange={(e) => setFormData({...formData, repo: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-gray-900"
                                    placeholder="https://github.com/username/repo"
                                 />
                             ) : (
                                 <a href={formData.repo} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary font-bold hover:underline">
                                     {formData.repo} <ExternalLink size={14}/>
                                 </a>
                             )}
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Video size={16} /> Demo Video URL
                             </label>
                             {isDraft ? (
                                 <input 
                                    type="url" 
                                    value={formData.demo}
                                    onChange={(e) => setFormData({...formData, demo: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-gray-900"
                                    placeholder="https://youtu.be/..."
                                 />
                             ) : (
                                 <a href={formData.demo} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary font-bold hover:underline">
                                     {formData.demo || 'No video uploaded'} <ExternalLink size={14}/>
                                 </a>
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
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Context</div>
                        <div className="font-bold text-gray-900 text-lg mb-1">{formData.hackathon}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <Users size={16} className="text-primary"/> {formData.team}
                        </div>
                    </div>

                    {isDraft ? (
                        <div className="space-y-3">
                            <button 
                                onClick={handleSaveDraft}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Save size={18} /> Save Draft
                            </button>
                            <button 
                                onClick={handleSubmit}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                <Send size={18} /> Submit Project
                            </button>
                            <p className="text-xs text-center text-gray-400 mt-2">
                                By submitting, you agree to the hackathon rules.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CheckCircle2 size={24} />
                            </div>
                            <h3 className="font-bold text-green-800">Submitted Successfully</h3>
                            <p className="text-xs text-green-600 mt-1">Updates are locked.</p>
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-2">Submission Checklist</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.repo ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                                <CheckCircle2 size={12}/>
                            </div>
                            Public Repository
                        </li>
                        <li className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.demo ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
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
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubmissionDetail;
