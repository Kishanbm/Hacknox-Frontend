import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { 
    UserCircle, MapPin, Link as LinkIcon, Github, Twitter, Linkedin, 
    Edit2, Award, Trophy, Star, Zap, Code, Briefcase, Building2, Calendar, Share2
} from 'lucide-react';
import { authService } from '../services/auth.service';
import { publicService } from '../services/public.service';
import { MeResponse } from '../types/api';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<MeResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [wins, setWins] = useState<number>(0);
    const [participatedCount, setParticipatedCount] = useState<number>(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const data = await authService.me();
                setUser(data);
                // fetch wins
                try {
                    const res = await publicService.getUserWins((data as any).id || (data as any).user_id || '');
                    setWins(res?.wins || 0);
                } catch (e) {
                    setWins(0);
                }

                // call canonical participation endpoint from backend
                try {
                    const p = await publicService.getUserParticipation((data as any).id || (data as any).user_id || '');
                    setParticipatedCount(p?.count || 0);
                } catch (e) {
                    // fallback to previous heuristics
                    let count = 0;
                    try {
                        if (data.Profiles && Array.isArray((data.Profiles as any).participation_history)) {
                            count = (data.Profiles as any).participation_history.length;
                        } else if (Array.isArray((data as any).participation_history)) {
                            count = (data as any).participation_history.length;
                        } else if (data.Profiles && typeof (data.Profiles as any).hackathons_participated === 'number') {
                            count = (data.Profiles as any).hackathons_participated;
                        } else {
                            const hackathonIds = new Set<string | number>();
                            if (Array.isArray((data as any).teams)) {
                                (data as any).teams.forEach((t: any) => { if (t.hackathon_id) hackathonIds.add(String(t.hackathon_id)); });
                            }
                            if (Array.isArray((data as any).submissions)) {
                                (data as any).submissions.forEach((s: any) => { if (s.hackathon_id) hackathonIds.add(String(s.hackathon_id)); });
                            }
                            count = hackathonIds.size;
                        }
                    } catch (err) { count = 0; }
                    setParticipatedCount(count || 0);
                }
            } catch (err: any) {
                console.error('Failed to fetch profile:', err);
                setError(err.message || 'Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Show loading state
    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading profile...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Show error state
    if (error || !user) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error || 'Failed to load profile'}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Get user initials for avatar
    const getInitials = () => {
        const first = user.Profiles?.first_name?.[0] || '';
        const last = user.Profiles?.last_name?.[0] || '';
        return (first + last).toUpperCase() || 'U';
    };

    // Get full name
    const fullName = `${user.Profiles?.first_name || ''} ${user.Profiles?.last_name || ''}`.trim() || 'User';

    const bannerExists = !!(user.Profiles?.banner_url || (user.Profiles as any)?.banner);
    const editBtnClass = bannerExists
        ? "px-4 py-2 bg-white text-black rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg z-20 border border-gray-100"
        : "px-4 py-2 bg-[#5425FF] text-white rounded-xl text-sm font-bold hover:bg-[#3b2bff] transition-all flex items-center gap-2 shadow-lg z-20";

    // Prefer server-provided experiences if available; otherwise show none
    const workExperience = (user.Profiles?.experiences && Array.isArray(user.Profiles.experiences) && user.Profiles.experiences.length > 0)
        ? user.Profiles.experiences.map((e: any, i: number) => ({ id: `db-${i}`, role: e.role || 'Contributor', company: e.company || '', period: e.period || '', description: e.description || '' }))
        : [];

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto pb-12">
                
                {/* Identity Card */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8 relative">
                    {/* Banner */}
                    <div className="h-48 w-full relative">
                        {user.Profiles?.banner_url ? (
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${user.Profiles.banner_url})` }}
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
                        )}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={() => navigate('/dashboard/profile/edit')}
                                className={editBtnClass}
                            >
                                <Edit2 size={16} /> Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="px-8 pb-8 pt-0 relative flex flex-col items-center text-center">
                        {/* Avatar - Centered and Overlapping */}
                        <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-900 text-white flex items-center justify-center text-4xl font-heading shadow-xl relative -mt-16 mb-4 z-10 overflow-hidden">
                            {user.Profiles?.avatar_url ? (
                                <img 
                                    src={user.Profiles.avatar_url} 
                                    alt={fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                getInitials()
                            )}
                        </div>

                        {/* Name & Headline */}
                        <h1 className="text-3xl font-heading text-gray-900 mb-2">{fullName}</h1>
                        
                        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                {user.role === 'participant' ? 'Participant' : user.role === 'judge' ? 'Judge' : 'Admin'}
                            </span>
                            {((user as any).is_verified || (user as any).verified || (user.Profiles as any)?.is_verified) && (
                                <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                    ✓ Verified
                                </span>
                            )}
                            {user.Profiles?.location && (
                                <span className="px-3 py-1 bg-white/50 text-gray-700 border border-gray-100 rounded-full text-xs font-medium flex items-center gap-2">
                                    <MapPin size={12} className="text-gray-500" /> {user.Profiles.location}
                                </span>
                            )}
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 font-medium">
                            <div className="flex items-center gap-2">
                                <UserCircle size={16} className="text-gray-400" /> {user.email}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Skills & Socials */}
                    <div className="space-y-6">
                        {/* Skills */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Code size={18} className="text-primary"/> Tech Stack
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {(user.Profiles?.skills && Array.isArray(user.Profiles.skills) && user.Profiles.skills.length > 0
                                    ? user.Profiles.skills
                                    : (user.Profiles?.tech_stack && Array.isArray(user.Profiles.tech_stack) ? user.Profiles.tech_stack : []))
                                    .map((skill: string) => (
                                    <span key={skill} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-default">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Socials */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Share2 size={18} className="text-blue-500"/> Connect
                            </h3>
                            <div className="space-y-3">
                                {user.Profiles?.github_url && (
                                    <a href={user.Profiles.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <Github size={18} className="text-gray-600 group-hover:text-black" />
                                            <span className="text-sm font-bold text-gray-700">Github</span>
                                        </div>
                                        <span className="text-xs text-gray-400">{user.Profiles.github_url.split('/').pop()}</span>
                                    </a>
                                )}
                                {user.Profiles?.linkedin_url && (
                                    <a href={user.Profiles.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <Linkedin size={18} className="text-gray-600 group-hover:text-blue-700" />
                                            <span className="text-sm font-bold text-gray-700">LinkedIn</span>
                                        </div>
                                        <span className="text-xs text-gray-400">View Profile</span>
                                    </a>
                                )}
                                {!user.Profiles?.github_url && !user.Profiles?.linkedin_url && (
                                    <div className="text-center py-4 text-gray-400 text-sm">
                                        No social links added yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Bio & Work */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <UserCircle size={20} className="text-primary"/> Biography
                            </h3>
                            {user.Profiles?.bio ? (
                                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                    {user.Profiles.bio}
                                </p>
                            ) : (
                                <p className="text-gray-400 leading-relaxed text-sm md:text-base italic">
                                    No bio added yet. Click "Edit Profile" to add your bio.
                                </p>
                            )}
                        </div>

                        {/* (stats card relocated below Experience) */}

                        {/* Work Experience */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Briefcase size={20} className="text-primary" /> Experience
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

                        {/* Small Stats Card - placed below Experience */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 p-3 rounded-lg bg-white">
                                    <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                                        <Trophy size={18} />
                                    </div>
                                    <div>
                                        <div className="text-xl font-heading text-gray-900">{wins}</div>
                                        <div className="text-xs text-gray-400 uppercase font-bold">Wins</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-3 rounded-lg bg-white">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                        <Award size={18} />
                                    </div>
                                    <div>
                                        <div className="text-xl font-heading text-gray-900">{participatedCount}</div>
                                        <div className="text-xs text-gray-400 uppercase font-bold">Hackathons</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Badges removed per design — location is shown near role instead */}

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;