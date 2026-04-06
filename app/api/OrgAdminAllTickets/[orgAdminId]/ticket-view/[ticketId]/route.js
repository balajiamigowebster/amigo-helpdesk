import {
  EmployeeAdministration,
  Organization,
  Ticket,
  User,
  UserManagement,
} from "@/lib";
import CustomAttribute from "@/lib/models/Organization/CustomAttribute";
import TicketCategory from "@/lib/models/Organization/TicketCategory";
import { NextResponse } from "next/server";
import { Op } from "sequelize";

const sendError = (message, status = 500) => {
  return NextResponse.json({ success: false, message }, { status });
};

export async function GET(req, { params }) {
  try {
    const { orgAdminId, ticketId } = await params;

    if (
      !orgAdminId ||
      orgAdminId === "undefined" ||
      !ticketId ||
      ticketId === "undefined"
    ) {
      return sendError("Missing required IDs", 400);
    }

    // 1. DYNAMIC USER/ROLE CHECK
    let currentUser = null;
    let currentRole = "";
    let targetOwnerId = null;

    const adminUser = await User.findByPk(orgAdminId, {
      attributes: ["id", "firstName", "lastName", "email", "role"],
    });

    if (adminUser) {
      currentUser = adminUser;
      currentRole = adminUser.role;
      targetOwnerId = adminUser.id;
    } else {
      const employeeUser = await EmployeeAdministration.findByPk(orgAdminId);
      if (employeeUser) {
        currentUser = employeeUser;
        currentRole = employeeUser.role;
        targetOwnerId = employeeUser.ownerId;
      }
    }

    if (!currentUser) return sendError("Access Denied", 403);

    // 2. FETCH TICKET
    const ticket = await Ticket.findOne({
      where: { id: ticketId, adminId: targetOwnerId },
      include: [
        {
          model: Organization,
          as: "Organization",
          attributes: ["id", "name", "slug"],
        },
        {
          model: UserManagement,
          as: "Creator",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: EmployeeAdministration,
          as: "AssigneeEmployee",
          // FIXED: Removed organizationId because it doesn't exist in your DB table
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
      ],
    });

    if (!ticket) return sendError("Ticket not found", 404);

    // 3. ROLE BASED ASSIGNEE LOGIC
    let assigneeWhereClause = { ownerId: targetOwnerId };
    let assigneeInclude = []; // New include array for filtering

    if (currentRole === "SUPER_ADMIN" || currentRole === "OWNER") {
      assigneeWhereClause.role = [
        "HDT_ADMIN",
        "HDT_MANAGER",
        "HDT_TECH",
        "ORG_ADMIN",
        "ORG_TECH",
      ];
    } else if (currentRole === "HDT_ADMIN") {
      assigneeWhereClause.role = [
        "HDT_MANAGER",
        "HDT_TECH",
        "ORG_ADMIN",
        "ORG_TECH",
      ];
    } else if (currentRole === "HDT_TECH") {
      assigneeWhereClause.role = ["ORG_ADMIN", "ORG_TECH"];
    } else if (currentRole === "ORG_ADMIN" || currentRole === "ORG_TECH") {
      assigneeWhereClause.role = ["ORG_ADMIN", "ORG_TECH"];
      // const targetOrgId = ticket.organizationId;
      // // Note: If 'organizations' is a JSON string in DB, this LIKE query works
      // assigneeWhereClause.organizations = { [Op.like]: `%${targetOrgId}%` };

      // Inga thaan logic change: Direct column-ku pathila, Organization model-a join panni filter panrom
      assigneeInclude.push({
        model: Organization,
        as: "Organizations", // Employee model-la irukura 'as' name check pannikonga
        where: { id: ticket.organizationId },
        attributes: [],
        through: { attributes: [] },
      });
    }

    // 4. FETCH DATA PARALLEL
    const [
      allOrgs,
      allContacts,
      allEmployees,
      allCategories,
      fieldDefinitions,
    ] = await Promise.all([
      Organization.findAll({
        where: { adminId: targetOwnerId },
        attributes: ["id", "name"],
      }),
      UserManagement.findAll({
        where: { orgId: ticket.organizationId },
        attributes: ["id", "email", "firstName", "lastName"],
      }),
      EmployeeAdministration.findAll({
        where: assigneeWhereClause,
        include: assigneeInclude,
        // FIXED: Removed organizationId here too
        attributes: [
          "id",
          "email",
          "firstName",
          "lastName",
          "role",
          "isNotifyEnabled",
        ],
      }),
      TicketCategory.findAll({
        where: { orgId: ticket.organizationId },
        attributes: ["id", "name"],
      }),
      CustomAttribute.findAll({ where: { orgId: ticket.organizationId } }),
    ]);

    // 5. DATA TRANSFORMATION
    const ticketData = ticket.get({ plain: true });

    let parsedAttachments = [];

    try {
      // DB-la irunthu vara string-ah array-ah mathurom
      parsedAttachments =
        typeof ticketData.attachmentUrl === "string"
          ? JSON.parse(ticketData.attachmentUrl)
          : ticketData.attachmentUrl || [];
    } catch (e) {
      console.error("Attachment parsing error:", e);
      parsedAttachments = [];
    }

    let parsedCustom = {};
    try {
      parsedCustom =
        typeof ticketData.customAttributes === "string"
          ? JSON.parse(ticketData.customAttributes)
          : ticketData.customAttributes || {};
    } catch (e) {
      parsedCustom = {};
    }

    const formattedAttributes = fieldDefinitions.map((field) => ({
      id: field.id,
      label: field.name,
      value: parsedCustom[field.name] || "",
      type: field.type,
      options: field.options,
      isRequired: field.isRequired,
    }));

    // 6. FINAL RESPONSE
    return NextResponse.json({
      success: true,
      data: {
        ...ticketData,
        attachmentUrl: parsedAttachments,
        customAttributes: formattedAttributes,
        senderProfile: {
          senderId: currentUser.id,
          senderName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
          senderRole: currentRole,
          senderMail: currentUser.email,
        },
        attributes: {
          assignee: {
            current: ticket.AssigneeEmployee
              ? {
                  id: ticket.AssigneeEmployee.id,
                  name: `${ticket.AssigneeEmployee.firstName} ${ticket.AssigneeEmployee.lastName}`,
                  email: ticket.AssigneeEmployee.email,
                  role: ticket.AssigneeEmployee.role,
                  // organizationId remove panniyachu
                }
              : "Unassigned",
            all: allEmployees.map((emp) => ({
              id: emp.id,
              name: `${emp.firstName} ${emp.lastName}`,
              email: emp.email,
              role: emp.role,
            })),
          },
          organization: { current: ticketData.Organization, all: allOrgs },
          contact: { current: ticketData.Creator, all: allContacts },
          status: {
            current: ticketData.status,
            options: ["open", "closed", "waiting"],
          },
          priority: {
            current: ticketData.priority,
            options: ["High", "Medium", "Low"],
          },
          category: {
            current: allCategories.find(
              (c) => c.name === ticketData.category,
            ) || { name: ticketData.category || "Unspecified" },
            all: allCategories,
          },
        },
      },
    });
  } catch (error) {
    console.error("CRITICAL_ADMIN_API_ERROR:", error);
    return sendError(error.message, 500);
  }
}
