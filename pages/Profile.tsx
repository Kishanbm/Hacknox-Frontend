import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { UserCircle, MapPin, Link as LinkIcon, Github, Twitter, Linkedin, Edit2, Award, Trophy, Star, Zap, Code, Briefcase, Building2, Calendar } from 'lucide-react';

const Profile: React.FC = () => {
    const navigate = useNavigate();

    const workExperience = [
        { 
            id: 1, 
            role: 'Senior Full Stack Developer', 
            company: 'TechFlow Systems', 
            period: '2022 - Present', 
            description: 'Leading the frontend architecture migration to React 18 and mentoring junior developers.' 
        },
        { 
            id: 2, 
            role: 'Frontend Engineer', 
            company: 'Creative Solutions', 
            period: '2020 - 2022', 
            description: 'Developed responsive web applications for e-commerce clients using Next.js and Tailwind CSS.' 
        }
    ];

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto pb-12">
                {/* Header Banner */}
                <div className="relative mb-12">
                    {/* Banner Image */}
                    <div className="h-48 md:h-64 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 w-full object-cover shadow-sm overflow-hidden relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    </div>
                    
                    {/* Profile Info Section - Pulled up with negative margin */}
                    <div className="px-6 md:px-10 relative -mt-16 sm:-mt-20 flex flex-col md:flex-row items-center md:items-end gap-6">
                        {/* Avatar */}
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white bg-gray-900 text-white flex items-center justify-center text-4xl font-heading shadow-2xl relative z-10 shrink-0">
                            AM
                            <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                        </div>
                        
                        {/* Name & Role */}
                        <div className="flex-1 text-center md:text-left pb-2 md:pb-6">
                            <h1 className="text-3xl md:text-4xl font-heading text-gray-900 mb-2 tracking-tight">Alex Morgan</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 text-gray-600 font-medium text-sm md:text-base">
                                <span className="flex items-center gap-1"><Code size={16} className="text-primary"/> Full Stack Developer</span>
                                <span className="hidden md:inline text-gray-300">•</span>
                                <span className="bg-purple-100 text-purple-700 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border border-purple-200">AI Enthusiast</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pb-2 md:pb-6 w-full md:w-auto">
                            <button 
                                onClick={() => navigate('/dashboard/profile/edit')} 
                                className="w-full md:w-auto px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-primary hover:border-primary transition-all shadow-sm flex items-center justify-center gap-2 group"
                            >
                                <Edit2 size={16} className="group-hover:scale-110 transition-transform"/> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Info */}
                    <div className="space-y-6">
                         <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                             <h3 className="font-bold text-gray-900 mb-4">About</h3>
                             <div className="space-y-4 text-sm text-gray-600">
                                 <div className="flex items-center gap-3">
                                     <MapPin size={18} className="text-gray-400 shrink-0" /> 
                                     <span className="font-medium text-gray-900">Bengaluru, India</span>
                                 </div>
                                 <div className="flex items-center gap-3">
                                     <LinkIcon size={18} className="text-gray-400 shrink-0" /> 
                                     <a href="#" className="text-primary hover:underline font-medium">alexmorgan.dev</a>
                                 </div>
                                 <hr className="border-gray-50 my-2" />
                                 <div className="flex items-center gap-3">
                                     <Github size={18} className="text-gray-400 shrink-0" /> 
                                     <a href="#" className="hover:text-black font-medium transition-colors">@alexcodes</a>
                                 </div>
                                 <div className="flex items-center gap-3">
                                     <Linkedin size={18} className="text-gray-400 shrink-0" /> 
                                     <a href="#" className="hover:text-blue-700 font-medium transition-colors">in/alex-morgan</a>
                                 </div>
                                 <div className="flex items-center gap-3">
                                     <Twitter size={18} className="text-gray-400 shrink-0" /> 
                                     <a href="#" className="hover:text-blue-400 font-medium transition-colors">@alex_m</a>
                                 </div>
                             </div>
                         </div>

                         <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                             <h3 className="font-bold text-gray-900 mb-4">Skills</h3>
                             <div className="flex flex-wrap gap-2">
                                 {['React', 'TypeScript', 'Node.js', 'Python', 'TensorFlow', 'Solidity', 'Tailwind', 'PostgreSQL'].map(skill => (
                                     <span key={skill} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-default">
                                         {skill}
                                     </span>
                                 ))}
                             </div>
                         </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Gamification Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                             <div className="bg-white border border-gray-100 p-6 rounded-3xl flex flex-col items-center text-center shadow-sm group hover:border-amber-200 transition-colors">
                                 <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                     <Trophy size={24} />
                                 </div>
                                 <div className="text-3xl font-heading text-gray-900 mb-1">2</div>
                                 <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Hackathons Won</div>
                             </div>
                             <div className="bg-white border border-gray-100 p-6 rounded-3xl flex flex-col items-center text-center shadow-sm group hover:border-indigo-200 transition-colors">
                                 <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                     <Zap size={24} />
                                 </div>
                                 <div className="text-3xl font-heading text-gray-900 mb-1">12</div>
                                 <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Streak Days</div>
                             </div>
                             <div className="bg-white border border-gray-100 p-6 rounded-3xl flex flex-col items-center text-center shadow-sm group hover:border-emerald-200 transition-colors">
                                 <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                     <Star size={24} />
                                 </div>
                                 <div className="text-3xl font-heading text-gray-900 mb-1">1,250</div>
                                 <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Total XP</div>
                             </div>
                        </div>

                        {/* Bio */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Bio</h3>
                            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                Passionate full-stack developer with a knack for building scalable web applications. I love participating in hackathons to challenge myself and learn new technologies. Currently exploring the intersection of Web3 and AI to build decentralized intelligent agents.
                            </p>
                        </div>

                        {/* Work Experience */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Briefcase size={20} className="text-primary" /> Work Experience
                            </h3>
                            <div className="space-y-8 relative">
                                {/* Timeline Line */}
                                {workExperience.length > 0 && <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-100"></div>}

                                {workExperience.map((job) => (
                                    <div key={job.id} className="relative pl-12 group">
                                        {/* Icon */}
                                        <div className="absolute left-0 top-0 w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 z-10 group-hover:border-primary group-hover:text-primary transition-colors shadow-sm">
                                            <Building2 size={18} />
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg">{job.role}</h4>
                                                <div className="font-medium text-primary text-sm">{job.company}</div>
                                            </div>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-gray-100 whitespace-nowrap w-fit">
                                                <Calendar size={12} /> {job.period}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {job.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Badges */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900">Badges Earned</h3>
                                <button className="text-xs font-bold text-primary hover:underline">View All</button>
                             </div>
                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                 {[
                                     { icon: '🥇', name: 'Winner', date: 'Mar 2024' },
                                     { icon: '🚀', name: 'Launcher', date: 'Feb 2024' },
                                     { icon: '💻', name: 'Coder', date: 'Jan 2024' },
                                     { icon: '🌟', name: 'Star', date: 'Dec 2023' }
                                 ].map((badge, i) => (
                                     <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group">
                                         <div className="text-4xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-sm">
                                             {badge.icon}
                                         </div>
                                         <div className="text-center">
                                            <div className="text-xs font-bold text-gray-900">{badge.name}</div>
                                            <div className="text-[10px] text-gray-400">{badge.date}</div>
                                         </div>
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