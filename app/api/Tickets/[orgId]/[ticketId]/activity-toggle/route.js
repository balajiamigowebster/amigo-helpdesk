import { Message, Ticket } from "@/lib";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    const { orgId, ticketId } = await params;
    const body = await req.json();

    // 1. ROLE BASED ACCESS CONTROL
    const allowedRoles = [
      "SUPER_ADMIN",
      "HDT_ADMIN",
      "HDT_MANAGER",
      "HDT_TECH",
      "ORG_ADMIN",
      "ORG_TECH",
    ];

    if (!allowedRoles.includes(body.senderRole)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Role not allowed to update attributes",
        },
        { status: 403 },
      );
    }

    // 2. FETCH TICKET
    const ticket = await Ticket.findOne({
      where: { id: ticketId, organizationId: orgId },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 },
      );
    }

    // 3. IDENTIFY CHANGES (From vs To Logic)
    // Frontend-la irundhu vara attributes-ai list panrom

    const fieldsToUpdate = [
      "status",
      "priority",
      "assigneeId",
      "assigneeName",
      "dueDate",
      "category",
    ];
    const updates = {};
    const activities = [];

    fieldsToUpdate.forEach((field) => {
      // Body-la antha field irundhu, adhu ticket-la irukura val-oda vera maari irundha mattum update pannu
      if (body[field] !== undefined && body[field] !== ticket[field]) {
        const oldValue = ticket[field] || "None";
        const newValue = body[field] || "None";

        updates[field] = body[field];

        // Activity content generate panrom (Screenshot-la irukura maari formatting)
        activities.push({
          type: "activity",
          content: `changed ${field} from ${oldValue} to ${newValue}`,
          activityMeta: { field, from: oldValue, to: newValue },
        });
      }
    });

    // 4. DATABASE UPDATE
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: true,
        message: "No changes detected",
      });
    }

    await ticket.update(updates);

    // 5. CREATE BULK ACTIVITY MESSAGES
    // Ovvoru change-kum individual-ah messages create pannum

    const messagePromise = activities.map((activity) =>
      Message.create({
        ticketId,
        senderId: body.senderId || "system",
        senderName: body.senderName || "Admin",
        senderRole: body.senderRole,
        type: "activity",
        content: activity.content,
        showToUser: false,
        isPrivate: false,
        activityMeta: activity.activityMeta,
      }),
    );

    await Promise.all(messagePromise);

    return NextResponse.json({
      success: true,
      message: "Ticket updated and activities logged",
      updatedFields: Object.keys(updates),
    });
  } catch (error) {
    console.error("PATCH_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
