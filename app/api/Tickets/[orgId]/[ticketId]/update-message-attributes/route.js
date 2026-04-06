import { Message, Ticket, EmployeeAdministration } from "@/lib";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    const { ticketId, orgId } = await params;
    const { field, newValue, adminId, adminName, senderRole } =
      await req.json();

    // 1. Validation for allowed fields
    const allowedFields = ["status", "priority", "assigneeId", "categoryId"];
    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { error: `Update not allowed` },
        { status: 400 },
      );
    }

    // 2. Fetch ticket and check authorization
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket || ticket.organizationId !== orgId) {
      return NextResponse.json(
        { error: "Unauthorized/Not Found" },
        { status: 403 },
      );
    }

    const oldValue = ticket[field];
    if (oldValue === newValue) {
      return NextResponse.json({ message: "No changes" });
    }

    // 3. Setup variables for Activity Meta (Names instead of IDs)
    let activityFrom = oldValue;
    let activityTo = newValue;
    let activityContent = "";

    // 4. Specific Logic for Assignee Change
    if (field === "assigneeId") {
      // Fetch Old Employee Name
      const oldEmp = oldValue
        ? await EmployeeAdministration.findByPk(oldValue)
        : null;
      const oldName = oldEmp
        ? `${oldEmp.firstName} ${oldEmp.lastName}`.trim()
        : "Unassigned";

      // Fetch New Employee Name
      const newEmp = newValue
        ? await EmployeeAdministration.findByPk(newValue)
        : null;
      const newName = newEmp
        ? `${newEmp.firstName} ${newEmp.lastName}`.trim()
        : "Unassigned";

      // Update Ticket Cache
      ticket.assigneeId = newValue;
      ticket.assigneeName = newName;

      // Set Name values for Activity
      activityContent = `reassigned from ${oldName} to ${newName}`;
      activityFrom = oldName;
      activityTo = newName;
    } else {
      // Logic for status, priority, etc.
      ticket[field] = newValue;
      activityContent = `changed ${field} from ${oldValue} to ${newValue}`;
    }

    // 5. Save Ticket Updates
    await ticket.save();

    // 6. Create Activity Message with Name Meta
    const newActivity = await Message.create({
      ticketId,
      senderId: adminId,
      senderName: adminName,
      senderRole: senderRole,
      content: activityContent,
      type: "activity",
      showToUser: false,
      activityMeta: {
        type: `${field}_change`,
        from: activityFrom, // IDs-ku pathila names ippo inga irukum
        to: activityTo,
      },
    });

    return NextResponse.json({ success: true, activity: newActivity });
  } catch (error) {
    console.error("PATCH_API_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
