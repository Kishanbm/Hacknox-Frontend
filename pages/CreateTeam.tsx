import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { Users, ChevronLeft, Flag, Target, UserPlus, CheckCircle2, Loader2 } from 'lucide-react';

const CreateTeam: React.FC = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    
    // Mock Hackathons for dropdown
    const hackathons = ['HackOnX 2025', 'Global AI Challenge', 'Sustainable Future'];

    const handleCreate = () => {
        setStatus('loading');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            // Redirect after showing success state
            setTimeout(() => {
                navigate('/dashboard/teams');
            }, 1500);
        }, 1500);
    };

    if (status === 'success') {
        return (
            <DashboardLayout>
                <div className="h-[80vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <CheckCircle2 size={48} />
                    </div>
                    <h1 className="text-4xl font-heading text-gray-900 mb-2">Squad Assembled!</h1>
                    <p className="text-gray-500">Your team has been created successfully.</p>
                    <p className="text-xs text-gray-400 mt-4">Redirecting to team dashboard...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto py-8">
                <button 
                    onClick={() => navigate(-1)} 
                    disabled={status === 'loading'}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-bold text-sm disabled:opacity-50"
                >
                    <ChevronLeft size={20} /> Back
                </button>

                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users size={32} />
                    </div>
                    <h1 className="text-3xl font-heading text-gray-900">Assemble Your Squad</h1>
                    <p className="text-gray-500 mt-2">Create a team, invite members, and start building.</p>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
                    {/* Loading Overlay */}
                    {status === 'loading' && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                            <Loader2 size={40} className="text-primary animate-spin mb-4" />
                            <p className="font-bold text-gray-900">Creating Team...</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Target size={16} /> Select Hackathon
                            </label>
                            <select className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors font-medium text-gray-900 appearance-none">
                                {hackathons.map(h => <option key={h}>{h}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Flag size={16} /> Team Name
                            </label>
                            <input 
                                type="text" 
                                placeholder="e.g. Quantum Coders" 
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors font-medium text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Team Bio / Pitch</label>
                            <textarea 
                                placeholder="What are you building? Who do you need?" 
                                className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors font-medium text-gray-900 resize-none"
                            ></textarea>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <div className="font-bold text-gray-900 flex items-center gap-2">
                                    <UserPlus size={16} /> Open for Members?
                                </div>
                                <div className="text-xs text-gray-500">Allow others to find and request to join.</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <button 
                            onClick={handleCreate}
                            className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 mt-4"
                        >
                            Create Team
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CreateTeam;