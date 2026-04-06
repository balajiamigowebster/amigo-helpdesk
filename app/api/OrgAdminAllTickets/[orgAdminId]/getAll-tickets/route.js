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
  while (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch (e) {
      return [];
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
      // 2. Check if the login is an Employee
      const employee = await EmployeeAdministration.findByPk(orgAdminId);
      if (!employee) {
        return NextResponse.json(
          { success: false, message: "Account not found" },
          { status: 404 },
        );
      }

      // Base: Employee owner-oda tickets thaan default
      whereCondition.adminId = employee.ownerId;

      // --- SPECIFIC ROLE FILTERING ---

      // Case A: ORG_TECH - Only show tickets assigned to them
      if (employee.role === "ORG_TECH") {
        whereCondition.assigneeId = orgAdminId;
      }
      // Case B: ORG_ADMIN or Specific access roles
      else if (
        employee.role === "ORG_ADMIN" ||
        employee.accessScope === "SPECIFIC"
      ) {
        const allowedOrgs = parseOrganizations(employee.organizations);
        if (allowedOrgs.length > 0) {
          whereCondition.organizationId = { [Op.in]: allowedOrgs };
        } else {
          return NextResponse.json({ success: true, count: 0, data: [] });
        }
      }
    }

    // 3. Status Filters (User side selection)
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

    const formattedTickets = tickets.map((ticket) =>
      ticket.get({ plain: true }),
    );

    return NextResponse.json({
      success: true,
      count: formattedTickets.length,
      data: formattedTickets,
    });
  } catch (error) {
    return handleError(error);
  }
}
