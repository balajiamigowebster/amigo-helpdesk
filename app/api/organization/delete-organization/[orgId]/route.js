import { User } from "@/lib";
import Organization from "@/lib/models/Organization/Organization";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    // 1. URL path-il irunthu orgId-ai edukkiroam
    // Folder name [orgId] enbathal params.orgId nu kidaikum
    const { orgId } = await params;

    // 2. Middleware vali-ah varum user-id (Security check)
    const userId = req.headers.get("user-id");

    // console.log(orgId);

    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID is required in the URL" },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Admin ID not found" },
        { status: 401 },
      );
    }

    // 2. Antha Organization irukira nu check pannuvom
    const org = await Organization.findOne({
      where: {
        id: orgId,
        adminId: userId,
      },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found or you don't have permission" },
        { status: 404 },
      );
    }

    // 4. Record-ai delete pannuvom
    // User update logic-ai thookiyachu, so user status disturb aagathu

    await org.destroy();

    return NextResponse.json(
      {
        message: "Organization deleted successfully and user status reset.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
