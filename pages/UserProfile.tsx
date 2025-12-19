import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { MapPin, Github, Linkedin, Trophy, Star, Zap, ChevronLeft, UserPlus, MessageCircle } from 'lucide-react';

const UserProfile: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock Data based on ID (In reality fetch)
    const user = {
        name: id === 'm5' ? 'David Kim' : 'Sarah Chen',
        handle: id === 'm5' ? '@davidkim_dev' : '@sarah_c',
        avatar: id === 'm5' ? 'DK' : 'SC',
        role: 'Full Stack Developer',
        location: 'Seoul, South Korea',
        bio: 'Building things on the internet. Obsessed with clean code and pixel-perfect UIs.',
        skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
        xp: 3400,
        streak: 5,
        wins: 1
    };

    return (
        <DashboardLayout>
             <div className="max-w-5xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold text-sm">
                    <ChevronLeft size={20} /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="space-y-6">
                         <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
                             <div className="w-32 h-32 bg-gradient-to-tr from-primary to-purple-400 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-heading text-white border-4 border-white shadow-lg">
                                 {user.avatar}
                             </div>
                             <h1 className="text-2xl font-heading text-gray-900 mb-1">{user.name}</h1>
                             <p className="text-gray-500 font-medium mb-4">{user.handle}</p>
                             
                             <div className="flex justify-center gap-3 mb-6">
                                 <button className="p-3 bg-gray-50 rounded-xl text-gray-600 hover:bg-primary hover:text-white transition-colors">
                                     <UserPlus size={20} />
                                 </button>
                                 <button className="p-3 bg-gray-50 rounded-xl text-gray-600 hover:bg-primary hover:text-white transition-colors">
                                     <MessageCircle size={20} />
                                 </button>
                             </div>

                             <div className="border-t border-gray-50 pt-6 space-y-3 text-left">
                                 <div className="flex items-center gap-3 text-gray-600 text-sm">
                                     <MapPin size={16} /> {user.location}
                                 </div>
                                 <div className="flex items-center gap-3 text-gray-600 text-sm">
                                     <Github size={16} /> <a href="#" className="hover:text-black hover:underline">github.com/{user.handle.replace('@','')}</a>
                                 </div>
                             </div>
                         </div>

                         <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                             <h3 className="font-bold text-gray-900 mb-4">Skills</h3>
                             <div className="flex flex-wrap gap-2">
                                 {user.skills.map(skill => (
                                     <span key={skill} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">
                                         {skill}
                                     </span>
                                 ))}
                             </div>
                         </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4">
                             <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                 <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-2">
                                     <Trophy size={20} />
                                 </div>
                                 <div className="font-heading text-xl text-gray-900">{user.wins}</div>
                                 <div className="text-[10px] text-gray-400 uppercase font-bold">Wins</div>
                             </div>
                             <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                 <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                                     <Zap size={20} />
                                 </div>
                                 <div className="font-heading text-xl text-gray-900">{user.streak}</div>
                                 <div className="text-[10px] text-gray-400 uppercase font-bold">Streak</div>
                             </div>
                             <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                 <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                                     <Star size={20} />
                                 </div>
                                 <div className="font-heading text-xl text-gray-900">{user.xp}</div>
                                 <div className="text-[10px] text-gray-400 uppercase font-bold">XP</div>
                             </div>
                        </div>

                        {/* Bio */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-3">About</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {user.bio}
                            </p>
                        </div>
                        
                        {/* Past Hackathons (Mock) */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Participation History</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500">
                                            H1
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">HackOnX 2024</div>
                                            <div className="text-xs text-gray-500">Team Alpha • Finalist</div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400">Dec 2024</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500">
                                            G2
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">Global AI Jam</div>
                                            <div className="text-xs text-gray-500">Solo • Participant</div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400">Oct 2024</span>
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