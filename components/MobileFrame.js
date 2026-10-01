'use client';

import Icon from './Icons';

export default function MobileFrame({
  children,
  activeTab,
  user,
  unreadNotifsCount,
  onOpenNotifications,
  onOpenSettings,
  onOpenAuth,
  isAuthenticated = true,
  bottomNav,
}) {
  return (
    <div className="app-viewport-wrapper">
      {/* Mobile Device Frame */}
      <div className="mobile-device-frame">
        {/* Top App Header (Only when logged in) */}
        {isAuthenticated && (
          <div className="app-header-wrapper">
            <header className="app-header">
              <div className="user-profile-badge" onClick={onOpenSettings}>
                <div className="user-avatar">
                  {user?.name ? user.name[0] : 'A'}
                </div>
                <div>
                  <div className="greeting-text">
                    {user?.isNewUser ? 'Welcome' : 'Welcome back'}
                  </div>
                  <div className="user-name">{user?.name || 'Amaka Juliet'}</div>
                </div>
              </div>

              <div className="header-actions">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={onOpenNotifications}
                  aria-label="Notifications"
                >
                  <Icon name="bell" size={18} />
                  {unreadNotifsCount > 0 && <span className="badge-dot" />}
                </button>

                <button
                  type="button"
                  className={`icon-btn ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={onOpenSettings}
                  aria-label="Settings"
                  style={activeTab === 'settings' ? { borderColor: 'var(--primary)', color: 'var(--primary-light)', background: 'rgba(16, 185, 129, 0.15)' } : {}}
                >
                  <Icon name="settings" size={18} />
                </button>
              </div>
            </header>
          </div>
        )}

        {/* Dynamic Screen Content */}
        <main className="mobile-screen-content">
          {children}
        </main>

        {/* Sticky Persistent Navigation Bar */}
        {bottomNav}
      </div>
    </div>
  );
}
