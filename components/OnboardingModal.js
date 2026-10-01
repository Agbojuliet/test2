'use client';

import { useState } from 'react';
import Icon from './Icons';
import { CURRENCIES, formatCurrency } from '@/lib/currency';

export default function OnboardingModal({ isOpen, onComplete, initialUser }) {
  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState(initialUser?.preferredCurrency || 'NGN');
  const [monthlyIncome, setMonthlyIncome] = useState(initialUser?.monthlyIncome ? String(initialUser.monthlyIncome) : '300000');
  const [incomeFrequency, setIncomeFrequency] = useState('monthly');
  const [goal, setGoal] = useState('emergency_fund');

  if (!isOpen) return null;

  const financialGoals = [
    {
      id: 'emergency_fund',
      title: 'Build an Emergency Fund',
      desc: 'Save 3 to 6 months of living expenses for peace of mind',
      icon: 'health',
    },
    {
      id: 'budget_discipline',
      title: 'Strict Budget Discipline',
      desc: 'Eliminate daily leakage and stop running out of money',
      icon: 'analytics',
    },
    {
      id: 'major_purchase',
      title: 'Save for Major Purchase',
      desc: 'Targeting a new laptop, rent, vehicle, or milestone',
      icon: 'goal',
    },
    {
      id: 'debt_clearance',
      title: 'Pay Off Existing Debt',
      desc: 'Create room in your cashflow to clear loans faster',
      icon: 'bills',
    },
    {
      id: 'investing',
      title: 'Grow Investments',
      desc: 'Build long-term assets and compound net worth',
      icon: 'salary',
    },
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const selectedGoalObj = financialGoals.find((g) => g.id === goal);
      onComplete({
        preferredCurrency: currency,
        monthlyIncome: parseFloat(monthlyIncome) || 300000,
        incomeFrequency,
        financialGoal: goal,
        financialGoalLabel: selectedGoalObj ? selectedGoalObj.title : 'Build an Emergency Fund',
        onboardingCompleted: true,
      });
    }
  };

  const curr = CURRENCIES[currency] || CURRENCIES.NGN;

  return (
    <div className="modal-overlay" style={{ alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#0f172a',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '28px',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          position: 'relative',
        }}
      >
        {/* Progress indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  width: s === step ? '28px' : '10px',
                  height: '6px',
                  borderRadius: '10px',
                  background: s <= step ? 'var(--primary)' : 'rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Step {step} of 3
          </span>
        </div>

        {/* STEP 1: Personal Setup & Currency Preference */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                }}
              >
                <Icon name="wallet" size={26} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Welcome to FinSmart</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Select your primary currency. Nigerian Naira (₦) is set by default.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Currency</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {Object.values(CURRENCIES).map((c) => {
                  const isSelected = currency === c.code;
                  return (
                    <div
                      key={c.code}
                      onClick={() => setCurrency(c.code)}
                      style={{
                        background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{c.flag}</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                          {c.symbol} {c.code}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {c.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Income Setup */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                }}
              >
                <Icon name="salary" size={26} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Income Setup</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                What is your estimated regular monthly income?
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Monthly Income</label>
              <div className="amount-input-wrap" style={{ width: '100%' }}>
                <span className="amount-symbol">{curr.symbol}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  className="form-input amount-input"
                  placeholder="300,000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  autoFocus
                  required
                  style={{ width: '100%', fontSize: '18px', paddingLeft: '34px', paddingRight: '10px' }}
                />
              </div>
            </div>

            {/* Quick Suggestions - 2x2 Responsive Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              {['200000', '300000', '500000', '800000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className="prompt-pill"
                  onClick={() => setMonthlyIncome(amt)}
                  style={{
                    fontSize: '11px',
                    padding: '8px',
                    textAlign: 'center',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {curr.symbol}{Number(amt).toLocaleString()}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Income Frequency</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'biweekly', label: 'Bi-Weekly' },
                  { id: 'freelance', label: 'Variable' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIncomeFrequency(item.id)}
                    className={`prompt-pill ${incomeFrequency === item.id ? 'active' : ''}`}
                    style={{
                      textAlign: 'center',
                      padding: '8px 4px',
                      fontSize: '11px',
                      background: incomeFrequency === item.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                      color: incomeFrequency === item.id ? '#fff' : 'var(--text-secondary)',
                      borderColor: incomeFrequency === item.id ? 'var(--primary)' : 'var(--border-subtle)',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Financial Goal */}
        {step === 3 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: '#a78bfa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                }}
              >
                <Icon name="goal" size={26} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Primary Financial Goal</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Your AI assistant will tailor suggestions to this focus.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', maxHeight: '240px', overflowY: 'auto' }}>
              {financialGoals.map((g) => {
                const isSelected = goal === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    style={{
                      background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon name={g.icon} size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{g.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{g.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          {step > 1 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep(step - 1)}
              style={{ width: '35%' }}
            >
              Back
            </button>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={handleNext}
            style={{ flex: 1 }}
          >
            {step === 3 ? 'Finish & Launch Dashboard' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
