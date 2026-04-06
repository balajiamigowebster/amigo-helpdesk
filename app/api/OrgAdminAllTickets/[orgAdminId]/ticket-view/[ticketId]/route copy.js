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

const sendError = (message, status = 500) => {
  return NextResponse.json({ success: false, message }, { status });
};

export async function GET(req, { params }) {
  try {
    // 1. Params-la irunthu adminId matrum ticketId edukkurom
    const { orgAdminId, ticketId } = await params;

    // --- SECURITY & VALIDATION CHECKS ---

    // 2. Check if IDs exist
    if (!orgAdminId || orgAdminId === "undefined") {
      return sendError("Admin ID is required", 400);
    }

    if (!ticketId || ticketId === "undefined") {
      return sendError("Ticket ID is required", 400);
    }

    // --- DYNAMIC USER/EMPLOYEE CHECK ---
    let currentUser = null;
    let currentRole = "";
    let targetOwnerId = null; // Ithu thaan namma query-ku use panna pora actual boss ID

    // 1. First User (Admin/SuperAdmin) table-la check pannrom
    const adminUser = await User.findByPk(orgAdminId, {
      attributes: ["id", "firstName", "lastName", "email", "role"],
    });

    if (adminUser) {
      currentUser = adminUser;
      currentRole = adminUser.role;
      targetOwnerId = adminUser.id;
    } else {
      // 2. User table-la illana, Employee table-la check pannrom
      const employeeUser = await EmployeeAdministration.findByPk(orgAdminId, {
        attributes: ["id", "firstName", "lastName", "email", "role", "ownerId"],
      });

      if (employeeUser) {
        currentUser = employeeUser;
        currentRole = employeeUser.role;
        targetOwnerId = employeeUser.ownerId; // Employee login panna, avaroda Boss ID thaan target
      }
    }

    if (!currentUser) {
      return sendError("Access Denied: User not found", 403);
    }

    // 3. Admin User Existence Check (Optional but recommended for Security)
    // Idhu admin dummy-aa illama real user-aa nu confirm pannum

    // 4. Ticket Fetch with Admin Ownership Validation
    const ticket = await Ticket.findOne({
      where: {
        id: ticketId,
        adminId: targetOwnerId,
      },
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
          model: User,
          as: "AdminCreator",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: EmployeeAdministration,
          as: "AssigneeEmployee",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "isNotifyEnabled",
          ],
        },
      ],
    });
    // 5. Ticket Existence & Ownership Check
    if (!ticket) {
      // Security Tip: 404 kuduppathu nallathu, illaiyeil 'Unauthorized' nu sonna
      // hacker-ku antha ticket vera admin kitta irukkunu therinjidum.
      return sendError(
        "Ticket not found or you don't have permission to view it",
        404,
      );
    }

    // 3. Parallel Data Fetching for Dropdowns (All Orgs, Contacts, Employees, Categories)
    // Inga adminId matrum orgId vachu matha dropdown data-vai edukkuram
    const [
      allOrgs,
      allContacts,
      allEmployees,
      allCategories,
      fieldDefinitions,
    ] = await Promise.all([
      Organization.findAll({
        where: {
          adminId: targetOwnerId,
        },
        attributes: ["id", "name"],
      }),
      UserManagement.findAll({
        where: {
          orgId: ticket.organizationId,
        },
        attributes: ["id", "email", "firstName", "lastName"],
      }),
      EmployeeAdministration.findAll({
        where: {
          ownerId: targetOwnerId,
        },
        attributes: ["id", "email", "firstName", "lastName", "isNotifyEnabled"],
      }),
      TicketCategory.findAll({
        where: {
          orgId: ticket.organizationId,
        },
        attributes: ["id", "name"],
      }),
      CustomAttribute.findAll({
        where: {
          orgId: ticket.organizationId,
        },
      }),
    ]);

    // --- DATA TRANSFORMATION ---
    const ticketData = ticket.get({ plain: true });

    // 6. Safe Custom Attributes Parsing
    let formattedAttributes = [];

    try {
      const rawAttrs =
        typeof ticketData.customAttributes === "string"
          ? JSON.parse(ticketData.customAttributes)
          : ticketData.customAttributes || {};

      // Name-ai key-ah vachu definitions-ai map seigirom
      formattedAttributes = fieldDefinitions.map((field) => {
        const fieldName = field.name;
        const userValue = rawAttrs[fieldName] || "";

        // UI Type Mapping logic
        let uiType = "text"; // Default
        const configType = field.type.toLowerCase();

        if (configType === "number" || configType === "phone")
          uiType = "number";
        else if (configType === "date") uiType = "date";
        else if (configType === "list") uiType = "select";
        else if (configType === "text area") uiType = "textarea";
        else if (configType === "text field") uiType = "text";

        return {
          id: field.id,
          label: fieldName,
          value: userValue,
          type: uiType, // Frontend intha type-ai vachu input-ai decide pannum
          options: field.options || null, // List-aga iruntha dropdown options
          isRequired: field.isRequired,
        };
      });

      // formattedAttributes = Object.entries(rawAttrs).map(([label, value]) => ({
      //   label: label,
      //   value: value || "N/A",
      //   type: typeof value,
      // }));
    } catch (parseError) {
      console.error("Custom Attributes Parse Error:", parseError);
      formattedAttributes = [];
    }

    // 7. Success Response
    return NextResponse.json({
      success: true,
      data: {
        ...ticketData,
        customAttributes: formattedAttributes,

        // Full Name Setup
        creatorName: ticketData.Creator
          ? `${ticketData.Creator.firstName} ${ticketData.Creator.lastName}`.trim()
          : "Unknown Creator",
        senderProfile: {
          senderId: currentUser.id,
          senderName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
          senderRole: currentRole,
          senderMail: currentUser.email,
        },
        formattedCreatedDate: new Date(ticketData.createdAt).toLocaleString(
          "en-US",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          },
        ),
        attributes: {
          muteEmailNotifications:
            ticketData.AssigneeEmployee?.isNotifyEnabled ?? true,
          organization: {
            current: ticketData.Organization,
            all: allOrgs,
          },
          contact: {
            current: ticketData.Creator,
            all: allContacts,
            allEmployee: allEmployees,
          },
          assignee: {
            current: ticketData.assigneeName || "Unassigned",
            all: allEmployees,
          },
          status: {
            current: ticketData.status,
            options: ["open", "closed", "waiting"],
          },
          priority: {
            current: ticketData.priority,
            options: ["High", "Medium", "Low"],
          },
          dueDate: ticketData.dueDate,
          category: {
            current: allCategories.find(
              (c) => c.name === ticketData.category,
            ) || {
              name: ticketData.category || "Unspecified",
            },
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
