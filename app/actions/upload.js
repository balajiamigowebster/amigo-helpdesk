"use server";

import { cloudinary, cloudinaryStorage } from "@/lib/cloudinaryStorage";
import { revalidatePath } from "next/cache";

// This function acts like middleware to validate the uploaded file
const validateFile = (file) => {
  if (!file || file.size === 0) throw new Error("No file selected!");

  if (!cloudinaryStorage.allowed_formats.includes(file.type.split("/")[1])) {
    throw new Error("Invalid file format! Only JPG and PNG files are allowed.");
  }

  if (file.size > 2 * 1024 * 1024)
    throw new Error("File size should not exceed 2MB!");
};

export async function uploadAvatar(formData, userId) {
  try {
    const file = formData.get("image");

    // Step 1: Validation (middleware-like logic)
    validateFile(file);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 2: Stream upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: cloudinaryStorage.folder,
          transformation: cloudinaryStorage.transformation,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    // Step 3: Update database
    // (Your User model hooks will automatically delete the old image)
    await Us.update(
      {
        avatar: result.secure_url,
        avatarPublicId: result.public_id,
      },
      { where: { id: userId } }
    );

    revalidatePath("/dashboard/settings"); // Refresh UI
    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error("Upload error:", error.message);
    return { success: false, error: error.message };
  }
}
