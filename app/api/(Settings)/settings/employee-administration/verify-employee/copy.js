import { EmployeeAdministration } from "@/lib";
import { NextResponse } from "next/server";
import { Op } from "sequelize";

export async function GET(req) {
  try {
    // 1. URL-la irunthu token-ai edukkuroam
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Verification token is missing." },
        { status: 400 }
      );
    }

    // 2. Database-la antha token irukka nu check panroam
    // Koodave expiry time 'ippo' irukkura time-ai vida perusa irukkanum

    const employee = await EmployeeAdministration.findOne({
      where: {
        verificationToken: token,
        verificationExpiry: {
          [Op.gt]: new Date(), // Check: expiry_time > current_time
        },
      },
    });

    // 3. Oruvelai token thappa irunthalo illa expiry aayிருந்தalo
    if (!employee) {
      return NextResponse.json(
        {
          message:
            "Link invalid or expired. Please ask your administrator to resend the verification email.",
        },
        { status: 400 }
      );
    }

    // 4. Token valid-ah iruntha, employee-ai verify pannittu token-ai clear panroam
    await employee.update({
      isVerified: true,
      verificationToken: null, // Oru thadava verify pannatha thirumba panna mudiyaathu
      verificationExpiry: null,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Account Verified Successfully! You can now access your dashboard.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("VERIFICATION_ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
