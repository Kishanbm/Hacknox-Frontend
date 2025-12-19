import React, { useState } from 'react';
import { DashboardLayout } from '../components/Layout';
import { UserCircle, MapPin, Link as LinkIcon, Github, Twitter, Linkedin, Edit2, Award, Trophy, Star, Zap } from 'lucide-react';

const Profile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header Banner */}
                <div className="relative mb-24">
                    <div className="h-48 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full object-cover"></div>
                    
                    {/* Floating Card */}
                    <div className="absolute top-24 left-6 right-6 md:left-12 flex flex-col md:flex-row items-end gap-6">
                        <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-900 text-white flex items-center justify-center text-3xl font-heading shadow-xl z-10">
                            AM
                        </div>
                        <div className="mb-4 flex-1">
                            <h1 className="text-3xl font-heading text-gray-900">Alex Morgan</h1>
                            <p className="text-gray-500 font-medium">Full Stack Developer • AI Enthusiast</p>
                        </div>
                        <div className="mb-4 flex gap-3">
                            <button onClick={() => setIsEditing(!isEditing)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                <Edit2 size={16} /> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Info */}
                    <div className="space-y-6">
                         <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                             <h3 className="font-bold text-gray-900 mb-4">About</h3>
                             <div className="space-y-3 text-sm text-gray-600">
                                 <div className="flex items-center gap-3">
                                     <MapPin size={18} className="text-gray-400" /> Bengaluru, India
                                 </div>
                                 <div className="flex items-center gap-3">
                                     <LinkIcon size={18} className="text-gray-400" /> <a href="#" className="text-primary hover:underline">alexmorgan.dev</a>
                                 </div>
                                 <div className="flex items-center gap-3">
                                     <Github size={18} className="text-gray-400" /> <a href="#" className="hover:text-black">@alexcodes</a>
                                 </div>
                                 <div className="flex items-center gap-3">
                                     <Linkedin size={18} className="text-gray-400" /> <a href="#" className="hover:text-blue-700">in/alex-morgan</a>
                                 </div>
                             </div>
                         </div>

                         <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                             <h3 className="font-bold text-gray-900 mb-4">Skills</h3>
                             <div className="flex flex-wrap gap-2">
                                 {['React', 'TypeScript', 'Node.js', 'Python', 'TensorFlow', 'Solidity'].map(skill => (
                                     <span key={skill} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">
                                         {skill}
                                     </span>
                                 ))}
                             </div>
                         </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Gamification Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-amber-100 p-6 rounded-3xl flex flex-col items-center text-center">
                                 <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-2">
                                     <Trophy size={20} />
                                 </div>
                                 <div className="text-2xl font-heading text-gray-900">2</div>
                                 <div className="text-xs text-amber-700 font-bold uppercase tracking-wide">Hackathons Won</div>
                             </div>
                             <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-indigo-100 p-6 rounded-3xl flex flex-col items-center text-center">
                                 <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                                     <Zap size={20} />
                                 </div>
                                 <div className="text-2xl font-heading text-gray-900">12</div>
                                 <div className="text-xs text-indigo-700 font-bold uppercase tracking-wide">Participation Streak</div>
                             </div>
                             <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-100 p-6 rounded-3xl flex flex-col items-center text-center">
                                 <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                                     <Star size={20} />
                                 </div>
                                 <div className="text-2xl font-heading text-gray-900">1,250</div>
                                 <div className="text-xs text-emerald-700 font-bold uppercase tracking-wide">Total XP</div>
                             </div>
                        </div>

                        {/* Bio */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Bio</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Passionate full-stack developer with a knack for building scalable web applications. I love participating in hackathons to challenge myself and learn new technologies. Currently exploring the intersection of Web3 and AI.
                            </p>
                        </div>

                        {/* Recent Badges */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                             <h3 className="font-bold text-gray-900 mb-6">Badges Earned</h3>
                             <div className="flex gap-4 overflow-x-auto pb-2">
                                 {[1, 2, 3, 4].map(i => (
                                     <div key={i} className="flex flex-col items-center gap-2 min-w-[100px]">
                                         <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl grayscale hover:grayscale-0 transition-all cursor-pointer">
                                             {['🥇', '🚀', '💻', '🌟'][i-1]}
                                         </div>
                                         <span className="text-xs font-bold text-gray-500">Badge Name</span>
                                     </div>
                                 ))}
                             </div>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;