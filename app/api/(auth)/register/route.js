import { registerUser } from "@/controllers/authController";
import sequelize from "@/lib/config/db";
import { sendOTPEmail } from "@/lib/mail";
import User from "@/lib/models/UserModels/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    // User create aagi, cookie-yum set aagidum
    const { email, otp } = await registerUser(body);

    // 2. Real-time-ah Gmail-ku OTP anuppurom
    try {
      await sendOTPEmail(email, otp);
    } catch (error) {
      console.error("Email sending failed:", error);
      // Oruvelai mail pogalana kooda, user-ku error kaatturathu nallathu
      throw new Error("Failed to send OTP email. Please try again.");
    }

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent to your email.",
        email: email,
      },
      { status: 201 }
    );
  } catch (error) {
    // Sequelize unique constraint error vantha custom message anupalam
    const errorMessage =
      error.name === "SequelizeUniqueConstraintError"
        ? "Email already registered!"
        : error.message;

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}
