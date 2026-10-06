// Initial seed data aligned with exact specifications

export const INITIAL_USER = {
  name: 'User',
  email: 'user@example.com',
  preferredCurrency: 'NGN',
  monthlyIncome: 300000,
  incomeFrequency: 'monthly',
  financialGoal: 'emergency_fund',
  financialGoalLabel: 'Build an Emergency Fund',
  onboardingCompleted: true,
  createdAt: '2026-09-01T08:00:00.000Z',
  isNewUser: false,
};

export const INITIAL_INCOMES = [
  {
    id: 'inc-1',
    amount: 300000,
    source: 'Salary',
    description: 'TechCorp Monthly Salary',
    date: '2026-09-01',
  },
  {
    id: 'inc-2',
    amount: 50000,
    source: 'Freelance',
    description: 'UI Design Consultation',
    date: '2026-09-12',
  },
  {
    id: 'inc-3',
    amount: 20000,
    source: 'Other',
    description: 'Dividends & Cash Gift',
    date: '2026-09-20',
  },
];

export const INITIAL_EXPENSES = [
  {
    id: 'exp-1',
    amount: 5000,
    category: 'Food',
    description: 'Lunch at Cafe',
    date: '2026-09-28',
  },
  {
    id: 'exp-2',
    amount: 4500,
    category: 'Transportation',
    description: 'Uber Ride to Ikeja',
    date: '2026-09-27',
  },
  {
    id: 'exp-3',
    amount: 28000,
    category: 'Bills',
    description: 'Home Fiber Internet & Power',
    date: '2026-09-25',
  },
  {
    id: 'exp-4',
    amount: 32000,
    category: 'Food',
    description: 'Supermarket Groceries',
    date: '2026-09-22',
  },
  {
    id: 'exp-5',
    amount: 19500,
    category: 'Transportation',
    description: 'Fuel Refill Station',
    date: '2026-09-19',
  },
  {
    id: 'exp-6',
    amount: 12000,
    category: 'Shopping',
    description: 'New Sneakers & Essentials',
    date: '2026-09-16',
  },
  {
    id: 'exp-7',
    amount: 9000,
    category: 'Entertainment',
    description: 'Cinema tickets & Streaming',
    date: '2026-09-14',
  },
  {
    id: 'exp-8',
    amount: 5000,
    category: 'Food',
    description: 'Dinner with colleagues',
    date: '2026-09-10',
  },
];

export const INITIAL_BUDGETS = {
  Food: 65000,
  Transportation: 28000,
  Bills: 40000,
  Shopping: 25000,
  Entertainment: 20000,
  Health: 20000,
  Education: 15000,
  Other: 15000,
};

export const INITIAL_UPCOMING_BILLS = [
  {
    id: 'bill-1',
    name: 'Fiber Internet Subscription',
    amount: 15000,
    dueDate: 'In 3 days (Oct 1)',
    category: 'Bills',
    isPaid: false,
  },
  {
    id: 'bill-2',
    name: 'Electricity Pre-paid Units',
    amount: 12000,
    dueDate: 'In 7 days (Oct 5)',
    category: 'Bills',
    isPaid: false,
  },
  {
    id: 'bill-3',
    name: 'Health Care Plan Contribution',
    amount: 8000,
    dueDate: 'In 14 days (Oct 12)',
    category: 'Health',
    isPaid: false,
  },
];

export const INITIAL_SAVINGS_GOALS = [
  {
    id: 'goal-1',
    name: 'New Laptop',
    targetAmount: 500000,
    currentAmount: 150000,
    targetDate: '2026-12-31',
    targetMonthYear: 'December 2026',
    notes: 'For development & remote work',
  },
  {
    id: 'goal-2',
    name: 'Emergency Fund',
    targetAmount: 900000,
    currentAmount: 320000,
    targetDate: '2027-03-31',
    targetMonthYear: 'March 2027',
    notes: '3-months essential living expenses buffer',
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'budget_alert',
    title: 'Budget Alert',
    message: "You've reached 85% of your Transportation budget with 10 days remaining.",
    time: '2 hours ago',
    read: false,
    badge: 'warning',
  },
  {
    id: 'notif-2',
    type: 'spending_reminder',
    title: 'Spending Reminder',
    message: "You haven't recorded today's evening expenses yet.",
    time: '5 hours ago',
    read: false,
    badge: 'info',
  },
  {
    id: 'notif-3',
    type: 'ai_insight',
    title: 'AI Insight',
    message: 'Your transportation spending is higher than usual this week.',
    time: 'Yesterday',
    read: true,
    badge: 'ai',
  },
];

export function getInitialChatMessage(userName = 'there') {
  const firstName = userName && userName !== 'there' ? userName.trim().split(' ')[0] : 'there';
  const currentMonthLong = new Date().toLocaleString('en-US', { month: 'long' });
  return {
    id: 'msg-1',
    sender: 'ai',
    text: `Hello ${firstName}! I am your AI Budget Assistant. I am analyzing your real-time ${currentMonthLong} spending data. How can I help you make smarter money decisions today?`,
    time: 'Just now',
  };
}

export const INITIAL_CHAT_MESSAGES = [getInitialChatMessage()];
