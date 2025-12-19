import React, { useState } from 'react';
import { DashboardLayout } from '../components/Layout';
import { Bell, Lock, User, Shield, LogOut } from 'lucide-react';

const Settings: React.FC = () => {
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(false);

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-heading text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-500 mb-8">Manage your account preferences and security.</p>

                <div className="space-y-6">
                    {/* Account Section */}
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <User size={20} className="text-primary"/> Account Information
                            </h3>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                    <input type="text" defaultValue="Alex Morgan" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors font-medium text-gray-900" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                                    <input type="text" defaultValue="alexcodes" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors font-medium text-gray-900" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                <input type="email" defaultValue="alex@example.com" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors font-medium text-gray-900" />
                            </div>
                            <div className="flex justify-end">
                                <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                             <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Bell size={20} className="text-amber-500"/> Notifications
                            </h3>
                        </div>
                        <div className="p-8 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <div className="font-bold text-gray-900">Email Notifications</div>
                                    <div className="text-sm text-gray-500">Receive updates about hackathons and teams via email.</div>
                                </div>
                                <div 
                                    onClick={() => setEmailNotifs(!emailNotifs)}
                                    className={`w-14 h-8 rounded-full flex items-center px-1 cursor-pointer transition-colors ${emailNotifs ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${emailNotifs ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <div className="font-bold text-gray-900">Push Notifications</div>
                                    <div className="text-sm text-gray-500">Get real-time alerts on your dashboard.</div>
                                </div>
                                <div 
                                    onClick={() => setPushNotifs(!pushNotifs)}
                                    className={`w-14 h-8 rounded-full flex items-center px-1 cursor-pointer transition-colors ${pushNotifs ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${pushNotifs ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                             <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Shield size={20} className="text-red-500"/> Security
                            </h3>
                        </div>
                        <div className="p-8">
                            <button className="flex items-center gap-2 text-primary font-bold hover:underline mb-6">
                                <Lock size={16} /> Change Password
                            </button>
                            <button className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100">
                                <LogOut size={16} /> Sign Out of All Devices
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;