import {
  GeneralSettings,
  Organization,
  User,
  EmployeeAdministration,
} from "@/lib";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const userId = req.headers.get("user-id");
    const { id: orgId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // 1. Target Admin ID-ai kandupidikanum
    let targetAdminId = userId;

    // User table-la check panrom (Super Admin-ah nu)
    const isOwner = await User.findByPk(userId);

    if (!isOwner) {
      // User table-la illai na, kandippa Employee table-la iruppaanga
      const employee = await EmployeeAdministration.findByPk(userId);

      if (employee) {
        // Employee-oda original owner (Super Admin) ID-ai edukkurom
        targetAdminId = employee.ownerId;

        // --- OPTIONAL SECURITY CHECK ---
        // Intha employee-ku intha specific organization-ku access irukka-nu check panna:
        if (employee.accessScope === "SPECIFIC") {
          const assignedOrgs = employee.organizations || [];
          if (!assignedOrgs.includes(orgId)) {
            return NextResponse.json(
              { success: false, error: "Access denied to this organization" },
              { status: 403 },
            );
          }
        }
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    // 2. Ippo targetAdminId-ai vaitchu query panrom
    const org = await Organization.findOne({
      where: {
        id: orgId,
        adminId: targetAdminId, // Ippo ithu Super Admin ID or Employee-oda Owner ID
      },
      include: [
        {
          model: GeneralSettings,
          as: "Settings",
        },
      ],
    });

    if (!org) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: org }, { status: 200 });
  } catch (error) {
    console.error("Single Org Fetch Error:", error);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
