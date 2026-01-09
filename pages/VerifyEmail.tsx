import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth.service';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'idle'|'verifying'|'success'|'error'>('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Missing verification token');
      setStatus('error');
      return;
    }

    (async () => {
      setStatus('verifying');
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        // Redirect to login page after 2 seconds with a success message
        setTimeout(() => {
          navigate('/login?verified=true');
        }, 2000);
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || 'Verification failed');
        setStatus('error');
      }
    })();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E9E3FF] to-[#E9FFE5] px-4 relative overflow-hidden">
      {/* Floating Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Left Side */}
        <div className="absolute top-[8%] left-[3%] w-20 h-20 animate-float-slow opacity-65">
          <img src="/images/decoration-1.svg" alt="" className="w-full h-full" />
        </div>
        <div className="absolute top-[45%] left-[5%] w-24 h-24 animate-float-medium opacity-55">
          <img src="/images/decoration-2.svg" alt="" className="w-full h-full rotate-12" />
        </div>
        <div className="absolute bottom-[12%] left-[4%] w-22 h-20 animate-float-fast opacity-60">
          <img src="/images/decoration-3.svg" alt="" className="w-full h-full -rotate-10" />
        </div>

        {/* Right Side */}
        <div className="absolute top-[10%] right-[4%] w-22 h-22 animate-float-medium opacity-60">
          <img src="/images/decoration-2.svg" alt="" className="w-full h-full" />
        </div>
        <div className="absolute top-[50%] right-[3%] w-24 h-24 animate-float-slow opacity-55">
          <img src="/images/decoration-3.svg" alt="" className="w-full h-full rotate-15" />
        </div>
        <div className="absolute bottom-[8%] right-[5%] w-20 h-20 animate-float-fast opacity-65">
          <img src="/images/decoration-1.svg" alt="" className="w-full h-full rotate-45" />
        </div>
      </div>

      {/* Verification Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center relative z-10">
        {status === 'verifying' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6">
              <svg className="animate-spin" viewBox="0 0 50 50">
                <circle
                  className="opacity-25"
                  cx="25"
                  cy="25"
                  r="20"
                  stroke="#5425FF"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  className="opacity-75"
                  cx="25"
                  cy="25"
                  r="20"
                  stroke="#5425FF"
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray="80"
                  strokeDashoffset="60"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-heading font-bold text-[#5425FF] mb-3">Verifying...</h2>
            <p className="text-gray-600 font-body">Please wait while we verify your email address.</p>
          </>
        )}
        
        {status === 'success' && (
          <div className="animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-heading font-bold text-green-600 mb-3">Verified!</h2>
            <p className="text-gray-700 font-body mb-6">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500 font-body">Redirecting to login page...</p>
              <Link 
                to="/login?verified=true" 
                className="inline-block px-8 py-3 bg-[#5425FF] text-white rounded-xl font-body font-semibold hover:bg-[#4319CC] transition-colors"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-3xl font-heading font-bold text-red-600 mb-3">Verification Failed</h2>
            <p className="text-gray-700 font-body mb-6">{error}</p>
            <div className="space-y-3">
              <Link 
                to="/signup" 
                className="inline-block px-8 py-3 bg-[#5425FF] text-white rounded-xl font-body font-semibold hover:bg-[#4319CC] transition-colors"
              >
                Try Signing Up Again
              </Link>
              <div>
                <Link to="/" className="text-[#5425FF] font-body hover:underline">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        
        @keyframes float-medium {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-5deg);
          }
        }
        
        @keyframes float-fast {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(8deg);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 4s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float-fast 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;
