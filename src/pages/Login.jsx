import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getGoogleAuthUrl } from '../Service/AuthService';

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setIsError(true);
      setMessage('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(form);

      // Save the token and structured user object directly from the response
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user)); 

      // Notify the Navbar instantly across the application tree
      window.dispatchEvent(new Event('userLogin'));

      setIsError(false);
      setMessage('Login successful! Redirecting…');

      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1e3c] via-[#1a3260] to-[#243d74] px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 bg-[#0f1e3c] rounded-xl flex items-center justify-center text-[#e8a838]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3L2 8l10 5 10-5-10-5z" />
              <path d="M2 16l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-[#0f1e3c] text-base leading-tight">EduManage</p>
            <p className="text-[10px] text-gray-400 tracking-wide">School Management System</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#0f1e3c] mb-1">Welcome back</h1>
        <p className="text-sm text-gray-400 mb-6">Sign in to your administrator account</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#0f1e3c] mb-1.5 tracking-wide" htmlFor="email">
              Email address
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@school.edu"
                value={form.email}
                onChange={handleInput}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-[#0f1e3c] placeholder-gray-300 focus:outline-none focus:border-[#0f1e3c] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#0f1e3c] mb-1.5 tracking-wide" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleInput}
                className="w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-[#0f1e3c] placeholder-gray-300 focus:outline-none focus:border-[#0f1e3c] focus:bg-white transition"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-5">
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
              <input type="checkbox" className="accent-[#0f1e3c] w-3.5 h-3.5" />
              Remember me
            </label>
            <a href="#forgot" className="text-xs font-medium text-[#1a3260] hover:text-[#e8a838] transition">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#0f1e3c] hover:bg-[#1a3260] active:scale-[.98] text-white text-sm font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            ) : 'Sign in'}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase">Or continuing via</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full py-2 border border-gray-200 hover:bg-gray-50 text-slate-700 font-medium rounded-lg text-xs flex items-center justify-center gap-2 transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.94 1 12 1 7.35 1 3.37 3.68 1.44 7.56l3.77 2.92c.9-2.7 3.42-4.44 6.79-4.44z"/>
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.73-4.94 3.73-8.55z"/>
            <path fill="#FBBC05" d="M5.21 14.81c-.23-.69-.36-1.43-.36-2.19s.13-1.5.36-2.19L1.44 7.56C.52 9.4 0 11.4 0 13.5s.52 4.1 1.44 5.94l3.77-2.63z"/>
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.08 7.96-2.92l-3.7-2.87c-1.03.69-2.34 1.1-3.93 1.1-3.37 0-5.89-2.25-6.91-5.33L1.65 15.6C3.62 19.93 7.5 23 12 23z"/>
          </svg>
          Identity Google Sign In
        </button>

      </div>
    </div>
  );
}

export default Login;