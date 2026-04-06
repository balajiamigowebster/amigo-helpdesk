import nodemailer from "nodemailer";

export const sendEmployeeVerifyEmail = async (email, token, firstName) => {
  // Transporter setup
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com", // Host-ai explicitly kudunga
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Production-la Vercel URL-ai check pannunga
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_FRONTEND_URL
      : process.env.DEVELOPMENT_FRONTEND_URL;

  // const verifyUrl = `${baseUrl}/verify-employee?token=${token}`;

  // Ippo namma 'id' ku pathila 'token' anupuroam
  // Frontend-la intha token-ai vachu thaan expiry check nadakkum
  const verifyUrl = `${baseUrl}/setup-password?token=${token}&email=${encodeURIComponent(email)}`;
  //const verifyUrl = `${process.env.PRODUCTION_FRONTEND_URL}/verify-employee?token=${token}`;

  const mailOptions = {
    from: `"HelpDesk Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "👋 Action Required: Verify Your Employee Account",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
      <div style="background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h2>Welcome to HelpDesk!</h2>
      </div>
      <div style="padding: 20px; text-align: center;">
        <p>Hi ${firstName},</p>
        <p>Your account has been created by your administrator. Please click the button below to verify your email.</p>
        <p style="color: #ef4444; font-weight: bold;">Note: This link will expire in 24 hours.</p>
        
        <a href="${verifyUrl}" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Verify My Account</a>
        
        <p style="font-size: 12px; color: #666;">If the button doesn't work, copy-paste this link: <br> 
        <a href="${verifyUrl}">${verifyUrl}</a></p>
      </div>
      <div style="background: #f9fafb; padding: 10px; text-align: center; font-size: 11px; color: #aaa;">
        © 2026 HelpDesk Inc.
      </div>
    </div>
    `,
  };

  try {
    // Mail-ai anupitu antha info-vai vanguroam
    const info = await transporter.sendMail(mailOptions);

    // Ithu thaan strong check: antha email address "accepted" list-la irundha mattume return true
    if (info.accepted.includes(email)) {
      console.log("Email actually delivered to Gmail server");
      return { success: true, messageId: info.messageId };
    } else {
      throw new Error("Email was not accepted by Gmail server");
    }
  } catch (error) {
    console.error("Critical Email Error:", error);
    return { success: false, error: error.message };
  }
};
