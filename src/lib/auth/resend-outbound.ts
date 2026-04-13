import { createClient } from "@supabase/supabase-js";

const RESEND_API = "https://api.resend.com/emails";

/**
 * Fallback: Supabase Auth sends the signup confirmation using project SMTP / default mailer.
 */
export async function sendSignupConfirmationViaSupabaseSmtp(
  emailNorm: string,
  emailRedirectTo: string,
): Promise<{ ok: true } | { ok: false; error: string; cooldownSec?: number }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return { ok: false, error: "Supabase URL or anon key is not configured." };
  }
  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: emailNorm,
    options: { emailRedirectTo },
  });
  if (error) {
    const raw = error.message ?? "Could not send email";
    const m = raw.toLowerCase();
    const match = m.match(/after\s+(\d+)\s+seconds?/);
    const cooldownSec = match ? Number(match[1]) : undefined;
    if (m.includes("for security purposes") && Number.isFinite(cooldownSec)) {
      return {
        ok: false,
        error: `Please wait ${cooldownSec} seconds before requesting another verification email.`,
        cooldownSec,
      };
    }
    return { ok: false, error: raw };
  }
  return { ok: true };
}

export function isResendConfigured(): boolean {
  return (
    Boolean(process.env.RESEND_API_KEY?.trim()) &&
    Boolean(process.env.AUTH_EMAIL_FROM?.trim())
  );
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Sends one transactional message via Resend (primary path for auth emails).
 */
export async function sendTransactionalEmailResend(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  let from = process.env.AUTH_EMAIL_FROM?.trim();
  if (!key || !from) {
    return { ok: false, error: "RESEND_API_KEY or AUTH_EMAIL_FROM is not set" };
  }

  if (!from.includes("<")) {
    from = `Prime Group <${from}>`;
  }

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    const errMsg =
      typeof body.message === "string"
        ? body.message
        : `Email API returned ${res.status}`;
    return { ok: false, error: errMsg };
  }

  return { ok: true };
}

export function buildSignupConfirmationEmail(confirmUrl: string): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = "Confirm your Prime Group account";
  const text = `Welcome to Prime Group.\n\nOpen this link to confirm your email and finish sign-up:\n${confirmUrl}\n\nIf you didn't register, you can ignore this email.`;
  const safeUrl = escapeHtml(confirmUrl);
  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=General+Sans:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background-color: #fcfcfc;
      font-family: 'General Sans', system-ui, -apple-system, sans-serif;
      color: #1a1a1a;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #fcfcfc;
      padding-bottom: 60px;
    }
    .main {
      background-color: #ffffff;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
      overflow: hidden;
      margin-top: 40px;
      border: 1px solid #f0f0f0;
    }
    .header {
      background-color: #0c1a30;
      padding: 40px 0;
      text-align: center;
      position: relative;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #d4af37, #f3e5ab, #d4af37);
    }
    .logo {
      color: #ffffff;
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 1px;
      margin: 0;
    }
    .accent {
      color: #d4af37;
    }
    .content {
      padding: 48px 40px;
    }
    .title {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      color: #0c1a30;
      margin-top: 0;
      margin-bottom: 16px;
      font-weight: 700;
    }
    .text {
      font-size: 16px;
      line-height: 1.6;
      color: #4a5568;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .btn-container {
      margin: 32px 0;
      text-align: center;
    }
    .btn {
      display: inline-block;
      background-color: #d4af37;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      letter-spacing: 0.5px;
      text-align: center;
      transition: background-color 0.3s ease;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    }
    .btn:hover {
      background-color: #c5a030;
    }
    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 32px 0;
    }
    .fallback {
      font-size: 13px;
      color: #718096;
      line-height: 1.5;
      background-color: #f8fafc;
      padding: 16px;
      border-radius: 6px;
      word-break: break-all;
    }
    .fallback a {
      color: #d4af37;
      text-decoration: underline;
    }
    .footer {
      text-align: center;
      padding: 24px 40px;
      background-color: #f8fafc;
      border-top: 1px solid #f1f5f9;
    }
    .footer-text {
      font-size: 13px;
      color: #94a3b8;
      margin: 0 0 8px 0;
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#fcfcfc;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Welcome to Prime Group. Thank you for registering. You're just one step away from completing your account setup.
  </div>
  <div style="display:none;max-height:0px;overflow:hidden;">
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <div class="wrapper">
    <table class="main" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td class="header">
          <h1 class="logo">PRIME <span class="accent">GROUP</span></h1>
        </td>
      </tr>
      <tr>
        <td class="content">
          <h2 class="title">Welcome to Prime Group</h2>
          <p class="text">Thank you for registering. You're just one step away from completing your account setup and joining an exclusive community.</p>
          <p class="text">Please confirm your email address by clicking the button below:</p>
          
          <div class="btn-container">
            <a href="${safeUrl}" class="btn">Confirm Email Address</a>
          </div>
          
          <div class="divider"></div>
          
          <div class="fallback">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <a href="${safeUrl}">${safeUrl}</a>
          </div>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p class="footer-text">© ${new Date().getFullYear()} Prime Group. All rights reserved.</p>
          <p class="footer-text">This is an automated message, please do not reply.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
  return { subject, text, html };
}

/** Magic / access link (e.g. resend verification when we only have email). */
export function buildAuthContinueEmail(actionUrl: string): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = "Continue your Prime Group sign-up";
  const text = `Use this link to verify your email and continue with Prime Group:\n${actionUrl}\n\nIf you didn't request this, you can ignore this email.`;
  const safeUrl = escapeHtml(actionUrl);
  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=General+Sans:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background-color: #fcfcfc;
      font-family: 'General Sans', system-ui, -apple-system, sans-serif;
      color: #1a1a1a;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #fcfcfc;
      padding-bottom: 60px;
    }
    .main {
      background-color: #ffffff;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
      overflow: hidden;
      margin-top: 40px;
      border: 1px solid #f0f0f0;
    }
    .header {
      background-color: #0c1a30;
      padding: 40px 0;
      text-align: center;
      position: relative;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #d4af37, #f3e5ab, #d4af37);
    }
    .logo {
      color: #ffffff;
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 1px;
      margin: 0;
    }
    .accent {
      color: #d4af37;
    }
    .content {
      padding: 48px 40px;
    }
    .title {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      color: #0c1a30;
      margin-top: 0;
      margin-bottom: 16px;
      font-weight: 700;
    }
    .text {
      font-size: 16px;
      line-height: 1.6;
      color: #4a5568;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .btn-container {
      margin: 32px 0;
      text-align: center;
    }
    .btn {
      display: inline-block;
      background-color: #0c1a30;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      letter-spacing: 0.5px;
      text-align: center;
      transition: background-color 0.3s ease;
      box-shadow: 0 4px 12px rgba(12, 26, 48, 0.2);
    }
    .btn:hover {
      background-color: #1a2a44;
    }
    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 32px 0;
    }
    .fallback {
      font-size: 13px;
      color: #718096;
      line-height: 1.5;
      background-color: #f8fafc;
      padding: 16px;
      border-radius: 6px;
      word-break: break-all;
    }
    .fallback a {
      color: #0c1a30;
      text-decoration: underline;
    }
    .footer {
      text-align: center;
      padding: 24px 40px;
      background-color: #f8fafc;
      border-top: 1px solid #f1f5f9;
    }
    .footer-text {
      font-size: 13px;
      color: #94a3b8;
      margin: 0 0 8px 0;
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#fcfcfc;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Action Required: We received a request to verify your email address to continue your session with Prime Group.
  </div>
  <div style="display:none;max-height:0px;overflow:hidden;">
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <div class="wrapper">
    <table class="main" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td class="header">
          <h1 class="logo">PRIME <span class="accent">GROUP</span></h1>
        </td>
      </tr>
      <tr>
        <td class="content">
          <h2 class="title">Action Required</h2>
          <p class="text">We received a request to verify your email address to continue your session with Prime Group.</p>
          <p class="text">Click the securely generated button below to securely verify your address and continue:</p>
          
          <div class="btn-container">
            <a href="${safeUrl}" class="btn">Verify & Continue</a>
          </div>
          
          <div class="divider"></div>
          
          <div class="fallback">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <a href="${safeUrl}">${safeUrl}</a>
          </div>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p class="footer-text">If you didn't request this email, you can safely ignore it.</p>
          <p class="footer-text">© ${new Date().getFullYear()} Prime Group. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
  return { subject, text, html };
}
