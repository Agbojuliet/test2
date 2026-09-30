'use client';

import { useState } from 'react';
import Icon from './Icons';
import { CATEGORIES, formatCurrency } from '@/lib/currency';

export default function SetBudgetModal({
  isOpen,
  onClose,
  budgets,
  onUpdateBudgets,
  currencyCode = 'NGN',
  monthlyIncome = 300000,
}) {
  const [currentBudgets, setCurrentBudgets] = useState({ ...budgets });

  if (!isOpen) return null;

  const handleChange = (catId, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setCurrentBudgets((prev) => ({
      ...prev,
      [catId]: num,
    }));
  };

  const totalBudget = Object.values(currentBudgets).reduce((sum, b) => sum + (Number(b) || 0), 0);
  const incomePct = monthlyIncome > 0 ? Math.round((totalBudget / monthlyIncome) * 100) : 0;

  const handleApply503020 = () => {
    // 50% Needs (Food, Transport, Bills, Health)
    // 30% Wants (Shopping, Entertainment, Other)
    // 20% Savings buffer
    const base = monthlyIncome || 300000;
    setCurrentBudgets({
      Food: Math.round(base * 0.22),
      Transportation: Math.round(base * 0.10),
      Bills: Math.round(base * 0.15),
      Health: Math.round(base * 0.05),
      Shopping: Math.round(base * 0.10),
      Entertainment: Math.round(base * 0.08),
      Education: Math.round(base * 0.05),
      Other: Math.round(base * 0.05),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateBudgets(currentBudgets);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div>
            <h3 className="sheet-title">Adjust Category Budgets</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Set monthly envelopes to maintain discipline
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Budget vs Income Summary Banner */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Planned Budget
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
              {formatCurrency(totalBudget, currencyCode)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span
              className={`health-pill ${
                incomePct <= 85 ? 'status-within' : incomePct <= 100 ? 'status-approaching' : 'status-over'
              }`}
            >
              {incomePct}% of Income
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
          <button
            type="button"
            className="prompt-pill"
            onClick={handleApply503020}
            style={{ fontSize: '12px', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
          >
            ⚡ Auto-allocate (50/30/20 Rule)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon name={cat.icon} size={20} color={cat.color} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{cat.name}</span>
                </div>
                <div style={{ width: '130px' }}>
                  <input
                    type="number"
                    step="1000"
                    className="form-input"
                    style={{ padding: '6px 10px', fontSize: '13px', textAlign: 'right' }}
                    value={currentBudgets[cat.id] || 0}
                    onChange={(e) => handleChange(cat.id, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="btn-primary">
            Save Budget Plan
          </button>
        </form>
      </div>
    </div>
  );
}
