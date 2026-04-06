import { Message, Organization, Ticket, UserManagement } from "@/lib";
import { NextResponse } from "next/server";
import { success } from "zod";

export async function GET(req, { params }) {
  // await Message.sync({ alter: true });
  try {
    const { orgId, ticketId } = await params;

    const ticket = await Ticket.findOne({
      where: {
        id: ticketId,
        organizationId: orgId,
      },
      include: [
        {
          model: Organization,
          as: "Organization",
          attributes: ["name", "slug"],
        },
        {
          model: UserManagement,
          as: "Creator",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 },
      );
    }

    const ticketData = ticket.toJSON();

    // 1. String-ah irukura customAttributes-ah Object-aa mathurom
    let parsedAttributes = {};

    if (ticketData.customAttributes) {
      try {
        parsedAttributes =
          typeof ticketData.customAttributes === "string"
            ? JSON.parse(ticketData.customAttributes)
            : ticketData.customAttributes;
      } catch (error) {
        console.error("JSON Parsing Error:", error);
        parsedAttributes = {};
      }
    }

    // --- Custom Attributes Transformation Logic ---
    // Backend-laye namma frontend-ku easy-aa irukura mathiri mathurom

    const hasAttributes =
      ticketData.customAttributes &&
      Object.keys(ticketData.customAttributes).length > 0;

    const formattedAttributes = hasAttributes
      ? Object.entries(parsedAttributes).map(([label, value]) => ({
          label: label, // e.g., "Text Field"
          value: value || "N/A",
          type: typeof value, // e.g., "string", "number"
        }))
      : [];

    // --- LOGIC FOR SENDER DETAILS ---
    // User type portal_user-ah irundha "USER" role assign pandrom

    const currentUserRole =
      ticketData.creatorType === "portal_user" ? "USER" : "";

    // Name combine pandrom (firstName + lastName)
    const senderFullName = ticketData.Creator
      ? `${ticketData.Creator.firstName} ${ticketData.Creator.lastName}`.trim()
      : "Unknown User";

    return NextResponse.json({
      success: true,
      data: {
        ...ticketData,
        // Replace panrom formatted array-va
        customAttributes: formattedAttributes,
        senderProfile: {
          id: ticketData.creatorId,
          name: senderFullName,
          email: ticketData.Creator?.email || ticketData.creatorEmail,
          role: currentUserRole,
        },
        // Date formatting ingeye panna nalla irukkum
        formattedCreatedDate: new Date(ticket.createdAt).toLocaleDateString(
          "en-US",

          {
            month: "long",
            day: "numeric",
            year: "numeric",
          },
        ),
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
