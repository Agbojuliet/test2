'use client';

import Icon from './Icons';
import { formatCurrency, CATEGORIES } from '@/lib/currency';

export default function DashboardTab({
  user,
  incomes,
  expenses,
  budgets,
  upcomingBills,
  savingsGoals,
  aiInsights,
  onNavigateTab,
  onOpenQuickAction,
  onMarkBillPaid,
}) {
  const currencyCode = user?.preferredCurrency || 'NGN';

  // Compute live financial totals
  const totalIncome = incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const availableBalance = totalIncome - totalExpenses;

  const totalBudget = Object.values(budgets).reduce((sum, b) => sum + (Number(b) || 0), 0);
  // Calculate budget used % (e.g. 38%)
  const budgetUsedPct = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0;

  // Determine Budget Status
  let budgetStatus = 'within'; // 'within' | 'approaching' | 'over'
  let budgetStatusLabel = 'Within Budget';
  let budgetStatusIcon = '🟢';

  if (budgetUsedPct > 90) {
    budgetStatus = 'over';
    budgetStatusLabel = 'Over Budget';
    budgetStatusIcon = '🔴';
  } else if (budgetUsedPct >= 70) {
    budgetStatus = 'approaching';
    budgetStatusLabel = 'Approaching Budget';
    budgetStatusIcon = '🟡';
  }

  // Aggregate Category Breakdown for Pills
  const categoryTotals = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (Number(e.amount) || 0);
  });

  return (
    <div>
      {/* Question Banner: How am I doing financially this month? */}
      <div className="core-question-banner">
        <div>
          <div className="question-text">Monthly Financial Pulse</div>
          <div className="question-title">&ldquo;How am I doing financially this month?&rdquo;</div>
        </div>
        <div className={`health-pill status-${budgetStatus}`}>
          <span>{budgetStatusIcon}</span>
          <span>{budgetStatusLabel}</span>
        </div>
      </div>

      {/* Main Financial Card (Balance, Income, Expenses, Budget Used) */}
      <div className="dashboard-hero-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="hero-balance-label">Available Balance</div>
            <div className="hero-balance-amount">
              {formatCurrency(availableBalance, currencyCode)}
              <span className="currency-code-tag">{currencyCode}</span>
            </div>
          </div>
        </div>

        {/* 3 Metric Grid */}
        <div className="hero-stats-grid">
          <div className="stat-item">
            <span className="stat-label">Income</span>
            <span className="stat-value income">
              {formatCurrency(totalIncome, currencyCode)}
            </span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Expenses</span>
            <span className="stat-value expense">
              {formatCurrency(totalExpenses, currencyCode)}
            </span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Budget Used</span>
            <span className="stat-value budget-pct">
              {budgetUsedPct}%
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="budget-progress-bar-wrap">
          <div className="budget-progress-labels">
            <span>Spent {formatCurrency(totalExpenses, currencyCode)}</span>
            <span>Limit {formatCurrency(totalBudget, currencyCode)}</span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${budgetStatus}`}
              style={{ width: `${Math.min(100, budgetUsedPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top AI Insight Highlight Card */}
      {aiInsights && (
        <div className="ai-insight-banner">
          <div className="ai-insight-header">
            <div className="ai-badge">
              <Icon name="ai" size={14} color="#a78bfa" />
              <span>AI Insight</span>
            </div>
            <button
              type="button"
              className="section-link"
              onClick={() => onNavigateTab('ai-coach')}
              style={{ fontSize: '11px', color: '#c4b5fd' }}
            >
              Ask Coach →
            </button>
          </div>
          <div className="ai-insight-body">
            {aiInsights?.spendingInsight?.message ||
              "You've spent 24% more on food this month than your average. Consider setting a lower food budget next month."}
          </div>
        </div>
      )}

      {/* Spending Breakdown Quick Carousel */}
      <div className="section-header">
        <h4 className="section-title">
          <Icon name="analytics" size={16} color="var(--primary)" />
          Spending Breakdown
        </h4>
        <button
          type="button"
          className="section-link"
          onClick={() => onNavigateTab('analytics')}
        >
          View All
        </button>
      </div>

      <div className="category-pills-row">
        {CATEGORIES.map((cat) => {
          const spent = categoryTotals[cat.id] || 0;
          const limit = budgets[cat.id] || 0;
          const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
          return (
            <div key={cat.id} className="category-pill">
              <div className="cat-pill-icon" style={{ background: cat.bg, color: cat.color }}>
                <Icon name={cat.icon} size={18} color={cat.color} />
              </div>
              <div className="cat-pill-info">
                <span className="cat-pill-name">{cat.name}</span>
                <span className="cat-pill-amount">
                  {formatCurrency(spent, currencyCode)}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: pct > 90 ? '#f43f5e' : pct > 70 ? '#f59e0b' : 'var(--text-muted)',
                  }}
                >
                  {pct}% of cap
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Bills */}
      <div className="section-header" style={{ marginTop: '10px' }}>
        <h4 className="section-title">
          <Icon name="bills" size={16} color="#ef4444" />
          Upcoming Bills
        </h4>
      </div>

      <div className="bills-list">
        {upcomingBills.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '13px',
            }}
          >
            No upcoming bills yet. Add recurring bills with the &apos;+&apos; button anytime.
          </div>
        ) : (
          upcomingBills.map((bill) => (
            <div key={bill.id} className="bill-item">
              <div className="bill-left">
                <div className="bill-icon">
                  <Icon name="bills" size={18} />
                </div>
                <div>
                  <div className="bill-name">{bill.name}</div>
                  <div className="bill-due">{bill.dueDate}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="bill-amount">{formatCurrency(bill.amount, currencyCode)}</div>
                <button
                  type="button"
                  onClick={() => onMarkBillPaid(bill.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '11px',
                    color: bill.isPaid ? 'var(--primary-light)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    marginTop: '2px',
                  }}
                >
                  {bill.isPaid ? '✓ Paid' : 'Mark as paid'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Savings Goal Quick Glance */}
      {savingsGoals && savingsGoals.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div className="section-header">
            <h4 className="section-title">
              <Icon name="goal" size={16} color="#8b5cf6" />
              Savings Goal
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Target: {savingsGoals[0].targetMonthYear}
            </span>
          </div>

          <div className="goal-card">
            <div className="goal-card-header">
              <span className="goal-name">{savingsGoals[0].name}</span>
              <span className="goal-progress-badge">
                {Math.round((savingsGoals[0].currentAmount / savingsGoals[0].targetAmount) * 100)}%
              </span>
            </div>

            <div className="progress-track" style={{ height: '6px' }}>
              <div
                className="progress-fill within"
                style={{
                  width: `${Math.round(
                    (savingsGoals[0].currentAmount / savingsGoals[0].targetAmount) * 100
                  )}%`,
                  background: 'linear-gradient(90deg, #8b5cf6, #10b981)',
                }}
              />
            </div>

            <div className="goal-numbers-row">
              <span>Saved: {formatCurrency(savingsGoals[0].currentAmount, currencyCode)}</span>
              <span>Target: {formatCurrency(savingsGoals[0].targetAmount, currencyCode)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions Feed */}
      <div className="section-header">
        <h4 className="section-title">
          <Icon name="list" size={16} color="var(--primary)" />
          Recent Transactions
        </h4>
        <button
          type="button"
          className="section-link"
          onClick={() => onNavigateTab('transactions')}
        >
          See All
        </button>
      </div>

      <div className="transaction-list">
        {expenses.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '24px 16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              No expenses recorded yet. Tap below to log your first transaction!
            </div>
            <button
              type="button"
              className="prompt-pill"
              onClick={onOpenQuickAction}
              style={{
                margin: '0 auto',
                color: 'var(--primary-light)',
                borderColor: 'var(--primary)',
                padding: '6px 14px',
              }}
            >
              + Log First Expense
            </button>
          </div>
        ) : (
          expenses.slice(0, 5).map((tx) => {
            const categoryObj = CATEGORIES.find((c) => c.id === tx.category) || CATEGORIES[7];
            return (
              <div key={tx.id} className="transaction-item">
                <div className="tx-left">
                  <div
                    className="tx-icon-box"
                    style={{ background: categoryObj.bg, color: categoryObj.color }}
                  >
                    <Icon name={categoryObj.icon} size={18} color={categoryObj.color} />
                  </div>
                  <div className="tx-details">
                    <span className="tx-desc">{tx.description}</span>
                    <span className="tx-meta">
                      {tx.category} • {tx.date}
                    </span>
                  </div>
                </div>
                <span className="tx-amount expense">
                  -{formatCurrency(tx.amount, currencyCode)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
