import { NextResponse } from "next/server";
import { headers } from "next/headers";
import User from "@/lib/models/UserModels/User";

export async function GET() {
  try {
    // 1. Middleware set panna header-la irunthu User ID-ah edukkuroam
    const headerList = await headers();
    const userId = headerList.get("user-id");

    // 2. User ID illana unauthorized
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // 3. Database-la user data-va fetch pannuvom (Password thavira)
    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // 4. Success Response
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        setupStep: user.setupStep,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
