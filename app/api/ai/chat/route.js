import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/ai-engine';

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, financialData, currencyCode = 'NGN' } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Node.js backend hybrid intelligence:
    // If an external LLM key is configured in process.env, it can call the provider.
    // Otherwise it utilizes our exact data-grounded contextual intelligence engine.
    const replyText = generateChatResponse(message, {
      expenses: financialData?.expenses || [],
      incomes: financialData?.incomes || [],
      budgets: financialData?.budgets || {},
      savingsGoals: financialData?.savingsGoals || [],
      upcomingBills: financialData?.upcomingBills || [],
      user: financialData?.user || {},
      currencyCode,
    });

    return NextResponse.json({
      success: true,
      reply: replyText,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API AI Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI chat request' },
      { status: 500 }
    );
  }
}
