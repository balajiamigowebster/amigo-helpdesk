import { EmployeeAdministration, User } from "@/lib";
import { NextResponse } from "next/server";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const token = searchParams.get("token");

//     if (!token)
//       return NextResponse.json(
//         {
//           message:
//             "This reset link is invalid or has expired. Please request a new one.",
//         },
//         { status: 400 },
//       );

//     // Rendu table-layum check pannunga
//     let account = await User.findOne({
//       where: {
//         verificationToken: token,
//         verificationExpiry: {
//           [Op.gt]: new Date(),
//         },
//       },
//     });

//     if (!account) {
//       account = await EmployeeAdministration.findOne({
//         where: {
//           verificationToken: token,
//           verificationExpiry: { [Op.gt]: new Date() },
//         },
//       });
//     }

//     if (!account) {
//       return NextResponse.json(
//         { valid: false, message: "Invalid or expired link" },
//         { status: 400 },
//       );
//     }

//     return NextResponse.json(
//       { valid: true, firstName: account.firstName },
//       { status: 200 },
//     );
//   } catch (error) {
//     return NextResponse.json({ message: "Server error" }, { status: 500 });
//   }
// }

// --- 2. POST: PASSWORD UPDATE ---

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token)
      return NextResponse.json(
        {
          message:
            "This reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 },
      );

    const now = new Date();
    let account = null;
    // A. First check in User Table
    account = await User.findOne({
      where: {
        verificationToken: token,
        verificationExpiry: { [Op.gt]: now },
      },
    });

    // B. If not found in User, check in Employee Table
    if (!account) {
      account = await EmployeeAdministration.findOne({
        where: {
          verificationToken: token,
          verificationExpiry: { [Op.gt]: now },
        },
      });
    }

    if (!account) {
      return NextResponse.json(
        { valid: false, message: "This reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { valid: true, firstName: account.firstName },
      { status: 200 },
    );
  } catch (error) {
    console.error("RESET_GET_ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        {
          message:
            "Unable to process your request. Please try again or request a new reset link.",
        },
        { status: 400 },
      );
    }

    // A. Check in User Table
    let account = await User.findOne({
      where: {
        verificationToken: token,
        verificationExpiry: {
          [Op.gt]: new Date(),
        },
      },
    });

    let accountType = "user"; // Admin/Owner

    // B. If not in User, check in Employee Table

    if (!account) {
      account = await EmployeeAdministration.findOne({
        where: {
          verificationToken: token,
          verificationExpiry: { [Op.gt]: new Date() },
        },
      });
      accountType = "employee";
    }

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 },
      );
    }

    // C. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // D. Update Password & Clear Reset Tokens
    // Inga account automatic-ah entha table-o athulaye update aagidum
    await account.update({
      password: hashedPassword,
      verificationToken: null, // Link-ai oru thadava mela use panna mudiyaathu
      verificationExpiry: null,
    });

    console.log(`Password reset success for ${accountType}: ${account.email}`);
    return NextResponse.json(
      {
        success: true,
        message: `Password updated successfully for ${accountType}!`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("RESET_PASSWORD_POST_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while resetting your password. Please try again later.",
      },
      { status: 500 },
    );
  }
}
