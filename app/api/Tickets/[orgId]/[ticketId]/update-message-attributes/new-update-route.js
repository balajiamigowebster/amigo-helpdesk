import { Message, Ticket } from "@/lib";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    // 1. GET IDS FROM PARAMS
    // orgId inga security guard-ah use aagum
    const { ticketId, orgId } = await params;
    const { field, newValue, adminId, adminName, senderRole } =
      await req.json();

    // 2. VALID FIELDS CHECK
    // 'orgId' ithula illa, so primary organization-ai yaarum thappa maatha mudiyathu
    const allowedFields = ["status", "priority", "assigneeId", "categoryId"];
    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { error: `Update not allowed for field: ${field}` },
        { status: 400 },
      );
    }

    // 3. TICKET EXISTENCE CHECK
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // 4. MANDATORY SECURITY CHECK
    // Ticket vera organization-ku sondhama irundha block pannidum

    if (ticket.organizationId !== orgId) {
      return NextResponse.json(
        { error: "Unauthorized: Ticket does not belong to your organization" },
        { status: 403 },
      );
    }

    const oldValue = ticket[field];

    // No change na return pannidalam
    if (oldValue === newValue) {
      return NextResponse.json({ message: "No changes detected" });
    }

    // 5. UPDATE THE TICKET
    ticket[field] = newValue;

    await ticket.save();

    // 6. GENERATE ACTIVITY CONTENT
    let activityContent = "";

    if (field === "status")
      activityContent = `changed status from ${oldValue} to ${newValue}`;
    if (field === "priority")
      activityContent = `changed priority from ${oldValue} to ${newValue}`;
    if (field === "assignedToId") activityContent = `reassigned the ticket`;
    if (field === "categoryId")
      activityContent = `changed category to ${newValue}`;

    // 7. CREATE AUTOMATIC ACTIVITY (In Messages Table)
    const newActivity = await Message.create({
      ticketId,
      senderId: adminId,
      senderName: adminName,
      senderRole: senderRole,
      content: activityContent,
      type: "activity",
      showToUser: false, // User portal-la activity maraika
      isPrivate: false,
      activityMeta: {
        type: `${field}_change`,
        from: oldValue,
        to: newValue,
        updatedField: field,
      },
    });
    return NextResponse.json(
      {
        success: true,
        message: `Ticket ${field} updated successfully`,
        data: {
          updatedField: field,
          newValue: newValue,
          activity: newActivity,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("UPDATE_ATTRIBUTE_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
