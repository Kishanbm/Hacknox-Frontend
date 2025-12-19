import React, { useState } from 'react';
import { JudgeLayout } from '../../components/JudgeLayout';
import { 
    UserCircle, MapPin, Link as LinkIcon, Github, Linkedin, 
    Edit2, Save, Mail, Briefcase, Award, FileCheck, Shield, CheckCircle2,
    Plus, Trash2, Building
} from 'lucide-react';

interface Experience {
    id: number;
    role: string;
    company: string;
    period: string;
    desc: string;
}

const JudgeProfile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    
    // Mock state for form data
    const [profile, setProfile] = useState({
        name: 'Judge Davis',
        role: 'Senior Technical Judge',
        organization: 'Tech Innovators Inc.',
        location: 'San Francisco, CA',
        bio: 'Senior Software Architect with 15+ years of experience in distributed systems and AI. Passionate about mentoring upcoming developers and evaluating innovative solutions.',
        website: 'judgedavis.tech',
        email: 'judge.davis@example.com',
        github: 'github.com/jdavis',
        linkedin: 'linkedin.com/in/jdavis',
        skills: ['System Design', 'Cloud Architecture', 'Machine Learning', 'Blockchain', 'Cybersecurity']
    });

    const [experience, setExperience] = useState<Experience[]>([
        { 
            id: 1, 
            role: 'Principal Software Engineer', 
            company: 'Google', 
            period: '2019 - Present', 
            desc: 'Leading the distributed cloud infrastructure team. Evaluating architecture scaling for global products.' 
        },
        { 
            id: 2, 
            role: 'Senior Developer', 
            company: 'Amazon AWS', 
            period: '2015 - 2019', 
            desc: 'Worked on core EC2 virtualization technologies and serverless compute primitives.' 
        }
    ]);

    const handleSave = () => {
        setIsEditing(false);
        // In a real app, API call to save data would go here
    };

    const addExperience = () => {
        const newExp = {
            id: Date.now(),
            role: 'New Position',
            company: 'Company Name',
            period: 'Year - Year',
            desc: 'Description of role...'
        };
        setExperience([newExp, ...experience]);
    };

    const removeExperience = (id: number) => {
        setExperience(experience.filter(exp => exp.id !== id));
    };

    const updateExperience = (id: number, field: keyof Experience, value: string) => {
        setExperience(experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
    };

    return (
        <JudgeLayout>
            <div className="max-w-7xl mx-auto pb-12">
                {/* Banner Section */}
                <div className="relative mb-24">
                    <div className="h-48 rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 w-full object-cover relative overflow-hidden border border-gray-800">
                        {/* Abstract Pattern */}
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#5425FF 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#5425FF] blur-[100px] opacity-20 rounded-full pointer-events-none"></div>
                    </div>
                    
                    <div className="absolute top-24 left-6 right-6 md:left-12 flex flex-col md:flex-row items-end gap-6">
                        <div className="w-32 h-32 rounded-full border-4 border-white bg-[#0F172A] text-white flex items-center justify-center text-3xl font-heading shadow-xl z-10 relative">
                            JD
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#24FF00] border-4 border-[#0F172A] rounded-full shadow-[0_0_10px_#24FF00]"></div>
                        </div>
                        <div className="mb-4 flex-1">
                             {isEditing ? (
                                 <input 
                                    type="text" 
                                    value={profile.name} 
                                    onChange={e => setProfile({...profile, name: e.target.value})}
                                    className="text-3xl font-heading text-gray-900 bg-white/50 backdrop-blur-sm border-b-2 border-[#5425FF] focus:outline-none w-full md:w-auto px-2 rounded-t-lg"
                                 />
                             ) : (
                                <h1 className="text-3xl font-heading text-gray-900 flex items-center gap-2">
                                    {profile.name} 
                                    <span className="bg-[#5425FF] text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-sans transform translate-y-[-4px] shadow-lg shadow-[#5425FF]/20 flex items-center gap-1">
                                        <Shield size={10} className="fill-current" /> Verified Judge
                                    </span>
                                </h1>
                             )}
                             <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                                 {isEditing ? (
                                     <input 
                                        type="text"
                                        value={profile.role}
                                        onChange={e => setProfile({...profile, role: e.target.value})}
                                        className="border-b border-gray-300 focus:border-[#5425FF] outline-none bg-transparent"
                                     />
                                 ) : profile.role}
                                 <span className="text-gray-300">•</span>
                                 {isEditing ? (
                                     <input 
                                        type="text"
                                        value={profile.organization}
                                        onChange={e => setProfile({...profile, organization: e.target.value})}
                                        className="border-b border-gray-300 focus:border-[#5425FF] outline-none bg-transparent"
                                     />
                                 ) : profile.organization}
                             </p>
                        </div>
                        <div className="mb-4">
                            <button 
                                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
                                    isEditing 
                                    ? 'bg-[#24FF00] text-black hover:bg-[#1fe600] shadow-[0_4px_14px_rgba(36,255,0,0.3)]' 
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {isEditing ? <><Save size={16} /> Save Changes</> : <><Edit2 size={16} /> Edit Profile</>}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Contact Card */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Contact & Info</h3>
                            <div className="space-y-4 text-sm">
                                 <div className="flex items-center gap-3 text-gray-600">
                                     <MapPin size={18} className="text-gray-400 shrink-0" />
                                     {isEditing ? (
                                         <input className="border-b border-gray-200 w-full focus:outline-none focus:border-[#5425FF]" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} />
                                     ) : profile.location}
                                 </div>
                                 <div className="flex items-center gap-3 text-gray-600">
                                     <Mail size={18} className="text-gray-400 shrink-0" />
                                     {isEditing ? (
                                         <input className="border-b border-gray-200 w-full focus:outline-none focus:border-[#5425FF]" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                                     ) : profile.email}
                                 </div>
                                 <div className="flex items-center gap-3 text-gray-600">
                                     <LinkIcon size={18} className="text-gray-400 shrink-0" />
                                     {isEditing ? (
                                         <input className="border-b border-gray-200 w-full focus:outline-none focus:border-[#5425FF]" value={profile.website} onChange={e => setProfile({...profile, website: e.target.value})} />
                                     ) : <a href={`https://${profile.website}`} target="_blank" rel="noreferrer" className="text-[#5425FF] hover:underline font-bold">{profile.website}</a>}
                                 </div>
                                 <hr className="border-gray-100 my-2" />
                                 <div className="flex items-center gap-3 text-gray-600">
                                     <Github size={18} className="text-gray-400 shrink-0" />
                                     {isEditing ? (
                                         <input className="border-b border-gray-200 w-full focus:outline-none focus:border-[#5425FF]" value={profile.github} onChange={e => setProfile({...profile, github: e.target.value})} />
                                     ) : profile.github}
                                 </div>
                                 <div className="flex items-center gap-3 text-gray-600">
                                     <Linkedin size={18} className="text-gray-400 shrink-0" />
                                     {isEditing ? (
                                         <input className="border-b border-gray-200 w-full focus:outline-none focus:border-[#5425FF]" value={profile.linkedin} onChange={e => setProfile({...profile, linkedin: e.target.value})} />
                                     ) : profile.linkedin}
                                 </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900">Expertise</h3>
                                {isEditing && <button className="text-xs text-[#5425FF] font-bold hover:underline">+ Add</button>}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                 {profile.skills.map((skill, idx) => (
                                     <span key={idx} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-gray-200 flex items-center gap-1 group">
                                         {skill}
                                         {isEditing && <button className="text-gray-400 hover:text-red-500 ml-1">×</button>}
                                     </span>
                                 ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center text-center group hover:border-[#5425FF] transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center mb-3 group-hover:bg-[#5425FF] group-hover:text-white transition-colors">
                                    <FileCheck size={20} />
                                </div>
                                <div className="text-3xl font-heading text-gray-900 mb-1">124</div>
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Evaluations</div>
                            </div>
                             <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center text-center group hover:border-[#5425FF] transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center mb-3 group-hover:bg-[#5425FF] group-hover:text-white transition-colors">
                                    <Briefcase size={20} />
                                </div>
                                <div className="text-3xl font-heading text-gray-900 mb-1">15</div>
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Hackathons</div>
                            </div>
                             <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center text-center group hover:border-[#24FF00] transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center mb-3 group-hover:bg-[#24FF00] group-hover:text-black transition-colors">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div className="text-3xl font-heading text-[#5425FF] mb-1">98%</div>
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">On-Time Rate</div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
                            <h3 className="font-bold text-gray-900 mb-4 relative z-10">Professional Bio</h3>
                            {isEditing ? (
                                <textarea 
                                    rows={4} 
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] transition-colors resize-none" 
                                    value={profile.bio}
                                    onChange={e => setProfile({...profile, bio: e.target.value})}
                                />
                            ) : (
                                <p className="text-gray-600 leading-relaxed text-sm relative z-10">{profile.bio}</p>
                            )}
                        </div>

                        {/* Work Experience */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900">Work Experience</h3>
                                {isEditing && (
                                    <button 
                                        onClick={addExperience}
                                        className="text-xs font-bold text-[#5425FF] hover:underline flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Add Role
                                    </button>
                                )}
                            </div>
                            
                            <div className="space-y-6 relative">
                                {experience.length > 0 && <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-100"></div>}
                                
                                {experience.map((exp, idx) => (
                                    <div key={exp.id} className="relative pl-10 group">
                                        <div className="absolute left-0 top-1.5 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 shadow-sm z-10 group-hover:border-[#5425FF] group-hover:text-[#5425FF] transition-colors">
                                            <Building size={18} />
                                        </div>

                                        <div className="flex justify-between items-start">
                                            <div className="w-full">
                                                {isEditing ? (
                                                    <div className="space-y-2 mb-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                                        <input 
                                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm font-bold" 
                                                            value={exp.role}
                                                            onChange={e => updateExperience(exp.id, 'role', e.target.value)}
                                                            placeholder="Role"
                                                        />
                                                        <div className="flex gap-2">
                                                            <input 
                                                                className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs" 
                                                                value={exp.company}
                                                                onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                                                                placeholder="Company"
                                                            />
                                                            <input 
                                                                className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs" 
                                                                value={exp.period}
                                                                onChange={e => updateExperience(exp.id, 'period', e.target.value)}
                                                                placeholder="Period"
                                                            />
                                                        </div>
                                                        <textarea 
                                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs resize-none"
                                                            value={exp.desc}
                                                            onChange={e => updateExperience(exp.id, 'desc', e.target.value)}
                                                            rows={2}
                                                            placeholder="Description"
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h4 className="font-bold text-gray-900">{exp.role}</h4>
                                                        <div className="text-xs text-gray-500 font-medium mb-1">{exp.company} • {exp.period}</div>
                                                        <p className="text-sm text-gray-600">{exp.desc}</p>
                                                    </>
                                                )}
                                            </div>
                                            {isEditing && (
                                                <button 
                                                    onClick={() => removeExperience(exp.id)}
                                                    className="ml-2 p-2 text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                         <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-6">Recent Activity</h3>
                            <div className="space-y-6">
                                {/* Item 1 */}
                                <div className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-[#5425FF]/10 text-[#5425FF] flex items-center justify-center shrink-0 group-hover:bg-[#5425FF] group-hover:text-white transition-colors">
                                        <FileCheck size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div className="text-sm font-bold text-gray-900">Graded submission "NeuroNet"</div>
                                            <span className="text-[10px] text-gray-400 font-bold">2h ago</span>
                                        </div>
                                        <div className="text-xs text-gray-500">HackOnX 2025 • AI/ML Track</div>
                                    </div>
                                </div>
                                {/* Item 2 */}
                                <div className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                        <Award size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div className="text-sm font-bold text-gray-900">Assigned as Lead Judge</div>
                                            <span className="text-[10px] text-gray-400 font-bold">1d ago</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Global AI Challenge • Final Round</div>
                                    </div>
                                </div>
                                {/* Item 3 */}
                                <div className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                        <Shield size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div className="text-sm font-bold text-gray-900">Verified Credentials Updated</div>
                                            <span className="text-[10px] text-gray-400 font-bold">3d ago</span>
                                        </div>
                                        <div className="text-xs text-gray-500">System • Profile Status</div>
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