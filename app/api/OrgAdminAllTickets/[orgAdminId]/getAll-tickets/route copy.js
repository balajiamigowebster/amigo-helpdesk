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

    // 1. Check if the login is an Owner
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

      // Base: Employee owner-oda tickets thaan paakanum
      whereCondition.adminId = employee.ownerId;

      // --- ORGANIZATION FILTER (SPECIFIC ACCESS) ---
      if (employee.accessScope === "SPECIFIC") {
        let allowedOrgs = employee.organizations;

        // JSON Parsing
        if (typeof allowedOrgs === "string") {
          try {
            allowedOrgs = JSON.parse(allowedOrgs);
          } catch (error) {
            allowedOrgs = [];
          }
        }

        // Variable ippo block-ku veliya check pannama ulla thaan check panrom
        if (Array.isArray(allowedOrgs) && allowedOrgs.length > 0) {
          whereCondition.organizationId = { [Op.in]: allowedOrgs };
        } else {
          // SPECIFIC access aanaal list kaali-na, results vara koodathu
          return NextResponse.json({ success: true, count: 0, data: [] });
        }
      }

      // --- ROLE FILTER (ORG_TECH) ---
      if (employee.role === "ORG_TECH") {
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

    // 5. Data Parsing
    const formattedTickets = tickets.map((ticket) => {
      const ticketData = ticket.get({ plain: true });
      const safeParse = (data, fallback) => {
        if (!data) return fallback;
        if (typeof data === "object") return data;
        try {
          return JSON.parse(data);
        } catch (e) {
          return fallback;
        }
      };
      ticketData.customAttributes = safeParse(ticketData.customAttributes, {});
      ticketData.attachmentUrl = safeParse(ticketData.attachmentUrl, []);
      return ticketData;
    });

    return NextResponse.json(
      { success: true, count: formattedTickets.length, data: formattedTickets },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error);
  }
}
