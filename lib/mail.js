import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Unga Gmail id
    pass: process.env.EMAIL_PASS, // Unga Google App Password
  },
});

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"HelpDesk Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Verify Your Account - OTP",
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #2563eb; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">HELP<span style="color: #bfdbfe;">DESK</span></h1>
      </div>
      
      <div style="padding: 30px; background-color: #ffffff; text-align: center;">
        <h2 style="color: #333; margin-bottom: 10px;">Email Verification</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          Welcome! Thank you for signing up. Use the following OTP to complete your registration process.
        </p>
        
        <div style="margin: 30px auto; padding: 15px; background-color: #f3f4f6; border-radius: 8px; display: inline-block; border: 1px dashed #2563eb;">
          <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px;">${otp}</span>
        </div>
        
        <p style="color: #999; font-size: 14px;">
          This code is valid for <b>10 minutes</b> only. 
          <br> If you didn't request this, please ignore this email.
        </p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #eeeeee;">
        <p style="color: #aaa; font-size: 12px; margin: 0;">
          &copy; 2026 HelpDesk Inc. All rights reserved.
        </p>
      </div>
    </div>
  `,
  };

  return await transporter.sendMail(mailOptions);
};
