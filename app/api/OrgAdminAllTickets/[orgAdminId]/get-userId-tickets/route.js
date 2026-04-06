import { Ticket } from "@/lib";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // 1. Middleware headers-la irunthu user-id edukirom
    const userId = await req.headers.get("user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User unauthorized. Please login." },
        { status: 401 }
      );
    }

    // 2. Database-la intha userId (creatorId) create panna tickets-ah fetch pandrom
    // Order: Puthiya tickets mela vara maari 'DESC' order set pandrom

    const userTickets = await Ticket.findAll({
      where: {
        creatorId: userId,
      },
      order: [["createdAt", "DESC"]],
    });

    // 3. Tickets irukka nu check pandrom
    if (!userTickets || userTickets.length === 0) {
      return NextResponse.json(
        {
          message: "No tickets found for this user",
          tickets: [],
        },
        {
          status: 200,
        }
      );
    }

    // 4. Success Response
    return NextResponse.json(
      { success: true, tickets: userTickets },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥 Get User Tickets Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}
