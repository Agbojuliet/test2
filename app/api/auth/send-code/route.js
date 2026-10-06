import { NextResponse } from 'next/server';
import { generateOtpCode, sendEmailOtp, storeOtp, createOtpToken } from '@/lib/auth-service';

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
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Register into in-memory / file store
    try {
      storeOtp(email, name, code, expiresAt);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 429 }
      );
    }

    // Generate stateless signed OTP token
    const otpToken = createOtpToken(email, code, expiresAt);

    // Send email
    const sendResult = await sendEmailOtp({ email, name, code });

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${email}`,
      token: otpToken,
      otpToken,
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
