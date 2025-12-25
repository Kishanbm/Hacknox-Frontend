import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Email is required' });
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setMessage({ type: 'success', text: 'If an account exists, a reset link has been sent.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || err?.message || 'Failed to send reset link' });
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-silkscreen text-[#5425FF] mb-2">Reset Password</h1>
          <p className="text-[#6A6A6A] font-figtree">
            Enter your email to receive a reset link
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <p className="font-figtree font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-figtree font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl font-figtree focus:outline-none focus:ring-2 focus:ring-[#5425FF] border-gray-300"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#5425FF] text-white py-3 rounded-xl font-figtree font-semibold text-lg hover:bg-[#4319CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 font-figtree">
            Remembered your password?{' '}
            <Link to="/login" className="text-[#5425FF] font-semibold hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

