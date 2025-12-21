import React, { useEffect, useState } from 'react';
import { JudgeLayout } from '../../components/JudgeLayout';
import { Lock, Shield, User, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import authService from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

const JudgeSettings: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false,
    });
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Email preferences state
    const [allowMarketingEmails, setAllowMarketingEmails] = useState(false);
    const [isUpdatingEmailPrefs, setIsUpdatingEmailPrefs] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const user = await authService.me();
                if (!user) {
                    navigate('/auth/login');
                    return;
                }

                // Check if user is a judge
                if (user.role !== 'judge') {
                    navigate('/');
                    return;
                }

                setCurrentUser(user);
                
                // Default to true for marketing emails
                setAllowMarketingEmails(true);
            } catch (err: any) {
                console.error('Failed to load user data:', err);
                setError(err.message || 'Failed to load settings');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [navigate]);

    const validatePassword = (password: string): string[] => {
        const errors: string[] = [];
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain an uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain a lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain a number');
        }
        return errors;
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setPasswordErrors([]);

        // Validation
        if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setError('All password fields are required');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('New password and confirm password do not match');
            return;
        }

        const validationErrors = validatePassword(passwordForm.newPassword);
        if (validationErrors.length > 0) {
            setPasswordErrors(validationErrors);
            return;
        }

        setIsUpdatingPassword(true);

        try {
            await authService.updatePassword(passwordForm.oldPassword, passwordForm.newPassword);
            setSuccessMessage('Password updated successfully! You will be logged out shortly...');
            // Clear form
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
            
            // Logout and redirect after 2 seconds
            setTimeout(async () => {
                await authService.logout();
                navigate('/auth/login');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleEmailPreferencesChange = async () => {
        setError(null);
        setSuccessMessage(null);
        setIsUpdatingEmailPrefs(true);

        try {
            await authService.updateEmailPreferences({ receiveAnnouncements: allowMarketingEmails });
            setSuccessMessage('Email preferences updated successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update email preferences');
            // Revert toggle on error
            setAllowMarketingEmails(!allowMarketingEmails);
        } finally {
            setIsUpdatingEmailPrefs(false);
        }
    };

    if (loading) {
        return (
            <JudgeLayout>
                <div className="flex items-center justify-center py-20">
                    <div className="flex items-center gap-3 text-primary">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        <span className="font-medium">Loading settings...</span>
                    </div>
                </div>
            </JudgeLayout>
        );
    }

    return (
        <JudgeLayout>
            <div className="max-w-4xl mx-auto pb-20 md:pb-0">
                <h1 className="text-2xl md:text-3xl font-heading text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-500 mb-8 text-sm md:text-base">Manage your account security and preferences.</p>

                {/* Messages */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2">
                        <CheckCircle2 size={18} />
                        {successMessage}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Security Settings */}
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-5 md:p-6 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                <Shield size={20} className="text-red-500"/> Security Settings
                            </h3>
                        </div>
                        <div className="p-5 md:p-8">
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.old ? 'text' : 'password'}
                                            value={passwordForm.oldPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors font-medium text-gray-900"
                                            placeholder="Enter your current password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"
                                        >
                                            {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            value={passwordForm.newPassword}
                                            onChange={(e) => {
                                                setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                                                if (e.target.value) {
                                                    setPasswordErrors(validatePassword(e.target.value));
                                                } else {
                                                    setPasswordErrors([]);
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors font-medium text-gray-900"
                                            placeholder="Enter your new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"
                                        >
                                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordErrors.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {passwordErrors.map((err, idx) => (
                                                <p key={idx} className="text-sm text-red-600 flex items-center gap-1">
                                                    <AlertCircle size={14} />
                                                    {err}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                    {passwordForm.newPassword && passwordErrors.length === 0 && (
                                        <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                                            <CheckCircle2 size={14} />
                                            Password meets all requirements
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors font-medium text-gray-900"
                                            placeholder="Confirm your new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"
                                        >
                                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            Passwords do not match
                                        </p>
                                    )}
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <p className="text-sm font-bold text-blue-800 mb-2">Password Requirements:</p>
                                    <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                                        <li>Minimum 8 characters</li>
                                        <li>At least one uppercase letter</li>
                                        <li>At least one lowercase letter</li>
                                        <li>At least one number</li>
                                    </ul>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={isUpdatingPassword}
                                        className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        {isUpdatingPassword ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Lock size={18} />
                                                Update Password
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Email Preferences */}
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-5 md:p-6 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                <User size={20} className="text-amber-500"/> Email Preferences
                            </h3>
                        </div>
                        <div className="p-5 md:p-8">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => {
                                const newValue = !allowMarketingEmails;
                                setAllowMarketingEmails(newValue);
                                handleEmailPreferencesChange();
                            }}>
                                <div className="pr-4">
                                    <div className="font-bold text-gray-900 text-sm md:text-base">Marketing Emails</div>
                                    <div className="text-xs md:text-sm text-gray-500">Receive updates about events, promotions, and announcements</div>
                                </div>
                                <div 
                                    className={`w-12 md:w-14 h-7 md:h-8 rounded-full flex items-center px-1 transition-colors shrink-0 ${allowMarketingEmails ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-5 md:w-6 h-5 md:h-6 bg-white rounded-full shadow-md transform transition-transform ${allowMarketingEmails ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>

                            {isUpdatingEmailPrefs && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                                    <span>Updating preferences...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account Information (Read-only) */}
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-5 md:p-6 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                <User size={20} className="text-primary"/> Account Information
                            </h3>
                        </div>
                        <div className="p-5 md:p-8 space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Email</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {currentUser?.email || 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Role</span>
                                <span className="text-sm font-bold text-gray-900 capitalize">
                                    {currentUser?.role || 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-500">Account Status</span>
                                <span className={`text-sm font-bold flex items-center gap-1 ${
                                    currentUser?.is_verified ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                    <CheckCircle2 size={14} />
                                    {currentUser?.is_verified ? 'Verified' : 'Pending Verification'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </JudgeLayout>
    );
};

export default JudgeSettings;
