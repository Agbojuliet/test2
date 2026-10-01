import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      message,
      messages = [],
      financialContext = {},
      financialData = {},
      currencyCode = 'NGN',
      currencySymbol = '₦',
    } = body;

    if (!message && (!messages || messages.length === 0)) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Extract consolidated financial metrics for live grounding
    const fin = {
      totalBudget: Number(financialContext.totalBudget ?? financialData.totalBudget ?? 0),
      totalSpent: Number(financialContext.totalSpent ?? financialData.totalSpent ?? 0),
      totalIncome: Number(financialContext.totalIncome ?? financialData.totalIncome ?? 0),
      remainingBalance: Number(financialContext.remainingBalance ?? financialData.remainingBalance ?? 0),
      topCategories: financialContext.topCategories || financialData.topCategories || [],
      upcomingBills: financialContext.upcomingBills || financialData.upcomingBills || [],
      savingsGoals: financialContext.savingsGoals || financialData.savingsGoals || [],
      userName: financialContext.userName || financialData.user?.name || 'User',
      financialGoal: financialContext.financialGoal || financialData.user?.financialGoalLabel || 'Save money & stay on budget',
    };

    // Format top categories string for prompt
    const topCategoriesStr = Array.isArray(fin.topCategories) && fin.topCategories.length > 0
      ? fin.topCategories
          .slice(0, 5)
          .map((c) => `${c.name || c.category}: ${currencySymbol}${Number(c.amount || c.spent || 0).toLocaleString()}`)
          .join(', ')
      : 'No major category expenses logged yet';

    // Format goals string
    const goalsStr = Array.isArray(fin.savingsGoals) && fin.savingsGoals.length > 0
      ? fin.savingsGoals
          .map((g) => `${g.name}: ${currencySymbol}${Number(g.currentAmount || 0).toLocaleString()} of ${currencySymbol}${Number(g.targetAmount || 0).toLocaleString()}`)
          .join('; ')
      : 'None set';

    // Format bills string
    const billsStr = Array.isArray(fin.upcomingBills) && fin.upcomingBills.length > 0
      ? fin.upcomingBills
          .map((b) => `${b.name || b.title}: ${currencySymbol}${Number(b.amount || 0).toLocaleString()} (Due: ${b.dueDate || b.dueDays || 'Soon'})`)
          .join('; ')
      : 'None due';

    // Secret API Key from server environment or client settings
    const rawApiKey = (process.env.GROQ_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY || body.apiKey || '').trim();

    // Groq OpenAI-Compatible Provider Configuration
    const baseUrl = process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1';
    const model = process.env.AI_MODEL || 'openai/gpt-oss-120b';
    const providerName = 'Groq (openai/gpt-oss-120b)';

    // Dynamic System Prompt enforcing persona and mobile guidelines
    const systemPrompt = `You are an empathetic, practical, and sharp AI Budget Coach for FinSmart, a modern mobile-first personal finance app.
The user's local currency is ${currencySymbol} (${currencyCode}).

Here is the user's LIVE financial context for this month:
- User Name: ${fin.userName}
- Primary Financial Goal: ${fin.financialGoal}
- Total Monthly Income: ${currencySymbol}${fin.totalIncome.toLocaleString()}
- Total Planned Budget: ${currencySymbol}${fin.totalBudget.toLocaleString()}
- Total Spent So Far: ${currencySymbol}${fin.totalSpent.toLocaleString()}
- Remaining Available Balance: ${currencySymbol}${fin.remainingBalance.toLocaleString()}
- Top Spending Categories: ${topCategoriesStr}
- Active Savings Goals: ${goalsStr}
- Upcoming Bills: ${billsStr}

STRICT MOBILE CONSTRAINTS & BEHAVIOR:
1. Conciseness: Responses MUST be 2 to 4 sentences maximum. Keep it compact for phone screens.
2. Tone: Be empathetic, non-judgmental, encouraging, and action-oriented.
3. Live Data Grounding: Always reference the user's real numbers (remaining balance, total spent, top categories) when answering questions like "Can I afford X?", "Where is my money going?", "Can I save?", or general advice.
4. Affordability Decisions: When asked about purchasing or spending a specific amount (e.g. "Can I afford ₦20,000?"), calculate against their remaining balance (${currencySymbol}${fin.remainingBalance.toLocaleString()}) and give a direct, realistic verdict with a practical next step.
5. Never invent or hallucinate contradictory financial numbers.`;

    // Construct conversation messages history
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
    ];

    // Append prior multi-turn conversation history
    if (Array.isArray(messages) && messages.length > 0) {
      messages.forEach((m) => {
        const role = (m.role === 'assistant' || m.sender === 'ai') ? 'assistant' : 'user';
        const text = m.content || m.text || '';
        if (text.trim()) {
          formattedMessages.push({ role, content: text });
        }
      });
    }

    // Append latest query if not duplicate
    if (message && (!formattedMessages.length || formattedMessages[formattedMessages.length - 1].content !== message)) {
      formattedMessages.push({ role: 'user', content: message });
    }

    // Attempt live LLM completion with Groq API
    let llmErrorMessage = null;
    if (rawApiKey) {
      try {
        const endpoint = baseUrl.endsWith('/chat/completions')
          ? baseUrl
          : `${baseUrl.replace(/\/$/, '')}/chat/completions`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${rawApiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: formattedMessages,
            temperature: 1,
            max_tokens: 1024,
            top_p: 1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const replyText = data.choices?.[0]?.message?.content?.trim();
          if (replyText) {
            return NextResponse.json({
              success: true,
              reply: replyText,
              provider: providerName,
              model: model,
              liveLLM: true,
              timestamp: new Date().toISOString(),
            });
          }
        } else {
          const errText = await response.text();
          console.error(`Groq API Error (${response.status}):`, errText);
          llmErrorMessage = `Groq Error (${response.status}): ${errText.slice(0, 120)}`;
        }
      } catch (llmError) {
        console.error('Groq Fetch Exception:', llmError);
        llmErrorMessage = `Groq Network Error: ${llmError.message}`;
      }
    }

    // Intelligent context-grounded fallback if AI_API_KEY is not configured or upstream provider fails
    const lastUserQuery = (message || (formattedMessages[formattedMessages.length - 1]?.content || '')).toLowerCase();
    let reply = '';

    const affordMatch = lastUserQuery.match(/(?:afford|spend|buy|purchase|pay\s+for)\s*(?:₦|ngn|n|usd|\$)?\s*([0-9,]+)/i);
    if (affordMatch) {
      const amount = parseFloat(affordMatch[1].replace(/,/g, ''));
      const balance = fin.remainingBalance;
      if (amount <= balance * 0.25) {
        reply = `Yes, you can afford ${currencySymbol}${amount.toLocaleString()}. Your current remaining balance is ${currencySymbol}${balance.toLocaleString()}, so this purchase leaves a healthy buffer for your other goals.`;
      } else if (amount <= balance) {
        reply = `You have ${currencySymbol}${balance.toLocaleString()} available, so you can cover ${currencySymbol}${amount.toLocaleString()}, but it consumes ${Math.round((amount / balance) * 100)}% of your remaining money. Ensure your essentials and upcoming bills are covered first.`;
      } else {
        reply = `I'd recommend holding off on spending ${currencySymbol}${amount.toLocaleString()} right now. Your remaining balance is ${currencySymbol}${balance.toLocaleString()}, which would put you in a deficit of ${currencySymbol}${Math.abs(balance - amount).toLocaleString()}.`;
      }
    } else if (lastUserQuery.includes('where') || lastUserQuery.includes('most') || lastUserQuery.includes('highest')) {
      const top = fin.topCategories?.[0];
      if (top) {
        reply = `Your biggest spending category is ${top.name || top.category} at ${currencySymbol}${Number(top.amount || top.spent || 0).toLocaleString()} out of ${currencySymbol}${fin.totalSpent.toLocaleString()} total spent. Pacing this category will give you the fastest boost in monthly savings.`;
      } else {
        reply = `You haven't logged any major expenses yet this month! With a starting income of ${currencySymbol}${fin.totalIncome.toLocaleString()}, you have full control to allocate your funds deliberately.`;
      }
    } else if (lastUserQuery.includes('reduce') || lastUserQuery.includes('save') || lastUserQuery.includes('tip')) {
      reply = `To accelerate your goal of "${fin.financialGoal}", try trimming 10% from discretionary areas like ${fin.topCategories?.[0]?.name || 'Shopping & Dining'}. That alone could preserve an extra ${currencySymbol}${Math.round((fin.totalSpent || 50000) * 0.1).toLocaleString()} this month!`;
    } else if (lastUserQuery.includes('balance') || lastUserQuery.includes('how much') || lastUserQuery.includes('left')) {
      reply = `You have ${currencySymbol}${fin.remainingBalance.toLocaleString()} remaining out of your ${currencySymbol}${fin.totalIncome.toLocaleString()} monthly income, having spent ${currencySymbol}${fin.totalSpent.toLocaleString()} across your budget so far.`;
    } else {
      reply = `You're currently managing ${currencySymbol}${fin.remainingBalance.toLocaleString()} in available funds against a total planned budget of ${currencySymbol}${fin.totalBudget.toLocaleString()}. What specific spending decision or goal would you like help with today?`;
    }

    return NextResponse.json({
      success: true,
      reply,
      provider: rawApiKey ? `Fallback (Provider issue: ${llmErrorMessage})` : 'Context-Aware Engine (Add AI_API_KEY for live LLM)',
      liveLLM: false,
      warning: llmErrorMessage || (!rawApiKey ? 'No AI_API_KEY detected in .env.local' : null),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API /api/chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat conversation' },
      { status: 500 }
    );
  }
}
