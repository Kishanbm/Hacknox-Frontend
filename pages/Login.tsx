import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Get redirect parameter from URL
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      
      setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
      const role = user.role;
      
      // Use redirect parameter if provided, otherwise use role-based default
      let target = redirect || '/';
      if (!redirect) {
        target =
          role === 'participant'
            ? '/dashboard'
            : role === 'judge'
            ? '/judge/dashboard'
            : role === 'admin'
            ? '/admin/dashboard'
            : '/';
      }
      
      setTimeout(() => {
        navigate(target, { replace: true });
      }, 800);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

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

        {/* Left of Card */}
        <div className="absolute top-1/2 left-[22%] -translate-y-1/2 w-20 h-20 animate-float-slow opacity-60">
          <img src="/images/decoration-1.svg" alt="" className="w-full h-full rotate-30" />
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

        {/* Right of Card */}
        <div className="absolute top-1/2 right-[22%] -translate-y-1/2 w-20 h-20 animate-float-medium opacity-60">
          <img src="/images/decoration-2.svg" alt="" className="w-full h-full -rotate-15" />
        </div>

        {/* Top Center */}
        <div className="absolute top-[5%] left-1/3 w-16 h-14 animate-float-fast opacity-45">
          <img src="/images/decoration-3.svg" alt="" className="w-full h-full rotate-8" />
        </div>

        {/* Bottom Center */}
        <div className="absolute bottom-[5%] right-1/3 w-16 h-16 animate-float-medium opacity-50">
          <img src="/images/decoration-1.svg" alt="" className="w-full h-full -rotate-20" />
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-[#5425FF] mb-2">Log In</h1>
          <p className="text-[#6A6A6A] font-body">Welcome back to HackOnX</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <p className="font-body font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-body font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl font-body focus:outline-none focus:ring-2 focus:ring-[#5425FF] ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="john.doe@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 font-body">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-body font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl font-body focus:outline-none focus:ring-2 focus:ring-[#5425FF] ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 font-body">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-[#5425FF] font-body hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#5425FF] text-white py-3 rounded-xl font-body font-semibold text-lg hover:bg-[#4319CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 font-body">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#5425FF] font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
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
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 4s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float-fast 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;