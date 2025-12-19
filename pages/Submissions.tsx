import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { Rocket, Github, ExternalLink, Clock, Edit3, Eye, FileText, CheckCircle2 } from 'lucide-react';

interface Submission {
    id: string;
    projectName: string;
    hackathonName: string;
    teamName: string;
    status: 'Draft' | 'Submitted' | 'Evaluating' | 'Winner';
    lastUpdated: string;
    repoLink?: string;
    demoLink?: string;
}

const mockSubmissions: Submission[] = [
    {
        id: 's1',
        projectName: 'NeuroNet',
        hackathonName: 'HackOnX 2025',
        teamName: 'Alpha Squad',
        status: 'Draft',
        lastUpdated: '2 hours ago',
        repoLink: 'https://github.com/alex/neuronet'
    },
    {
        id: 's2',
        projectName: 'EcoTrack',
        hackathonName: 'Sustainable Future',
        teamName: 'GreenGen',
        status: 'Submitted',
        lastUpdated: '10 days ago',
        repoLink: 'https://github.com/alex/ecotrack',
        demoLink: 'https://youtu.be/xyz'
    },
    {
        id: 's3',
        projectName: 'DeFi Bridge',
        hackathonName: 'Defi Summer 2.0',
        teamName: 'BlockBusters',
        status: 'Winner',
        lastUpdated: 'Aug 2024',
        repoLink: 'https://github.com/alex/defi-bridge',
        demoLink: 'https://youtu.be/abc'
    }
];

const Submissions: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-heading text-gray-900">Project Registry</h1>
            <p className="text-gray-500">Track your hackathon submissions and project drafts.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
            {mockSubmissions.map((sub) => (
                <div key={sub.id} className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:shadow-md transition-shadow group">
                    <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${
                            sub.status === 'Draft' ? 'bg-gray-400 shadow-gray-200' : 
                            sub.status === 'Submitted' ? 'bg-blue-500 shadow-blue-200' : 
                            sub.status === 'Winner' ? 'bg-yellow-500 shadow-yellow-200' : 'bg-primary shadow-purple-200'
                        }`}>
                            <Rocket size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{sub.projectName}</h3>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                    sub.status === 'Draft' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                    sub.status === 'Submitted' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                    sub.status === 'Winner' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    'bg-purple-50 text-purple-600 border-purple-200'
                                }`}>
                                    {sub.status}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">{sub.hackathonName} • <span className="text-gray-400">with {sub.teamName}</span></p>
                            <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                <span className="flex items-center gap-1"><Clock size={12} /> Updated {sub.lastUpdated}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <div className="flex gap-2">
                            {sub.repoLink && (
                                <a href={sub.repoLink} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Repository">
                                    <Github size={18} />
                                </a>
                            )}
                            {sub.demoLink && (
                                <a href={sub.demoLink} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Video Demo">
                                    <ExternalLink size={18} />
                                </a>
                            )}
                        </div>
                        
                        <Link to={`/dashboard/submissions/${sub.id}`} className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                            sub.status === 'Draft' 
                            ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20' 
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}>
                            {sub.status === 'Draft' ? <><Edit3 size={16} /> Continue Edit</> : <><Eye size={16} /> View Project</>}
                        </Link>
                    </div>
                </div>
            ))}
            
            {/* Empty State visual if needed, currently showing items */}
            <div className="mt-8 p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 mx-auto mb-3 shadow-sm">
                     <FileText size={20} />
                 </div>
                 <p className="text-gray-500 text-sm">Want to submit a new project? Go to your active hackathon dashboard.</p>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Submissions;