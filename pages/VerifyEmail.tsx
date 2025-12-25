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
        setTimeout(() => navigate('/login'), 1500);
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || 'Verification failed');
        setStatus('error');
      }
    })();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E9E3FF] to-[#E9FFE5] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-pulse mb-4 text-gray-700">Verifying your email...</div>
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full"></div>
          </>
        )}
        {status === 'success' && (
          <div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Email verified!</h2>
            <p className="text-gray-600 mb-4">Redirecting to login...</p>
            <Link to="/login" className="inline-block px-6 py-2 bg-primary text-white rounded-xl">Go to Login</Link>
          </div>
        )}
        {status === 'error' && (
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Verification failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link to="/" className="text-primary hover:underline">Back to home</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
