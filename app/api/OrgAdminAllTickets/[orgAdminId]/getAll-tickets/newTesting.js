import {
  EmployeeAdministration,
  Message,
  Organization,
  Ticket,
  User,
  UserManagement,
} from "@/lib";
import { NextResponse } from "next/server";
import { Op } from "sequelize";

const handleError = (error) => {
  console.error("API_ERROR:", error);
  return NextResponse.json({ error: error.message }, { status: 500 });
};

// Helper function to handle double-stringified JSON data
const parseOrganizations = (data) => {
  let parsed = data;
  // Screenshot-padi data escaped string-ah iruntha, loop panni array varuvara parse pannum
  while (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch (e) {
      return []; // Parsing fail aana empty array
    }
  }
  return Array.isArray(parsed) ? parsed : [];
};

export async function GET(req, { params }) {
  try {
    const { orgAdminId } = await params;
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    if (!orgAdminId || orgAdminId === "undefined") {
      return NextResponse.json(
        { success: false, message: "Admin ID is required." },
        { status: 400 },
      );
    }

    let whereCondition = {};

    // 1. Check if the login is an Owner (Super Admin)
    const userCheck = await User.findByPk(orgAdminId);

    if (userCheck) {
      whereCondition.adminId = orgAdminId;
    } else {
      // 2. Check if the login is an Employee (HDT_TECH, ORG_ADMIN, etc.)
      const employee = await EmployeeAdministration.findByPk(orgAdminId);
      if (!employee) {
        return NextResponse.json(
          { success: false, message: "Account not found" },
          { status: 404 },
        );
      }

      // Base: Employee owner-oda tickets thaan paakanum
      whereCondition.adminId = employee.ownerId;

      // --- IMPROVED ORGANIZATION FILTERING WITH DOUBLE-PARSE FIX ---

      if (
        employee.role === "ORG_ADMIN" ||
        employee.accessScope === "SPECIFIC"
      ) {
        const allowedOrgs = parseOrganizations(employee.organizations);

        if (allowedOrgs.length > 0) {
          // ORG_ADMIN or Specific access roles-ku assign panna organizations tickets mattum thaan pakanum
          whereCondition.organizationId = { [Op.in]: allowedOrgs };
        } else {
          // Organizations assign pannala na tickets kaata koodathu
          return NextResponse.json({ success: true, count: 0, data: [] });
        }
      }

      // Case: ORG_TECH logic
      else if (employee.role === "ORG_TECH") {
        whereCondition.assigneeId = orgAdminId;
      }
    }

    // 3. Status Filters
    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "unassigned") {
        whereCondition.assigneeName = "Unassigned";
      } else if (statusFilter === "my-tickets") {
        whereCondition.assigneeId = orgAdminId;
      } else {
        whereCondition.status = statusFilter;
      }
    }

    // 4. Fetch Tickets
    const tickets = await Ticket.findAll({
      where: whereCondition,
      include: [
        {
          model: EmployeeAdministration,
          as: "AssigneeEmployee",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: UserManagement,
          as: "Creator",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: User,
          as: "AdminCreator",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: Organization,
          as: "Organization",
          attributes: ["id", "name", "slug"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Formatting response logic
    const formattedTickets = tickets.map((ticket) => {
      const ticketData = ticket.get({ plain: true });
      return ticketData;
    });

    return NextResponse.json({
      success: true,
      count: formattedTickets.length,
      data: formattedTickets,
    });
  } catch (error) {
    return handleError(error);
  }
}
