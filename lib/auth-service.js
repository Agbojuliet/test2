import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const OTP_FILE_PATH = path.join(process.cwd(), '.otp-store.json');
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 10 * 1000; // 10 seconds
const MAX_ATTEMPTS = 5;

// Helper to read persistent store
function readStore() {
  try {
    if (fs.existsSync(OTP_FILE_PATH)) {
      const data = fs.readFileSync(OTP_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading OTP store:', e);
  }
  return {};
}

// Helper to write persistent store
function writeStore(store) {
  try {
    fs.writeFileSync(OTP_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing OTP store:', e);
  }
}

/**
 * Generate a secure 6-digit numeric OTP
 */
export function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generates styled HTML email template for FinSmart verification
 */
export function createVerificationEmailHtml({ name, code }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your FinSmart Account</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 10px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background: #0f172a; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 20px; padding: 32px 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            <!-- Header / Logo -->
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <div style="width: 54px; height: 54px; border-radius: 16px; background: linear-gradient(135deg, #10b981, #059669); line-height: 54px; text-align: center; margin: 0 auto; color: #ffffff; font-size: 24px; font-weight: bold; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);">
                  ✦
                </div>
                <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 14px 0 4px 0; letter-spacing: -0.5px;">FinSmart AI</h1>
                <p style="color: #10b981; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Email Verification</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="color: #94a3b8; font-size: 14px; line-height: 1.6; padding-bottom: 24px;">
                <p style="color: #ffffff; font-size: 15px; font-weight: 600; margin: 0 0 10px 0;">Hello ${name || 'there'},</p>
                <p style="margin: 0 0 16px 0;">Welcome to FinSmart! Use the verification code below to verify your email address and activate your smart budget tracker.</p>
                
                <!-- OTP Code Display -->
                <div style="background: rgba(16, 185, 129, 0.08); border: 1px dashed rgba(16, 185, 129, 0.5); border-radius: 14px; padding: 18px; text-align: center; margin: 20px 0;">
                  <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #34d399; font-family: monospace;">
                    ${code}
                  </span>
                </div>

                <p style="font-size: 12px; color: #64748b; margin: 0; text-align: center;">
                  This code expires in <strong>10 minutes</strong>. If you didn't request this sign-up, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; text-align: center;">
                <p style="font-size: 11px; color: #475569; margin: 0;">
                  FinSmart AI Budget Assistant &bull; Intelligent Financial Tracking
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * Send the OTP email using available transport (Resend API -> SMTP -> Dev fallback)
 */
export async function sendEmailOtp({ email, name, code }) {
  const normalizedEmail = email.toLowerCase().trim();
  const subject = `${code} is your FinSmart verification code`;
  const html = createVerificationEmailHtml({ name, code });

  // 1. Check if Resend API Key is provided
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'FinSmart <onboarding@resend.dev>',
          to: [normalizedEmail],
          subject,
          html,
        }),
      });

      if (res.ok) {
        console.log(`[AUTH] Verification email successfully sent via Resend to ${normalizedEmail}`);
        return { sent: true, provider: 'resend' };
      } else {
        const errorText = await res.text();
        console.warn('[AUTH] Resend API error:', errorText);
      }
    } catch (err) {
      console.warn('[AUTH] Error sending with Resend:', err.message);
    }
  }

  // 2. Check if SMTP is configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const isGmail = process.env.SMTP_HOST.includes('gmail');
      const cleanPass = process.env.SMTP_PASS.replace(/\s+/g, '');
      
      const transportConfig = isGmail
        ? {
            service: 'gmail',
            auth: {
              user: process.env.SMTP_USER.trim(),
              pass: cleanPass,
            },
          }
        : {
            host: process.env.SMTP_HOST.trim(),
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER.trim(),
              pass: cleanPass,
            },
          };

      const transporter = nodemailer.createTransport(transportConfig);

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"FinSmart" <${process.env.SMTP_USER}>`,
        to: normalizedEmail,
        subject,
        text: `Your FinSmart verification code is: ${code}. This code expires in 10 minutes.`,
        html,
      });

      console.log(`[AUTH] Verification email successfully sent via SMTP to ${normalizedEmail}`);
      return { sent: true, provider: 'smtp' };
    } catch (err) {
      console.warn('[AUTH] SMTP send failed:', err.message);
    }
  }

  // 3. Development / Local Fallback (Logs to terminal & supplies devCode)
  console.log(`\n================== [FINSMART EMAIL VERIFICATION] ==================`);
  console.log(`Recipient : ${normalizedEmail} (${name || 'User'})`);
  console.log(`OTP Code  : ${code}`);
  console.log(`Expires In: 10 minutes`);
  console.log(`Status    : SMTP/Resend not configured in .env.local -> using Demo Test Code`);
  console.log(`===================================================================\n`);

  return { sent: false, provider: 'dev-mode', devCode: code };
}

/**
 * Register/Store an OTP for an email in persistent store
 */
export function storeOtp(email, name, code) {
  const normalizedEmail = email.toLowerCase().trim();
  const store = readStore();
  const existing = store[normalizedEmail];

  if (existing && Date.now() - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const secondsRemaining = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - existing.lastSentAt)) / 1000);
    throw new Error(`Please wait ${secondsRemaining}s before requesting a new code.`);
  }

  store[normalizedEmail] = {
    code,
    name,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
    lastSentAt: Date.now(),
  };

  writeStore(store);
}

/**
 * Verify the OTP entered by user
 */
export function verifyOtp(email, enteredCode) {
  const normalizedEmail = email.toLowerCase().trim();
  const store = readStore();
  const record = store[normalizedEmail];

  if (!record) {
    return { valid: false, message: 'No verification code found for this email. Please click "Resend Code" below.' };
  }

  if (Date.now() > record.expiresAt) {
    delete store[normalizedEmail];
    writeStore(store);
    return { valid: false, message: 'Verification code has expired. Please click "Resend Code".' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    delete store[normalizedEmail];
    writeStore(store);
    return { valid: false, message: 'Too many incorrect attempts. Please request a new code.' };
  }

  if (record.code !== enteredCode.trim()) {
    record.attempts += 1;
    const attemptsLeft = MAX_ATTEMPTS - record.attempts;
    writeStore(store);
    return {
      valid: false,
      message: `Incorrect verification code. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`,
    };
  }

  // Successful verification -> delete OTP
  delete store[normalizedEmail];
  writeStore(store);
  return { valid: true, message: 'Email verified successfully!' };
}
