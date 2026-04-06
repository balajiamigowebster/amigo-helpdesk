import Organization from "@/lib/models/Organization/Organization";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    const body = await req.json();

    const {
      orgId,
      organizationName,
      domain,
      jobTitle,
      country,
      username, // frontend-la irundhu varudhu
    } = body;

    // 1. Validation
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // 2. Find existing organization
    const org = await Organization.findByPk(orgId);

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // 3. Update fields (only if provided)
    if (organizationName !== undefined) org.name = organizationName;
    if (domain !== undefined) org.domain = domain;
    if (jobTitle !== undefined) org.jobTitle = jobTitle;
    if (country !== undefined) org.country = country;
    if (username !== undefined) org.adminUsername = username;

    // 4. Save changes
    await org.save();

    // 5. Return updated record
    return NextResponse.json(
      {
        success: true,
        message: "Organization updated successfully",
        organization: org,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ORG_UPDATE_ERROR:", error);

    // Unique domain error handle
    if (error.name === "SequelizeUniqueConstraintError") {
      return NextResponse.json(
        { error: "Domain already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
