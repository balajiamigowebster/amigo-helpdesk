import { EmployeeAdministration, User, UserManagement } from "@/lib";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // 1. URL-la irunthu query parameters edukuroam
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    // Parallel-ah moonu table-layum check panrom for better performance

    const [existingEmployee] = await Promise.all([
      EmployeeAdministration.findOne({ where: { email: normalizedEmail } }),

      // User.findOne({ where: { email: normalizedEmail } }),
      // UserManagement.findOne({ where: { email: normalizedEmail } }),
    ]);

    // 2. Database-la intha email-la yevarkavathu account irukka nu check pandrom
    // Sequelize use panna:

    // Ethula account irunthalum exists true nu varum
    const emailExists = !!existingEmployee;
    // || !!existingUser || !!existingUserMgmt;

    let source = null;
    if (existingEmployee) source = "Employee Table";
    else if (existingUser) source = "User Table";
    else if (existingUserMgmt) source = "User Management Table";

    // 3. Email irundha exists: true, illana false
    return NextResponse.json(
      {
        success: true,
        exists: emailExists, // existingEmployee irundha true, illana false
        source: source, // Debugging-ku useful-ah irukkum
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Global Check Email Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
