import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // 60 seconds (1 minute) varai wait pannum
});

// --- ELIGIBLE FORMATS ONLY ---
const ALLOWED_EXTENSIONS = [
  "jpg",
  "png",
  "jpeg",
  "gif",
  "pdf",
  "docx",
  "xlsx",
  "csv",
  "txt",
  "log",
];

export const uploadToCloudinary = async (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    // 1. Extension Check
    const extension = fileName.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return reject(new Error(`File type .${extension} is not allowed!`));
    }

    // 2. Size Check (Buffer level-laye check pannidalaam - Very Safe)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (fileBuffer.length > MAX_SIZE) {
      return reject(new Error("File size exceeds the 2MB limit!"));
    }

    // 2. Cloudinary Upload Stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "helpdesk_tickets/attachments",
        resource_type: "auto", // PDF/Docs-ku 'auto' mukkiyam
        timeout: 120000,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    uploadStream.on("error", (err) => reject(err));
    uploadStream.end(fileBuffer);
  });
};

export { cloudinary };
