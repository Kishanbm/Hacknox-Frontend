import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { ChevronLeft, Save, Upload, User, MapPin, Link as LinkIcon, Github, Twitter, Linkedin } from 'lucide-react';

const EditProfile: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            navigate('/dashboard/profile');
        }, 1500);
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto pb-12">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold text-sm">
                    <ChevronLeft size={20} /> Back to Profile
                </button>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-heading text-gray-900">Edit Profile</h1>
                    <button 
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    
                    {/* Cover & Avatar */}
                    <div className="relative h-48 bg-gray-100 group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold gap-2">
                             <Upload size={20} /> Change Cover
                        </div>
                        
                        <div className="absolute -bottom-12 left-8">
                             <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-900 text-white flex items-center justify-center text-2xl font-heading relative group/avatar cursor-pointer">
                                 AM
                                 <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                     <Upload size={16} />
                                 </div>
                             </div>
                        </div>
                    </div>

                    <div className="p-8 pt-16 space-y-8">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                                 <div className="relative">
                                     <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                     <input type="text" defaultValue="Alex Morgan" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-gray-900 font-medium" />
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Title / Role</label>
                                 <input type="text" defaultValue="Full Stack Developer" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-gray-900 font-medium" />
                             </div>
                             <div className="md:col-span-2">
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                                 <textarea rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-gray-900 font-medium resize-none" defaultValue="Passionate full-stack developer with a knack for building scalable web applications. I love participating in hackathons to challenge myself and learn new technologies."></textarea>
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                                 <div className="relative">
                                     <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                     <input type="text" defaultValue="Bengaluru, India" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-gray-900 font-medium" />
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Website</label>
                                 <div className="relative">
                                     <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                     <input type="url" defaultValue="https://alexmorgan.dev" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-gray-900 font-medium" />
                                 </div>
                             </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Skills */}
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-3">Skills (Separate by comma)</label>
                             <input type="text" defaultValue="React, TypeScript, Node.js, Python, TensorFlow, Solidity" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-gray-900 font-medium" />
                             <div className="flex flex-wrap gap-2 mt-3">
                                 {['React', 'TypeScript', 'Node.js', 'Python', 'TensorFlow', 'Solidity'].map(skill => (
                                     <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">
                                         {skill}
                                     </span>
                                 ))}
                             </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Socials */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Social Links</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                        <Github size={20} />
                                    </div>
                                    <input type="text" defaultValue="github.com/alexcodes" className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-gray-900 font-medium" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                                        <Twitter size={20} />
                                    </div>
                                    <input type="text" placeholder="Twitter Profile" className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-gray-900 font-medium" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-700">
                                        <Linkedin size={20} />
                                    </div>
                                    <input type="text" defaultValue="linkedin.com/in/alex-morgan" className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-gray-900 font-medium" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EditProfile;