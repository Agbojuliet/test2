'use client';

import Icon from './Icons';

export default function QuickActionSheet({ isOpen, onClose, onSelectAction }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <h3 className="sheet-title">Quick Actions</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="quick-action-grid">
          <div
            className="quick-action-card"
            onClick={() => {
              onClose();
              onSelectAction('add-expense');
            }}
          >
            <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}>
              <Icon name="arrow-up-right" size={22} color="#fff" />
            </div>
            <div>
              <div className="quick-action-label">Add Expense</div>
              <div className="quick-action-sub">Log food, transport, bills</div>
            </div>
          </div>

          <div
            className="quick-action-card"
            onClick={() => {
              onClose();
              onSelectAction('add-income');
            }}
          >
            <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #10b981, #047857)' }}>
              <Icon name="arrow-down-left" size={22} color="#fff" />
            </div>
            <div>
              <div className="quick-action-label">Add Income</div>
              <div className="quick-action-sub">Salary, freelance, other</div>
            </div>
          </div>

          <div
            className="quick-action-card"
            onClick={() => {
              onClose();
              onSelectAction('add-bill');
            }}
          >
            <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #f43f5e, #be123c)' }}>
              <Icon name="bills" size={22} color="#fff" />
            </div>
            <div>
              <div className="quick-action-label">Recurring Bill</div>
              <div className="quick-action-sub">Track upcoming bills & rent</div>
            </div>
          </div>

          <div
            className="quick-action-card"
            onClick={() => {
              onClose();
              onSelectAction('set-budget');
            }}
          >
            <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              <Icon name="analytics" size={22} color="#fff" />
            </div>
            <div>
              <div className="quick-action-label">Adjust Budget</div>
              <div className="quick-action-sub">Set monthly category caps</div>
            </div>
          </div>

          <div
            className="quick-action-card"
            onClick={() => {
              onClose();
              onSelectAction('add-goal');
            }}
          >
            <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
              <Icon name="goal" size={22} color="#fff" />
            </div>
            <div>
              <div className="quick-action-label">Savings Goal</div>
              <div className="quick-action-sub">Target & monthly pace</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
