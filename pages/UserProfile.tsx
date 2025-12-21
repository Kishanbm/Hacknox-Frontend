import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { MapPin, Github, Linkedin, Trophy, Star, Zap, ChevronLeft, UserPlus, MessageCircle } from 'lucide-react';
import { authService } from '../services/auth.service';

const UserProfile: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setIsLoading(true);
            setError(null);
            try {
                const u = await authService.getUserById(id);
                setUser(u);
            } catch (err: any) {
                setError(err?.message || 'Failed to load user');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id]);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="h-96 flex items-center justify-center">Loading user...</div>
            </DashboardLayout>
        );
    }

    if (error || !user) {
        return (
            <DashboardLayout>
                <div className="h-96 flex items-center justify-center">{error || 'User not found'}</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
             <div className="max-w-5xl mx-auto pb-20 md:pb-0">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold text-sm transition-colors">
                    <ChevronLeft size={20} /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Sidebar */}
                    <div className="space-y-6">
                         <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm text-center">
                             <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-tr from-primary to-purple-400 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl md:text-4xl font-heading text-white border-4 border-white shadow-lg">
                                 {user.avatar_url ? <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-full"/> : (user.first_name?.[0] || user.email?.[0] || 'U')}
                             </div>
                             <h1 className="text-2xl md:text-3xl font-heading text-gray-900 mb-1">{(user.first_name || '') + (user.last_name ? ' ' + user.last_name : '')}</h1>
                             <p className="text-gray-500 font-medium mb-4 text-sm md:text-base">{user.email}</p>
                             
                             <div className="flex justify-center gap-3 mb-6">
                                 <button className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 text-sm shadow-lg">
                                     <UserPlus size={18} /> Connect
                                 </button>
                                 <button className="p-3 bg-gray-50 rounded-xl text-gray-600 hover:bg-primary hover:text-white transition-colors border border-gray-100">
                                     <MessageCircle size={20} />
                                 </button>
                             </div>

                             <div className="border-t border-gray-50 pt-6 space-y-3 text-left">
                                 <div className="flex items-center gap-3 text-gray-600 text-sm">
                                     <MapPin size={16} className="text-gray-400" /> {user.location || '—'}
                                 </div>
                                 <div className="flex items-center gap-3 text-gray-600 text-sm">
                                     <Github size={16} className="text-gray-400" /> <a href={user.github_url || '#'} className="hover:text-black hover:underline truncate block w-full">{user.github_url ? user.github_url.replace(/^https?:\/\//,'') : 'Not provided'}</a>
                                 </div>
                             </div>
                         </div>

                         {(user.skills && user.skills.length > 0) && (
                         <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                             <h3 className="font-bold text-gray-900 mb-4">Skills</h3>
                             <div className="flex flex-wrap gap-2">
                                 {user.skills.map((skill: string) => (
                                     <span key={skill} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">
                                         {skill}
                                     </span>
                                 ))}
                             </div>
                         </div>
                         )}
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                             <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
                                 <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-2">
                                     <Trophy size={16} className="md:w-5 md:h-5" />
                                 </div>
                                 <div className="font-heading text-lg md:text-xl text-gray-900">{user.wins ?? 0}</div>
                                 <div className="text-[10px] text-gray-400 uppercase font-bold">Wins</div>
                             </div>
                             <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
                                 <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                                     <Zap size={16} className="md:w-5 md:h-5" />
                                 </div>
                                 <div className="font-heading text-lg md:text-xl text-gray-900">{user.streak ?? 0}</div>
                                 <div className="text-[10px] text-gray-400 uppercase font-bold">Streak</div>
                             </div>
                             <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
                                 <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                                     <Star size={16} className="md:w-5 md:h-5" />
                                 </div>
                                 <div className="font-heading text-lg md:text-xl text-gray-900">{user.xp ?? 0}</div>
                                 <div className="text-[10px] text-gray-400 uppercase font-bold">XP</div>
                             </div>
                        </div>

                        {/* Bio */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-3">About</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {user.bio || 'No bio provided.'}
                            </p>
                        </div>
                        
                        {/* Past Hackathons (Mock) */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Participation History</h3>
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors gap-3 border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500 shrink-0">
                                            H1
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">HackOnX 2024</div>
                                            <div className="text-xs text-gray-500">Team Alpha • Finalist</div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 sm:text-right pl-14 sm:pl-0">Dec 2024</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors gap-3 border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500 shrink-0">
                                            G2
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">Global AI Jam</div>
                                            <div className="text-xs text-gray-500">Solo • Participant</div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 sm:text-right pl-14 sm:pl-0">Oct 2024</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
             </div>
        </DashboardLayout>
    );
};

export default UserProfile;