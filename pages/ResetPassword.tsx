'use client';

import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth.service';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Check if token is present on mount
  React.useEffect(() => {
    if (!token) {
      setMessage({ type: 'error', text: 'Invalid reset link. Please request a new password reset from the login page.' });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!token) {
      setMessage({ type: 'error', text: 'Missing reset token. Use the link from your email.' });
      return;
    }
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    if (password !== confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      setMessage({ type: 'success', text: 'Password reset successful. Redirecting to login...' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || err?.message || 'Failed to reset password' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E9E3FF] to-[#E9FFE5] px-4 relative overflow-hidden">
      {/* Floating Decorations (copied from Login page for consistent animations) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[8%] left-[3%] w-20 h-20 animate-float-slow opacity-65">
          <img src="/images/decoration-1.svg" alt="" className="w-full h-full" />
        </div>
        <div className="absolute top-[45%] left-[5%] w-24 h-24 animate-float-medium opacity-55">
          <img src="/images/decoration-2.svg" alt="" className="w-full h-full rotate-12" />
        </div>
        <div className="absolute bottom-[12%] left-[4%] w-22 h-20 animate-float-fast opacity-60">
          <img src="/images/decoration-3.svg" alt="" className="w-full h-full -rotate-10" />
        </div>
        <div className="absolute top-1/2 left-[22%] -translate-y-1/2 w-20 h-20 animate-float-slow opacity-60">
          <img src="/images/decoration-1.svg" alt="" className="w-full h-full rotate-30" />
        </div>
        <div className="absolute top-[10%] right-[4%] w-22 h-22 animate-float-medium opacity-60">
          <img src="/images/decoration-2.svg" alt="" className="w-full h-full" />
        </div>
        <div className="absolute top-[50%] right-[3%] w-24 h-24 animate-float-slow opacity-55">
          <img src="/images/decoration-3.svg" alt="" className="w-full h-full rotate-15" />
        </div>
        <div className="absolute bottom-[8%] right-[5%] w-20 h-20 animate-float-fast opacity-65">
          <img src="/images/decoration-1.svg" alt="" className="w-full h-full rotate-45" />
        </div>
        <div className="absolute top-1/2 right-[22%] -translate-y-1/2 w-20 h-20 animate-float-medium opacity-60">
          <img src="/images/decoration-2.svg" alt="" className="w-full h-full -rotate-15" />
        </div>
        <div className="absolute top-[5%] left-1/3 w-16 h-14 animate-float-fast opacity-45">
          <img src="/images/decoration-3.svg" alt="" className="w-full h-full rotate-8" />
        </div>
        <div className="absolute bottom-[5%] right-1/3 w-16 h-16 animate-float-medium opacity-50">
          <img src="/images/decoration-1.svg" alt="" className="w-full h-full -rotate-20" />
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-silkscreen text-[#5425FF] mb-2">Set a New Password</h1>
          <p className="text-gray-500 text-sm">Enter a new password for your account</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5425FF]" 
                placeholder="Minimum 8 characters" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input 
                type={showConfirm ? 'text' : 'password'} 
                value={confirm} 
                onChange={e => setConfirm(e.target.value)} 
                className="w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5425FF]" 
                placeholder="Repeat new password" 
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#5425FF] text-white rounded-xl font-semibold hover:bg-[#4319CC] transition-colors disabled:opacity-60">
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <Link to="/login" className="text-[#5425FF] hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;




