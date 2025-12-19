import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { Globe, Twitter, Linkedin, MapPin, Calendar, ArrowUpRight, Users, Shield } from 'lucide-react';

const OrganizerProfile: React.FC = () => {
    const { id } = useParams();

    // Mock Data
    const organizer = {
        name: 'SuperCompute India',
        handle: '@supercompute_in',
        logo: 'SC',
        location: 'Bengaluru, India',
        bio: 'Premier community for High-Performance Computing enthusiasts in India. We organize nationwide hackathons, workshops, and meetups to foster innovation in parallel computing and AI infrastructure.',
        stats: {
            hackathons: 12,
            members: '15k+',
            founded: '2021'
        },
        socials: {
            web: 'supercompute.in',
            twitter: '#',
            linkedin: '#'
        },
        activeEvents: [
            { id: 'h1', name: 'HackOnX 2025', status: 'Live', date: 'Mar 15 - 17' }
        ],
        pastEvents: [
            { id: 'p1', name: 'HPC Winter Summit', date: 'Dec 2024' },
            { id: 'p2', name: 'GPU Day 2024', date: 'Aug 2024' }
        ]
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                {/* Banner */}
                <div className="h-48 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl mb-12 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                </div>

                <div className="px-6 relative">
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-20 mb-8">
                        <div className="w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center text-4xl font-heading text-primary border-4 border-white z-10">
                            {organizer.logo}
                        </div>
                        <div className="flex-1 mb-2">
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-heading text-gray-900">{organizer.name}</h1>
                                <Shield size={20} className="text-blue-500 fill-current" />
                            </div>
                            <p className="text-gray-500 font-medium">{organizer.handle}</p>
                        </div>
                        <div className="flex gap-3 mb-3">
                            <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors">
                                Follow
                            </button>
                            <button className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                                Message
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">About</h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                    {organizer.bio}
                                </p>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <MapPin size={16} /> {organizer.location}
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Globe size={16} /> <a href="#" className="text-primary hover:underline">{organizer.socials.web}</a>
                                    </div>
                                    <div className="flex gap-4 mt-4 pt-4 border-t border-gray-50">
                                        <a href={organizer.socials.twitter} className="text-gray-400 hover:text-blue-400"><Twitter size={20}/></a>
                                        <a href={organizer.socials.linkedin} className="text-gray-400 hover:text-blue-700"><Linkedin size={20}/></a>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex justify-between text-center">
                                <div>
                                    <div className="font-bold text-xl text-gray-900">{organizer.stats.hackathons}</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Hackathons</div>
                                </div>
                                <div>
                                    <div className="font-bold text-xl text-gray-900">{organizer.stats.members}</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Community</div>
                                </div>
                                <div>
                                    <div className="font-bold text-xl text-gray-900">{organizer.stats.founded}</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Founded</div>
                                </div>
                            </div>
                        </div>

                        {/* Events List */}
                        <div className="lg:col-span-2 space-y-6">
                             <div className="flex items-center justify-between mb-2">
                                 <h3 className="font-heading text-lg text-gray-900">Active Events</h3>
                             </div>
                             {organizer.activeEvents.map(ev => (
                                 <Link to={`/dashboard/hackathons/${ev.id}`} key={ev.id} className="block group">
                                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center">
                                         <div className="flex items-center gap-4">
                                             <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                                 <Calendar size={24} />
                                             </div>
                                             <div>
                                                 <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{ev.name}</h4>
                                                 <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">{ev.status}</span>
                                             </div>
                                         </div>
                                         <ArrowUpRight size={20} className="text-gray-300 group-hover:text-primary transition-colors" />
                                     </div>
                                 </Link>
                             ))}

                             <div className="flex items-center justify-between mb-2 mt-8">
                                 <h3 className="font-heading text-lg text-gray-900">Past Events</h3>
                             </div>
                             {organizer.pastEvents.map(ev => (
                                 <div key={ev.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity">
                                     <div className="flex items-center gap-4">
                                         <div className="w-12 h-12 bg-gray-200 text-gray-500 rounded-xl flex items-center justify-center">
                                             <Users size={24} />
                                         </div>
                                         <div>
                                             <h4 className="font-bold text-gray-900">{ev.name}</h4>
                                             <span className="text-xs text-gray-500">{ev.date}</span>
                                         </div>
                                     </div>
                                     <button className="text-xs font-bold text-gray-500 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg">View Winners</button>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default OrganizerProfile;