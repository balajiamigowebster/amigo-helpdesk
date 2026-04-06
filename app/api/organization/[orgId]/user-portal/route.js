import { Organization } from "@/lib";
import { cloudinary } from "@/lib/cloudinaryStorage";
import UserPortal from "@/lib/models/Organization/UserPortal";
import { NextResponse } from "next/server";

/**
 * Common Error Handler Helper for User Portal
 */
const handleError = (error) => {
  console.error("USER_PORTAL_API_ERROR:", error);

  // Sequelize Validation Errors (e.g., invalid email format)
  if (error.name === "SequelizeValidationError") {
    return NextResponse.json(
      { error: error.errors[0].message },
      { status: 400 },
    );
  }

  // Unique Constraint Errors
  if (error.name === "SequelizeUniqueConstraintError") {
    return NextResponse.json(
      { error: "Settings for this organization already exist." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { error: "Internal Server Error. Please try again later." },
    { status: 500 },
  );
};

export async function GET(req, { params }) {
  // await UserPortal.sync({ alter: true });
  try {
    const { orgId } = await params;

    if (!orgId) {
      return NextResponse.json(
        { message: "Invalid session or request" },
        { status: 400 },
      );
    }

    // 1. First DB-la settings irukanu check pannuvom
    let portalSettings = await UserPortal.findOne({
      where: {
        orgId: orgId,
      },
    });

    // 2. Settings illana mattum fresh-ah create pannuvom (First time only)
    if (!portalSettings) {
      const org = await Organization.findByPk(orgId);

      if (!org) {
        return NextResponse.json(
          { message: "Organization not found" },
          { status: 404 },
        );
      }

      // First time user portal-ku varumbothu automatic-ah default data-voda DB-la row insert panniduvom
      portalSettings = await UserPortal.create({
        orgId: orgId,
        isEnabled: true,
        pageTitle: `${org.name} Help Desk`,
        formTitle: "Submit a help desk ticket",
        formMessage:
          "Simply create a ticket below. A technician will respond promptly to your issue.",
        successTitle: "Your ticket has been submitted!",
        successMessage: "A technician will reply to you shortly via email.",
        loginWelcomeMessage: "Welcome to the Help Desk.",
        announcements: "No announcements",
        displayedEmail: `help@${org.domain}.vercel.app` || "Not Configured",
        includeReferenceEmail: true,
        portalTheme: "orange",
        authType: "email",
      });
    }

    // 3. Ippo portalSettings-la eppovume DB data thaan irukum (Default or Updated)
    return NextResponse.json(
      {
        success: true,
        data: portalSettings,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req, { params }) {
  try {
    const { orgId } = await params;
    const formData = await req.formData();

    // 1. Check if User Portal exists
    const portal = await UserPortal.findOne({
      where: {
        orgId: orgId,
      },
    });

    if (!portal) {
      return NextResponse.json(
        { message: "Portal not found" },
        { status: 404 },
      );
    }

    // 2. Basic Fields Extract
    const updateData = {
      pageTitle: formData.get("pageTitle")
        ? formData.get("pageTitle")
        : portal.pageTitle,
      formTitle: formData.get("formTitle")
        ? formData.get("formTitle")
        : portal.formTitle,
      formMessage: formData.get("formMessage")
        ? formData.get("formMessage")
        : portal.formMessage,
      successTitle: formData.get("successTitle")
        ? formData.get("successTitle")
        : portal.successTitle,
      successMessage: formData.get("successMessage")
        ? formData.get("successMessage")
        : portal.successMessage,
      loginWelcomeMessage: formData.get("loginWelcomeMessage")
        ? formData.get("loginWelcomeMessage")
        : portal.loginWelcomeMessage,
      announcements: formData.get("announcements")
        ? formData.get("announcements")
        : portal.announcements,
      // isEnabled: formData.get("isEnabled") === "true",
      authType: formData.get("authType")
        ? formData.get("authType")
        : portal.authType,
      portalTheme: formData.get("portalTheme")
        ? formData.get("portalTheme")
        : portal.portalTheme,
      // includeCategoryField: formData.get("includeCategoryField") === "true",
      // requireCategory: formData.get("requireCategory") === "true",
    };

    // Boolean fields Handling
    if (formData.has("isEnabled")) {
      updateData.isEnabled = formData.get("isEnabled") === "true";
    }

    if (formData.has("includeCategoryField")) {
      updateData.includeCategoryField =
        formData.get("includeCategoryField") === "true";
    }

    if (formData.has("requireCategory")) {
      updateData.requireCategory = formData.get("requireCategory") === "true";
    }

    // 3. Cloudinary Image Logic (Employee logic maariye)
    const imageFile = formData.get("portalImage"); // Frontend-la irunthu vara key name
    const isImageDeleted = formData.get("isImageDeleted") === "true";

    // A. Backend Image Validation (Security Check)
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      // File Size Validation (1MB limit)
      const MAX_SIZE = 1 * 1024 * 1024;
      if (imageFile.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "Image size too large. Max limit is 1MB." },
          { status: 400 },
        );
      }

      // File Format Validation
      const ALLOWED_TYPES = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!ALLOWED_TYPES.includes(imageFile.type)) {
        return NextResponse.json(
          { error: "Invalid format. Please upload JPG, PNG or WebP." },
          { status: 400 },
        );
      }
    }

    // CASE 1: Image-ah delete panna sonna (Remove button clicked)
    if (isImageDeleted && portal.portalImagePublicId) {
      try {
        await cloudinary.uploader.destroy(portal.portalImagePublicId);
        updateData.portalImageUrl = null;
        updateData.portalImagePublicId = null;
        console.log("Image removed from Cloudinary and DB");
      } catch (delError) {
        console.error("Cloudinary Delete Error:", delError);
      }
    }

    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      // Step A: Pazhaya image iruntha Cloudinary-la irunthu thookiduvom
      // Unga schema-padi field name: 'portalImagePublicId'
      if (portal.portalImagePublicId) {
        try {
          await cloudinary.uploader.destroy(portal.portalImagePublicId);
          console.log("Deleted old image:", portal.portalImagePublicId);
        } catch (delError) {
          console.error("Cloudinary Delete Error:", delError);
        }
      }

      // Step B: New Image Upload
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "user_portals" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(buffer);
      });

      updateData.portalImageUrl = uploadResponse.secure_url;
      updateData.portalImagePublicId = uploadResponse.public_id;
    }

    // 4. Update Database
    await portal.update(updateData);

    return NextResponse.json(
      {
        message: "Portal updated successfully",
        data: portal,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error);
  }
}
