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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!token) {
      setMessage({ type: 'error', text: 'Missing reset token. Use the link from your email.' });
      return;
    }
    if (password.length < 8) return setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
    if (password !== confirm) return setMessage({ type: 'error', text: 'Passwords do not match.' });

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
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5425FF]" placeholder="Minimum 8 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5425FF]" placeholder="Repeat new password" />
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




