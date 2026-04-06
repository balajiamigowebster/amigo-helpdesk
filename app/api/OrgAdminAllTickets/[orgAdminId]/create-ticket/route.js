import { Ticket } from "@/lib";
import { uploadToCloudinary } from "@/lib/config/cloudinary";
import { NextResponse } from "next/server";

// Vercel-la upload panna extra time venum, athunaala 60s set pandrom
export const maxDuration = 60; // 60 seconds timeout for Vercel

export async function POST(req) {
  try {
    // 1. Frontend-la irunthu vara FormData-va pirichi edukirom
    const formData = await req.formData();
    console.log(formData);

    // Manual-ah user fill panna data
    const summary = formData.get("summary");
    const description = formData.get("description");
    const priority = formData.get("priority");
    const category = formData.get("category");
    const organizationId = formData.get("organizationId");
    const creatorId = formData.get("creatorId");

    // Admin setup panna koodiya extra fields
    const internalNotes = formData.get("internalNotes");
    const assigneeId = formData.get("assigneeId");
    const tags = formData.get("tags");
    const source = formData.get("source") || "Portal";

    // Attachment file-ah edukirom
    const file = formData.get("attachment");

    // 2. Kandippa irukka vendiya details check pandrom (Validation)
    if (!summary || !description || !organizationId || !creatorId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: summary, description, organizationId, or creatorId.",
        },
        { status: 400 }
      );
    }

    let attachmentDetails = {
      attachmentUrl: null,
      attachmentPublicId: null,
    };

    // 3. File iruntha athoda size-ah check panni Cloudinary-ku upload pandrom
    if (file && file.size > 0) {
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB limit check

      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          {
            error: "File size exceeds the 2MB limit!",
          },
          {
            status: 400,
          }
        );
      }

      // File-ah buffer-ah mathi upload-ku ready pandrom
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Cloudinary helper-ah call panni URL matrum ID vaangi vachukurom
      const cloudinaryResult = await uploadToCloudinary(buffer, file.name);

      attachmentDetails.attachmentUrl = cloudinaryResult.secure_url;
      attachmentDetails.attachmentPublicId = cloudinaryResult.public_id;
    }

    // 4. Tags JSON string-ah vantha athai array-ah mathurom (Parsing)
    let parsedTags = null;
    if (tags) {
      try {
        parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
      } catch (error) {
        console.error("Tags parsing error:", error);
        parsedTags = [];
      }
    }

    // 5. Database-la Ticket-ah create pandrom
    // Due Date automatic-ah Schema hook vazhiya calculate aagidum
    const newTicket = await Ticket.create({
      summary,
      description,
      priority: priority || "medium",
      category: category || "Unspecified",
      organizationId,
      creatorId,
      assigneeId: assigneeId || null,
      internalNotes: internalNotes || null,
      tags: parsedTags,
      attachmentUrl: attachmentDetails.attachmentUrl,
      attachmentPublicId: attachmentDetails.attachmentPublicId,
      source: source,
      status: "Open",
    });

    // Success response anupuroam
    return NextResponse.json(
      {
        message: "Ticket created successfully",
        ticket: newTicket,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("🔥 Ticket Route Error:", error);

    // Schema-la neenga set panna category validation error vantha ithu handle pannum
    if (error.name === "SequelizeValidationError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    // Vera ethaavathu server error vantha
    return NextResponse.json(
      { error: "Internal Server Error. Please check logs." },
      { status: 500 }
    );
  }
}
