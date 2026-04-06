import { loginUser } from "@/controllers/authController";
import sequelize from "@/lib/config/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // await sequelize.sync({ alter: true });

    const { email, password } = await req.json();

    if (!email || !password) {
      throw new Error("Email and Password are required!");
    }

    // Variable 'user'-la store pannanum!
    const user = await loginUser(email.toLowerCase(), password);

    // 3. Success Response with user details (Register mathiriye)
    return NextResponse.json(
      {
        success: true,
        message: "Login successful!",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role, // Dashboard logic-ku role helpful-ah irukum
          setupStep: user.setupStep, // Ithu dashboard redirect-ku useful-ah irukkum
          isSetupCompleted: user.isSetupCompleted,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 },
    );
  }
}
