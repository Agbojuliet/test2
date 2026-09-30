'use client';

import { useState } from 'react';
import Icon from './Icons';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('welcome'); // 'welcome' | 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    onLoginSuccess({
      email,
      name: name || (mode === 'signup' ? 'New Member' : 'Amaka Juliet'),
    });
    onClose();
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
                onClick={() => setMode('signup')}
              >
                <Icon name="user" size={18} />
                <span>Sign Up</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setMode('login')}
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

            <form onSubmit={handleSubmit}>
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
                onClick={() => setMode('signup')}
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

            <form onSubmit={handleSubmit}>
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

              <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
                Create Account
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <span
                style={{ color: 'var(--primary-light)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setMode('login')}
              >
                Sign In
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
