import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryStorage = {
  folder: "user_profiles",
  allowed_formats: ["jpg", "png", "jpeg", "webp"],
  transformation: [{ width: 500, height: 500, crop: "limit" }], // Auto resize panna
};

export { cloudinary };
