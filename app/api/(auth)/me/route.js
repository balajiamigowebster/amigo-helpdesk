import { NextResponse } from "next/server";
import { headers } from "next/headers";
import User from "@/lib/models/UserModels/User";
import { EmployeeAdministration, Organization } from "@/lib";

export async function GET() {
  try {
    // 1. Middleware set panna header-la irunthu User ID-ah edukkuroam
    const headerList = await headers();
    const userId = headerList.get("user-id");
    const userRole = headerList.get("user-role"); // Middleware-la irundhu varudhu

    // 2. User ID illana unauthorized
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required", userID: userId },
        { status: 401 },
      );
    }

    console.log("getme-USERID", userId);

    let userData = null;
    let type = "admin";
    let currentOrgId = null;

    // 1. Role-ai check panni specific table-la mattum query pannalam
    const isEmployeeRole = userRole === "ORG_TECH" || userRole === "ORG_ADMIN";

    if (isEmployeeRole) {
      userData = await EmployeeAdministration.findByPk(userId, {
        attributes: { exclude: ["password"] },
        include: [
          {
            model: Organization,
            as: "Organizations",
            attributes: ["id"],
            through: { attributes: [] },
          },
        ],
      });
      type = "employee";
      // 2. Intha employee-ku assign aana mudhal Organization ID-ah edukkurom
      if (userData?.Organizations && userData.Organizations.length > 0) {
        currentOrgId = userData.Organizations[0].id;
      }
    } else {
      userData = await User.findByPk(userId, {
        attributes: {
          exclude: ["password"],
        },
      });
      type = "admin";
    }

    // 2. Extra Safety: Oru vaela table query fail aana alternative table-la oru check
    if (!userData) {
      // Just in case role header mismatch aana logic
      userData =
        type === "admin"
          ? await EmployeeAdministration.findByPk(userId, {
              attributes: { exclude: ["password"] },
            })
          : await User.findByPk(userId, {
              attributes: { exclude: ["password"] },
            });

      if (userData) type = type === "admin" ? "employee" : "admin";
    }

    if (!userData) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 },
      );
    }

    // --- Response Construction ---
    const userResponse = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      setupStep: userData.setupStep,
      isEmailVerified: userData.isEmailVerified ?? userData.isVerified ?? false,
      organizationId: currentOrgId,
    };

    // console.log("GETMERESPONSE", userResponse);

    // 4. Success Response
    return NextResponse.json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.error("GetMe Error:", error.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
