import { Ticket } from "@/lib";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    const { orgId, ticketId } = await params;

    const ticket = await Ticket.findOne({
      where: {
        id: ticketId,
        organizationId: orgId,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 },
      );
    }

    // --- Lowercase Toggle Logic ---
    const oldStatus = ticket.status;
    const nextStatus = oldStatus === "closed" ? "open" : "closed";

    // 1. Update Ticket Status
    await ticket.update({ status: nextStatus });

    // 2. Automatic Activity Message Generation
    // Inga senderId and senderName-ah neenga Auth session-la irundhu edukkanum
    // Ippo dummy-ah "Admin"-nu vaikiraen

    // await Message.create({
    //   ticketId: ticketId,
    //   senderId: "system-admin-id", // Replace with req.user.id if available
    //   senderName: "Admin",
    //   senderRole: "admin",
    //   type: "activity",
    //   content: `changed ticket status from **${oldStatus}** to **${nextStatus}**`,
    //   activityMeta: { from: oldStatus, to: nextStatus }
    // });

    return NextResponse.json({
      success: true,
      message: `Ticket ${nextStatus === "closed" ? "closed" : "reopened"} successfully`,
      data: { status: nextStatus },
    });
  } catch (error) {
    console.error("Toggle Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
