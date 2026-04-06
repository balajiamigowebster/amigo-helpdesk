import { NextResponse } from "next/server";
import crypto from "crypto";
import UserManagement from "@/lib/models/Organization/UserManagement";
import { UserRegisterPortalEmail } from "@/lib/UserRegisterPortalEmail";
import { Organization } from "@/lib";

const handleError = (error) => {
  console.error("USER_PORTAL_LOGIN_ERROR", error.message);

  // Sequelize Validation Errors (e.g., invalid email format)
  if (error.name === "SequelizeValidationError") {
    return NextResponse.json(
      { error: error.errors[0].message },
      { status: 400 },
    );
  }

  // Unique Constraint Errors
  if (error.name === "SequelizeUniqueConstraintError") {
    return NextResponse.json(
      { error: "Settings for this organization already exist." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { error: "Internal Server Error. Please try again later." },
    { status: 500 },
  );
};

export async function POST(req) {
  //   await UserManagement.sync({ alter: true });
  try {
    const { email, orgId, slug } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // --- PUDHU STEPS: Organization details-ai edukkurathukku ---
    const org = await Organization.findByPk(orgId); // Id vachu org details fetch pandrom
    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // 1. User irukkangala nu check pannuvom
    let user = await UserManagement.findOne({
      where: {
        orgId,
        email: normalizedEmail,
      },
    });

    if (!user) {
      user = await UserManagement.create({
        orgId,
        email: normalizedEmail,
        firstName: "Guest", // Default name
        lastName: "User",
        phoneNumber: "",
      });
    }

    // 3. Magic Link Token generate pannuvom
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60000); // 15 mins validity

    // 4. Token-ai database-la save pannuvom
    await user.update({
      verificationToken: token,
      tokenExpiry: expiry,
    });

    // 5. Magic Link anupuvom
    // Note: Frontend link-la 'slug' irukanum appo thaan verify aana aprum
    // thirumba correct portal-ku redirect panna mudiyum
    const emailResult = await UserRegisterPortalEmail(
      normalizedEmail,
      token,
      slug,
      org.name,
    );

    if (emailResult.success) {
      return NextResponse.json(
        {
          message: "Verify link sent to your email!",
        },
        { status: 200 },
      );
    } else {
      throw new Error("Failed to send email");
    }
  } catch (error) {
    return handleError(error);
  }
}
