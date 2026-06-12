import nodemailer from "nodemailer";
import { env } from "../config/env";
import { SendEmailParams } from "../models/auth.model";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

const createEmailTemplate = (title: string, body: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 570px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
    .body { padding: 32px; color: #333333; line-height: 1.6; }
    .body p { margin: 0 0 16px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 16px 0; }
    .code { display: inline-block; background: #f4f4f7; padding: 12px 24px; border-radius: 6px; font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #667eea; margin: 16px 0; }
    .footer { padding: 24px 32px; text-align: center; color: #999999; font-size: 13px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Track Hire</h1>
    </div>
    <div class="body">
      <h2 style="margin: 0 0 16px; color: #333;">${title}</h2>
      ${body}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Track Hire. All rights reserved.</p>
      <p>If you didn't request this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendVerificationEmail = async ({
  to,
  name,
  token,
}: SendEmailParams): Promise<void> => {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;

  const html = createEmailTemplate(
    "Verify Your Email",
    `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Thank you for registering at Track Hire! Please verify your email address by clicking the button below:</p>
    <p style="text-align: center;">
      <a href="${verifyUrl}" class="button">Verify Email</a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #667eea; font-size: 14px;">${verifyUrl}</p>
    <p>This link will expire in <strong>24 hours</strong>.</p>
    `
  );

  await transporter.sendMail({
    from: `"Track Hire" <${env.SMTP_USER}>`,
    to,
    subject: "Verify Your Email - Track Hire",
    html,
  });
};

export const sendPasswordResetEmail = async ({
  to,
  name,
  token,
}: SendEmailParams): Promise<void> => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  const html = createEmailTemplate(
    "Reset Your Password",
    `
    <p>Hi <strong>${name}</strong>,</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #667eea; font-size: 14px;">${resetUrl}</p>
    <p>This link will expire in <strong>1 hour</strong>.</p>
    `
  );

  await transporter.sendMail({
    from: `"Track Hire" <${env.SMTP_USER}>`,
    to,
    subject: "Reset Your Password - Track Hire",
    html,
  });
};
