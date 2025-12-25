import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { MapPin, Github, Linkedin, Trophy, Star, Zap, ChevronLeft, UserPlus, Phone } from 'lucide-react';
import { publicService } from '../services/public.service';
import { authService } from '../services/auth.service';

const UserProfile: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [wins, setWins] = useState<number>(0);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setIsLoading(true);
            setError(null);
            try {
                const u = await authService.getUserById(id);
                setUser(u);
                try {
                    const res = await publicService.getUserWins(id);
                    setWins(res?.wins || 0);
                } catch (e) { setWins(0); }
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
                             
                             {/* contact buttons removed - replaced by contact info lines */}

                                 <div className="border-t border-gray-50 pt-6 space-y-3 text-left">
                                     {((user.phone || user.phone_number || (user.Profiles && user.Profiles.phone) || (user.Profiles && user.Profiles.phone_number))) && (
                                        <div className="flex items-center gap-3 text-gray-600 text-sm">
                                          <Phone size={16} className="text-green-500" />
                                          <span>{user.phone || user.phone_number || user.Profiles?.phone || user.Profiles?.phone_number}</span>
                                        </div>
                                     )}
                                     <div className="flex items-center gap-3 text-gray-600 text-sm">
                                         <MapPin size={16} className="text-blue-500" /> {user.location || '—'}
                                     </div>
                                     <div className="flex items-center gap-3 text-gray-600 text-sm">
                                         <Github size={16} className="text-black" /> <a href={user.github_url || '#'} className="hover:text-black hover:underline truncate block w-full">{user.github_url ? user.github_url.replace(/^https?:\/\//,'') : 'Not provided'}</a>
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
                        
                        {/* Wins + About side-by-side */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
                            <div className="col-span-1 flex">
                                <div className="bg-white p-4 md:p-6 rounded-3xl border border-gray-100 flex items-center justify-center shadow-sm w-full max-w-[320px] min-h-[160px]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                                            <Trophy size={18} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-heading text-2xl md:text-3xl text-gray-900">{wins}</div>
                                            <div className="text-xs text-gray-400 uppercase font-bold mt-1">Wins</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <div className="bg-white rounded-3xl p-4 md:p-8 border border-gray-100 shadow-sm h-full">
                                    <h3 className="font-bold text-gray-900 mb-3">About</h3>
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        {user.bio || 'No bio provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Past Hackathons (Mock) */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Participation History</h3>
                            <div className="space-y-4">
                                {user.participation_history && user.participation_history.length > 0 ? (
                                    user.participation_history.map((h: any, idx: number) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors gap-3 border border-transparent hover:border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500 shrink-0">
                                                    {h.hackathon_name ? h.hackathon_name.slice(0,2).toUpperCase() : 'HX'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm">{h.hackathon_name || 'Unknown Hackathon'}</div>
                                                    <div className="text-xs text-gray-500">{h.team_name ? `${h.team_name} • ${h.role}` : h.role}</div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-400 sm:text-right pl-14 sm:pl-0">{h.year || ''}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500">No participation history available.</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
             </div>
        </DashboardLayout>
    );
};

export default UserProfile;