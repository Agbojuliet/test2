'use client';

import { useState, useEffect } from 'react';
import MobileFrame from '@/components/MobileFrame';
import BottomNav from '@/components/BottomNav';
import DashboardTab from '@/components/DashboardTab';
import TransactionsTab from '@/components/TransactionsTab';
import AnalyticsTab from '@/components/AnalyticsTab';
import AICoachTab from '@/components/AICoachTab';
import SettingsTab from '@/components/SettingsTab';

// Auth and Onboarding Views
import AuthView from '@/components/AuthView';
import OnboardingModal from '@/components/OnboardingModal';

// Bottom sheets and modals
import QuickActionSheet from '@/components/QuickActionSheet';
import AddExpenseModal from '@/components/AddExpenseModal';
import AddIncomeModal from '@/components/AddIncomeModal';
import SetBudgetModal from '@/components/SetBudgetModal';
import AddGoalModal from '@/components/AddGoalModal';
import NotificationsDrawer from '@/components/NotificationsDrawer';

// Seed and AI logic
import {
  INITIAL_USER,
  INITIAL_EXPENSES,
  INITIAL_INCOMES,
  INITIAL_BUDGETS,
  INITIAL_UPCOMING_BILLS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CHAT_MESSAGES,
} from '@/lib/initialData';
import { generateAIInsights } from '@/lib/ai-engine';
import { CURRENCIES } from '@/lib/currency';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Authentication State (Default: false to show Welcome, Sign Up & Login)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Application Data States
  const [user, setUser] = useState(INITIAL_USER);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [incomes, setIncomes] = useState(INITIAL_INCOMES);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [upcomingBills, setUpcomingBills] = useState(INITIAL_UPCOMING_BILLS);
  const [savingsGoals, setSavingsGoals] = useState(INITIAL_SAVINGS_GOALS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [isAiSending, setIsAiSending] = useState(false);

  // Modals & Drawers States
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [addIncomeOpen, setAddIncomeOpen] = useState(false);
  const [setBudgetOpen, setSetBudgetOpen] = useState(false);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Load persisted state on client mount
  useEffect(() => {
    setIsClient(true);
    try {
      const savedAuth = localStorage.getItem('finsmart_auth');
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
      }

      const savedUser = localStorage.getItem('finsmart_user');
      if (savedUser) setUser(JSON.parse(savedUser));

      const savedExpenses = localStorage.getItem('finsmart_expenses');
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));

      const savedIncomes = localStorage.getItem('finsmart_incomes');
      if (savedIncomes) setIncomes(JSON.parse(savedIncomes));

      const savedBudgets = localStorage.getItem('finsmart_budgets');
      if (savedBudgets) setBudgets(JSON.parse(savedBudgets));

      const savedGoals = localStorage.getItem('finsmart_goals');
      if (savedGoals) setSavingsGoals(JSON.parse(savedGoals));

      const savedBills = localStorage.getItem('finsmart_bills');
      if (savedBills) setUpcomingBills(JSON.parse(savedBills));
    } catch (e) {
      console.error('Error loading persisted state:', e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem('finsmart_user', JSON.stringify(user));
      localStorage.setItem('finsmart_expenses', JSON.stringify(expenses));
      localStorage.setItem('finsmart_incomes', JSON.stringify(incomes));
      localStorage.setItem('finsmart_budgets', JSON.stringify(budgets));
      localStorage.setItem('finsmart_goals', JSON.stringify(savingsGoals));
      localStorage.setItem('finsmart_bills', JSON.stringify(upcomingBills));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [user, expenses, incomes, budgets, savingsGoals, upcomingBills, isClient]);

  const currencyCode = user?.preferredCurrency || 'NGN';
  const currencySymbol = CURRENCIES[currencyCode]?.symbol || '₦';

  // Compute 3-tier insights dynamically
  const aiInsights = generateAIInsights({
    expenses,
    incomes,
    budgets,
    currencyCode,
  });

  // Auth Handlers
  const handleAuthSuccess = ({ name, email, isNewUser }) => {
    setUser((prev) => ({
      ...prev,
      name: name || prev.name,
      email: email || prev.email,
      isNewUser: Boolean(isNewUser),
    }));

    if (isNewUser) {
      // Clear all demo prefilled data for new signups
      setExpenses([]);
      setUpcomingBills([]);
      setSavingsGoals([]);
      setIncomes([]);
      setNotifications([
        {
          id: `notif-${Date.now()}`,
          type: 'spending_reminder',
          title: 'Welcome to FinSmart!',
          message: "Your new budget is ready. Tap the '+' button anytime to log expenses.",
          time: 'Just now',
          read: false,
          badge: 'info',
        },
      ]);
      setChatMessages([
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: `Hello ${name || 'there'}! I am your AI Budget Assistant. Your dashboard is brand new and clean. Record your first expense or income to begin tracking your financial health!`,
          time: 'Just now',
        },
      ]);
      setOnboardingOpen(true);
    } else {
      // Returning user login / demo -> Direct entry to dashboard
      setIsAuthenticated(true);
      try {
        localStorage.setItem('finsmart_auth', 'true');
      } catch (e) {}
    }
  };

  const handleOnboardingComplete = (onboardingData) => {
    const enteredIncome = Number(onboardingData.monthlyIncome) || 0;
    const base = enteredIncome > 0 ? enteredIncome : 300000;

    // Calculate budget limits based on entered income
    const cleanBudgets = {
      Food: Math.round(base * 0.22),
      Transportation: Math.round(base * 0.10),
      Bills: Math.round(base * 0.15),
      Health: Math.round(base * 0.05),
      Shopping: Math.round(base * 0.10),
      Entertainment: Math.round(base * 0.08),
      Education: Math.round(base * 0.05),
      Other: Math.round(base * 0.05),
    };
    setBudgets(cleanBudgets);

    // Record user's entered monthly income as initial income entry
    if (enteredIncome > 0) {
      setIncomes([
        {
          id: `inc-${Date.now()}`,
          amount: enteredIncome,
          source: 'Salary',
          description: 'Monthly Income',
          date: new Date().toISOString().split('T')[0],
        },
      ]);
    } else {
      setIncomes([]);
    }

    // Keep expenses and bills strictly empty (not prefilled)
    setExpenses([]);
    setUpcomingBills([]);

    // Initialize clean goal with 0 saved if they chose one during onboarding
    if (onboardingData.financialGoalLabel) {
      setSavingsGoals([
        {
          id: `goal-${Date.now()}`,
          name: onboardingData.financialGoalLabel,
          targetAmount: Math.round(base * 3),
          currentAmount: 0,
          targetDate: `${new Date().getFullYear()}-12-31`,
          targetMonthYear: `December ${new Date().getFullYear()}`,
          notes: 'Goal set during onboarding',
        },
      ]);
    } else {
      setSavingsGoals([]);
    }

    setUser((prev) => ({
      ...prev,
      ...onboardingData,
      onboardingCompleted: true,
    }));
    setIsAuthenticated(true);
    try {
      localStorage.setItem('finsmart_auth', 'true');
    } catch (e) {}
    setOnboardingOpen(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('finsmart_auth');
    } catch (e) {}
    setActiveTab('dashboard');
  };

  // Action Handlers
  const handleQuickAction = (actionId) => {
    if (actionId === 'add-expense') setAddExpenseOpen(true);
    if (actionId === 'add-income') setAddIncomeOpen(true);
    if (actionId === 'set-budget') setSetBudgetOpen(true);
    if (actionId === 'add-goal') setAddGoalOpen(true);
  };

  const handleAddExpense = (newExpense) => {
    setExpenses((prev) => [newExpense, ...prev]);

    // Check if added expense pushes category near threshold to create notification
    const cat = newExpense.category;
    const catLimit = budgets[cat] || 0;
    const currentCatSpend =
      expenses
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + Number(e.amount), 0) + newExpense.amount;

    if (catLimit > 0 && currentCatSpend >= catLimit * 0.8) {
      const newNotif = {
        id: `notif-${Date.now()}`,
        type: 'budget_alert',
        title: 'Budget Alert',
        message: `You've reached ${Math.round((currentCatSpend / catLimit) * 100)}% of your ${cat} budget.`,
        time: 'Just now',
        read: false,
        badge: 'warning',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const handleAddIncome = (newIncome) => {
    setIncomes((prev) => [newIncome, ...prev]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleDeleteIncome = (id) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateBudgets = (updatedBudgets) => {
    setBudgets(updatedBudgets);
  };

  const handleAddGoal = (newGoal) => {
    setSavingsGoals((prev) => [newGoal, ...prev]);
  };

  const handleMarkBillPaid = (billId) => {
    setUpcomingBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, isPaid: !b.isPaid } : b))
    );
  };

  const handleClearNotification = (notifId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  // Conversational AI message handler (Connects to backend /api/ai/chat)
  const handleSendChatMessage = async (userText) => {
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: 'Just now',
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          financialData: {
            expenses,
            incomes,
            budgets,
            savingsGoals,
            upcomingBills,
            user,
          },
          currencyCode,
        }),
      });

      const data = await res.json();
      const replyMsg = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'I analyzed your spending records.',
        time: 'Just now',
      };
      setChatMessages((prev) => [...prev, replyMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackReply = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: `Based on your records, your highest spending category this month is Food, and your current balance is ${currencySymbol}${
          (
            incomes.reduce((s, i) => s + Number(i.amount), 0) -
            expenses.reduce((s, e) => s + Number(e.amount), 0)
          ).toLocaleString()
        }.`,
        time: 'Just now',
      };
      setChatMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsAiSending(false);
    }
  };

  const handleResetData = () => {
    setUser(INITIAL_USER);
    setExpenses(INITIAL_EXPENSES);
    setIncomes(INITIAL_INCOMES);
    setBudgets(INITIAL_BUDGETS);
    setUpcomingBills(INITIAL_UPCOMING_BILLS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    try {
      localStorage.clear();
    } catch (e) {}
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <MobileFrame
      activeTab={activeTab}
      user={user}
      unreadNotifsCount={unreadNotifsCount}
      onOpenNotifications={() => setNotificationsOpen(true)}
      onOpenSettings={() => setActiveTab('settings')}
      isAuthenticated={isAuthenticated}
      bottomNav={
        isAuthenticated && (
          <BottomNav
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenQuickAction={() => setQuickActionOpen(true)}
          />
        )
      }
    >
      {/* 1. AUTH VIEW (Welcome Splash, Sign Up, Login) */}
      {!isAuthenticated ? (
        <AuthView onAuthSuccess={handleAuthSuccess} />
      ) : (
        <>
          {/* 2. MAIN APPLICATION (Primary Tabs & Dedicated Settings Page) */}
          {activeTab === 'dashboard' && (
            <DashboardTab
              user={user}
              incomes={incomes}
              expenses={expenses}
              budgets={budgets}
              upcomingBills={upcomingBills}
              savingsGoals={savingsGoals}
              aiInsights={aiInsights}
              onNavigateTab={setActiveTab}
              onOpenQuickAction={() => setQuickActionOpen(true)}
              onMarkBillPaid={handleMarkBillPaid}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsTab
              expenses={expenses}
              incomes={incomes}
              onDeleteExpense={handleDeleteExpense}
              onDeleteIncome={handleDeleteIncome}
              currencyCode={currencyCode}
              onOpenQuickAction={() => setQuickActionOpen(true)}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              expenses={expenses}
              incomes={incomes}
              currencyCode={currencyCode}
            />
          )}

          {activeTab === 'ai-coach' && (
            <AICoachTab
              aiInsights={aiInsights}
              chatMessages={chatMessages}
              onSendMessage={handleSendChatMessage}
              isSending={isAiSending}
              currencyCode={currencyCode}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              user={user}
              onUpdateUser={(updates) => setUser((prev) => ({ ...prev, ...updates }))}
              onRestartOnboarding={() => setOnboardingOpen(true)}
              onResetData={handleResetData}
              onLogout={handleLogout}
              onNavigateTab={setActiveTab}
            />
          )}
        </>
      )}

      {/* Bottom Sheet Modals */}
      <QuickActionSheet
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onSelectAction={handleQuickAction}
      />

      <AddExpenseModal
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        onAddExpense={handleAddExpense}
        currencySymbol={currencySymbol}
      />

      <AddIncomeModal
        isOpen={addIncomeOpen}
        onClose={() => setAddIncomeOpen(false)}
        onAddIncome={handleAddIncome}
        currencySymbol={currencySymbol}
      />

      <SetBudgetModal
        isOpen={setBudgetOpen}
        onClose={() => setSetBudgetOpen(false)}
        budgets={budgets}
        onUpdateBudgets={handleUpdateBudgets}
        currencyCode={currencyCode}
        monthlyIncome={user?.monthlyIncome || 300000}
      />

      <AddGoalModal
        isOpen={addGoalOpen}
        onClose={() => setAddGoalOpen(false)}
        onAddGoal={handleAddGoal}
        currencySymbol={currencySymbol}
      />

      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onClearNotification={handleClearNotification}
      />

      {/* 3-Step Onboarding Modal (Currency -> Income -> Goal) */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onComplete={handleOnboardingComplete}
        initialUser={user}
      />
    </MobileFrame>
  );
}
