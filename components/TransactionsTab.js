'use client';

import { useState } from 'react';
import Icon from './Icons';
import { formatCurrency, CATEGORIES } from '@/lib/currency';

export default function TransactionsTab({
  expenses,
  incomes,
  onDeleteExpense,
  onDeleteIncome,
  currencyCode = 'NGN',
  onOpenQuickAction,
}) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'expense' | 'income'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Unify transactions
  const formattedExpenses = expenses.map((e) => ({
    ...e,
    type: 'expense',
    timestamp: new Date(e.date).getTime(),
  }));

  const formattedIncomes = incomes.map((i) => ({
    ...i,
    category: i.source,
    type: 'income',
    timestamp: new Date(i.date).getTime(),
  }));

  const combined = [...formattedExpenses, ...formattedIncomes].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  const filteredList = combined.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchCat = item.category?.toLowerCase().includes(q);
      if (!matchDesc && !matchCat) return false;
    }
    return true;
  });

  const totalExpenseFiltered = filteredList
    .filter((i) => i.type === 'expense')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const totalIncomeFiltered = filteredList
    .filter((i) => i.type === 'income')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Activity & Ledger</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            All your recorded income and expenses
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
          background: 'var(--bg-card)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '12px',
        }}
      >
        {[
          { id: 'all', label: 'All' },
          { id: 'expense', label: 'Expenses' },
          { id: 'income', label: 'Income' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: filterType === tab.id ? 'var(--primary)' : 'transparent',
              color: filterType === tab.id ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="form-group" style={{ marginBottom: '12px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by keyword, cafe, salary..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '10px 14px', fontSize: '13px' }}
        />
      </div>

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
        <button
          type="button"
          className="prompt-pill"
          onClick={() => setSelectedCategory('all')}
          style={{
            background: selectedCategory === 'all' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
            color: selectedCategory === 'all' ? '#fff' : 'var(--text-secondary)',
            borderColor: selectedCategory === 'all' ? 'var(--primary)' : 'var(--border-subtle)',
          }}
        >
          All Categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className="prompt-pill"
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              background: selectedCategory === cat.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
              color: selectedCategory === cat.id ? '#fff' : 'var(--text-secondary)',
              borderColor: selectedCategory === cat.id ? 'var(--primary)' : 'var(--border-subtle)',
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Summary totals for current filter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginBottom: '10px',
          padding: '0 4px',
        }}
      >
        <span>{filteredList.length} transactions</span>
        <span>
          Outflows: <strong style={{ color: '#f87171' }}>{formatCurrency(totalExpenseFiltered, currencyCode)}</strong>
        </span>
      </div>

      {/* Transaction Items */}
      {filteredList.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Icon name="list" size={36} color="var(--border-subtle)" style={{ marginBottom: '8px' }} />
          <p style={{ fontSize: '14px', fontWeight: 600 }}>No transactions found</p>
          <p style={{ fontSize: '12px', marginTop: '4px' }}>Try changing your filters or add a new record.</p>
        </div>
      ) : (
        <div className="transaction-list">
          {filteredList.map((tx) => {
            const isExpense = tx.type === 'expense';
            const catObj = CATEGORIES.find((c) => c.id === tx.category) || {
              icon: isExpense ? 'other' : 'salary',
              bg: isExpense ? '#f1f5f9' : '#d1fae5',
              color: isExpense ? '#64748b' : '#10b981',
            };

            return (
              <div key={tx.id} className="transaction-item">
                <div className="tx-left">
                  <div
                    className="tx-icon-box"
                    style={{ background: catObj.bg, color: catObj.color }}
                  >
                    <Icon name={catObj.icon} size={18} color={catObj.color} />
                  </div>
                  <div className="tx-details">
                    <span className="tx-desc">{tx.description}</span>
                    <span className="tx-meta">
                      {tx.category} • {tx.date}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`tx-amount ${isExpense ? 'expense' : 'income'}`}>
                    {isExpense ? '-' : '+'}
                    {formatCurrency(tx.amount, currencyCode)}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isExpense) {
                        onDeleteExpense(tx.id);
                      } else {
                        onDeleteIncome(tx.id);
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    title="Delete record"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
