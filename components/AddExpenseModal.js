'use client';

import { useState } from 'react';
import Icon from './Icons';
import { CATEGORIES } from '@/lib/currency';

export default function AddExpenseModal({ isOpen, onClose, onAddExpense, currencySymbol = '₦' }) {
  const [amount, setAmount] = useState('5000');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('Lunch');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) return;

    onAddExpense({
      id: `exp-${Date.now()}`,
      amount: num,
      category,
      description: description.trim() || category,
      date,
    });

    onClose();
  };

  const quickPills = [
    { label: 'Lunch', cat: 'Food' },
    { label: 'Uber', cat: 'Transportation' },
    { label: 'Groceries', cat: 'Food' },
    { label: 'Coffee', cat: 'Food' },
    { label: 'Data/Airtime', cat: 'Bills' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <h3 className="sheet-title">Add Expense</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Field */}
          <div className="form-group">
            <label className="form-label">Amount</label>
            <div className="amount-input-wrap">
              <span className="amount-symbol">{currencySymbol}</span>
              <input
                type="number"
                inputMode="decimal"
                className="form-input amount-input"
                placeholder="5,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          {/* Quick Increment Chips */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['1000', '2000', '5000', '10000', '20000'].map((val) => (
              <button
                key={val}
                type="button"
                className="prompt-pill"
                onClick={() => setAmount(val)}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                +{currencySymbol}{Number(val).toLocaleString()}
              </button>
            ))}
          </div>

          {/* Category Chips - 8 Required Categories */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="category-chips-grid">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    <Icon
                      name={cat.icon}
                      size={20}
                      color={isSelected ? '#10b981' : '#94a3b8'}
                    />
                    <span className="category-chip-name">{cat.name}</span>
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
              placeholder="e.g. Lunch"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {/* Quick suggestion tags */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              {quickPills.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setDescription(p.label);
                    setCategory(p.cat);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '12px' }}>
            <Icon name="plus" size={18} />
            <span>Add Expense</span>
          </button>
        </form>
      </div>
    </div>
  );
}
