import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import UserManagement from "@/lib/models/Organization/UserManagement";
import { Op } from "sequelize";

const handleError = (error) => {
  console.error("USER_PORTAL_LOGIN_ERROR", error);

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

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const orgSlug = searchParams.get("slug");

    if (!token || !email) {
      return NextResponse.json({ error: "Invalid link" }, { status: 400 });
    }

    // 1. User matrum Token valid-ah-nu database-la check pannuvom
    const user = await UserManagement.findOne({
      where: {
        email: email.toLocaleLowerCase().trim(),
        verificationToken: token,
        tokenExpiry: {
          [Op.gt]: new Date(), // Current time-ai vida expiry athigama irukanum
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Link expired or invalid. Please try logging in again." },
        { status: 400 },
      );
    }

    // 2. Token Valid! Ippo Crypto Session ID generate pannuvom (7 Days Expiry)
    const sessionToken = crypto.randomBytes(64).toString("hex");

    // 3. Database-la token-ai clear pannidanum (One-time use security)
    await user.update({
      verificationToken: null,
      tokenExpiry: null,
    });

    // 4. Set Cookies (Next.js server-side)
    const cookieStore = await cookies();
    const SEVEN_DAYS = 7 * 24 * 60 * 60; // Seconds-la

    // Crypto Session Cookie (HttpOnly for Security)
    cookieStore.set("portal_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: SEVEN_DAYS,
      path: "/",
    });

    // User Email Cookie (Dashboard UI-kaga)
    cookieStore.set("portal_user_email", user.email, {
      maxAge: SEVEN_DAYS,
      path: "/",
    });

    // *** INTHA LINE ADD PANNUNGA ***
    // User ID Cookie (API calls kaga)
    cookieStore.set("portal_user_id", user.id.toString(), {
      maxAge: SEVEN_DAYS,
      path: "/",
    });

    cookieStore.set("portal_org_slug", orgSlug, {
      maxAge: SEVEN_DAYS,
      path: "/",
    });

    // 5. Success aana aprum user-ai Dashboard-ku redirect pannanum
    // Note: URL-la unga frontend base URL-ai automatic-ah edukkum
    const redirectUrl = new URL(req.url);
    const origin = redirectUrl.origin;

    // '/portal/[slug]' ku redirect pannuvom
    // Unga login API-la slug pass pannirunthaal easy-ah handle panna mudiyum

    return NextResponse.json(
      {
        success: true,
        message: "Verified successfully",
        slug: searchParams.get("slug"),
      },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error);
  }
}
