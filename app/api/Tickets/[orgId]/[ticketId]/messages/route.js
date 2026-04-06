import { Message, Ticket, UserManagement } from "@/lib";
import { NextResponse } from "next/server";
import { Op } from "sequelize";

export async function GET(req, { params }) {
  // await Message.sync({ alter: true });
  try {
    const { ticketId, orgId } = await params;

    // 1. IDENTIFY USER ROLE
    const { searchParams } = new URL(req.url);
    const userRole = searchParams.get("role") || "USER";

    // 2. DEFINE VISIBILITY FILTER
    let messageFilter = {};

    if (userRole === "USER") {
      messageFilter = {
        isPrivate: false,
        [Op.or]: [
          {
            type: "message",
          },
          {
            [Op.and]: [
              {
                type: "activity",
              },
              {
                showToUser: true,
              },
            ],
          },
        ],
      };
    }

    // 3. FETCH TICKET WITH MESSAGES & CREATOR DETAILS
    const ticket = await Ticket.findOne({
      where: {
        id: ticketId,
        organizationId: orgId,
      },
      include: [
        {
          model: Message,
          as: "messages",
          where: messageFilter,
          required: false,
        },
        {
          model: UserManagement,
          as: "Creator", // Association alias name
          attributes: ["email"], // Email mattum eduthukkalaam
        },
      ],
      order: [
        [
          {
            model: Message,
            as: "messages",
          },
          "createdAt",
          "ASC",
        ],
      ],
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // 4. PREPARE RESPONSE DATA (Adding Creator Object)
    // Sequelize object-ai JSON-ah maathi custom data sethu anuppuvom

    const ticketData = ticket.toJSON();

    if (ticketData.messages && ticketData.messages.length > 0) {
      ticketData.messages = ticketData.messages.map((msg) => {
        if (msg.type === "activity" && typeof msg.activityMeta === "string") {
          try {
            msg.activityMeta = JSON.parse(msg.activityMeta);
          } catch (e) {
            msg.activityMeta = null; // Error vandha null-ah vidu
          }
        }

        // 2. ✅ Parse attachmentUrl if it's a string (Intha logic thaan unga problem-ah fix pannum)
        if (typeof msg.attachmentUrl === "string") {
          try {
            msg.attachmentUrl = JSON.parse(msg.attachmentUrl);
          } catch (error) {
            // Parse panna mudiyalana (empty string or invalid) empty array-va kuduthiduvom
            msg.attachmentUrl = [];
          }
        }

        return msg;
      });
    }

    const responseData = {
      ...ticketData,
      creatorInfo: {
        email: ticket.Creator.email || "System/Unknown",
        createdAt: ticket.createdAt, // Ticket create panna date & time
      },
    };

    const response = NextResponse.json(
      {
        success: true,
        roleApplied: userRole,
        data: responseData,
      },
      { status: 200 },
    );

    // Idhu dhaan server load-ai kuraikkum:
    // Browser 5s varaikkum cache-ai use pannikkum, adhuku apparam fresh data ketkum

    response.headers.set(
      "Cache-Control",
      "public, s-maxage=5, stale-while-revalidate=10",
    );

    return response;
  } catch (error) {
    console.error("GET_TICKET_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req, { params }) {
  // await Message.sync({ alter: true });
  try {
    const { ticketId, orgId } = await params;
    const body = await req.json();

    // 1. BASIC VALIDATION
    if (!body.content || body.content.trim() === "") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    if (!body.senderId || !body.senderRole) {
      return NextResponse.json(
        { error: "Sender details missing" },
        { status: 400 },
      );
    }

    // 2. TICKET EXISTENCE CHECK
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // EXTRA SECURITY: Intha ticket indha organization-ku thaan sondhama?
    if (orgId && ticket.organizationId !== orgId) {
      return NextResponse.json(
        {
          error: "Unauthorized: Ticket does not belong to this organization",
          // data: {
          //   orgId: orgId,
          //   ticketOrgId: ticket.organizationId,
          // },
        },
        { status: 403 },
      );
    }

    // 3. ROLE VALIDATION (ENUM Check)
    const validRoles = [
      "SUPER_ADMIN",
      "HDT_ADMIN",
      "HDT_MANAGER",
      "HDT_TECH",
      "ORG_ADMIN",
      "ORG_TECH",
      "USER",
    ];
    if (!validRoles.includes(body.senderRole)) {
      return NextResponse.json(
        { error: "Invalid sender role" },
        { status: 400 },
      );
    }

    // 4. DATA SANITIZATION & CREATION
    const newMessage = await Message.create({
      ticketId,
      senderId: body.senderId,
      senderName: body.senderName || "System",
      senderMail: body.senderMail || null, // Body-la irundhu mail-ai save panrom
      senderRole: body.senderRole,
      content: body.content.trim(),
      type: body.type || "message",
      // Logic for Internal Notes (Private)
      isPrivate: body.isPrivate === true || body.isPrivate === "true",
      // Activity visibility control
      showToUser: body.showToUser !== undefined ? body.showToUser : true,
      activityMeta: body.activityMeta || null,
      // Attachments (Cloudinary integration ready)
      attachmentUrl: body.attachmentUrl || null,
      attachmentType: body.attachmentType || null,
      attachmentPublicId: body.attachmentPublicId || null,
    });

    // 5. SUCCESS RESPONSE
    return NextResponse.json(
      {
        message: "Message sent successfully",
        data: newMessage,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST_MESSAGE_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
