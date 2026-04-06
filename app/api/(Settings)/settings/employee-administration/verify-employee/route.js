import { NextResponse } from "next/server";
import { Op, where } from "sequelize";
import bcrypt from "bcryptjs";
import { EmployeeAdministration } from "@/lib";

/**
 * @description 1. GET: TOKEN VALIDATION
 * Used when the page loads to verify if the link is still valid.
 */

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token || token.length < 20) {
      return NextResponse.json(
        { message: "Security Alert: Invalid token format." },
        { status: 400 },
      );
    }

    // Security: Only fetch necessary fields (attributes)
    const employee = await EmployeeAdministration.findOne({
      where: {
        verificationToken: token,
        verificationExpiry: { [Op.gt]: new Date() },
        isVerified: false, // Innum verify aagathavungala mattume check pannu
      },
      attributes: ["id", "email", "firstName", "password", "isVerified"],
    });

    if (!employee) {
      return NextResponse.json(
        { message: "This activation link is invalid or has expired." },
        { status: 400 },
      );
    }

    // Expiry check
    if (new Date() > employee.verificationExpiry) {
      return NextResponse.json(
        {
          message: "Link expired",
        },
        {
          status: 400,
        },
      );
    }

    // Logic: Admin password set panniruntha, GET call-laye verify pannidalam
    const hasPassword = employee.password !== null;

    if (hasPassword && !employee.isVerified) {
      employee.isVerified = true;
      employee.verificationToken = null;
      employee.verificationExpiry = null;
      // employee.activatedAt= new Date(),
      await employee.save();
    }

    return NextResponse.json(
      {
        success: true,
        email: employee.email,
        name: employee.firstName,
        verified: employee.isVerified,
        hasPassword: hasPassword,
        message: hasPassword ? "Account verified successfully" : "Token valid",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("TOKEN_VERIFY_ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error occurred." },
      { status: 500 },
    );
  }
}

/**
 * @description 2. POST: PASSWORD SETUP & FINAL ACTIVATION
 * Securely hashes the password and activates the account.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { token, password } = body;

    // --- A. Backend Validation ---
    if (!token || !password) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password is too weak. Minimum 8 characters required." },
        { status: 400 },
      );
    }

    // --- B. Security Fetch ---
    const employee = await EmployeeAdministration.findOne({
      where: {
        verificationToken: token,
        verificationExpiry: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Security Error: Verification link expired or invalid." },
        { status: 400 },
      );
    }

    // --- C. Secure Processing ---
    // Salt rounds higher (12) means more secure but slightly slower hashing
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- D. Atomic Update ---
    // Clear all tokens so the link can NEVER be used again
    await employee.update({
      password: hashedPassword,
      isVerified: true,
      verificationToken: null,
      verificationExpiry: null,
      activatedAt: new Date(), // Optional: Neenga column vachiruntha useful-ah irukkum
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your account has been successfully secured and activated.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("ACTIVATION_CRITICAL_ERROR:", error);
    return NextResponse.json(
      { message: "System failed to process activation." },
      { status: 500 },
    );
  }
}
