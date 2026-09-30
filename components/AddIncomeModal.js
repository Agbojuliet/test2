'use client';

import { useState } from 'react';
import Icon from './Icons';
import { INCOME_SOURCES } from '@/lib/currency';

export default function AddIncomeModal({ isOpen, onClose, onAddIncome, currencySymbol = '₦' }) {
  const [amount, setAmount] = useState('300000');
  const [source, setSource] = useState('Salary');
  const [description, setDescription] = useState('Monthly Salary');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) return;

    onAddIncome({
      id: `inc-${Date.now()}`,
      amount: num,
      source,
      description: description.trim() || source,
      date,
    });

    onClose();
  };

  const presetAmounts = [
    { label: 'Salary', val: '300000', src: 'Salary' },
    { label: 'Freelance', val: '50000', src: 'Freelance' },
    { label: 'Other', val: '20000', src: 'Other' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <h3 className="sheet-title">Record Income</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Field */}
          <div className="form-group">
            <label className="form-label">Amount</label>
            <div className="amount-input-wrap">
              <span className="amount-symbol" style={{ color: '#34d399' }}>{currencySymbol}</span>
              <input
                type="number"
                inputMode="decimal"
                className="form-input amount-input"
                placeholder="300,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {presetAmounts.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="prompt-pill"
                onClick={() => {
                  setAmount(preset.val);
                  setSource(preset.src);
                  setDescription(`${preset.label} Income`);
                }}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {preset.label} ({currencySymbol}{Number(preset.val).toLocaleString()})
              </button>
            ))}
          </div>

          {/* Source Selection */}
          <div className="form-group">
            <label className="form-label">Income Source</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {INCOME_SOURCES.map((src) => {
                const isSelected = source === src.id;
                return (
                  <button
                    key={src.id}
                    type="button"
                    className={`category-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSource(src.id);
                      if (description.includes('Salary') || description.includes('Income')) {
                        setDescription(`${src.name} Income`);
                      }
                    }}
                    style={{ padding: '8px 4px' }}
                  >
                    <Icon
                      name={src.icon}
                      size={18}
                      color={isSelected ? '#10b981' : '#94a3b8'}
                    />
                    <span className="category-chip-name">{src.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Salary, Client payment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Date Received</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              marginTop: '12px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
            }}
          >
            <Icon name="plus" size={18} />
            <span>Record Income</span>
          </button>
        </form>
      </div>
    </div>
  );
}
