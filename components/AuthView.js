'use client';

import { useState } from 'react';
import Icon from './Icons';

export default function AuthView({ onAuthSuccess, onGuestLogin }) {
  const [screen, setScreen] = useState('welcome'); // 'welcome' | 'signup' | 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    onAuthSuccess({
      name: name.trim(),
      email: email.trim(),
      isNewUser: true,
    });
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

  const handleUseDemo = () => {
    onAuthSuccess({
      name: 'Amaka Juliet',
      email: 'amaka.juliet@example.com',
      isNewUser: false,
    });
  };

  return (
    <div style={{ padding: '10px 4px', minHeight: '680px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                setScreen('login');
              }}
              style={{ padding: '14px', fontSize: '15px' }}
            >
              <Icon name="log-in" size={18} />
              <span>Log In</span>
            </button>

            <button
              type="button"
              onClick={handleUseDemo}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '12px',
                cursor: 'pointer',
                marginTop: '6px',
                textDecoration: 'underline',
              }}
            >
              Or explore with Demo Profile (Amaka Juliet)
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

            <button type="submit" className="btn-primary" style={{ marginTop: '20px', padding: '14px' }}>
              <span>Continue to Onboarding →</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <span
              style={{ color: 'var(--primary-light)', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => {
                setError('');
                setScreen('login');
              }}
            >
              Log In
            </span>
          </div>
        </div>
      )}

      {/* SCREEN 3: LOGIN */}
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

          {/* Quick Demo Credentials Autofill */}
          <div
            style={{
              marginTop: '16px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Quick Test:
            </div>
            <button
              type="button"
              className="prompt-pill"
              onClick={() => {
                setEmail('amaka.juliet@example.com');
                setPassword('password123');
              }}
              style={{ fontSize: '11px' }}
            >
              Autofill Demo Credentials
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Don&apos;t have an account yet?{' '}
            <span
              style={{ color: 'var(--primary-light)', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => {
                setError('');
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
