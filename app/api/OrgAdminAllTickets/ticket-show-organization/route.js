import {
  EmployeeAdministration,
  Organization,
  TicketCategory,
  User,
  UserManagement,
} from "@/lib";
import CustomAttribute from "@/lib/models/Organization/CustomAttribute";
import UserPortal from "@/lib/models/Organization/UserPortal";
import { NextResponse } from "next/server";
import { Op } from "sequelize";

export async function GET(req) {
  try {
    const userId = req.headers.get("user-id");
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId"); // Specific org details-kaga

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    let targetOwnerId = userId;
    let allowedOrgIds = null;

    const isOwner = await User.findByPk(userId);

    if (!isOwner) {
      const employee = await EmployeeAdministration.findByPk(userId, {
        attributes: ["ownerId", "accessScope", "organizations"],
      });

      if (employee) {
        targetOwnerId = employee.ownerId;
        if (employee.accessScope === "SPECIFIC") {
          let orgs = employee.organizations;
          if (typeof orgs === "string") {
            try {
              let parsedOrgs = JSON.parse(orgs);
              if (typeof parsedOrgs === "string")
                parsedOrgs = JSON.parse(parsedOrgs);
              orgs = parsedOrgs;
            } catch (e) {
              orgs = [];
            }
          }
          allowedOrgIds = Array.isArray(orgs) ? orgs : [];
        }
      }
    }

    // --- Step 2: Query Construction ---

    const whereClause = { adminId: targetOwnerId };

    // Filter by specific org if provided, else filter by allowed list
    if (orgId) {
      whereClause.id = orgId;
    } else if (allowedOrgIds && allowedOrgIds.length > 0) {
      whereClause.id = { [Op.in]: allowedOrgIds };
    } else if (!isOwner && allowedOrgIds !== null) {
      return NextResponse.json({ success: true, data: [] });
    }

    // --- Step 3: Fetch with Includes ---

    const organizations = await Organization.findAll({
      where: whereClause,
      include: [
        {
          model: CustomAttribute,
          as: "Attributes",
          required: false,
        },
        {
          model: UserManagement, // Changed from UserPortal
          as: "Contacts", // Alias matches the association above
          attributes: ["id", "firstName", "lastName", "email"],
          required: false,
        },
        {
          model: TicketCategory, // Categories-um sethu eduthukkalaam ticket create-kaga
          as: "Categories",
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json({ success: true, data: organizations });
  } catch (error) {
    console.error("TICKET_ORG_FETCH_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
