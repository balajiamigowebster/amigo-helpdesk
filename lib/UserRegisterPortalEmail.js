import nodemailer from "nodemailer";

/**
 * User Portal-ukku Magic Link anuppum function.
 * @param {string} email - User-oda email address.
 * @param {string} token - Crypto-la generate panna 15-min token.
 * @param {string} slug - Organization-oda unique slug.
 * @param {string} orgName - Organization-oda per (UI-la kaatta).
 */
export const UserRegisterPortalEmail = async (email, token, slug, orgName) => {
  // 1. Transporter Setup
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Base URL Configuration
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_FRONTEND_URL
      : process.env.DEVELOPMENT_FRONTEND_URL || "http://localhost:3000";

  // 3. Spiceworks style Verify URL
  // User intha link-ai click panna namma verify route-ku povaanga
  const verifyUrl = `${baseUrl}/portal/${slug}/verify?token=${token}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: `"${orgName} Help Desk" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Log in to your ${orgName} Help Desk portal`,
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
      <div style="padding: 20px; border-bottom: 1px solid #eee;">
        <h2 style="color: #444;">Hello, ${email}!</h2>
        <p style="font-size: 16px; line-height: 1.5;">
          You've been given access to log in to the portal of <strong>"${orgName}"</strong> help desk.
        </p>
        
        <div style="margin: 30px 0; text-align: left;">
          <a href="${verifyUrl}" style="background: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Log in to the portal
          </a>
        </div>

        <p style="font-size: 13px; color: #666;">
          (The above invitation link is only valid for a short period of time, so please log in quickly.)
        </p>
      </div>

      <div style="padding: 20px; font-size: 14px;">
        <h4 style="margin-bottom: 5px;">Why did you receive this email?</h4>
        <p style="margin-top: 0; color: #555;">
          Glad you asked! We're using the Help Desk to track issues and get all your requests sorted in a snap. 
          Have a concern? Just reply to this email, and we'll be in touch. Thanks!
        </p>
      </div>

      <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #999;">
        © 2026 Help Desk | Powered by Your Service
      </div>
    </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (info.accepted.includes(email)) {
      return { success: true, messageId: info.messageId };
    }
    return { success: false, error: "Email rejected by server" };
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false, error: error.message };
  }
};
