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

  tls: {
    rejectUnauthorized: true,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,

  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 10,
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error);
  } else {
    console.log("✅ Email server is ready to send emails");
  }
});

export const createEmailTemplate = (
  title: string,
  body: string,
  previewText: string = ""
): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <title>${title} - Track Hire</title>
  <style>
   
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
   
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background-color: #f4f7fa;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
    }
    
   
    .email-wrapper {
      width: 100%;
      background-color: #f4f7fa;
      padding: 40px 0;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    
   
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 48px 40px;
      text-align: center;
    }
    
    .logo {
      font-size: 32px;
      font-weight: 800;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.5px;
      display: inline-block;
      margin-bottom: 8px;
    }
    
    .tagline {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      margin: 0;
      font-weight: 400;
    }
    
   
    .email-body {
      padding: 48px 40px;
      color: #334155;
    }
    
    .email-title {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 24px;
      line-height: 1.3;
    }
    
    .email-text {
      font-size: 16px;
      color: #475569;
      margin: 0 0 20px;
      line-height: 1.7;
    }
    
    .email-text strong {
      color: #1e293b;
      font-weight: 600;
    }
    
   
    .button-wrapper {
      text-align: center;
      margin: 32px 0;
    }
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
   
    .link-fallback {
      background: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    
    .link-fallback p {
      margin: 0 0 12px;
      font-size: 14px;
      color: #64748b;
    }
    
    .link-fallback a {
      word-break: break-all;
      color: #667eea;
      text-decoration: none;
      font-size: 13px;
    }
    
   
    .alert-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 6px;
      padding: 16px 20px;
      margin: 24px 0;
    }
    
    .alert-box p {
      margin: 0;
      color: #92400e;
      font-size: 14px;
    }
    
   
    .info-box {
      background: #dbeafe;
      border-left: 4px solid #3b82f6;
      border-radius: 6px;
      padding: 16px 20px;
      margin: 24px 0;
    }
    
    .info-box p {
      margin: 0;
      color: #1e40af;
      font-size: 14px;
    }
    
   
    .email-footer {
      padding: 32px 40px;
      text-align: center;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    
    .email-footer p {
      margin: 8px 0;
      font-size: 13px;
      color: #64748b;
    }
    
    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 24px 0;
    }
    
   
    @media only screen and (max-width: 640px) {
      .email-container {
        border-radius: 0;
      }
      .email-header, .email-body, .email-footer {
        padding: 32px 24px !important;
      }
      .email-title {
        font-size: 24px !important;
      }
    }
  </style>
</head>
<body>
  <!-- Preview text (hidden but visible in inbox preview) -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${previewText}
  </div>
  
  <!-- Wrapper for email clients -->
  <div class="email-wrapper">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%">
      <tr>
        <td>
          <div class="email-container">
            <!-- Header -->
            <div class="email-header">
              <div class="logo">Track Hire</div>
              <p class="tagline">Your Job Application Tracker</p>
            </div>
            
            <!-- Body -->
            <div class="email-body">
              <h1 class="email-title">${title}</h1>
              ${body}
            </div>
            
            <!-- Footer -->
            <div class="email-footer">
              <p style="font-weight: 600; color: #475569; margin-bottom: 16px;">Track Hire</p>
              <p>Manage your job applications efficiently</p>
              
              <div class="divider"></div>
              
              <p style="font-size: 12px;">
                © ${new Date().getFullYear()} Track Hire. All rights reserved.
              </p>
              <p style="font-size: 12px; margin-top: 8px;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </div>
          </div>
        </td>
      </tr>
    </table>
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
  const previewText = `Hi ${name}, please verify your email address to activate your Track Hire account.`;

  const html = createEmailTemplate(
    "Verify Your Email Address",
    `
    <p class="email-text">Hi <strong>${name}</strong>,</p>
    <p class="email-text">
      Welcome to Track Hire! 🎉 We're excited to have you on board. 
      To get started, please verify your email address by clicking the button below:
    </p>
    
    <div class="button-wrapper">
      <a href="${verifyUrl}" class="button">Verify My Email</a>
    </div>
    
    <div class="info-box">
      <p><strong>Why verify?</strong> Email verification helps us ensure account security and lets you receive important updates about your job applications.</p>
    </div>
    
    <div class="link-fallback">
      <p>Button not working? Copy and paste this link into your browser:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    </div>
    
    <div class="alert-box">
      <p>⏰ This verification link will expire in <strong>24 hours</strong>.</p>
    </div>
    
    <p class="email-text">
      If you didn't create an account with Track Hire, please disregard this email.
    </p>
    `,
    previewText
  );

  await transporter.sendMail({
    from: {
      name: env.SMTP_FROM_NAME,
      address: env.SMTP_USER,
    },
    replyTo: env.SUPPORT_EMAIL,
    to,
    subject: "✅ Verify Your Email - Track Hire",
    html,
    text: `Hi ${name},\n\nWelcome to Track Hire! Please verify your email by visiting: ${verifyUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.\n\nBest regards,\nTrack Hire Team`,
    headers: {
      "X-Priority": "3",
      "X-MSMail-Priority": "Normal",
      Importance: "Normal",
      "X-Mailer": "Track Hire",
    },
  });
};

export const sendPasswordResetEmail = async ({
  to,
  name,
  token,
}: SendEmailParams): Promise<void> => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  const previewText = `Hi ${name}, reset your Track Hire password using this secure link.`;

  const html = createEmailTemplate(
    "Reset Your Password",
    `
    <p class="email-text">Hi <strong>${name}</strong>,</p>
    <p class="email-text">
      We received a request to reset your password for your Track Hire account.
      If this was you, click the button below to create a new password:
    </p>
    
    <div class="button-wrapper">
      <a href="${resetUrl}" class="button">Reset My Password</a>
    </div>
    
    <div class="info-box">
      <p><strong>Security Tip:</strong> Choose a strong, unique password that you don't use anywhere else.</p>
    </div>
    
    <div class="link-fallback">
      <p>Button not working? Copy and paste this link into your browser:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    </div>
    
    <div class="alert-box">
      <p>⏰ This password reset link will expire in <strong>1 hour</strong>.</p>
    </div>
    
    <p class="email-text" style="margin-top: 32px;">
      <strong>Didn't request a password reset?</strong><br>
      If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
    </p>
    `,
    previewText
  );

  await transporter.sendMail({
    from: {
      name: env.SMTP_FROM_NAME,
      address: env.SMTP_USER,
    },
    replyTo: env.SUPPORT_EMAIL,
    to,
    subject: "🔒 Reset Your Password - Track Hire",
    html,
    text: `Hi ${name},\n\nWe received a request to reset your password. Reset it here: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nTrack Hire Team`,
    headers: {
      "X-Priority": "1",
      "X-MSMail-Priority": "High",
      Importance: "High",
      "X-Mailer": "Track Hire",
    },
  });
};

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> => {
  await transporter.sendMail({
    from: {
      name: env.SMTP_FROM_NAME,
      address: env.SMTP_USER,
    },
    replyTo: env.SUPPORT_EMAIL,
    to,
    subject,
    html,
    headers: {
      "X-Priority": "3",
      "X-MSMail-Priority": "Normal",
      Importance: "Normal",
      "X-Mailer": "Track Hire",
    },
  });
};
