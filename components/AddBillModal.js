'use client';

import { useState } from 'react';
import Icon from './Icons';
import { CATEGORIES } from '@/lib/currency';

export default function AddBillModal({ isOpen, onClose, onAddBill, currencySymbol = '₦' }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Bills');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [frequency, setFrequency] = useState('monthly'); // 'monthly' | 'weekly' | 'yearly' | 'one-time'

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!name.trim() || !num || num <= 0) return;

    // Format readable due date string (e.g., "In 5 days (Oct 7)")
    let formattedDue = dueDate;
    try {
      const target = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      target.setHours(0, 0, 0, 0);
      
      const diffMs = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const monthShort = target.toLocaleString('en-US', { month: 'short' });
      const dayNum = target.getDate();

      if (diffDays === 0) {
        formattedDue = `Due today (${monthShort} ${dayNum})`;
      } else if (diffDays === 1) {
        formattedDue = `Due tomorrow (${monthShort} ${dayNum})`;
      } else if (diffDays > 1 && diffDays <= 30) {
        formattedDue = `In ${diffDays} days (${monthShort} ${dayNum})`;
      } else {
        formattedDue = `${monthShort} ${dayNum}, ${target.getFullYear()}`;
      }
    } catch (err) {
      formattedDue = dueDate;
    }

    onAddBill({
      id: `bill-${Date.now()}`,
      name: name.trim(),
      amount: num,
      dueDate: formattedDue,
      category,
      frequency,
      isPaid: false,
    });

    onClose();
  };

  const quickBillSuggestions = [
    { name: 'Electricity Bill', cat: 'Bills', icon: 'bills' },
    { name: 'Internet / WiFi', cat: 'Bills', icon: 'bills' },
    { name: 'House Rent', cat: 'Bills', icon: 'wallet' },
    { name: 'Streaming / TV', cat: 'Entertainment', icon: 'entertainment' },
    { name: 'Health Insurance', cat: 'Health', icon: 'health' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="bills" size={18} />
            </div>
            <div>
              <h3 className="sheet-title">Add Recurring Bill</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Track upcoming subscriptions and utility obligations
              </p>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Quick preset chips */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
            {quickBillSuggestions.map((item) => (
              <button
                key={item.name}
                type="button"
                className="prompt-pill"
                onClick={() => {
                  setName(item.name);
                  setCategory(item.cat);
                }}
                style={{ fontSize: '11px', padding: '5px 10px', whiteSpace: 'nowrap' }}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Bill Name */}
          <div className="form-group">
            <label className="form-label">Bill / Subscription Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Internet Subscription, Rent, NEPA"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Amount Field */}
          <div className="form-group">
            <label className="form-label">Bill Amount</label>
            <div className="amount-input-wrap">
              <span className="amount-symbol" style={{ color: '#ef4444' }}>{currencySymbol}</span>
              <input
                type="number"
                inputMode="decimal"
                className="form-input amount-input"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Due Date & Frequency */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Frequency</label>
              <select
                className="form-input"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                style={{ height: '42px', background: 'var(--bg-input)' }}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One-Time</option>
              </select>
            </div>
          </div>

          {/* Category Selection */}
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
                    <Icon name={cat.icon} size={18} color={isSelected ? '#10b981' : '#94a3b8'} />
                    <span className="category-chip-name" style={{ fontSize: '11px' }}>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '14px', background: '#ef4444' }}>
            <Icon name="plus" size={18} />
            <span>Add Recurring Bill</span>
          </button>
        </form>
      </div>
    </div>
  );
}
