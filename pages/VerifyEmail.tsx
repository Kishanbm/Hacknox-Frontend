import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

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
        setError(err.message || 'Verification failed');
        setStatus('error');
      }
    })();
  }, [token]);

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto' }}>
      {status === 'verifying' && <div>Verifying your email...</div>}
      {status === 'success' && <div style={{ color: 'green' }}>Email verified! Redirecting to login...</div>}
      {status === 'error' && <div style={{ color: 'red' }}>Verification failed: {error}</div>}
    </div>
  );
};

export default VerifyEmail;
