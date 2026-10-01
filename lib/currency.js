// Multi-currency system with Nigerian Naira (₦) as default

export const CURRENCIES = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    flag: '🇳🇬',
    rate: 1.0, // Base reference
    locale: 'en-NG',
    decimals: 0,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    rate: 0.00067, // ~1500 NGN per USD
    locale: 'en-US',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    rate: 0.00052,
    locale: 'en-GB',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    rate: 0.00061,
    locale: 'de-DE',
    decimals: 2,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    rate: 0.00091,
    locale: 'en-CA',
    decimals: 2,
  },
  GHS: {
    code: 'GHS',
    symbol: 'GH₵',
    name: 'Ghanaian Cedi',
    flag: '🇬🇭',
    rate: 0.010,
    locale: 'en-GH',
    decimals: 2,
  },
  KES: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    flag: '🇰🇪',
    rate: 0.086,
    locale: 'sw-KE',
    decimals: 0,
  },
};

/**
 * Format an amount in the given currency code
 * @param {number} amountInNGN - Base amount in NGN
 * @param {string} currencyCode - Target currency code (defaults to NGN)
 * @param {boolean} convert - Whether to convert from base NGN or treat amount as already in target currency
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amountInNGN, currencyCode = 'NGN', convert = false) {
  const curr = CURRENCIES[currencyCode] || CURRENCIES.NGN;
  const num = Number(amountInNGN) || 0;
  const finalValue = convert && currencyCode !== 'NGN' ? num * curr.rate : num;

  const formattedNum = Math.abs(finalValue).toLocaleString(curr.locale, {
    minimumFractionDigits: curr.decimals,
    maximumFractionDigits: curr.decimals,
  });

  const sign = num < 0 ? '-' : '';
  return `${sign}${curr.symbol}${formattedNum}`;
}

export const CATEGORIES = [
  { id: 'Food', name: 'Food', icon: 'food', color: '#f59e0b', bg: '#fef3c7' },
  { id: 'Transportation', name: 'Transportation', icon: 'transport', color: '#3b82f6', bg: '#dbeafe' },
  { id: 'Bills', name: 'Bills', icon: 'bills', color: '#ef4444', bg: '#fee2e2' },
  { id: 'Shopping', name: 'Shopping', icon: 'shopping', color: '#8b5cf6', bg: '#ede9fe' },
  { id: 'Entertainment', name: 'Entertainment', icon: 'entertainment', color: '#ec4899', bg: '#fce7f3' },
  { id: 'Health', name: 'Health', icon: 'health', color: '#10b981', bg: '#d1fae5' },
  { id: 'Education', name: 'Education', icon: 'education', color: '#06b6d4', bg: '#cffafe' },
  { id: 'Other', name: 'Other', icon: 'other', color: '#64748b', bg: '#f1f5f9' },
];

export const INCOME_SOURCES = [
  { id: 'Salary', name: 'Salary', icon: 'salary', defaultAmount: 300000 },
  { id: 'Freelance', name: 'Freelance', icon: 'freelance', defaultAmount: 50000 },
  { id: 'Business', name: 'Business', icon: 'business', defaultAmount: 40000 },
  { id: 'Investment', name: 'Investment', icon: 'investment', defaultAmount: 25000 },
  { id: 'Other', name: 'Other', icon: 'other', defaultAmount: 20000 },
];

export const FINANCIAL_GOALS = [
  {
    id: 'emergency_fund',
    label: 'Build an Emergency Fund',
    title: 'Build an Emergency Fund',
    desc: 'Save 3 to 6 months of living expenses for peace of mind',
    icon: '🛡️',
  },
  {
    id: 'budget_discipline',
    label: 'Strict Budget Discipline',
    title: 'Strict Budget Discipline',
    desc: 'Eliminate daily leakage and stop running out of money',
    icon: '📊',
  },
  {
    id: 'major_purchase',
    label: 'Save for Major Purchase',
    title: 'Save for Major Purchase',
    desc: 'Targeting a new laptop, rent, vehicle, or milestone',
    icon: '🎯',
  },
  {
    id: 'debt_clearance',
    label: 'Pay Off Existing Debt',
    title: 'Pay Off Existing Debt',
    desc: 'Create room in your cashflow to clear loans faster',
    icon: '💳',
  },
  {
    id: 'investing',
    label: 'Grow Investments',
    title: 'Grow Investments',
    desc: 'Build long-term assets and compound net worth',
    icon: '📈',
  },
];
