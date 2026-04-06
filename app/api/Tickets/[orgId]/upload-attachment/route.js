import { Organization, Ticket } from "@/lib";
import { cloudinary } from "@/lib/cloudinaryStorage";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  //   await Ticket.sync({ alter: true });
  try {
    const { orgId } = await params;

    const org = await Organization.findByPk(orgId);
    if (!org) {
      return NextResponse.json(
        { message: "Invalid Organization ID" },
        { status: 400 },
      );
    }

    const formData = await req.formData();

    const file = formData.get("file");
    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 },
      );
    }

    // 2. Validation: File size check (1MB = 1024 * 1024 bytes)
    const MAX_SIZE = 1024 * 1024;

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: "File size too large. Max 1MB allowed" },
        { status: 400 },
      );
    }

    // Convert file to Buffer for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Cloudinary Upload
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `tickets/${orgId}`,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    return NextResponse.json(
      {
        url: result.secure_url,
        publicId: result.public_id,
        fileName: file.name,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { orgId } = await params;
    const { searchParams } = await new URL(req.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { message: "Public ID is required" },
        { status: 400 },
      );
    }

    // Security Check: Public ID-la orgId irukanu check pannalam
    // Folder structure 'tickets/orgId/filename' nu irundha dhaan safe
    if (!publicId.includes(orgId)) {
      return NextResponse.json(
        { message: "Unauthorized delete request" },
        { status: 403 },
      );
    }

    // Cloudinary-la irundhu delete pannuvom
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "ok") {
      return NextResponse.json(
        { message: "File deleted successfully" },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { message: "Cloudinary delete failed" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
