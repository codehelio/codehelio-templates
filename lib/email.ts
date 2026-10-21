import "server-only";
import nodemailer from "nodemailer";

const userEmail = (process.env.GOOGLE_USER_EMAIL || "hr.codehelio@gmail.com").trim();
const appPassword = (process.env.GOOGLE_APP_PASSWORD || "rwmh dyqb xqdk urqj").trim();

export const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: userEmail,
    pass: appPassword,
  },
});

/**
 * Send an OTP code to a recipient email address
 */
export async function sendOtpEmail(to: string, otpCode: string, purpose: string = "Account Sign In") {
  const recipient = to.trim().toLowerCase();

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { font-size: 22px; font-weight: 800; color: #027cc7; letter-spacing: -0.5px; }
          .badge { display: inline-block; padding: 4px 12px; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-top: 8px; }
          .otp-box { background: #f1f5f9; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 32px; font-weight: 800; color: #0f172a; letter-spacing: 6px; font-family: monospace; }
          .desc { font-size: 14px; line-height: 1.6; color: #475569; }
          .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="logo">CodeHelio Studio</div>
            <div class="badge">Security Verification</div>
          </div>
          <p class="desc">Hello,</p>
          <p class="desc">Your single-use 6-digit verification code for <strong>${purpose}</strong> is:</p>
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
          </div>
          <p class="desc" style="font-size: 13px;">This security code will expire in <strong>1 minute</strong>. If you did not request this, you can safely ignore this email.</p>
          <div class="footer">
            © 2026 CodeHelio Templates. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await mailTransporter.sendMail({
      from: `"CodeHelio Security" <${userEmail}>`,
      to: recipient,
      subject: `CodeHelio Verification Code: ${otpCode}`,
      text: `Your CodeHelio verification code for ${purpose} is: ${otpCode}. Valid for 1 minute.`,
      html,
    });
    console.log(`OTP email sent to ${recipient}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`Failed to dispatch OTP email to ${recipient}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send an Application confirmation email to the client
 */
export async function sendApplicationConfirmationEmail(to: string, clientCode: string, templateName: string) {
  const recipient = to.trim().toLowerCase();

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { text-align: center; margin-bottom: 20px; }
          .logo { font-size: 22px; font-weight: 800; color: #027cc7; }
          .code-box { background: #eff6ff; border: 1.5px dashed #027cc7; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
          .client-code { font-size: 24px; font-weight: 800; color: #0369a1; letter-spacing: 2px; }
          .desc { font-size: 14px; line-height: 1.6; color: #475569; }
          .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="logo">CodeHelio Studio</div>
          </div>
          <p class="desc">Thank you for applying for <strong>${templateName}</strong>!</p>
          <p class="desc">Your application has been received and assigned a dedicated engineer.</p>
          <div class="code-box">
            <div style="font-size: 12px; color: #0284c7; text-transform: uppercase; font-weight: 600;">Your Client Code</div>
            <div class="client-code">${clientCode}</div>
          </div>
          <p class="desc">Please quote this client code when discussing changes or deployments with our engineering team on WhatsApp / Phone.</p>
          <div class="footer">
            © 2026 CodeHelio Templates. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await mailTransporter.sendMail({
      from: `"CodeHelio Studio" <${userEmail}>`,
      to: recipient,
      subject: `Application Received - ${clientCode} (${templateName})`,
      text: `We received your application for ${templateName}. Your client tracking code is ${clientCode}.`,
      html,
    });
  } catch (err: any) {
    console.error("Failed to send application confirmation email:", err.message);
  }
}
