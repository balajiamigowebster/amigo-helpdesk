import { EmployeeAdministration, User } from "@/lib";
import sequelize from "@/lib/config/db";
import { sendResetPasswordEmail } from "@/lib/sendResetPasswordEmail";
import CryptoJS from "crypto-js";
import { NextResponse } from "next/server";

export async function POST(req) {
  //   await sequelize.sync({ alter: true });
  try {
    const { email } = await req.json();
    const lowEmail = email.toLowerCase();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    // 1. Check in both tables (User & Employee)
    let account = await User.findOne({
      where: {
        email: lowEmail,
      },
    });
    let accountType = "user"; // Admin/Owner

    if (!account) {
      account = await EmployeeAdministration.findOne({
        where: {
          email: lowEmail,
        },
      });
      accountType = "employee";
    }

    // Account check
    if (!account) {
      return NextResponse.json(
        { message: "No account found with this email" },
        { status: 404 },
      );
    }

    // 2. Generate Reset Token (Crypto-JS)
    const randomWords = CryptoJS.lib.WordArray.random(32);
    const resetToken = CryptoJS.enc.Hex.stringify(randomWords);

    // 3. Expiry Set (1 Hour)
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);

    // 4. Update the record (User or Employee)
    // Rendu table-layum verificationToken & expiry column irukkum-nu assume pannuren
    await account.update({
      verificationToken: resetToken,
      verificationExpiry: resetExpiry,
    });

    // 5. Send Email
    try {
      // accountType-ai send pannuna email template-la "Hi Admin" or "Hi Employee" nu maathalam
      await sendResetPasswordEmail(
        lowEmail,
        resetToken,
        account.firstName,
        accountType,
      );
      console.log(`Reset link sent to ${accountType}: ${lowEmail}`);
    } catch (mailError) {
      console.error("MAIL_SENDING_ERROR:", mailError.message);
      return NextResponse.json(
        { message: "Failed to send email." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Password reset link sent to your email.",
        type: accountType, // Optional: Debugging-ku use aagum
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
