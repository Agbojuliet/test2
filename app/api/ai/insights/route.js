import { NextResponse } from 'next/server';
import { generateAIInsights } from '@/lib/ai-engine';

export async function POST(request) {
  try {
    const body = await request.json();
    const { expenses = [], incomes = [], budgets = {}, currencyCode = 'NGN' } = body;

    const insights = generateAIInsights({
      expenses,
      incomes,
      budgets,
      currencyCode,
    });

    return NextResponse.json({
      success: true,
      insights,
    });
  } catch (error) {
    console.error('API AI Insights Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI insights' },
      { status: 500 }
    );
  }
}
