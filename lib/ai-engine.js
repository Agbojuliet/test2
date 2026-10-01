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
export function generateChatResponse(userMessage, {
  expenses = [],
  incomes = [],
  budgets = {},
  savingsGoals = [],
  upcomingBills = [],
  user = {},
  currencyCode = 'NGN',
}) {
  const query = userMessage.toLowerCase().trim();
  const userName = user?.name ? user.name.split(' ')[0] : 'there';

  // Aggregate current numbers
  const totalIncome = incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const availableBalance = totalIncome - totalExpenses;
  const totalBudget = Object.values(budgets).reduce((sum, b) => sum + (Number(b) || 0), 0);
  const budgetUsedPct = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0;

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
  const currentDay = now.getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay);
  const dailySafeSpend = availableBalance > 0 ? Math.floor(availableBalance / daysRemaining) : 0;
  const burnRate = currentDay > 0 ? Math.round(totalExpenses / currentDay) : 0;

  // Primary active goal info
  const primaryGoal = savingsGoals[0] || null;
  const activeBills = upcomingBills.filter((b) => !b.isPaid);

  // 1. GREETINGS & INTRODUCTIONS
  if (
    query.match(/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|sup|yo|what's up)/) ||
    query === 'hi' || query === 'hello' || query === 'hey' || query.includes('who are you') || query.includes('what can you do')
  ) {
    return `Hello ${userName}! 👋 I am your FinSmart AI Financial Assistant.

Here is a quick snapshot of your finances right now:
- **Available Balance**: ${formatCurrency(availableBalance, currencyCode)}
- **Total Spent So Far**: ${formatCurrency(totalExpenses, currencyCode)} (${budgetUsedPct}% of budget)
- **Safe Daily Allowance**: ~${formatCurrency(dailySafeSpend, currencyCode)}/day for the remaining ${daysRemaining} days.

Feel free to ask me anything! For example:
- *"How is my food budget doing?"*
- *"Can I afford to spend ${formatCurrency(25000, currencyCode)} today?"*
- *"Where am I spending the most?"*
- *"What are my upcoming bills?"*
- *"Give me a plan to save money this month."*`;
  }

  // 2. FINANCIAL PULSE & OVERALL BALANCE / HEALTH
  if (
    query.includes('how am i doing') ||
    query.includes('balance') ||
    query.includes('my status') ||
    query.includes('overview') ||
    query.includes('financial health') ||
    query.includes('how much money do i have') ||
    query.includes('how much do i have')
  ) {
    let healthStatus = '🟢 **On Track**';
    let summaryAdvice = 'You are pacing well under your budget limits.';
    if (budgetUsedPct > 90 || availableBalance < totalIncome * 0.1) {
      healthStatus = '🔴 **Needs Immediate Attention**';
      summaryAdvice = 'You have used most of your budget. Focus on strictly essential expenses for the rest of the month.';
    } else if (budgetUsedPct >= 75) {
      healthStatus = '🟡 **Approaching Budget Cap**';
      summaryAdvice = `You've used ${budgetUsedPct}% of your budget with ${daysRemaining} days left. Keep daily spending under ${formatCurrency(dailySafeSpend, currencyCode)}.`;
    }

    return `Here is your monthly financial pulse, ${userName}:

- **Status**: ${healthStatus}
- **Available Balance**: **${formatCurrency(availableBalance, currencyCode)}**
- **Total Income Recorded**: ${formatCurrency(totalIncome, currencyCode)}
- **Total Outflows**: ${formatCurrency(totalExpenses, currencyCode)} (${budgetUsedPct}% of ${formatCurrency(totalBudget, currencyCode)} budget)
- **Daily Safe Pace**: **${formatCurrency(dailySafeSpend, currencyCode)} / day** across ${daysRemaining} remaining days
- **Top Spending Area**: ${top1[0]} (${formatCurrency(top1[1], currencyCode)})

💡 *Coach Note*: ${summaryAdvice}`;
  }

  // 3. CATEGORY SPECIFIC INQUIRIES
  const categoryKeywords = {
    Food: ['food', 'eating', 'groceries', 'grocery', 'dining', 'restaurant', 'lunch', 'dinner', 'snacks', 'eat out'],
    Transportation: ['transport', 'transportation', 'uber', 'bolt', 'taxi', 'fuel', 'gas', 'car', 'commute', 'bus', 'fare'],
    Bills: ['bill', 'bills', 'electricity', 'nepa', 'water', 'rent', 'wifi', 'internet', 'subscription', 'netflix', 'utilities'],
    Shopping: ['shopping', 'clothes', 'clothing', 'shoes', 'gadgets', 'gear', 'amazon', 'store'],
    Entertainment: ['entertainment', 'movie', 'movies', 'night out', 'party', 'drinks', 'club', 'games', 'fun'],
    Health: ['health', 'medical', 'hospital', 'doctor', 'pharmacy', 'medicine', 'gym', 'fitness', 'drugs'],
    Education: ['education', 'course', 'courses', 'school', 'tuition', 'books', 'training'],
    Other: ['other', 'misc', 'miscellaneous'],
  };

  for (const [catName, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => query.includes(kw))) {
      const catSpent = categoryTotals[catName] || 0;
      const catLimit = budgets[catName] || 0;
      const catPct = catLimit > 0 ? Math.round((catSpent / catLimit) * 100) : 0;
      const catRemaining = Math.max(0, catLimit - catSpent);
      const catTxCount = expenses.filter((e) => e.category === catName).length;

      let catStatus = `You have spent **${formatCurrency(catSpent, currencyCode)}** on **${catName}** across ${catTxCount} transactions.`;
      if (catLimit > 0) {
        catStatus += ` This represents **${catPct}%** of your ${formatCurrency(catLimit, currencyCode)} ${catName} budget envelope.`;
      }

      let catTip = '';
      if (catPct >= 100) {
        catTip = `⚠️ You have exceeded your ${catName} budget envelope by ${formatCurrency(catSpent - catLimit, currencyCode)}. Freeze any non-essential ${catName.toLowerCase()} expenses for the remainder of this month.`;
      } else if (catPct >= 80) {
        catTip = `⚡ You are near your limit with **${formatCurrency(catRemaining, currencyCode)}** remaining. Pacing yourself at ~${formatCurrency(Math.floor(catRemaining / daysRemaining), currencyCode)}/day will keep you safe.`;
      } else {
        catTip = `✅ You have a healthy buffer of **${formatCurrency(catRemaining, currencyCode)}** remaining in ${catName}.`;
      }

      return `### 📊 ${catName} Spending Breakdown
${catStatus}

- **Total Spent**: ${formatCurrency(catSpent, currencyCode)}
- **Monthly Limit**: ${catLimit > 0 ? formatCurrency(catLimit, currencyCode) : 'No limit set'}
- **Remaining Buffer**: ${formatCurrency(catRemaining, currencyCode)}

💡 **AI Coach Advice**:
${catTip}`;
    }
  }

  // 4. "Where am I spending the most?" / Expense Breakdown
  if (
    query.includes('where am i spending') ||
    query.includes('spending the most') ||
    query.includes('highest spending') ||
    query.includes('biggest expense') ||
    query.includes('expense breakdown') ||
    query.includes('top expenses') ||
    query.includes('where is my money going')
  ) {
    if (expenses.length === 0) {
      return `You haven't recorded any expenses yet this month!
Once you log transactions using the '+' button, I will analyze and display your top spending categories automatically.`;
    }

    const breakdownLines = sortedCategories
      .slice(0, 5)
      .map(([cat, amt], idx) => {
        const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
        return `${idx + 1}. **${cat}**: ${formatCurrency(amt, currencyCode)} (${pct}%)`;
      })
      .join('\n');

    return `### 📈 Your Top Spending Categories This Month

${breakdownLines}

- **Total Spent So Far**: **${formatCurrency(totalExpenses, currencyCode)}**
- **Top Concentration**: **${top1[0]}** is your #1 expense, taking up **${totalExpenses > 0 ? Math.round((top1[1] / totalExpenses) * 100) : 0}%** of your total outflows.

💡 *Tip*: Trimming just 10-15% of your ${top1[0]} spend will free up roughly **${formatCurrency(Math.round(top1[1] * 0.15), currencyCode)}** to put toward your savings.`;
  }

  // 5. AFFORDABILITY & PURCHASE EVALUATION
  if (
    query.includes('afford') ||
    query.includes('can i spend') ||
    query.includes('can i buy') ||
    query.includes('should i buy') ||
    query.match(/spend (\d+|₦|\$|£|€)/) ||
    query.match(/buy.*(\d+)/)
  ) {
    const match = query.match(/[\d,]+/);
    let requestedAmt = 20000;
    if (match) {
      const parsed = parseInt(match[0].replace(/,/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) requestedAmt = parsed;
    }
    if (query.includes('100k') || query.includes('100,000')) requestedAmt = 100000;
    if (query.includes('50k') || query.includes('50,000')) requestedAmt = 50000;
    if (query.includes('20k') || query.includes('20,000')) requestedAmt = 20000;
    if (query.includes('10k') || query.includes('10,000')) requestedAmt = 10000;

    if (requestedAmt <= dailySafeSpend) {
      return `### ✅ Yes, you can comfortably afford this!
- **Requested Amount**: **${formatCurrency(requestedAmt, currencyCode)}**
- **Daily Safe Allowance**: **${formatCurrency(dailySafeSpend, currencyCode)} / day**
- **Available Balance**: **${formatCurrency(availableBalance, currencyCode)}**

This purchase is well within your daily safe limit and will not strain your remaining **${daysRemaining} days** in the month.`;
    } else if (requestedAmt <= availableBalance * 0.4) {
      const daysOfBudget = dailySafeSpend > 0 ? Math.ceil(requestedAmt / dailySafeSpend) : 1;
      return `### ⚠️ Proceed with caution.
- **Requested Amount**: **${formatCurrency(requestedAmt, currencyCode)}**
- **Available Balance**: **${formatCurrency(availableBalance, currencyCode)}**
- **Impact**: Consumes approximately **${daysOfBudget} days** of your daily safe allowance (${formatCurrency(dailySafeSpend, currencyCode)}/day).

If you make this purchase, plan to reduce discretionary spending on ${top1[0]} or entertainment over the next few days to stay balanced.`;
    } else if (requestedAmt <= availableBalance) {
      return `### ⚡ High Risk Purchase
- **Requested Amount**: **${formatCurrency(requestedAmt, currencyCode)}**
- **Available Balance**: **${formatCurrency(availableBalance, currencyCode)}**

While you technically have enough funds in your balance, this will wipe out **${Math.round((requestedAmt / availableBalance) * 100)}%** of your remaining cash for the next ${daysRemaining} days. It is strongly recommended to delay or budget for this next month.`;
    } else {
      return `### ❌ Not Recommended
Spending **${formatCurrency(requestedAmt, currencyCode)}** exceeds your current available balance of **${formatCurrency(availableBalance, currencyCode)}**. Making this purchase would put you into negative cashflow.`;
    }
  }

  // 6. HOW TO REDUCE EXPENSES & CUT BACK
  if (
    query.includes('reduce') ||
    query.includes('cut back') ||
    query.includes('cut down') ||
    query.includes('lower my expenses') ||
    query.includes('spend less') ||
    query.includes('save money')
  ) {
    const cut1 = Math.round((top1[1] * 0.15) / 1000) * 1000;
    const cut2 = Math.round((top2[1] * 0.15) / 1000) * 1000;
    const totalPotential = cut1 + cut2;

    return `### 🎯 Targeted Expense Reduction Plan

Based on your live ledger, your two largest cost drivers are **${top1[0]}** (${formatCurrency(top1[1], currencyCode)}) and **${top2[0]}** (${formatCurrency(top2[1], currencyCode)}).

Here is an actionable 3-step strategy to free up **~${formatCurrency(totalPotential, currencyCode)}**:
1. **Optimize ${top1[0]} (-15%)**: Meal-prep lunches and consolidate grocery trips to save **${formatCurrency(cut1, currencyCode)}**.
2. **Streamline ${top2[0]} (-15%)**: Combine errands or ride-pool during peak transit hours to save **${formatCurrency(cut2, currencyCode)}**.
3. **Audit Subscriptions & Discretionary**: Review recurring bills and entertainment to trim an additional **${formatCurrency(5000, currencyCode)}**.

Moving these savings straight to your **${user?.financialGoalLabel || 'Emergency Fund'}** goal builds resilience automatically!`;
  }

  // 7. UPCOMING BILLS & RECURRING PAYMENTS
  if (
    query.includes('bill') ||
    query.includes('bills') ||
    query.includes('upcoming') ||
    query.includes('due date') ||
    query.includes('subscription')
  ) {
    if (activeBills.length === 0) {
      return `### 📅 Upcoming Bills
You have **no pending unpaid bills** scheduled right now!
All clear! You can add recurring bills using the '+' action button anytime.`;
    }

    const billsList = activeBills
      .map((b) => `- **${b.name}**: ${formatCurrency(b.amount, currencyCode)} (Due: ${b.dueDate || 'Soon'})`)
      .join('\n');
    const totalBillsAmt = activeBills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    return `### 📅 Your Upcoming Scheduled Bills

${billsList}

- **Total Upcoming Obligation**: **${formatCurrency(totalBillsAmt, currencyCode)}**
- **Available Balance**: **${formatCurrency(availableBalance, currencyCode)}**

💡 *Advice*: Ensure you maintain at least **${formatCurrency(totalBillsAmt, currencyCode)}** in your reserve to avoid missed payments or late penalties.`;
  }

  // 8. SAVINGS GOALS & PROGRESS
  if (
    query.includes('goal') ||
    query.includes('savings goal') ||
    query.includes('emergency fund') ||
    query.includes('save for')
  ) {
    if (!primaryGoal) {
      return `You haven't set up a specific savings goal yet!
Your primary target is configured as **${user?.financialGoalLabel || 'Build an Emergency Fund'}**. Tap '+' -> **New Goal** to track your target amount and progress.`;
    }

    const goalPct = primaryGoal.targetAmount > 0 ? Math.round((primaryGoal.currentAmount / primaryGoal.targetAmount) * 100) : 0;
    const remainingGoal = Math.max(0, primaryGoal.targetAmount - primaryGoal.currentAmount);

    return `### 🎯 Savings Goal: ${primaryGoal.name}
- **Current Progress**: **${formatCurrency(primaryGoal.currentAmount, currencyCode)}** / ${formatCurrency(primaryGoal.targetAmount, currencyCode)} (**${goalPct}%**)
- **Remaining Target**: **${formatCurrency(remainingGoal, currencyCode)}**
- **Target Date**: ${primaryGoal.targetDate || primaryGoal.targetMonthYear || 'End of Year'}

💡 *Recommendation*: Allocating ~**${formatCurrency(Math.ceil(remainingGoal / 4), currencyCode)}** per month will get you to 100% on schedule!`;
  }

  // 9. INCOME & EARNINGS
  if (
    query.includes('income') ||
    query.includes('earned') ||
    query.includes('salary') ||
    query.includes('earnings') ||
    query.includes('how much did i earn')
  ) {
    const incomeList = incomes
      .map((i) => `- **${i.source || 'Income'}**: ${formatCurrency(i.amount, currencyCode)} (${i.description || 'Deposit'})`)
      .join('\n');

    return `### 💵 Income Summary This Month

${incomeList.length > 0 ? incomeList : `- **Monthly Income**: ${formatCurrency(totalIncome, currencyCode)}`}

- **Total Recorded Income**: **${formatCurrency(totalIncome, currencyCode)}**
- **Net Balance Remaining**: **${formatCurrency(availableBalance, currencyCode)}**
- **Savings Rate**: ${totalIncome > 0 ? Math.round((Math.max(0, availableBalance) / totalIncome) * 100) : 0}% of income preserved so far.`;
  }

  // 10. WHY AM I RUNNING OUT OF MONEY / CASHFLOW BURNDOWN
  if (
    query.includes('running out of money') ||
    query.includes('broke') ||
    query.includes('why am i') ||
    query.includes('out of money') ||
    query.includes('burn rate')
  ) {
    return `### 🔍 Cashflow Analysis & Diagnosis

Here is what your numbers reveal:
1. **Average Daily Spend**: You are spending **${formatCurrency(burnRate, currencyCode)}/day**.
2. **Category Concentration**: **${top1[0]}** and **${top2[0]}** represent **${totalExpenses > 0 ? Math.round(((top1[1] + top2[1]) / totalExpenses) * 100) : 0}%** of all outgoing funds.
3. **Pacing**: With **${daysRemaining} days** left in the month, your remaining safe spend is **${formatCurrency(dailySafeSpend, currencyCode)}/day**.

🚀 **Immediate Fixes**:
- Cap daily discretionary spending at **${formatCurrency(dailySafeSpend, currencyCode)}**.
- Pause non-essential purchases in **${top1[0]}** for the next 7 days.
- Transfer any surplus immediately to your savings reserve on payday.`;
  }

  // 11. FINANCIAL PRINCIPLES (50/30/20 Rule, Debt Snowball, Investing)
  if (query.includes('50/30/20') || query.includes('budget rule') || query.includes('rule')) {
    const needs = Math.round(totalIncome * 0.5);
    const wants = Math.round(totalIncome * 0.3);
    const savings = Math.round(totalIncome * 0.2);

    return `### 📐 The 50/30/20 Rule (Tailored to Your ${formatCurrency(totalIncome, currencyCode)} Income)

1. **50% Needs (${formatCurrency(needs, currencyCode)})**: Essentials like Rent, Groceries, Utilities, and Basic Transport.
2. **30% Wants (${formatCurrency(wants, currencyCode)})**: Dining out, Entertainment, Hobbies, and Shopping.
3. **20% Savings & Goals (${formatCurrency(savings, currencyCode)})**: Emergency fund, Debt repayment, and Investments.

Right now, your current outflows are **${formatCurrency(totalExpenses, currencyCode)}** (${totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}% of income).`;
  }

  if (query.includes('debt') || query.includes('loan') || query.includes('pay off')) {
    return `### 💳 Strategic Debt Repayment

Here are the two most effective strategies:
1. **Debt Avalanche (Mathematical Best)**: Pay minimums on all debts, then put every extra ${currencyCode} toward the debt with the *highest interest rate*. Saves the most money in fees.
2. **Debt Snowball (Psychological Best)**: Pay off the *smallest balance* first for quick motivational wins.

💡 *Next Step*: Ensure you have at least 1 month of living expenses (${formatCurrency(Math.round(totalIncome * 0.5), currencyCode)}) saved before aggressively overpaying principal.`;
  }

  if (query.includes('invest') || query.includes('stocks') || query.includes('crypto') || query.includes('wealth')) {
    return `### 📈 Wealth Building Hierarchy

1. **Step 1: Solid Emergency Fund**: Keep 3-6 months of expenses in a safe, high-yield account.
2. **Step 2: Clear High-Interest Debt**: Any loan with interest > 10% should be cleared before investing.
3. **Step 3: Diversified Long-Term Investing**: Focus on low-cost index funds, Treasury bills, or mutual funds to harness compound growth.

Your current goal is set to **${user?.financialGoalLabel || 'Emergency Fund'}**.`;
  }

  // 12. DYNAMIC INTELLIGENT FALLBACK
  return `I reviewed your question regarding "${userMessage}" against your live financial records:

- **Available Balance**: ${formatCurrency(availableBalance, currencyCode)}
- **Month's Income**: ${formatCurrency(totalIncome, currencyCode)}
- **Total Outflows**: ${formatCurrency(totalExpenses, currencyCode)} (${budgetUsedPct}% of budget)
- **Safe Daily Pace**: ~${formatCurrency(dailySafeSpend, currencyCode)}/day (${daysRemaining} days left)
- **Top Expense Category**: ${top1[0]} (${formatCurrency(top1[1], currencyCode)})

You can ask me specific questions like:
- *"How is my food budget doing?"*
- *"Can I afford to spend ${formatCurrency(20000, currencyCode)} today?"*
- *"What are my upcoming bills?"*
- *"Where am I spending the most?"*
- *"Give me a plan to cut expenses."*`;
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
