import { verifyOTP } from "@/controllers/authController";
import OTP from "@/lib/models/UserModels/OtpModel";
import User from "@/lib/models/UserModels/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1. Table-ah sync pannunga (Pudhu table-nu check panni create pannum)

    const { email, otp } = await req.json();

    const user = await verifyOTP(email, otp);

    // // 1. Check if OTP is valid and not expired
    // if (!user || new Date() > user.otpExpires) {
    //   return NextResponse.json(
    //     { success: false, error: "Invalid or expired OTP" },
    //     { status: 400 }
    //   );
    // }

    // // 2. Update User - Move to Step 2
    // await user.update({
    //   isEmailVerified: true,
    //   otpCode: null, // Delete OTP after use
    //   otpExpires: null,
    //   setupStep: 2,
    // });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully!",
      setupStep: user.setupStep,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
