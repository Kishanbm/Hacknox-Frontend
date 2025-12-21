import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { 
    ChevronLeft, Save, Upload, User, MapPin, Link as LinkIcon, 
    Github, Twitter, Linkedin, Camera, Briefcase, Plus, Trash2, 
    Calendar, FileText, Layers, Share2
} from 'lucide-react';
import { authService } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/axios';
import { MeResponse } from '../types/api';

interface Experience {
    id: number;
    role: string;
    company: string;
    period: string;
    description: string;
}

const EditProfile: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'general' | 'experience' | 'socials'>('general');
    
    // User Data
    const [user, setUser] = useState<MeResponse | null>(null);
    
    // Form States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [phone, setPhone] = useState('');
    
    // Image Preview States
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string>('');

    // Experience (not used in backend but kept for UI)
    const [experience, setExperience] = useState<Experience[]>([]);

    // File Input Refs
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Fetch profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsFetching(true);
                const data = await authService.me();
                setUser(data);
                
                // Populate form fields
                setFirstName(data.Profiles?.first_name || '');
                setLastName(data.Profiles?.last_name || '');
                setBio(data.Profiles?.bio || '');
                setGithubUrl(data.Profiles?.github_url || '');
                setLinkedinUrl(data.Profiles?.linkedin_url || '');
                setPhone(data.Profiles?.phone || '');
                setAvatarUrl(data.Profiles?.avatar_url || '');
                setAvatarPreview(data.Profiles?.avatar_url || null);
            } catch (err: any) {
                console.error('Failed to fetch profile:', err);
                setError(err.message || 'Failed to load profile');
            } finally {
                setIsFetching(false);
            }
        };

        fetchProfile();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'avatar') => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            if (type === 'banner') {
                setBannerPreview(objectUrl);
            } else {
                // Upload avatar to backend and store returned URL
                (async () => {
                    try {
                        setIsLoading(true);
                        const form = new FormData();
                        form.append('avatar', file);
                        // apiClient.baseURL already points to /api
                        const resp = await apiClient.upload<{ message: string; url: string }>('uploads/avatar', form);
                        const url = resp.data.url;
                        setAvatarPreview(url);
                        setAvatarUrl(url);
                    } catch (err) {
                        console.error('Avatar upload failed', err);
                    } finally {
                        setIsLoading(false);
                    }
                })();
            }
        }
    };

    const triggerBannerUpload = () => bannerInputRef.current?.click();
    const triggerAvatarUpload = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent bubbling to banner
        avatarInputRef.current?.click();
    };

    const handleAddExperience = () => {
        const newExp: Experience = {
            id: Date.now(),
            role: '',
            company: '',
            period: '',
            description: ''
        };
        setExperience([newExp, ...experience]);
    };

    const handleRemoveExperience = (id: number) => {
        setExperience(experience.filter(exp => exp.id !== id));
    };

    const handleExperienceChange = (id: number, field: keyof Experience, value: string) => {
        setExperience(experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
    };

    const { refetchUser } = useAuth();

    const handleSave = async () => {
        try {
            setIsLoading(true);
            setError(null);
            setSuccessMessage(null);
            
            // Prepare profile data
            const profileData: any = {};
            
            if (firstName) profileData.first_name = firstName;
            if (lastName) profileData.last_name = lastName;
            if (bio) profileData.bio = bio;
            if (githubUrl) profileData.github_url = githubUrl;
            if (linkedinUrl) profileData.linkedin_url = linkedinUrl;
            if (phone) profileData.phone = phone;
            if (avatarUrl) profileData.avatar_url = avatarUrl;
            
            const resp = await authService.updateProfile(profileData);
            setSuccessMessage('Profile updated successfully!');

            // Refresh global auth user so UI updates (header, nav, etc.)
            try {
                await refetchUser();
            } catch (e) {
                console.warn('refetchUser failed after profile update', e);
            }
            
            // Navigate back after a short delay
            setTimeout(() => {
                navigate('/dashboard/profile');
            }, 1000);
            
        } catch (err: any) {
            console.error('Failed to update profile:', err);
            setError(err.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading state while fetching
    if (isFetching) {
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

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full text-gray-500 transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-heading text-gray-900">Edit Profile</h1>
                            <p className="text-gray-500 text-sm">Customize your public presence and resume.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-3 bg-[#111827] text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} /> Save Changes
                            </>
                        )}
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <span className="text-red-600 text-sm">{error}</span>
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                        <span className="text-green-600 text-sm">{successMessage}</span>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex p-1 bg-white border border-gray-200 rounded-xl w-full md:w-fit mb-8 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'general', label: 'General Info', icon: User },
                        { id: 'experience', label: 'Work Experience', icon: Briefcase },
                        { id: 'socials', label: 'Social Links', icon: Share2 }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                                activeTab === tab.id 
                                ? 'bg-gray-100 text-gray-900 shadow-sm' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    
                    {/* --- GENERAL TAB --- */}
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Card 1: Visuals (Banner & Avatar) - Spans Full Width on Mobile, 2 Cols on Desktop */}
                            <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden relative group">
                                <input 
                                    type="file" 
                                    ref={bannerInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'banner')}
                                />
                                <input 
                                    type="file" 
                                    ref={avatarInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'avatar')}
                                />

                                <div 
                                    className="h-48 md:h-64 bg-gray-100 relative cursor-pointer overflow-hidden"
                                    onClick={triggerBannerUpload}
                                >
                                    {bannerPreview ? (
                                        <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold gap-2 backdrop-blur-sm">
                                        <Camera size={20} /> Update Cover
                                    </div>
                                </div>

                                <div className="absolute bottom-6 left-6 md:left-10 flex items-end">
                                    <div 
                                        className="w-28 h-28 md:w-36 md:h-36 rounded-full border-[6px] border-white bg-gray-900 text-white flex items-center justify-center text-4xl font-heading relative cursor-pointer overflow-hidden shadow-xl group/avatar"
                                        onClick={triggerAvatarUpload}
                                    >
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || 'U'
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm">
                                            <Upload size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Identity Info */}
                            <div className="lg:col-span-1 bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm flex flex-col gap-5 h-full">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <User size={18} className="text-[#5425FF]" /> Identity
                                </h3>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">First Name *</label>
                                    <input 
                                        type="text" 
                                        value={firstName} 
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium text-gray-900" 
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Last Name *</label>
                                    <input 
                                        type="text" 
                                        value={lastName} 
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium text-gray-900" 
                                        placeholder="Enter last name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone</label>
                                    <input 
                                        type="text" 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium text-gray-900" 
                                        placeholder="+91 1234567890"
                                    />
                                </div>
                            </div>

                            {/* Card 3: Bio & Skills */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                {/* Bio */}
                                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm flex-1">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                        <FileText size={18} className="text-[#5425FF]" /> Bio
                                    </h3>
                                    <textarea 
                                        className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium text-gray-700 resize-none leading-relaxed" 
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Tell us about yourself..."
                                    ></textarea>
                                </div>

                                {/* Skills */}
                                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                        <Layers size={18} className="text-[#5425FF]" /> Skills
                                    </h3>
                                    <div className="mb-4">
                                        <input type="text" placeholder="Add skills (e.g. React, Python) and press Enter" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium text-gray-900" />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['React', 'TypeScript', 'Node.js', 'Python', 'TensorFlow', 'Solidity'].map(skill => (
                                            <span key={skill} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold flex items-center gap-2 group hover:border-[#5425FF] transition-colors cursor-default">
                                                {skill}
                                                <button className="text-gray-400 hover:text-red-500 group-hover:text-gray-500">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- WORK EXPERIENCE TAB --- */}
                    {activeTab === 'experience' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-blue-50 p-6 rounded-3xl border border-blue-100">
                                <div>
                                    <h3 className="font-heading text-xl text-blue-900">Work History</h3>
                                    <p className="text-blue-700/80 text-sm">Add your professional experience to showcase your journey.</p>
                                </div>
                                <button 
                                    onClick={handleAddExperience}
                                    className="px-5 py-2.5 bg-white text-blue-700 rounded-xl font-bold shadow-sm hover:bg-blue-50 hover:shadow-md transition-all flex items-center gap-2"
                                >
                                    <Plus size={18} /> Add Role
                                </button>
                            </div>

                            {experience.map((exp, index) => (
                                <div key={exp.id} className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm relative group transition-all hover:border-[#5425FF]/30">
                                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleRemoveExperience(exp.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Role Title</label>
                                            <div className="relative">
                                                <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input 
                                                    type="text" 
                                                    value={exp.role} 
                                                    onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-bold text-gray-900" 
                                                    placeholder="e.g. Senior Developer"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Company</label>
                                            <input 
                                                type="text" 
                                                value={exp.company} 
                                                onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium text-gray-900" 
                                                placeholder="e.g. Google"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Duration</label>
                                        <div className="relative">
                                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input 
                                                type="text" 
                                                value={exp.period} 
                                                onChange={(e) => handleExperienceChange(exp.id, 'period', e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium text-gray-900" 
                                                placeholder="e.g. Jan 2020 - Present"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                                        <textarea 
                                            value={exp.description}
                                            onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] text-gray-700 resize-none h-24"
                                            placeholder="Describe your responsibilities and achievements..."
                                        ></textarea>
                                    </div>
                                </div>
                            ))}
                            
                            {experience.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Briefcase size={24} />
                                    </div>
                                    <h3 className="font-bold text-gray-900">No Experience Added</h3>
                                    <p className="text-gray-500 text-sm mb-4">Highlight your career journey.</p>
                                    <button onClick={handleAddExperience} className="text-[#5425FF] font-bold hover:underline">Add your first role</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- SOCIALS TAB --- */}
                    {activeTab === 'socials' && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Share2 size={20} className="text-[#5425FF]" /> Social Presence
                                </h3>
                                
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">GitHub</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                                <Github size={18} />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={githubUrl} 
                                                onChange={(e) => setGithubUrl(e.target.value)}
                                                placeholder="https://github.com/username"
                                                className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium text-gray-900" 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">LinkedIn</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-700">
                                                <Linkedin size={18} />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={linkedinUrl} 
                                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                                placeholder="https://linkedin.com/in/username"
                                                className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium text-gray-900" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </DashboardLayout>
    );
};

export default EditProfile;