import { EmployeeAdministration, EmployeeOrganizations } from "@/lib";
import { cloudinary } from "@/lib/cloudinaryStorage";
import { NextResponse } from "next/server";
import CryptoJS from "crypto-js";
import { sendEmployeeVerifyEmail } from "@/lib/sendEmployeeVerifyEmail";
import bcrypt from "bcryptjs";
import sequelize from "@/lib/config/db";

export async function POST(req) {
  const t = await sequelize.transaction();

  try {
    const formData = await req.formData();

    // -------- BASIC DATA --------
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const email = formData.get("email");
    const role = formData.get("role");
    const rawPassword = formData.get("password");
    const ownerId = formData.get("ownerId");

    const hourlyRate = formData.get("hourlyRate") || 0.0;
    const isNotifyEnabled = formData.get("isNotifyEnabled") === "true";

    const accessScope = formData.get("accessScope");
    const organizationsRaw = formData.get("organizations");

    let organizations = [];

    if (organizationsRaw) {
      try {
        organizations = JSON.parse(organizationsRaw);
      } catch (err) {
        organizations = [];
      }
    }

    // -------- VALIDATION --------
    if (!firstName || !email || !role || !ownerId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // -------- PASSWORD --------
    let hashedPassword = null;

    if (rawPassword && rawPassword.trim() !== "") {
      hashedPassword = await bcrypt.hash(rawPassword, 10);
    }

    // -------- EMAIL VERIFY TOKEN --------
    const randomWords = CryptoJS.lib.WordArray.random(32);
    const verificationToken = CryptoJS.enc.Hex.stringify(randomWords);

    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // -------- IMAGE UPLOAD --------
    let employeeImage = null;
    let employeeImagePublicId = null;

    const imageFile = formData.get("Employeeimage");

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "employee_profiles" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(buffer);
      });

      employeeImage = uploadResponse.secure_url;
      employeeImagePublicId = uploadResponse.public_id;
    }

    // -------- CREATE EMPLOYEE --------
    const newEmployee = await EmployeeAdministration.create(
      {
        ownerId,
        firstName,
        lastName,
        email,
        role,
        password: hashedPassword,
        employeeImage,
        employeeImagePublicId,
        accessScope,
        hourlyRate,
        isNotifyEnabled,
        isVerified: false,
        verificationToken,
        verificationExpiry,
      },
      { transaction: t },
    );

    // -------- MULTIPLE ORGANIZATION ASSIGN --------
    if (
      accessScope === "SPECIFIC" &&
      Array.isArray(organizations) &&
      organizations.length > 0 &&
      !organizations.includes("ALL")
    ) {
      const orgMappings = organizations.map((orgId) => ({
        employeeId: newEmployee.id,
        organizationId: orgId,
      }));

      await EmployeeOrganizations.bulkCreate(orgMappings, {
        transaction: t,
      });
    }

    // -------- EMAIL SEND --------
    if (isNotifyEnabled) {
      try {
        await sendEmployeeVerifyEmail(email, verificationToken, firstName);
      } catch (err) {
        console.error("MAIL_ERROR:", err.message);
      }
    }

    await t.commit();

    return NextResponse.json(
      {
        message: "Employee created successfully",
        data: newEmployee,
      },
      { status: 201 },
    );
  } catch (error) {
    await t.rollback();

    console.error("CREATE_EMPLOYEE_ERROR:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return NextResponse.json(
        { message: "This email already exists" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 },
    );
  }
}
