'use client';

import { useState } from 'react';
import Icon from './Icons';
import { calculateSavingsPace } from '@/lib/ai-engine';

export default function AddGoalModal({ isOpen, onClose, onAddGoal, currencySymbol = '₦' }) {
  const [name, setName] = useState('New Laptop');
  const [targetAmount, setTargetAmount] = useState('500000');
  const [currentAmount, setCurrentAmount] = useState('150000');
  const [targetDate, setTargetDate] = useState('2026-12-31');

  if (!isOpen) return null;

  // Real-time AI pace calculation
  const pace = calculateSavingsPace(targetAmount, currentAmount, targetDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;
    if (!name.trim() || !target || target <= 0) return;

    const dateObj = new Date(targetDate);
    const targetMonthYear = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    onAddGoal({
      id: `goal-${Date.now()}`,
      name: name.trim(),
      targetAmount: target,
      currentAmount: current,
      targetDate,
      targetMonthYear,
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <h3 className="sheet-title">Create Savings Goal</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Goal Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. New Laptop, Emergency Fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Target Amount</label>
              <div className="amount-input-wrap">
                <span className="amount-symbol" style={{ fontSize: '16px' }}>{currencySymbol}</span>
                <input
                  type="number"
                  className="form-input amount-input"
                  style={{ fontSize: '18px', paddingLeft: '30px' }}
                  placeholder="500,000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Already Saved</label>
              <div className="amount-input-wrap">
                <span className="amount-symbol" style={{ fontSize: '16px', color: '#94a3b8' }}>{currencySymbol}</span>
                <input
                  type="number"
                  className="form-input amount-input"
                  style={{ fontSize: '18px', paddingLeft: '30px' }}
                  placeholder="150,000"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Completion Date</label>
            <input
              type="date"
              className="form-input"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>

          {/* AI Calculated Pace Suggestion Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Icon name="ai" size={16} color="#34d399" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                AI Pace Recommendation
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.4 }}>
              {pace.recommendation}
            </div>
          </div>

          <button type="submit" className="btn-primary">
            <Icon name="goal" size={18} />
            <span>Save Goal</span>
          </button>
        </form>
      </div>
    </div>
  );
}
