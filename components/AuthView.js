'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from './Icons';

export default function AuthView({ onAuthSuccess, onGuestLogin }) {
  const [screen, setScreen] = useState('welcome'); // 'welcome' | 'signup' | 'verify' | 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Email OTP Verification States
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devCode, setDevCode] = useState(null);

  const otpInputsRef = useRef([]);

  // Cooldown timer effect
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first OTP input when entering verification screen
  useEffect(() => {
    if (screen === 'verify' && otpInputsRef.current[0]) {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }
  }, [screen]);

  // Request 6-digit verification code
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

      setDevCode(data.devCode || null);
      setResendCooldown(30);
      setSuccessMsg(`Verification code sent to ${targetEmail.trim()}`);
      return true;
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      return false;
    } finally {
      setIsSendingCode(false);
    }
  };

  // Handle Signup submission -> trigger code send
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const sent = await sendVerificationCode(email, name);
    if (sent) {
      setOtp(['', '', '', '', '', '']);
      setScreen('verify');
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next input if digit entered
    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle pasting full 6-digit OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = ['', '', '', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      otpInputsRef.current[focusIndex]?.focus();
    }
  };

  // Auto-fill dev code helper
  const handleAutoFillDevCode = () => {
    if (!devCode) return;
    const digits = devCode.split('').slice(0, 6);
    setOtp(digits);
    if (otpInputsRef.current[5]) {
      otpInputsRef.current[5].focus();
    }
  };

  // Handle OTP Verification submission
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifying(true);
    setError('');
    setSuccessMsg('');

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
        throw new Error(data.error || 'Verification failed. Please check the code.');
      }

      // Success -> Proceed to Onboarding
      onAuthSuccess({
        name: name.trim(),
        email: email.trim(),
        isNewUser: true,
      });
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isSendingCode) return;
    await sendVerificationCode(email, name);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    onAuthSuccess({
      name: email.split('@')[0] || 'Member',
      email: email.trim(),
      isNewUser: false,
    });
  };

  return (
    <div style={{ padding: '8px 2px 20px 2px', minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* SCREEN 1: SPLASH & WELCOME */}
      {screen === 'welcome' && (
        <div style={{ textAlign: 'center' }}>
          {/* Animated Glowing Logo */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '26px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: '0 12px 30px rgba(16, 185, 129, 0.45)',
              position: 'relative',
            }}
          >
            <Icon name="ai" size={44} color="#ffffff" />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--primary-light)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '12px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            AI BUDGET ASSISTANT
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            FinSmart
          </h1>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '28px', padding: '0 10px' }}>
            A simple, mobile-first way to track spending, manage monthly budgets, and answer{' '}
            <span style={{ color: '#fff', fontWeight: 600 }}>&ldquo;How am I doing financially this month?&rdquo;</span>
          </p>

          {/* Core Feature Highlights */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name="wallet" size={18} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Default Naira (₦) & Multi-Currency</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tailored with instant global currency switching</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: '#a78bfa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name="ai" size={18} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>3-Tier AI Budget Insights</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Observations, budget warnings, & actionable savings tips</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name="plus" size={18} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Sub-3-Second Quick Logging</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fast thumb-zone expense & income tracking</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setError('');
                setSuccessMsg('');
                setScreen('signup');
              }}
              style={{ fontSize: '15px', padding: '14px' }}
            >
              <Icon name="user" size={18} />
              <span>Sign Up</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setError('');
                setSuccessMsg('');
                setScreen('login');
              }}
              style={{ padding: '14px', fontSize: '15px' }}
            >
              <Icon name="log-in" size={18} />
              <span>Log In</span>
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 2: SIGN UP */}
      {screen === 'signup' && (
        <div>
          <button
            type="button"
            onClick={() => setScreen('welcome')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              marginBottom: '16px',
            }}
          >
            ← Back to Welcome
          </button>

          <div style={{ marginBottom: '22px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Create Your Account</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Join FinSmart and start managing your monthly budget with AI
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '12px',
                color: '#fca5a5',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Amaka Juliet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
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
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSendingCode}
              style={{ marginTop: '20px', padding: '14px', opacity: isSendingCode ? 0.7 : 1 }}
            >
              {isSendingCode ? (
                <span>Sending Verification Code...</span>
              ) : (
                <span>Continue & Verify Email →</span>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <span
              style={{ color: 'var(--primary-light)', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => {
                setError('');
                setSuccessMsg('');
                setScreen('login');
              }}
            >
              Log In
            </span>
          </div>
        </div>
      )}

      {/* SCREEN 3: EMAIL OTP VERIFICATION */}
      {screen === 'verify' && (
        <div>
          <button
            type="button"
            onClick={() => {
              setError('');
              setSuccessMsg('');
              setScreen('signup');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              marginBottom: '16px',
            }}
          >
            ← Edit Registration Details
          </button>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto',
              }}
            >
              <Icon name="bell" size={26} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              Verify Your Email
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              We sent a 6-digit confirmation code to:
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '6px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                fontSize: '13px',
                fontWeight: 600,
                color: '#fff',
              }}
            >
              <span>{email}</span>
            </div>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '12px',
                color: '#fca5a5',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          {successMsg && !error && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '12px',
                color: 'var(--primary-light)',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              {successMsg}
            </div>
          )}

          {/* Dev Mode Code Quick-Fill Helper */}
          {devCode && (
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px dashed rgba(59, 130, 246, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
              }}
            >
              <div style={{ color: '#93c5fd' }}>
                💡 Test Code: <strong style={{ letterSpacing: '1px', color: '#fff' }}>{devCode}</strong>
              </div>
              <button
                type="button"
                onClick={handleAutoFillDevCode}
                style={{
                  background: 'rgba(59, 130, 246, 0.25)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: '#bfdbfe',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Auto-fill
              </button>
            </div>
          )}

          <form onSubmit={handleVerifySubmit}>
            {/* 6 Digit Input Group */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                margin: '16px 0 20px 0',
              }}
              onPaste={handleOtpPaste}
            >
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputsRef.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  style={{
                    width: '44px',
                    height: '52px',
                    borderRadius: '12px',
                    background: 'var(--bg-input, #1e293b)',
                    border: digit
                      ? '2px solid var(--primary, #10b981)'
                      : '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '22px',
                    fontWeight: 800,
                    textAlign: 'center',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    boxShadow: digit ? '0 0 12px rgba(16, 185, 129, 0.3)' : 'none',
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isVerifying || otp.join('').length !== 6}
              style={{
                width: '100%',
                padding: '14px',
                opacity: isVerifying || otp.join('').length !== 6 ? 0.6 : 1,
              }}
            >
              {isVerifying ? <span>Verifying Code...</span> : <span>Confirm & Complete Sign Up</span>}
            </button>
          </form>

          {/* Resend Action */}
          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Didn&apos;t receive the email?{' '}
            {resendCooldown > 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>Resend in {resendCooldown}s</span>
            ) : (
              <span
                style={{
                  color: 'var(--primary-light)',
                  fontWeight: 700,
                  cursor: isSendingCode ? 'default' : 'pointer',
                  opacity: isSendingCode ? 0.6 : 1,
                }}
                onClick={handleResendCode}
              >
                {isSendingCode ? 'Sending...' : 'Resend Code'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* SCREEN 4: LOGIN */}
      {screen === 'login' && (
        <div>
          <button
            type="button"
            onClick={() => setScreen('welcome')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              marginBottom: '16px',
            }}
          >
            ← Back to Welcome
          </button>

          <div style={{ marginBottom: '22px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Welcome Back</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Sign in to access your financial dashboard and live insights
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '12px',
                color: '#fca5a5',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
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
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '20px', padding: '14px' }}>
              <span>Sign In to Dashboard</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Don&apos;t have an account yet?{' '}
            <span
              style={{ color: 'var(--primary-light)', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => {
                setError('');
                setSuccessMsg('');
                setScreen('signup');
              }}
            >
              Sign Up
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
