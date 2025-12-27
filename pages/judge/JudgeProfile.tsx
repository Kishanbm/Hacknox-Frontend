import React, { useState, useEffect, useRef } from 'react';
import { JudgeLayout } from '../../components/JudgeLayout';
import { 
    UserCircle, MapPin, Github, Linkedin, 
    Edit2, Save, Award, Code, Briefcase, Building2, Calendar, Share2,
    FileCheck, Shield, CheckCircle2, Plus, Trash2
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import uploadsService from '../../services/uploads.service';
import { MeResponse } from '../../types/api';

const JudgeProfile: React.FC = () => {
    const [user, setUser] = useState<MeResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const auth = useAuth();

    // Upload states
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);
    const [avatarProgress, setAvatarProgress] = useState<number | null>(null);
    const [bannerProgress, setBannerProgress] = useState<number | null>(null);
    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const bannerInputRef = useRef<HTMLInputElement | null>(null);
    const [evaluationsCount, setEvaluationsCount] = useState<number>(0);
    const [hackathonsJudged, setHackathonsJudged] = useState<number>(0);
    
    // Form states
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    
    // Experience state
    interface Experience {
        id: number;
        role: string;
        company: string;
        period: string;
        description: string;
    }
    const [experience, setExperience] = useState<Experience[]>([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const data = await authService.me();
                setUser(data);
                
                // Populate form fields
                setFirstName(data.Profiles?.first_name || '');
                setLastName(data.Profiles?.last_name || '');
                setBio(data.Profiles?.bio || '');
                setGithubUrl(data.Profiles?.github_url || '');
                setLinkedinUrl(data.Profiles?.linkedin_url || '');
                setSkills(Array.isArray(data.Profiles?.skills) ? data.Profiles.skills : (Array.isArray(data.Profiles?.tech_stack) ? data.Profiles.tech_stack : []));
                
                // Map experiences
                const ex = Array.isArray(data.Profiles?.experiences) ? data.Profiles.experiences : [];
                setExperience(ex.map((e: any, idx: number) => ({
                    id: e.id || Date.now() + idx,
                    role: e.role || '',
                    company: e.company || '',
                    period: e.period || '',
                    description: e.description || ''
                })));
                
                // TODO: Fetch judge-specific stats from API when available
                setEvaluationsCount(0);
                setHackathonsJudged(0);
            } catch (err: any) {
                console.error('Failed to fetch profile:', err);
                setError(err.message || 'Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleAvatarFile = async (file?: File | null) => {
        if (!file) return;
        try {
            setAvatarUploading(true);
            setAvatarProgress(0);
            const resp = await uploadsService.uploadAvatar(file, (p) => setAvatarProgress(p));
            const url = resp?.url || resp?.data?.url || resp?.avatar_url || resp?.url;
            if (url) {
                await authService.updateProfile({ avatar_url: url });
                // update local auth context and local state
                auth.updateUser({ avatarUrl: url });
                const updated = await authService.me();
                setUser(updated);
            }
        } catch (e) {
            console.error('Avatar upload failed', e);
            setError('Avatar upload failed');
        } finally {
            setAvatarUploading(false);
            setAvatarProgress(null);
        }
    };

    const handleBannerFile = async (file?: File | null) => {
        if (!file) return;
        try {
            setBannerUploading(true);
            setBannerProgress(0);
            const resp = await uploadsService.uploadBanner(file, (p) => setBannerProgress(p));
            const url = resp?.url || resp?.data?.url || resp?.banner_url || resp?.url;
            if (url) {
                await authService.updateProfile({ banner_url: url });
                const updated = await authService.me();
                setUser(updated);
            }
        } catch (e) {
            console.error('Banner upload failed', e);
            setError('Banner upload failed');
        } finally {
            setBannerUploading(false);
            setBannerProgress(null);
        }
    };
    
    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError(null);
            
            // Prepare update payload
            const updateData: any = {
                first_name: firstName,
                last_name: lastName,
                bio,
                github_url: githubUrl,
                linkedin_url: linkedinUrl,
                skills,
                experiences: experience.map(e => ({
                    role: e.role,
                    company: e.company,
                    period: e.period,
                    description: e.description
                }))
            };
            
            await authService.updateProfile(updateData);
            
            // Refresh user data
            const updatedData = await authService.me();
            setUser(updatedData);
            setIsEditing(false);
        } catch (err: any) {
            console.error('Failed to save profile:', err);
            setError(err.message || 'Failed to save profile');
        } finally {
            setIsSaving(false);
        }
    };
    
    const addExperience = () => {
        setExperience([...experience, {
            id: Date.now(),
            role: 'Role Title',
            company: 'Company Name',
            period: 'Year - Year',
            description: 'Description of responsibilities...'
        }]);
    };
    
    const removeExperience = (id: number) => {
        setExperience(experience.filter(e => e.id !== id));
    };
    
    const updateExperience = (id: number, field: keyof Experience, value: string) => {
        setExperience(experience.map(e => e.id === id ? { ...e, [field]: value } : e));
    };
    
    const addSkill = () => {
        if (skillInput.trim() && !skills.includes(skillInput.trim())) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };
    
    const removeSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    // Show loading state
    if (isLoading) {
        return (
            <JudgeLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#5425FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading profile...</p>
                    </div>
                </div>
            </JudgeLayout>
        );
    }

    // Show error state
    if (error || !user) {
        return (
            <JudgeLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error || 'Failed to load profile'}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-[#5425FF] text-white rounded-lg font-bold hover:bg-[#5425FF]/90"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </JudgeLayout>
        );
    }

    // Get user initials for avatar
    const getInitials = () => {
        const first = firstName?.[0] || '';
        const last = lastName?.[0] || '';
        return (first + last).toUpperCase() || 'J';
    };

    // Get full name
    const fullName = `${firstName} ${lastName}`.trim() || 'Judge';

    const bannerExists = !!((user as any)?.Profiles?.banner_url || (user as any)?.Profiles?.banner);
    const editBtnClass = bannerExists
        ? "px-4 py-2 bg-white text-black rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg z-20 border border-gray-100"
        : "px-4 py-2 bg-[#5425FF] text-white rounded-xl text-sm font-bold hover:bg-[#3b2bff] transition-all flex items-center gap-2 shadow-lg z-20";

    return (
        <JudgeLayout>
            <div className="max-w-5xl mx-auto pb-12">
                {/* Hidden file inputs for avatar/banner uploads */}
                <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleAvatarFile(e.target.files?.[0] ?? null)} />
                <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleBannerFile(e.target.files?.[0] ?? null)} />
                
                {/* Identity Card */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8 relative">
                    {/* Banner */}
                    <div className={`h-48 w-full relative ${isEditing ? 'cursor-pointer' : ''}`} onClick={() => { if (isEditing) bannerInputRef.current?.click(); }}>
                        {((user as any)?.Profiles?.banner_url) ? (
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${(user as any).Profiles.banner_url})` }}
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-[#5425FF] to-slate-900"></div>
                        )}
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#5425FF 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#5425FF] blur-[100px] opacity-20 rounded-full pointer-events-none"></div>
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className={editBtnClass}
                                >
                                    <Edit2 size={16} /> Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            setIsEditing(false);
                                            // Reset to original values
                                            setFirstName((user as any).Profiles?.first_name || '');
                                            setLastName((user as any).Profiles?.last_name || '');
                                            setBio((user as any).Profiles?.bio || '');
                                            setGithubUrl((user as any).Profiles?.github_url || '');
                                            setLinkedinUrl((user as any).Profiles?.linkedin_url || '');
                                        }}
                                        className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl text-sm font-bold hover:bg-gray-200 hover:text-gray-900 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-[#24FF00] text-black rounded-xl text-sm font-bold hover:bg-[#1fe600] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(36,255,0,0.3)]"
                                    >
                                        {isSaving ? (
                                            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div> Saving...</>
                                        ) : (
                                            <><Save size={16} /> Save Changes</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="px-8 pb-8 pt-0 relative flex flex-col items-center text-center">
                        {/* Avatar - Centered and Overlapping */}
                        <div onClick={() => { if (isEditing) avatarInputRef.current?.click(); }} className={`w-32 h-32 rounded-full border-4 border-white bg-[#0F172A] text-white flex items-center justify-center text-4xl font-heading shadow-xl relative -mt-16 mb-4 z-10 overflow-hidden ${isEditing ? 'cursor-pointer hover:ring-4 hover:ring-[#5425FF]/30 transition-all' : ''}`}>
                            {user?.Profiles?.avatar_url ? (
                                <img 
                                    src={user.Profiles.avatar_url} 
                                    alt={fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                getInitials()
                            )}
                            {avatarUploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="text-white text-xs">{avatarProgress}%</div>
                                </div>
                            )}
                            {isEditing && !avatarUploading && (
                                <button onClick={(e) => { e.stopPropagation(); avatarInputRef.current?.click(); }} className="absolute bottom-0 right-0 -mb-2 -mr-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm shadow-md border border-gray-200 hover:bg-[#5425FF] hover:text-white transition-colors">
                                    📷
                                </button>
                            )}
                            {/* Online indicator */}
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#24FF00] border-4 border-white rounded-full shadow-[0_0_10px_#24FF00]"></div>
                        </div>

                        {/* Name & Headline */}
                        {isEditing ? (
                            <div className="w-full max-w-lg space-y-4 mb-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <input 
                                        type="text" 
                                        value={firstName} 
                                        onChange={e => setFirstName(e.target.value)}
                                        placeholder="First Name"
                                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-lg font-heading text-gray-900 focus:outline-none focus:border-[#5425FF]"
                                    />
                                    <input 
                                        type="text" 
                                        value={lastName} 
                                        onChange={e => setLastName(e.target.value)}
                                        placeholder="Last Name"
                                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-lg font-heading text-gray-900 focus:outline-none focus:border-[#5425FF]"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-heading text-gray-900 mb-2 flex items-center gap-2">
                                    {fullName}
                                    <span className="bg-[#5425FF] text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-sans transform translate-y-[-4px] shadow-lg shadow-[#5425FF]/20 flex items-center gap-1">
                                        <Shield size={10} className="fill-current" /> Judge
                                    </span>
                                </h1>
                                
                                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                                    <span className="px-3 py-1 bg-[#5425FF]/10 text-[#5425FF] border border-[#5425FF]/20 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                        <FileCheck size={12} /> Technical Judge
                                    </span>
                                    {((user as any)?.is_verified || (user as any)?.verified || (user?.Profiles as any)?.is_verified) && (
                                        <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                            <CheckCircle2 size={12} /> Verified
                                        </span>
                                    )}
                                    {user?.Profiles?.location && (
                                        <span className="px-3 py-1 bg-white/50 text-gray-700 border border-gray-100 rounded-full text-xs font-medium flex items-center gap-2">
                                            <MapPin size={12} className="text-gray-500" /> {user.Profiles.location}
                                        </span>
                                    )}
                                </div>

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 font-medium">
                                    <div className="flex items-center gap-2">
                                        <UserCircle size={16} className="text-gray-400" /> {user?.email}
                                    </div>
                                </div>
                            </>
                        )}
                        
                        {error && (
                            <div className="mt-4 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Skills & Socials */}
                    <div className="space-y-6">
                        {/* Skills */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Code size={18} className="text-[#5425FF]"/> Expertise
                                </h3>
                                {isEditing && (
                                    <button 
                                        onClick={() => {
                                            if (skillInput.trim()) addSkill();
                                        }}
                                        className="text-xs text-[#5425FF] font-bold hover:underline flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Add
                                    </button>
                                )}
                            </div>
                            {isEditing && (
                                <div className="mb-3">
                                    <input 
                                        type="text"
                                        value={skillInput}
                                        onChange={e => setSkillInput(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && addSkill()}
                                        placeholder="Add skill..."
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5425FF]"
                                    />
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 hover:border-[#5425FF]/30 hover:bg-[#5425FF]/5 transition-colors cursor-default flex items-center gap-1">
                                        {skill}
                                        {isEditing && (
                                            <button 
                                                onClick={() => removeSkill(skill)}
                                                className="text-gray-400 hover:text-red-500 ml-1"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </span>
                                ))}
                                {skills.length === 0 && !isEditing && (
                                    <p className="text-sm text-gray-400 italic">No expertise areas added yet</p>
                                )}
                            </div>
                        </div>

                        {/* Socials */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Share2 size={18} className="text-blue-500"/> Connect
                            </h3>
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-500 font-bold mb-1 block">GitHub URL</label>
                                        <input 
                                            type="text"
                                            value={githubUrl}
                                            onChange={e => setGithubUrl(e.target.value)}
                                            placeholder="https://github.com/username"
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5425FF]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-bold mb-1 block">LinkedIn URL</label>
                                        <input 
                                            type="text"
                                            value={linkedinUrl}
                                            onChange={e => setLinkedinUrl(e.target.value)}
                                            placeholder="https://linkedin.com/in/username"
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5425FF]"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {githubUrl && (
                                        <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <Github size={18} className="text-gray-600 group-hover:text-black" />
                                                <span className="text-sm font-bold text-gray-700">Github</span>
                                            </div>
                                            <span className="text-xs text-gray-400">{githubUrl.split('/').pop()}</span>
                                        </a>
                                    )}
                                    {linkedinUrl && (
                                        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <Linkedin size={18} className="text-gray-600 group-hover:text-blue-700" />
                                                <span className="text-sm font-bold text-gray-700">LinkedIn</span>
                                            </div>
                                            <span className="text-xs text-gray-400">View Profile</span>
                                        </a>
                                    )}
                                    {!githubUrl && !linkedinUrl && (
                                        <div className="text-center py-4 text-gray-400 text-sm">
                                            No social links added yet
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Bio & Work */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <UserCircle size={20} className="text-[#5425FF]"/> Professional Bio
                            </h3>
                            {isEditing ? (
                                <textarea 
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                    rows={4}
                                    placeholder="Write your professional bio..."
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5425FF] resize-none"
                                />
                            ) : (
                                <>
                                    {bio ? (
                                        <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                            {bio}
                                        </p>
                                    ) : (
                                        <p className="text-gray-400 leading-relaxed text-sm md:text-base italic">
                                            No bio added yet. Click "Edit Profile" to add your professional bio.
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Work Experience */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Briefcase size={20} className="text-[#5425FF]" /> Experience
                                </h3>
                                {isEditing && (
                                    <button 
                                        onClick={addExperience}
                                        className="text-xs font-bold text-[#5425FF] hover:underline flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Add Role
                                    </button>
                                )}
                            </div>
                            <div className="space-y-8 relative">
                                {/* Timeline Line */}
                                {experience.length > 0 && !isEditing && <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-100"></div>}

                                {experience.length > 0 ? (
                                    experience.map((job) => (
                                        <div key={job.id} className="relative pl-12 group">
                                            {/* Icon */}
                                            {!isEditing && (
                                                <div className="absolute left-0 top-0 w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 z-10 group-hover:border-[#5425FF] group-hover:text-[#5425FF] transition-colors shadow-sm">
                                                    <Building2 size={18} />
                                                </div>
                                            )}
                                            
                                            {isEditing ? (
                                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-gray-400 uppercase">Edit Role</span>
                                                        <button 
                                                            onClick={() => removeExperience(job.id)}
                                                            className="text-red-400 hover:text-red-600"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <input 
                                                        type="text"
                                                        value={job.role}
                                                        onChange={e => updateExperience(job.id, 'role', e.target.value)}
                                                        placeholder="Role Title"
                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:border-[#5425FF]"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input 
                                                            type="text"
                                                            value={job.company}
                                                            onChange={e => updateExperience(job.id, 'company', e.target.value)}
                                                            placeholder="Company"
                                                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5425FF]"
                                                        />
                                                        <input 
                                                            type="text"
                                                            value={job.period}
                                                            onChange={e => updateExperience(job.id, 'period', e.target.value)}
                                                            placeholder="2020 - 2023"
                                                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5425FF]"
                                                        />
                                                    </div>
                                                    <textarea 
                                                        value={job.description}
                                                        onChange={e => updateExperience(job.id, 'description', e.target.value)}
                                                        placeholder="Description of responsibilities..."
                                                        rows={2}
                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5425FF] resize-none"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-lg">{job.role}</h4>
                                                            <div className="font-medium text-[#5425FF] text-sm">{job.company}</div>
                                                        </div>
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-gray-100 whitespace-nowrap w-fit">
                                                            <Calendar size={12} /> {job.period}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm leading-relaxed">
                                                        {job.description}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 italic text-sm">No work experience added yet. Click "Edit Profile" to add your experience.</p>
                                )}
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 p-3 rounded-lg bg-white">
                                    <div className="w-10 h-10 bg-[#5425FF]/10 text-[#5425FF] rounded-full flex items-center justify-center">
                                        <FileCheck size={18} />
                                    </div>
                                    <div>
                                        <div className="text-xl font-heading text-gray-900">{evaluationsCount}</div>
                                        <div className="text-xs text-gray-400 uppercase font-bold">Evaluations</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-3 rounded-lg bg-white">
                                    <div className="w-10 h-10 bg-[#24FF00]/10 text-[#24FF00] rounded-full flex items-center justify-center">
                                        <Award size={18} />
                                    </div>
                                    <div>
                                        <div className="text-xl font-heading text-gray-900">{hackathonsJudged}</div>
                                        <div className="text-xs text-gray-400 uppercase font-bold">Hackathons Judged</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </JudgeLayout>
    );
};

export default JudgeProfile;
