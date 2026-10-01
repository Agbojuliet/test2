'use client';

import { useState } from 'react';
import Icon from './Icons';
import { CURRENCIES, FINANCIAL_GOALS } from '@/lib/currency';

export default function SettingsTab({
  user,
  onUpdateUser,
  onRestartOnboarding,
  onResetData,
  onLogout,
  onNavigateTab,
}) {
  const [aiTone, setAiTone] = useState('encouraging'); // 'encouraging' | 'analytical' | 'strict'
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSelectGoal = (goalKey, goalLabel) => {
    onUpdateUser({
      financialGoal: goalKey,
      financialGoalLabel: goalLabel,
    });
  };

  const currentCurrency = user?.preferredCurrency || 'NGN';

  return (
    <div className="settings-page-content" style={{ paddingBottom: '30px' }}>
      {/* Page Navigation Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => onNavigateTab('dashboard')}
            aria-label="Back to Dashboard"
          >
            <Icon name="chevron-left" size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
              Settings & Profile
            </h1>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Manage your preferences and account
            </div>
          </div>
        </div>
      </div>

      {profileSuccess && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '16px',
            color: '#34d399',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Icon name="check-circle" size={16} color="#10b981" />
          <span>Profile preferences updated successfully!</span>
        </div>
      )}



      {/* 2. MULTI-CURRENCY SELECTOR */}
      <div className="section-card" style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Icon name="wallet" size={18} color="#10b981" />
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0 }}>
            Preferred Currency
          </h2>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Choose your primary currency for balances, transactions, budgets, and AI insights.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            maxHeight: '220px',
            overflowY: 'auto',
            paddingRight: '2px',
          }}
        >
          {Object.values(CURRENCIES).map((c) => {
            const isSelected = currentCurrency === c.code;
            return (
              <div
                key={c.code}
                onClick={() => onUpdateUser({ preferredCurrency: c.code })}
                style={{
                  background: isSelected ? 'rgba(16, 185, 129, 0.16)' : 'var(--bg-card)',
                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '20px' }}>{c.flag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                    {c.symbol} {c.code}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {c.name}
                  </div>
                </div>
                {isSelected && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. FINANCIAL GOAL PREFERENCES */}
      <div className="section-card" style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Icon name="target" size={18} color="#10b981" />
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0 }}>
            Primary Financial Goal
          </h2>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          FinSmart AI tailors your monthly advice and target recommendations based on this goal.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {FINANCIAL_GOALS.map((g) => {
            const isSelected = user?.financialGoal === g.id;
            return (
              <div
                key={g.id}
                onClick={() => handleSelectGoal(g.id, g.label)}
                style={{
                  background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '18px' }}>{g.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{g.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{g.desc}</div>
                </div>
                {isSelected && <Icon name="check" size={16} color="#10b981" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. AI COACH & NOTIFICATION PREFERENCES */}
      <div className="section-card" style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Icon name="sparkles" size={18} color="#8b5cf6" />
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0 }}>
            AI Coach & Alerts
          </h2>
        </div>

        {/* AI Tone Selector */}
        <div style={{ marginBottom: '14px' }}>
          <label className="form-label">AI Coach Personality</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            {[
              { id: 'encouraging', label: 'Encouraging', icon: '🌟' },
              { id: 'analytical', label: 'Analytical', icon: '📊' },
              { id: 'strict', label: 'Strict', icon: '🎯' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setAiTone(t.id)}
                style={{
                  background: aiTone === t.id ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-card)',
                  border: `1px solid ${aiTone === t.id ? 'var(--ai-purple)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 4px',
                  color: aiTone === t.id ? '#fff' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notification Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                Budget Threshold Alerts
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Notify when category spend exceeds 80%
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAlertsEnabled(!alertsEnabled)}
              style={{
                width: '40px',
                height: '22px',
                borderRadius: '12px',
                background: alertsEnabled ? 'var(--primary)' : 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: alertsEnabled ? '20px' : '2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                }}
              />
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                Weekly Financial Digest
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Summary of monthly progress and savings tips
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDigestEnabled(!digestEnabled)}
              style={{
                width: '40px',
                height: '22px',
                borderRadius: '12px',
                background: digestEnabled ? 'var(--primary)' : 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: digestEnabled ? '20px' : '2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 5. DATA MANAGEMENT & ONBOARDING */}
      <div className="section-card" style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Icon name="shield" size={18} color="#94a3b8" />
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0 }}>
            Data & Account Setup
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onRestartOnboarding}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <Icon name="sparkles" size={16} />
            <span>Restart 3-Step Setup Assistant</span>
          </button>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Icon name="trash" size={16} color="#f87171" />
              <span>Reset All Data & Start Fresh</span>
            </button>
          ) : (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '12px', color: '#fca5a5', fontWeight: 600, marginBottom: '8px' }}>
                Are you sure? This will clear all logged expenses, incomes, and budgets.
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowResetConfirm(false)}
                  style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirm(false);
                    onResetData();
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: '#ef4444',
                    border: 'none',
                    color: '#fff',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  Yes, Reset Everything
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. SIGN OUT */}
      <div>
        {!showLogoutConfirm ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              width: '100%',
              color: '#f87171',
              borderColor: 'rgba(239, 68, 68, 0.35)',
              background: 'rgba(244, 63, 94, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            <Icon name="logout" size={18} color="#f87171" />
            <span>Sign Out</span>
          </button>
        ) : (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '13px', color: '#fff', fontWeight: 600, marginBottom: '10px' }}>
              Do you want to sign out?
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowLogoutConfirm(false)}
                style={{ flex: 1, padding: '10px', fontSize: '13px' }}
              >
                Stay Logged In
              </button>
              <button
                type="button"
                onClick={onLogout}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
