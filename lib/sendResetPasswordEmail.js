import nodemailer from "nodemailer";

export const sendResetPasswordEmail = async (
  email,
  token,
  firstName,
  accountType,
) => {
  // 1. Transporter setup (Same as your reference)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Base URL detection
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_FRONTEND_URL
      : process.env.DEVELOPMENT_FRONTEND_URL;

  // 3. Reset URL (Path: /reset-password)
  // Inga path-ai namma ippo create panna pora reset route-ku logic panni irukkom
  const resetUrl = `${baseUrl}/reset-password-page?token=${token}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: `"HelpDesk Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Action Required: Reset Your Password",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
      <div style="background: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h2>Password Reset Request</h2>
      </div>
      <div style="padding: 20px; text-align: center;">
        <p>Hi ${firstName},</p>
        <p>We received a request to reset the password for your <strong>${accountType}</strong> account.</p>
        <p>Click the button below to set a new password. If you didn't request this, you can safely ignore this email.</p>
        
        <p style="color: #ef4444; font-weight: bold;">Note: This link will expire in 1 hour.</p>
        
        <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold;">Reset My Password</a>
        
        <p style="font-size: 12px; color: #666;">If the button doesn't work, copy-paste this link: <br> 
        <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a></p>
      </div>
      <div style="background: #f9fafb; padding: 15px; text-align: center; font-size: 11px; color: #aaa; border-radius: 0 0 10px 10px;">
        © 2026 HelpDesk Inc. <br>
        Secure Password Management System
      </div>
    </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    if (info.accepted.includes(email)) {
      console.log(`Reset Email delivered to ${accountType}: ${email}`);
      return { success: true, messageId: info.messageId };
    } else {
      throw new Error("Email was not accepted by server");
    }
  } catch (error) {
    console.error("Reset Email Error:", error);
    return { success: false, error: error.message };
  }
};
