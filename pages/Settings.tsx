import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/Layout';
import { Bell, Lock, User, Shield, LogOut } from 'lucide-react';
import authService from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const user = await authService.me();
                if (user) {
                    setEmail(user.email || '');
                    setUsername((user.username as string) || '');
                    const profile = Array.isArray(user.Profiles) ? user.Profiles[0] : user.Profiles;
                    setFirstName(profile?.first_name || '');
                    setLastName(profile?.last_name || '');
                }
            } catch (err) {
                // ignore if not authenticated
            }
        };
        load();
    }, []);

    const handleSaveProfile = async () => {
        setStatusMessage(null);
        try {
            await authService.updateProfile({ first_name: firstName, last_name: lastName });
            setStatusMessage('Profile updated successfully');
            setTimeout(() => setStatusMessage(null), 2500);
        } catch (err: any) {
            console.error('Failed to update profile', err);
            setStatusMessage(err?.message || 'Failed to update profile');
            setTimeout(() => setStatusMessage(null), 2500);
        }
    };

    const toggleEmailPrefs = async () => {
        const newVal = !emailNotifs;
        setEmailNotifs(newVal);
        try {
            await authService.updateEmailPreferences({ allowMarketingEmails: newVal });
            setStatusMessage('Email preferences updated');
            setTimeout(() => setStatusMessage(null), 2500);
        } catch (err: any) {
            console.error('Failed to update email preferences', err);
            setStatusMessage('Failed to update email preferences');
            setEmailNotifs(!newVal); // revert
            setTimeout(() => setStatusMessage(null), 2500);
        }
    };

    const handleSignOutAll = async () => {
        try {
            await authService.logout();
        } catch (err) {
            // ignore
        }
        try { localStorage.removeItem('authToken'); } catch(_) {}
        navigate('/auth/login');
    };

    return (
        <>
        <DashboardLayout>
            <div className="max-w-4xl mx-auto pb-20 md:pb-0">
                <h1 className="text-2xl md:text-3xl font-heading text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-500 mb-8 text-sm md:text-base">Manage your account preferences and security.</p>

                <div className="space-y-6">
                    {/* Account Section */}
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-5 md:p-6 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                <User size={20} className="text-primary"/> Account Information
                            </h3>
                        </div>
                        <div className="p-5 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={`${firstName}${lastName ? ' ' + lastName : ''}`}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            const [first, ...rest] = v.split(' ');
                                            setFirstName(first || '');
                                            setLastName(rest.join(' ') || '');
                                        }}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors font-medium text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors font-medium text-gray-900"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors font-medium text-gray-900"
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button onClick={handleSaveProfile} className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                    Save Changes
                                </button>
                            </div>
                            {statusMessage && <div className="text-sm text-center text-gray-600 mt-2">{statusMessage}</div>}
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-5 md:p-6 border-b border-gray-50 bg-gray-50/50">
                             <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                <Bell size={20} className="text-amber-500"/> Notifications
                            </h3>
                        </div>
                        <div className="p-5 md:p-8 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" onClick={toggleEmailPrefs}>
                                <div className="pr-4">
                                    <div className="font-bold text-gray-900 text-sm md:text-base">Email Notifications</div>
                                    <div className="text-xs md:text-sm text-gray-500">Receive updates about hackathons and teams.</div>
                                </div>
                                <div 
                                    role="button"
                                    className={`w-12 md:w-14 h-7 md:h-8 rounded-full flex items-center px-1 transition-colors shrink-0 ${emailNotifs ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-5 md:w-6 h-5 md:h-6 bg-white rounded-full shadow-md transform transition-transform ${emailNotifs ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => setPushNotifs(!pushNotifs)}>
                                <div className="pr-4">
                                    <div className="font-bold text-gray-900 text-sm md:text-base">Push Notifications</div>
                                    <div className="text-xs md:text-sm text-gray-500">Get real-time alerts on your dashboard.</div>
                                </div>
                                <div 
                                    className={`w-12 md:w-14 h-7 md:h-8 rounded-full flex items-center px-1 transition-colors shrink-0 ${pushNotifs ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-5 md:w-6 h-5 md:h-6 bg-white rounded-full shadow-md transform transition-transform ${pushNotifs ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-5 md:p-6 border-b border-gray-50 bg-gray-50/50">
                             <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                <Shield size={20} className="text-red-500"/> Security
                            </h3>
                        </div>
                        <div className="p-5 md:p-8 flex flex-col gap-3">
                            <button onClick={() => { setShowChangePassword(true); setPasswordStatus(null); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }} className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left group transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-primary shadow-sm"><Lock size={18} /></div>
                                    <span className="font-bold text-gray-700 group-hover:text-gray-900">Change Password</span>
                                </div>
                                <span className="text-xs font-bold text-gray-400 group-hover:text-primary">Update</span>
                            </button>
                            
                            <button onClick={handleSignOutAll} className="flex items-center justify-between w-full p-4 bg-red-50 hover:bg-red-100 rounded-xl text-left group transition-colors border border-red-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-red-500 shadow-sm"><LogOut size={18} /></div>
                                    <span className="font-bold text-red-700">Sign Out of All Devices</span>
                                </div>
                                <span className="text-xs font-bold text-red-400 group-hover:text-red-600">Action</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
        {showChangePassword && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold mb-4">Change Password</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Current Password</label>
                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">New Password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        {passwordStatus && <div className="text-sm text-center text-gray-600">{passwordStatus}</div>}
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setShowChangePassword(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                            <button onClick={async () => {
                                setPasswordStatus(null);
                                if (!currentPassword || !newPassword) { setPasswordStatus('Please fill both fields'); return; }
                                if (newPassword !== confirmPassword) { setPasswordStatus('New passwords do not match'); return; }
                                try {
                                    await authService.updatePassword(currentPassword, newPassword);
                                    setPasswordStatus('Password updated — please login again');
                                    setTimeout(() => {
                                        setShowChangePassword(false);
                                        try { localStorage.removeItem('authToken'); } catch(_) {}
                                        navigate('/auth/login');
                                    }, 1200);
                                } catch (err: any) {
                                    console.error('Change password failed', err);
                                    setPasswordStatus(err?.message || 'Failed to update password');
                                }
                            }} className="px-4 py-2 rounded-lg bg-primary text-white">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default Settings;