import { NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/auth-service';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const verification = verifyOtp(email, code);

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
      verified: true,
    });
  } catch (err) {
    console.error('Verify verification code error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to verify code. Please try again.' },
      { status: 500 }
    );
  }
}
