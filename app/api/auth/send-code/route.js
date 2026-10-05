import { NextResponse } from 'next/server';
import { generateOtpCode, sendEmailOtp, storeOtp } from '@/lib/auth-service';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { email, name } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const code = generateOtpCode();

    // Register into in-memory store
    try {
      storeOtp(email, name, code);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 429 }
      );
    }

    // Send email
    const sendResult = await sendEmailOtp({ email, name, code });

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${email}`,
      provider: sendResult.provider,
      // Included in development/demo when real SMTP/Resend is not configured
      devCode: sendResult.devCode || null,
      expiresInSeconds: 600,
    });
  } catch (err) {
    console.error('Send verification code error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to send verification code. Please try again.' },
      { status: 500 }
    );
  }
}
