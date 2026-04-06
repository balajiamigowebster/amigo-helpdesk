import { GeneralSettings, Organization } from "@/lib";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // 1. Middleware set panna 'user-id' header-ai edukkiroam
    const userId = req.headers.get("user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: User ID not found in headers" },
        { status: 401 },
      );
    }

    // 2. userId-ku relate-aana organizations mattum filter pandrom
    const organizations = await Organization.findAll({
      where: {
        adminId: userId, // Owner-oda ID vaitchu filter seikirom
      },
      include: [
        {
          model: GeneralSettings,
          as: "Settings", // Association file-la neenga enna 'as' kudutheengalo adhe inga irukkanum
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json(
      {
        success: true,
        data: organizations,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch Owner Organization Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch your organizations" },
      { status: 500 },
    );
  }
}
