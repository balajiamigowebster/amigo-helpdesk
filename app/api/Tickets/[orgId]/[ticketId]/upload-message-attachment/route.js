import { cloudinary } from "@/lib/cloudinaryStorage";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const { ticketId, orgId } = await params;

    const formData = await req.formData();
    const file = formData.get("file");

    // 1. CHECK IF FILE EXISTS
    if (!file || file.length === 0) {
      return NextResponse.json(
        { error: "No file provided. Please select a file." },
        { status: 400 },
      );
    }

    // 2. FILE SIZE CHECK (Strictly 1MB)
    const maxSizeBytes = 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: "File is too large. Maximum allowed size is 1MB." },
        { status: 400 },
      );
    }

    // 3. FILE TYPE VALIDATION (Images and PDFs only)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "text/plain",
      "application/zip",
      "application/x-zip-compressed", // Windows zip fix
      "application/x-zip",
    ];

    // Browser sila neram zip file-ku type empty-ah anupum,
    // athunaala file name-ah vachum check panrom
    const isZipExtension = file.name.toLowerCase().endsWith(".zip");

    if (!allowedTypes.includes(file.type) && !isZipExtension) {
      return NextResponse.json(
        {
          error: "Invalid file type",
        },
        { status: 400 },
      );
    }

    // 4. BUFFER CONVERSION
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. UPLOAD TO CLOUDINARY
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `helpdesk/org_${orgId}/ticket_${ticketId}/attachments`,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    // Dynamic Size Logic:
    // const sizeInBytes = file.size
    // let displaySize = ''

    // if(sizeInBytes < 1024){
    //   displaySize = `${sizeInBytes}`
    // }

    // 6. SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        attachments: {
          url: uploadResponse.secure_url,
          publicId: uploadResponse.public_id,
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(2) + " KB",
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("ATTACHMENT_UPLOAD_ERROR:", error);
    return NextResponse.json(
      {
        error: "An error occurred during file upload.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
