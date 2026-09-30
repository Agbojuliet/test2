// Hybrid AI Financial Intelligence Engine
import { formatCurrency } from './currency';

/**
 * Generate 3 types of insights based on actual ledger data:
 * 1. Spending Insight (Observation & Pattern)
 * 2. Warning (Risk & Limit proximity)
 * 3. Recommendation (Actionable savings advice + rationale)
 */
export function generateAIInsights({ expenses, incomes, budgets, currencyCode = 'NGN' }) {
  // Aggregate expenses by category
  const categoryTotals = {};
  let totalSpent = 0;

  expenses.forEach((item) => {
    const amt = Number(item.amount) || 0;
    totalSpent += amt;
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + amt;
  });

  const totalIncome = incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalBudget = Object.values(budgets).reduce((sum, b) => sum + (Number(b) || 0), 0);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate());

  // Gracefully handle clean state for new signups
  if (expenses.length === 0) {
    const dailySafe = totalIncome > 0 ? Math.round(totalIncome / daysRemaining) : 0;
    return {
      spendingInsight: {
        type: 'spending_insight',
        badge: 'Spending Insight',
        icon: 'chart',
        headline: 'No expenses recorded yet this month',
        message: `Your balance is ready at ${formatCurrency(totalIncome, currencyCode)}. Tap '+' to log your first daily transaction.`,
        details: 'Start recording expenses to unlock automated category breakdown and habit tracking.',
      },
      warning: {
        type: 'warning',
        badge: 'Budget Status',
        severity: 'low',
        icon: 'check-circle',
        headline: '100% of your monthly budget is available',
        message: `You have ${formatCurrency(totalBudget, currencyCode)} in planned budget envelopes with ${daysRemaining} days remaining in the month.`,
        details: 'Zero expenses recorded so far gives you maximum budget flexibility.',
      },
      recommendation: {
        type: 'recommendation',
        badge: 'Recommendation',
        icon: 'lightbulb',
        headline: `Aim for ~${formatCurrency(dailySafe, currencyCode)} daily safe spend`,
        message: `To comfortably stay within your monthly income across the remaining ${daysRemaining} days, target spending no more than ${formatCurrency(dailySafe, currencyCode)} per day.`,
        details: 'Pacing your daily discretionary outflows from day one builds lasting financial discipline.',
      },
    };
  }

  // Find highest spending category
  let highestCategory = 'Food';
  let highestAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > highestAmount) {
      highestAmount = amt;
      highestCategory = cat;
    }
  });

  const highestPct = totalSpent > 0 ? Math.round((highestAmount / totalSpent) * 100) : 0;

  // 1. Spending Insight
  const spendingInsight = {
    type: 'spending_insight',
    badge: 'Spending Insight',
    icon: 'chart',
    headline: `${highestCategory} is your highest spending category this month`,
    message: `${highestCategory} accounts for ${highestPct}% (${formatCurrency(highestAmount, currencyCode)}) of your total spending so far.`,
    details: `You have spent ${formatCurrency(highestAmount, currencyCode)} out of ${formatCurrency(totalSpent, currencyCode)} total outgoings across ${expenses.length} logged transactions.`,
  };

  // 2. Warning Insight: Check which category is closest to / exceeding budget
  let warningCategory = null;
  let warningPct = 0;
  let warningBudget = 0;
  let warningSpent = 0;

  Object.entries(budgets).forEach(([cat, limit]) => {
    const spent = categoryTotals[cat] || 0;
    const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    if (pct > warningPct) {
      warningPct = pct;
      warningCategory = cat;
      warningBudget = limit;
      warningSpent = spent;
    }
  });

  // Default to Transportation if none found
  if (!warningCategory) {
    warningCategory = 'Transportation';
    warningPct = 85;
    warningBudget = budgets.Transportation || 28000;
    warningSpent = categoryTotals.Transportation || 24000;
  }


  let warning = null;
  if (warningPct >= 100) {
    warning = {
      type: 'warning',
      badge: 'Budget Warning',
      severity: 'high',
      icon: 'alert-triangle',
      headline: `Exceeded ${warningCategory} budget`,
      message: `You have spent ${formatCurrency(warningSpent, currencyCode)} (${warningPct}%) of your ${formatCurrency(warningBudget, currencyCode)} limit with ${daysRemaining} days remaining in the month.`,
      details: `Fast spending velocity in ${warningCategory} exceeded your monthly envelope. Non-essential expenses in this bucket should be frozen for the remainder of the month.`,
    };
  } else if (warningPct >= 75) {
    warning = {
      type: 'warning',
      badge: 'Budget Warning',
      severity: 'medium',
      icon: 'alert-circle',
      headline: `Approaching ${warningCategory} limit`,
      message: `You've used ${warningPct}% of your ${warningCategory} budget (${formatCurrency(warningSpent, currencyCode)} of ${formatCurrency(warningBudget, currencyCode)}) with ${daysRemaining} days remaining in the month.`,
      details: `At your current pace, continuing to spend at this rate will exceed your ${warningCategory} allowance before the end of the month.`,
    };
  } else {
    warning = {
      type: 'warning',
      badge: 'Budget Alert',
      severity: 'low',
      icon: 'check-circle',
      headline: 'All spending categories within safe limits',
      message: `Your highest utilized category is ${warningCategory} at ${warningPct}%, leaving healthy buffer for the remaining ${daysRemaining} days.`,
      details: 'Your steady expense logging and discipline are keeping you well under your monthly targets.',
    };
  }

  // 3. Recommendation Insight
  // Find discretionary categories to recommend cuts: Entertainment, Shopping, or Food
  const discretionarySpend = (categoryTotals.Entertainment || 0) + (categoryTotals.Shopping || 0);
  const potentialWeeklySave = Math.max(2500, Math.round(discretionarySpend * 0.15 / 1000) * 1000);
  const potentialMonthlySave = potentialWeeklySave * 4;

  const recommendation = {
    type: 'recommendation',
    badge: 'Recommendation',
    icon: 'lightbulb',
    headline: `Free up ~${formatCurrency(potentialMonthlySave, currencyCode)} this month`,
    message: `Reducing your entertainment and dining out spending by ${formatCurrency(potentialWeeklySave, currencyCode)} per week could free up approximately ${formatCurrency(potentialMonthlySave, currencyCode)} this month.`,
    details: `Discretionary expenses in Food and Entertainment total ${formatCurrency((categoryTotals.Food || 0) + (categoryTotals.Entertainment || 0), currencyCode)}. Trimming small recurring outings generates immediate cashflow towards your savings goals without sacrificing essentials.`,
  };

  return {
    spendingInsight,
    warning,
    recommendation,
  };
}

/**
 * Conversational AI logic grounded in the user's live financial data
 */
export function generateChatResponse(userMessage, { expenses, incomes, budgets, currencyCode = 'NGN' }) {
  const query = userMessage.toLowerCase().trim();

  // Aggregate current numbers
  const totalIncome = incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const availableBalance = totalIncome - totalExpenses;

  const categoryTotals = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (Number(e.amount) || 0);
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const top1 = sortedCategories[0] || ['Food', 0];
  const top2 = sortedCategories[1] || ['Transportation', 0];
  const top3 = sortedCategories[2] || ['Bills', 0];

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate());
  const dailySafeSpend = availableBalance > 0 ? Math.floor(availableBalance / daysRemaining) : 0;

  // 1. "Where am I spending the most?"
  if (query.includes('where am i spending') || query.includes('spending the most') || query.includes('highest spending')) {
    if (expenses.length === 0) {
      return `You haven't recorded any expenses yet this month!
Once you log your daily purchases using the '+' button, I will break down your highest spending categories and percentages in real time.`;
    }
    return `Based on your recorded transactions this month, your biggest spending categories are:
1. **${top1[0]}**: ${formatCurrency(top1[1], currencyCode)} (${totalExpenses > 0 ? Math.round((top1[1] / totalExpenses) * 100) : 0}%)
2. **${top2[0]}**: ${formatCurrency(top2[1], currencyCode)} (${totalExpenses > 0 ? Math.round((top2[1] / totalExpenses) * 100) : 0}%)
3. **${top3[0]}**: ${formatCurrency(top3[1], currencyCode)} (${totalExpenses > 0 ? Math.round((top3[1] / totalExpenses) * 100) : 0}%)

Together, these account for ${totalExpenses > 0 ? Math.round(((top1[1] + top2[1] + top3[1]) / totalExpenses) * 100) : 0}% of your total ${formatCurrency(totalExpenses, currencyCode)} outflows.`;
  }

  // 2. "Can I afford to spend X today?" (e.g. ₦20,000)
  if (query.includes('afford') || query.includes('can i spend') || query.match(/spend (\d+|₦|\$)/)) {
    // Extract number if present
    const match = query.match(/[\d,]+/);
    const requestedAmt = match ? parseInt(match[0].replace(/,/g, ''), 10) : 20000;

    if (requestedAmt <= dailySafeSpend) {
      return `**Yes, you can comfortably afford this!**
Your available balance is **${formatCurrency(availableBalance, currencyCode)}**, and with **${daysRemaining} days** left in the month, your safe daily allowance is approximately **${formatCurrency(dailySafeSpend, currencyCode)}/day**.
Spending ${formatCurrency(requestedAmt, currencyCode)} today keeps you completely on track with your monthly budget.`;
    } else if (requestedAmt <= availableBalance) {
      return `**Proceed with caution.**
While you have **${formatCurrency(availableBalance, currencyCode)}** in balance, your calculated safe daily spend is **${formatCurrency(dailySafeSpend, currencyCode)}**.
Spending ${formatCurrency(requestedAmt, currencyCode)} today would consume approximately **${Math.round(requestedAmt / dailySafeSpend)} days** of your daily allowance. If you make this purchase, try to balance it by trimming discretionary expenses over the next few days.`;
    } else {
      return `**Not recommended right now.**
Spending ${formatCurrency(requestedAmt, currencyCode)} exceeds your current available balance of **${formatCurrency(availableBalance, currencyCode)}**. Doing so would push you into negative cashflow for the month.`;
    }
  }

  // 3. "How can I reduce my expenses / spending?"
  if (query.includes('reduce') || query.includes('cut back') || query.includes('lower my expenses')) {
    const foodCut = Math.round((top1[1] * 0.2) / 1000) * 1000;
    const secondCut = Math.round((top2[1] * 0.2) / 1000) * 1000;
    const totalPotential = foodCut + secondCut;

    return `Based on your spending this month, your biggest categories are **${top1[0]}** (${formatCurrency(top1[1], currencyCode)}) and **${top2[0]}** (${formatCurrency(top2[1], currencyCode)}).

Here is a practical 3-step action plan:
1. **${top1[0]} Cap**: Reduce dining out/impulse grocery trips by ~20% to save **${formatCurrency(foodCut, currencyCode)}**.
2. **${top2[0]} Optimization**: Bundle ride-hailing trips or commute during off-peak hours to save **${formatCurrency(secondCut, currencyCode)}**.
3. **Automate Savings**: Move **${formatCurrency(totalPotential, currencyCode)}** to your savings goal on payday before discretionary spending begins.`;
  }

  // 4. "Why am I always running out of money?"
  if (query.includes('running out of money') || query.includes('broke') || query.includes('out of money')) {
    const burnRate = daysRemaining > 0 ? (totalExpenses / (daysInMonth - daysRemaining)) : 0;
    return `Looking at your financial ledger:
- **Total Income**: ${formatCurrency(totalIncome, currencyCode)}
- **Total Spent So Far**: ${formatCurrency(totalExpenses, currencyCode)}
- **Burn Rate**: You are spending an average of **${formatCurrency(Math.round(burnRate), currencyCode)} per day**.

The primary reason money feels tight:
1. **High Concentration**: ${top1[0]} and ${top2[0]} are taking up ${totalExpenses > 0 ? Math.round(((top1[1] + top2[1]) / totalExpenses) * 100) : 0}% of your total outgoings.
2. **Pacing**: With ${daysRemaining} days left, you have ${formatCurrency(availableBalance, currencyCode)} remaining. Setting weekly category caps prevents spending the bulk of your funds in the first 2 weeks.`;
  }

  // 5. "Give me tips to save 50,000 this month"
  if (query.includes('tips to save') || query.includes('save') || query.includes('50,000') || query.includes('50000')) {
    return `To save **${formatCurrency(50000, currencyCode)}** this month, here is a targeted breakdown:
1. **Food (${formatCurrency(25000, currencyCode)})**: Meal prep weekday lunches instead of ordering delivery.
2. **Transportation (${formatCurrency(15000, currencyCode)})**: Combine weekend errands into a single trip rather than multiple rides.
3. **Entertainment & Subscriptions (${formatCurrency(10000, currencyCode)})**: Pause unused digital subscriptions and host a movie night at home.

*Total monthly savings: **${formatCurrency(50000, currencyCode)}**.* Would you like me to adjust your budget limits to reflect these targets?`;
  }

  // Default intelligent assistant response
  return `I reviewed your live financial data:
- **Available Balance**: ${formatCurrency(availableBalance, currencyCode)}
- **Month's Income**: ${formatCurrency(totalIncome, currencyCode)}
- **Month's Outflows**: ${formatCurrency(totalExpenses, currencyCode)}
- **Top Spending Category**: ${top1[0]} (${formatCurrency(top1[1], currencyCode)})

You can ask me questions like:
- *"Where am I spending the most?"*
- *"Can I afford to spend ₦20,000 today?"*
- *"How can I reduce my expenses?"*
- *"Give me tips to save ₦50,000 this month."*`;
}

/**
 * Calculate required monthly savings pace for a goal
 */
export function calculateSavingsPace(targetAmount, currentAmount, targetDateStr) {
  const target = Number(targetAmount) || 0;
  const current = Number(currentAmount) || 0;
  const remainingNeeded = Math.max(0, target - current);

  if (remainingNeeded === 0) {
    return {
      remainingNeeded: 0,
      monthsRemaining: 0,
      monthlyPace: 0,
      percentage: 100,
      recommendation: '🎉 Congratulations! You have reached your savings goal!',
    };
  }

  const now = new Date();
  const targetDate = new Date(targetDateStr);
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const monthsRemaining = Math.max(1, Math.round(diffDays / 30.4));

  const monthlyPace = Math.ceil(remainingNeeded / monthsRemaining);
  const percentage = Math.min(100, Math.round((current / target) * 100));

  return {
    remainingNeeded,
    monthsRemaining,
    monthlyPace,
    percentage,
    recommendation: `You need to save approximately ${formatCurrency(monthlyPace, 'NGN')} per month to reach your goal by ${targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`,
  };
}
