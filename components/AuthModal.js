'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from './Icons';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('welcome'); // 'welcome' | 'login' | 'signup' | 'verify'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Email OTP states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputsRef = useRef([]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (mode === 'verify' && otpInputsRef.current[0]) {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }
  }, [mode]);

  if (!isOpen) return null;

  const sendVerificationCode = async (targetEmail, targetName) => {
    setIsSendingCode(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail.trim(),
          name: targetName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      setResendCooldown(30);
      setSuccessMsg(`Code sent to ${targetEmail.trim()}`);
      return true;
    } catch (err) {
      setError(err.message || 'Error sending code.');
      return false;
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    const sent = await sendVerificationCode(email, name);
    if (sent) {
      setOtp(['', '', '', '', '', '']);
      setMode('verify');
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length !== 6) {
      setError('Enter 6-digit verification code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: fullCode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid verification code.');
      }

      onLoginSuccess({
        email,
        name: name || 'Amaka Juliet',
        isNewUser: true,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    onLoginSuccess({
      email,
      name: email.split('@')[0] || 'Member',
      isNewUser: false,
    });
    onClose();
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="modal-overlay" style={{ alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '380px',
          background: '#0f172a',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '28px',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          position: 'relative',
        }}
      >
        <button
          type="button"
          className="icon-btn"
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px' }}
          aria-label="Close"
        >
          <Icon name="close" size={16} />
        </button>

        {/* WELCOME / SPLASH SCREEN */}
        {mode === 'welcome' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Icon name="ai" size={34} color="#fff" />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              FinSmart AI
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              Your intelligent, mobile-first financial assistant and monthly budget tracker.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setError('');
                  setMode('signup');
                }}
              >
                <Icon name="user" size={18} />
                <span>Sign Up</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setError('');
                  setMode('login');
                }}
              >
                <Icon name="log-in" size={18} />
                <span>Log In</span>
              </button>
            </div>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              Welcome Back
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Sign in to manage your budget and view live insights
            </p>

            {error && (
              <div style={{ color: '#fca5a5', fontSize: '12px', marginBottom: '12px' }}>{error}</div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="amaka.juliet@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
                Sign In
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
              Don&apos;t have an account?{' '}
              <span
                style={{ color: 'var(--primary-light)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => {
                  setError('');
                  setMode('signup');
                }}
              >
                Sign Up
              </span>
            </div>
          </div>
        )}

        {/* SIGN UP FORM */}
        {mode === 'signup' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              Create Account
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Start tracking spending with personalized AI guidance
            </p>

            {error && (
              <div style={{ color: '#fca5a5', fontSize: '12px', marginBottom: '12px' }}>{error}</div>
            )}

            <form onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Amaka Juliet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="amaka@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSendingCode}
                style={{ marginTop: '16px' }}
              >
                {isSendingCode ? 'Sending Code...' : 'Verify Email →'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <span
                style={{ color: 'var(--primary-light)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => {
                  setError('');
                  setMode('login');
                }}
              >
                Sign In
              </span>
            </div>
          </div>
        )}

        {/* VERIFICATION FORM */}
        {mode === 'verify' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              Verify Email
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Enter 6-digit code sent to <strong style={{ color: '#fff' }}>{email}</strong>
            </p>

            {error && (
              <div style={{ color: '#fca5a5', fontSize: '12px', marginBottom: '12px' }}>{error}</div>
            )}
            {successMsg && !error && (
              <div style={{ color: 'var(--primary-light)', fontSize: '12px', marginBottom: '12px' }}>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleVerifySubmit}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', margin: '14px 0 18px 0' }}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      width: '38px',
                      height: '46px',
                      borderRadius: '10px',
                      background: 'var(--bg-input, #1e293b)',
                      border: digit
                        ? '2px solid var(--primary, #10b981)'
                        : '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: 800,
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isVerifying || otp.join('').length !== 6}
                style={{ width: '100%' }}
              >
                {isVerifying ? 'Verifying...' : 'Verify & Enter'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
              {resendCooldown > 0 ? (
                <span>Resend in {resendCooldown}s</span>
              ) : (
                <span
                  style={{ color: 'var(--primary-light)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => sendVerificationCode(email, name)}
                >
                  Resend Code
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
