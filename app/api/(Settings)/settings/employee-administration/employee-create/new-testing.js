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
    // await EmployeeAdministration.sync({ alter: true });

    const formData = await req.formData();

    // 1. Extract Basic Data
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const email = formData.get("email");
    const role = formData.get("role");
    const rawPassword = formData.get("password"); // Admin kudutha password
    const hourlyRate = formData.get("hourlyRate") || 0.0;
    const isNotifyEnabled = formData.get("isNotifyEnabled") === "true";

    // 2. Owner ID (Login panni irukkura Admin ID)
    // Idhu romba mukkiyam, token-la iruntho illa session-la iruntho edukkanum
    const ownerId = formData.get("ownerId");

    // 3. Limited Access Logic (Unga Frontend State handle pannuthu)
    // const isLimitedAll = formData.get("isLimitedAll") === "true";
    // const selectedOrganizations = formData.get("organizations"); // Inga JSON string-ah varum

    const accessScope = formData.get("accessScope");
    const organizationsRaw = formData.get("organizations");

    let organizationsList = [];

    if (accessScope === "SPECIFIC" && organizationsRaw) {
      try {
        organizationsList = JSON.parse(organizationsRaw);
      } catch (e) {
        console.error("Org Parse Error:", e);
        organizationsList = [];
      }
    }

    // Validation Check
    if (!firstName || !email || !role || !ownerId) {
      return NextResponse.json(
        {
          message:
            "Missing required fields (FirstName, Email, Role, or OwnerId)",
        },
        { status: 400 },
      );
    }

    // --- Logic for Password ---
    let hashedPassword = null;
    if (rawPassword && rawPassword.trim() !== "") {
      hashedPassword = await bcrypt.hash(rawPassword, 10);
    }

    // 3. Verification Token & Expiry (5 Minutes)
    // Crypto-JS moolama oru random string generate panroam
    const randomWords = CryptoJS.lib.WordArray.random(32);
    // console.log("Random words", randomWords);
    const verificationToken = CryptoJS.enc.Hex.stringify(randomWords);
    // console.log("Verification-token", verificationToken);
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 5 Mins Expiry
    // console.log("Verification-Expiry", verificationExpiry);
    // 4. Image Upload to Cloudinary (If image exists)
    let employeeImage = null;
    let employeeImagePublicId = null;

    const imageFile = formData.get("Employeeimage");
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Cloudinary upload promise
      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "employee_profiles",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(buffer);
      });

      employeeImage = uploadResponse.secure_url;
      employeeImagePublicId = uploadResponse.public_id;
    }

    // 5. Create Employee in Database
    const newEmployee = await EmployeeAdministration.create({
      ownerId,
      firstName,
      lastName,
      email,
      role,
      password: hashedPassword, // Hash panna password (iruntha)
      employeeImage,
      employeeImagePublicId,
      accessScope,
      organizations: JSON.stringify(organizationsList),
      hourlyRate,
      isNotifyEnabled,
      isVerified: false,
      verificationToken,
      verificationExpiry,
    });

    // 6. STEP B: Insert into Junction Table if Access is SPECIFIC

    if (accessScope === "SPECIFIC" && organizationsList.length > 0) {
      const junctionData = organizationsList.map((orgId) => ({
        employeeId: newEmployee.id,
        organizationId: orgId,
      }));

      // bulkCreate moolama orey query-la ella org-laiyum add panrom
      await EmployeeOrganizations.bulkCreate(junctionData, { transaction: t });
    }

    await t.commit();

    // 6. Send Email ONLY if Notification is Enabled
    if (isNotifyEnabled === true) {
      try {
        await sendEmployeeVerifyEmail(email, verificationToken, firstName);
        console.log(`Verification email sent (Crypto-JS) to: ${email}`);
      } catch (mailError) {
        console.error("MAIL_SENDING_ERROR:", mailError.message);
      }
    }

    return NextResponse.json(
      {
        message: "Employee created and verification email sent.",
        data: newEmployee,
      },
      { status: 201 },
    );
  } catch (error) {
    if (t) await t.rollback();
    console.error("CREATE_EMPLOYEE_ERROR:", error);
    // Unique Email Error handling
    if (error.name === "SequelizeUniqueConstraintError") {
      return NextResponse.json(
        { message: "This email is already registered for your account" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 },
    );
  }
}
