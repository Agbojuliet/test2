'use client';

import { useState } from 'react';
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
  const [isFullWidth, setIsFullWidth] = useState(false);

  return (
    <div className={`app-viewport-wrapper ${isFullWidth ? 'full-width-mode' : ''}`}>
      {/* Desktop Helper Bar */}
      <div className="desktop-controls-bar">
        <span>Mobile-First AI Budget Assistant</span>
        <button
          type="button"
          className="device-toggle-btn"
          onClick={() => setIsFullWidth(!isFullWidth)}
        >
          <Icon name="smartphone" size={14} />
          <span>{isFullWidth ? 'Switch to Phone Frame' : 'Expand View'}</span>
        </button>
      </div>

      {/* Mobile Device Frame */}
      <div className="mobile-device-frame">
        {/* Top App Header (Only when logged in) */}
        {isAuthenticated && (
          <div className="app-header-wrapper" style={{ padding: '16px 18px 0 18px' }}>
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
                  className="icon-btn"
                  onClick={onOpenSettings}
                  aria-label="Settings"
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
