'use client';

import Icon from './Icons';
import { CURRENCIES } from '@/lib/currency';

export default function SettingsModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onRestartOnboarding,
  onResetData,
  onLogout,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <h3 className="sheet-title">Profile & Preferences</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Profile Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '16px',
          }}
        >
          <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
            {user?.name?.[0] || 'A'}
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{user?.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.email}</div>
            <div style={{ fontSize: '11px', color: 'var(--primary-light)', marginTop: '2px' }}>
              Goal: {user?.financialGoalLabel || 'Emergency Fund'}
            </div>
          </div>
        </div>

        {/* Multi-Currency Switcher */}
        <div className="form-group">
          <label className="form-label">Active Currency</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
            {Object.values(CURRENCIES).map((c) => {
              const isSelected = user?.preferredCurrency === c.code;
              return (
                <div
                  key={c.code}
                  onClick={() => onUpdateUser({ preferredCurrency: c.code })}
                  style={{
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{c.flag}</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                      {c.symbol} {c.code}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{c.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sign Out Action */}
        <div style={{ marginTop: '20px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
            }}
            style={{
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
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
