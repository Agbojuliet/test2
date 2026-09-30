'use client';

import Icon from './Icons';

export default function BottomNav({ activeTab, onSelectTab, onOpenQuickAction }) {
  return (
    <nav className="bottom-nav-bar" aria-label="Mobile Navigation">
      <button
        type="button"
        className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onSelectTab('dashboard')}
      >
        <Icon name="home" size={22} />
        <span>Home</span>
      </button>

      <button
        type="button"
        className={`nav-tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
        onClick={() => onSelectTab('transactions')}
      >
        <Icon name="transactions" size={22} />
        <span>Activity</span>
      </button>

      {/* Central Prominent '+' Floating Action Button */}
      <button
        type="button"
        className="fab-plus-button"
        onClick={onOpenQuickAction}
        aria-label="Add Transaction or Goal"
      >
        <Icon name="plus" size={26} color="#ffffff" />
      </button>

      <button
        type="button"
        className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => onSelectTab('analytics')}
      >
        <Icon name="analytics" size={22} />
        <span>Analytics</span>
      </button>

      <button
        type="button"
        className={`nav-tab-btn ${activeTab === 'ai-coach' ? 'active' : ''}`}
        onClick={() => onSelectTab('ai-coach')}
      >
        <Icon name="ai" size={22} />
        <span>AI Coach</span>
      </button>
    </nav>
  );
}
