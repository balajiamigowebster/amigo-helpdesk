import { NextResponse } from "next/server";
import sequelize from "@/lib/config/db";
import { Op } from "sequelize";
import { Organization, Ticket, User, UserManagement } from "@/lib";
import Message from "@/lib/models/tickets/Message";

// --- Custom Error Handler ---

const handleError = (error) => {
  console.error("API_ERROR:", error);
  if (error.name === "SequelizeUniqueConstraintError") {
    return NextResponse.json(
      {
        success: false,
        error: "Display ID already exists. Try again.",
        message: error.message,
      },
      { status: 400 },
    );
  }
  if (error.name === "SequelizeValidationError") {
    return NextResponse.json(
      { success: false, error: error.errors[0].message },
      { status: 400 },
    );
  }
  return NextResponse.json(
    { success: false, error: error.message },
    { status: 500 },
  );
};

// Organization rank-ai porutthu C, D, E nu letters generate panna intha function use aagudhu
function getLetterPrefix(index) {
  // A-Z ulla alphabet string
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  // Index-ai 26-aal divide panni varra remainder-ai vechu letter-ai edukrom
  const letter = alphabet[index % 26];
  // 26 letters thanduna AA, BB nu repeat panna count calculate panrom
  const repeatCount = Math.floor(index / 26) + 1;
  // Letter-ai repeat count-padi return panrom (e.g., C, CC, CCC)
  return letter.repeat(repeatCount);
}

// Ticket create panna use aagum POST method
export async function POST(req, { params }) {
  // await Ticket.sync({ alter: true });
  try {
    // URL-il irundhu orgId-ai eduthu await panrom
    const { orgId } = await params;
    // Request body-il user anuppiya details-ai edukrom

    const formData = await req.formData();

    console.log("FORMDATA", formData);

    // FormData-vil irundhu ovvoru field-aiyum get() moolam edukrom
    const summary = formData.get("summary");
    const description = formData.get("description");
    const creatorId = formData.get("creatorId");
    const creatorEmail = formData.get("creatorEmail");
    const phone = formData.get("phone");
    const priority = formData.get("priority");
    const category = formData.get("category");
    const dueDate = formData.get("dueDate");
    const creatorType = formData.get("creatorType") || "portal_user";

    // JSON objects (customAttributes) formData-la string-aa varum, adhai parse panrom
    const customAttributesRaw = formData.get("customAttributes");
    const customAttributes = customAttributesRaw
      ? JSON.parse(customAttributesRaw)
      : {};

    // 2. Attachments (Storing the whole object array: [{url, publicId, name, type}])
    const attachmentUrlRaw = formData.get("attachmentUrl");
    const attachmentUrl = attachmentUrlRaw ? JSON.parse(attachmentUrlRaw) : [];

    if (!summary || !description) {
      return NextResponse.json(
        { success: false, error: "Summary and Description are required" },
        { status: 400 },
      );
    }

    // 1. Organization fetch (Intha org-oda Admin yarunu theriyanum)
    // Database-la intha orgId-ku data irukka nu check panrom
    const org = await Organization.findByPk(orgId);

    if (!org) {
      return NextResponse.json(
        { success: false, error: "Org not found" },
        { status: 404 },
      );
    }

    // Database operations-ai secure-aa seiya transaction start panrom
    const result = await sequelize.transaction(async (t) => {
      // 2. PREFIX LOGIC (C, D, E...)
      // Intha Org-oda Admin-ku keezha ulla ellaa org-aiyum creation order-padi edukrom
      const adminOrgs = await Organization.findAll({
        // Intha Admin create panna orgs mattum (Isolation logic)
        where: {
          adminId: org.adminId,
        },
        attributes: ["id"],
        // Creation date-padi sort panrom
        order: [["createdAt", "ASC"]],
        transaction: t,
      });

      // Admin-oda organizations list-la intha org entha index-la irukku nu paarkurom
      const orgRank = adminOrgs.findIndex((o) => o.id === orgId);
      // 3. PREFIX LOGIC UPDATE:
      // index 0 (first org) -> rank + 2 = 2 ('C' alphabet-la)
      const charPart = getLetterPrefix(orgRank + 2);
      // Ippo prefix-la eppovum '1' serthu vara update pannirukaen
      // Result: C1, D1, E1...
      const prefix = `${charPart}`;

      // 3. SEQUENCE LOGIC (Counter based)
      // Organization table-la irukura counter-ai 1 increase panrom
      const updatedOrg = await org.increment("ticketDisplayIdCounter", {
        by: 1,
        transaction: t,
      });

      // Increment aanadhukku apram ulla pudhu value-vai edukrom
      // Note: Sequelize-la increment panna udane instance update aagidum
      const nextTicketNum = updatedOrg.ticketDisplayIdCounter;
      // Number-ai string-aa maathi, min 4 digits irukura maadhiri 0001 nu pad panrom
      const sequenceStr = nextTicketNum.toString().padStart(4, "0");
      // Current year-ai edukrom (e.g., 2026)
      const currentYear = new Date().getFullYear();

      // Final ID format-ai uruvaakukirom: Prefix + Year + Sequence (C120260001)
      const generatedDisplayId = `${prefix}${nextTicketNum}`;

      // 4. Ticket Creation
      // Ella details matrum generated displayId-ai vechu ticket-ai database-la create panrom

      const newTicket = await Ticket.create(
        {
          displayId: generatedDisplayId,
          summary,
          description,
          organizationId: orgId,
          adminId: org.adminId, // Adding Account Owner ID from Org table
          orgSlug: org.slug,
          creatorId,
          creatorType: creatorType,
          creatorEmail,
          phone: phone || null,
          customAttributes: customAttributes || {},
          attachmentUrl: attachmentUrl || null,
          priority: priority || "Medium",
          status: "open",
          category: category || "Unspecified",
          assigneeName: "Unassigned",
          dueDate: dueDate || null,
          reopenCount: 0,
        },
        { transaction: t },
      );

      // --- POPULATE LOGIC START ---
      // Ticket create aanadhuku apram, adhai thirumba find panni User details-ai include panrom
      return await Ticket.findByPk(newTicket.id, {
        include: [
          {
            model: UserManagement,
            as: "Creator",
            attributes: ["id", "firstName", "lastName", "email"],
          },
          {
            model: Organization, // Pudhu include inga dhaan varum
            as: "Organization", // lib/index.js-la kudutha same alias
            attributes: ["id", "name", "slug"], // Org name and slug mattum podhum
          },
        ],

        transaction: t,
      });
    });

    // Success response-ai result data-vudan return panrom
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    // Edhavadhu error vandhaal terminal-la log panrom
    console.error("ERROR:", error);
    return handleError(error);
  }
}

export async function GET(req, { params }) {
  try {
    const { orgId } = await params;

    const { searchParams } = new URL(req.url);

    // Intha parameters frontend query string-la irundhu varum
    const creatorId = searchParams.get("creatorId");
    const adminId = searchParams.get("adminId"); // Account Owner ID for cross-org view
    const role = searchParams.get("role"); // 'admin' or 'portal_user'
    const status = searchParams.get("status");

    // Basic Filter: Intha organization tickets mattum dhaan eppovum varanum
    let filterConditions = {};

    /**
     * Filtering Logic:
     * 1. Account Owner (Admin) Dashboard:
     * 'adminId' irundha, avaroda ELLA organizations tickets-um varum.
     * 2. Portal User:
     * Avanga specific user ID (creatorId) tickets mattum varum.
     * 3. Specific Org View:
     * 'orgId' irundha andha specific company tickets mattum varum.
     */

    if (role === "admin" && adminId) {
      filterConditions.adminId = adminId;
    } else if (role === "portal_user" && creatorId) {
      filterConditions.creatorId = creatorId;
      filterConditions.creatorType = "portal_user";
      filterConditions.organizationId = orgId;
    } else {
      filterConditions.organizationId = orgId;
    }

    // Filter object-ai ready panrom

    if (status) {
      filterConditions.status = status;
    }

    // 1. Database-la irundhu tickets-ai fetch panrom
    const tickets = await Ticket.findAll({
      where: filterConditions,
      include: [
        {
          // Portal User create pannirundha intha object-la data varum
          model: UserManagement,
          as: "Creator",
          attributes: ["id", "firstName", "lastName", "email"],
          required: false,
        },
        {
          // Admin create pannirundha intha object-la data varum
          model: User,
          as: "AdminCreator",
          attributes: ["id", "firstName", "lastName", "email"],
          required: false,
        },
        {
          model: Organization,
          as: "Organization",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    // --- PARSING LOGIC START ---
    // Database-la irundhu vara JSON string-ai pure object/array-va matharom
    const formattedTickets = tickets.map((ticket) => {
      // Sequelize instance-ai plain JavaScript object-ah mathurom
      const ticketData = ticket.get({ plain: true });

      try {
        // customAttributes parse panrom (Object)
        ticketData.customAttributes = ticketData.customAttributes
          ? JSON.parse(ticketData.customAttributes)
          : {};

        // attachmentUrl parse panrom (Array of Objects)
        ticketData.attachmentUrl = ticketData.attachmentUrl
          ? JSON.parse(ticketData.attachmentUrl)
          : [];
      } catch (parseError) {
        console.error(
          "Parsing error for ticket ID:",
          ticketData.id,
          parseError,
        );
        ticketData.customAttributes = ticketData.customAttributes || {};
        ticketData.attachmentUrl = ticketData.attachmentUrl || [];
      }
      return ticketData;
    });

    return NextResponse.json(
      {
        success: true,
        count: formattedTickets.length,
        data: formattedTickets,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET_TICKETS_ERROR:", error);
    return handleError(error);
  }
}
