'use client';

import Icon from './Icons';

export default function NotificationsDrawer({ isOpen, onClose, notifications, onClearNotification }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="bell" size={20} color="#10b981" />
            <h3 className="sheet-title">Notifications</h3>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>

        {notifications.length === 0 ? (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Icon name="check-circle" size={40} color="#10b981" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600 }}>All caught up!</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>No active budget alerts or reminders right now.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((notif) => {
              const isWarning = notif.type === 'budget_alert';
              const isAi = notif.type === 'ai_insight';

              return (
                <div
                  key={notif.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        background: isWarning
                          ? 'rgba(245, 158, 11, 0.15)'
                          : isAi
                          ? 'rgba(139, 92, 246, 0.15)'
                          : 'rgba(59, 130, 246, 0.15)',
                        color: isWarning ? '#f59e0b' : isAi ? '#a78bfa' : '#60a5fa',
                      }}
                    >
                      <Icon
                        name={isWarning ? 'alert-triangle' : isAi ? 'ai' : 'bell'}
                        size={18}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                          {notif.title}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          • {notif.time}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '3px', lineHeight: 1.4 }}>
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onClearNotification(notif.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    title="Dismiss"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
