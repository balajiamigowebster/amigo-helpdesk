import { Message, Ticket } from "@/lib";
import sequelize from "@/lib/config/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Database Connection Check
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    // ORDER ROMBA MUKKIYAM:
    // 1. First Parent table-ah sync pannunga
    await Ticket.sync({ alter: true });
    console.log("Ticket table synced.");

    // 2. Sync Logic
    // alter: true kudutha, table munnadiyae irundhalum namma model-ku thagundhapadi structure-ah modify pannum.
    // force: true kuduthiraatheenga (full data delete aagi table fresh-a create aagidum).
    await Message.sync({ alter: true });

    return NextResponse.json(
      {
        success: true,
        message: "Messages table synced successfully in phpMyAdmin!",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Sync Error:", error);

    // Error details-ah response-la anupuroam
    return NextResponse.json(
      {
        success: false,
        message: "Database sync failed!",
        error: error.message,
        // Foreign key issues check panna:
        hint: "Make sure the 'tickets' table exists and its 'id' column type matches with 'ticketId'.",
      },
      { status: 500 },
    );
  }
}
