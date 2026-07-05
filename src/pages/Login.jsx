import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import { QRCodeSVG } from 'qrcode.react';
import { login, getGoogleAuthUrl, createQrLoginSession, getQrLoginStatus } from '../Service/AuthService';
import { WS_URL } from '../api/config';

const FEATURES = [
  'Student & Teacher Management',
  'Course & Attendance Tracking',
  'Payment & Fee Management',
  'Analytics & Reports',
];

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState('');

  const countdownTimerRef = useRef(null);
  const pollTimerRef = useRef(null);
  const stompClientRef = useRef(null);
  const sessionInFlightRef = useRef(false);
  const authenticatedRef = useRef(false);

  const clearQrTimers = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const disconnectStomp = () => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }
  };

  const persistAuth = (jwt, user) => {
    if (jwt) {
      localStorage.setItem('token', jwt);
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }

    window.dispatchEvent(new Event('userLogin'));
  };

  const handleQrSuccess = (payload) => {
    authenticatedRef.current = true;
    clearQrTimers();
    disconnectStomp();
    setQrError('');
    setQrToken('');
    setCountdown(0);
    setQrLoading(false);
    setMessage('Login successful! Redirecting…');
    setIsError(false);

    const jwt = payload?.jwt || payload?.token || payload?.accessToken;
    const user = payload?.user || null;

    persistAuth(jwt, user);

    window.setTimeout(() => navigate('/dashboard'), 800);
  };

  const handleQrStatus = async (token) => {
    if (!token || authenticatedRef.current) return false;

    try {
      const response = await getQrLoginStatus(token);
      const payload = response?.data || {};

      if (payload?.status === 'SUCCESS' || payload?.jwt || payload?.token) {
        handleQrSuccess(payload);
        return true;
      }

      if (payload?.status === 'EXPIRED' || payload?.expired) {
        setQrError('QR Code has expired.');
        setQrLoading(false);
        return false;
      }

      if (payload?.status === 'INVALID' || payload?.invalid) {
        setQrError('Invalid QR Code.');
        setQrLoading(false);
        return false;
      }

      return false;
    } catch (error) {
      console.error('QR status check failed:', error);
      return false;
    }
  };

  const startPolling = (token) => {
    if (!token || authenticatedRef.current) return;

    clearQrTimers();
    pollTimerRef.current = window.setInterval(async () => {
      const handled = await handleQrStatus(token);
      if (handled) {
        clearQrTimers();
      }
    }, 2000);
  };

  const startCountdown = (seconds) => {
    clearQrTimers();

    if (!seconds || seconds <= 0) {
      return;
    }

    setCountdown(seconds);
    countdownTimerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearQrTimers();
          createQrSession();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  const createQrSession = async () => {
    if (sessionInFlightRef.current || authenticatedRef.current) {
      return;
    }

    sessionInFlightRef.current = true;
    clearQrTimers();
    disconnectStomp();
    setQrLoading(true);
    setQrError('');
    setMessage('');

    try {
      const response = await createQrLoginSession();
      const token = response?.data?.token;
      const expire = Number(response?.data?.expire || 60);

      if (!token) {
        throw new Error('QR login session could not be created.');
      }

      setQrToken(token);
      startCountdown(expire);

      const client = new Client({
        brokerURL: WS_URL,
        reconnectDelay: 5000,
        onConnect: () => {
          client.subscribe(`/queue/qr-login/${token}`, (message) => {
            try {
              const payload = JSON.parse(message.body);
              if (payload?.status === 'SUCCESS' || payload?.jwt || payload?.token) {
                handleQrSuccess(payload);
              } else if (payload?.status === 'EXPIRED') {
                setQrError('QR Code has expired.');
                setQrLoading(false);
              } else if (payload?.status === 'INVALID') {
                setQrError('Invalid QR Code.');
                setQrLoading(false);
              }
            } catch (error) {
              console.error('Failed to parse QR login payload:', error);
            }
          });
        },
        onWebSocketError: () => {
          startPolling(token);
        },
        onStompError: () => {
          startPolling(token);
        },
      });

      client.activate();
      stompClientRef.current = client;
    } catch (error) {
      console.error('Unable to create QR login session:', error);
      setQrError('Unable to connect to server.');
      setQrLoading(false);
    } finally {
      sessionInFlightRef.current = false;
    }
  };

  useEffect(() => {
    createQrSession();

    return () => {
      authenticatedRef.current = false;
      clearQrTimers();
      disconnectStomp();
    };
  }, []);

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

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

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
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="relative md:w-[42%] flex flex-col justify-center items-center text-center px-10 py-16 bg-gradient-to-br from-[#4B2FE0] via-[#5B3FF0] to-[#6D4DFF] overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#e8a838]/10 blur-3xl" />

        <div className="relative w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-5 ring-1 ring-white/25">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10 12 5 2 10l10 5 10-5Z" />
            <path d="M6 12.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
            <path d="M22 10v6" />
          </svg>
        </div>

        <h2 className="relative text-white text-xl font-semibold tracking-tight">EduManage</h2>
        <p className="relative text-white/70 text-sm mt-3 max-w-[260px] leading-relaxed">
          The complete school management platform for modern institutions
        </p>

        <ul className="relative mt-9 space-y-3.5 text-left">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-white/90 text-sm">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#F7F7FA] px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-11 h-11 rounded-xl bg-[#0f1e3c] flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[#e8a838]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21V9l9-6 9 6v12" />
                <path d="M9 21v-6h6v6" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#0f1e3c] tracking-tight">Welcome back</h1>
            <p className="text-sm text-gray-400 mt-1">Sign in to your administrator account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="sr-only" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleInput}
                className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-full text-[#0f1e3c] placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5B3FF0]/30 focus:border-[#5B3FF0] transition"
              />
            </div>

            <div className="relative">
              <label className="sr-only" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleInput}
                className="w-full px-4 pr-11 py-3 text-sm bg-white border border-gray-200 rounded-full text-[#0f1e3c] placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5B3FF0]/30 focus:border-[#5B3FF0] transition"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

            <div className="flex items-center justify-between pt-1 pb-1 px-1">
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                <input type="checkbox" className="accent-[#5B3FF0] w-3.5 h-3.5" />
                Remember me
              </label>
              <a href="#forgot" className="text-xs font-medium text-[#5B3FF0] hover:text-[#e8a838] transition">
                Forgot password?
              </a>
            </div>

            {message && (
              <p className={`text-xs text-center ${isError ? 'text-red-500' : 'text-emerald-600'}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-1 bg-white border-2 border-[#0f1e3c] hover:bg-[#0f1e3c] text-[#0f1e3c] hover:text-white text-sm font-semibold rounded-full transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              ) : 'Log in'}
            </button>
          </form>

          <div className="mt-5 rounded-2xl border border-dashed border-[#5B3FF0]/20 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#0f1e3c]">Scan QR Login</p>
                <p className="text-xs text-gray-500 mt-1">Use the mobile app to approve this sign-in.</p>
              </div>
              <span className="rounded-full bg-[#5B3FF0]/10 px-2.5 py-1 text-[11px] font-medium text-[#5B3FF0]">
                {qrLoading ? 'Generating…' : 'Live'}
              </span>
            </div>

            <div className="mt-4 flex flex-col items-center justify-center rounded-xl bg-[#F7F7FA] p-3">
              {qrLoading ? (
                <div className="flex flex-col items-center gap-2 py-4 text-sm text-gray-500">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Generating QR code…
                </div>
              ) : qrToken ? (
                <>
                  <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                    <QRCodeSVG value={qrToken} size={180} level="H" />
                  </div>
                  <p className="mt-3 text-[11px] text-center text-gray-500 break-all">{qrToken}</p>
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-[#0f1e3c]">
                    <span className="font-semibold">Expires in:</span>
                    <span>{countdown}s</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => createQrSession()}
                    className="mt-3 text-xs font-medium text-[#5B3FF0] hover:text-[#e8a838] transition"
                  >
                    Refresh code
                  </button>
                </>
              ) : (
                <p className="py-4 text-sm text-gray-500">Unable to generate QR login code right now.</p>
              )}
            </div>

            {qrError && (
              <p className="mt-3 text-center text-xs text-red-500">{qrError}</p>
            )}
          </div>

          <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase tracking-wide">Or continue with</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-2.5 border border-gray-200 hover:bg-white bg-white text-slate-700 font-medium rounded-full text-xs flex items-center justify-center gap-2 transition shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.94 1 12 1 7.35 1 3.37 3.68 1.44 7.56l3.77 2.92c.9-2.7 3.42-4.44 6.79-4.44z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.73-4.94 3.73-8.55z"/>
              <path fill="#FBBC05" d="M5.21 14.81c-.23-.69-.36-1.43-.36-2.19s.13-1.5.36-2.19L1.44 7.56C.52 9.4 0 11.4 0 13.5s.52 4.1 1.44 5.94l3.77-2.63z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.08 7.96-2.92l-3.7-2.87c-1.03.69-2.34 1.1-3.93 1.1-3.37 0-5.89-2.25-6.91-5.33L1.65 15.6C3.62 19.93 7.5 23 12 23z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;