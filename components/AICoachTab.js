'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from './Icons';

export default function AICoachTab({
  aiInsights,
  chatMessages = [],
  onSendMessage,
  isSending,
  chatError,
  onRetryLastMessage,
  currencyCode = 'NGN',
  currencySymbol = '₦',
}) {
  const [activeSection, setActiveSection] = useState('insights'); // 'insights' | 'chat'
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const promptSuggestions = [
    'Where am I spending the most?',
    `Can I afford to spend ${currencySymbol}20,000 today?`,
    'How can I reduce my expenses?',
    'Why am I always running out of money?',
    `Give me tips to save ${currencySymbol}50,000 this month.`,
  ];

  // Auto-scroll to latest message
  useEffect(() => {
    if (activeSection === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isSending, activeSection]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;
    onSendMessage(text.trim());
    setInputText('');
  };

  return (
    <div>
      {/* Tab Switcher: Insights vs Chat */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: 'var(--bg-card)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSection('insights')}
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeSection === 'insights' ? 'var(--primary)' : 'transparent',
            color: activeSection === 'insights' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <Icon name="sparkles" size={16} />
          <span>3-Tier Insights</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('chat')}
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeSection === 'chat' ? 'var(--primary)' : 'transparent',
            color: activeSection === 'chat' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <Icon name="bot" size={16} />
          <span>Financial Coach Chat</span>
        </button>
      </div>

      {/* SECTION 1: 3-TIER AI INSIGHTS */}
      {activeSection === 'insights' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>AI Financial Analysis</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Actionable intelligence derived from your recorded expenses
            </p>
          </div>

          {/* 1. Spending Insight */}
          {aiInsights?.spendingInsight && (
            <div className="insight-card spending_insight">
              <div className="insight-card-header">
                <span className="insight-tag">
                  <Icon name="chart" size={14} />
                  <span>1. Spending Insight</span>
                </span>
              </div>
              <h4 className="insight-title">{aiInsights.spendingInsight.headline}</h4>
              <p className="insight-text">{aiInsights.spendingInsight.message}</p>
              <div className="insight-why-box">
                <strong>Why: </strong>
                {aiInsights.spendingInsight.details?.replace(/^Why:\s*/i, '')}
              </div>
            </div>
          )}

          {/* 2. Warning */}
          {aiInsights?.warning && (
            <div className="insight-card warning">
              <div className="insight-card-header">
                <span className="insight-tag">
                  <Icon name="warning" size={14} />
                  <span>2. Budget Warning</span>
                </span>
              </div>
              <h4 className="insight-title">{aiInsights.warning.headline}</h4>
              <p className="insight-text">{aiInsights.warning.message}</p>
              <div className="insight-why-box">
                <strong>Why: </strong>
                {aiInsights.warning.details?.replace(/^Why:\s*/i, '')}
              </div>
            </div>
          )}

          {/* 3. Recommendation */}
          {aiInsights?.recommendation && (
            <div className="insight-card recommendation">
              <div className="insight-card-header">
                <span className="insight-tag">
                  <Icon name="lightbulb" size={14} />
                  <span>3. Actionable Recommendation</span>
                </span>
              </div>
              <h4 className="insight-title">{aiInsights.recommendation.headline}</h4>
              <p className="insight-text">{aiInsights.recommendation.message}</p>
              <div className="insight-why-box">
                <strong>Why: </strong>
                {aiInsights.recommendation.details?.replace(/^Why:\s*/i, '')}
              </div>
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setActiveSection('chat')}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                boxShadow: '0 4px 18px rgba(139, 92, 246, 0.35)',
              }}
            >
              <Icon name="ai" size={18} />
              <span>Discuss Suggestions with AI Coach</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: CONVERSATIONAL AI CHAT */}
      {activeSection === 'chat' && (
        <div className="chat-container">
          {/* Quick Prompts Carousel */}
          <div className="prompt-suggestions-row">
            {promptSuggestions.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="prompt-pill"
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="chat-messages-area">
            {chatMessages.map((msg) => {
              const isAi = msg.sender === 'ai' || msg.role === 'assistant';
              return (
                <div key={msg.id || `${msg.time}-${Math.random()}`} className={`chat-bubble ${isAi ? 'ai' : 'user'}`}>
                  <div style={{ whiteSpace: 'pre-line' }}>{msg.text || msg.content}</div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: isAi ? 'var(--text-muted)' : 'rgba(255, 255, 255, 0.75)',
                      marginTop: '4px',
                      textAlign: isAi ? 'left' : 'right',
                    }}
                  >
                    {msg.time || 'Just now'}
                  </div>
                </div>
              );
            })}

            {/* Smooth Loading / Typing Indicator */}
            {isSending && (
              <div className="chat-bubble ai" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px' }}>
                <span style={{ fontSize: '12px', color: '#c4b5fd', fontWeight: 500 }}>AI Coach is thinking</span>
                <span className="typing-indicator">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </span>
              </div>
            )}

            {/* Graceful Network / Error State */}
            {chatError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#fca5a5',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="warning" size={14} color="#f87171" />
                  <span>{chatError}</span>
                </div>
                {onRetryLastMessage && (
                  <button
                    type="button"
                    onClick={onRetryLastMessage}
                    style={{
                      background: 'rgba(239, 68, 68, 0.25)',
                      border: 'none',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="chat-input-bar"
          >
            <input
              type="text"
              className="chat-input"
              placeholder={`Ask about your ${currencyCode} budget, spending...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputText.trim() || isSending}
              aria-label="Send message to AI Coach"
            >
              <Icon name="send" size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
