import { EmployeeAdministration } from "@/lib";
import { cloudinary } from "@/lib/cloudinaryStorage";
import { NextResponse } from "next/server";
import CryptoJS from "crypto-js";
import { sendEmployeeVerifyEmail } from "@/lib/sendEmployeeVerifyEmail";

// export const dynamic = "force-dynamic";
// export const maxDuration = 60;

export async function PUT(req, { params }) {
  try {
    // 1. Employee ID-ai kandupidikanum (Ithu update panna romba mukkiyam)
    // const employeeId = formData.get("id");

    // 1. URL Params-la irunthu ID-ai edukuroam
    const { id: employeeId } = await params;

    const ownerId = req.headers.get("user-id"); // Middleware-la irunthu varum
    const formData = await req.formData();

    console.log("FORMDATA", formData);

    if (!employeeId) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 },
      );
    }

    // 2. Database-la antha employee irukkaangala nu check pannurom
    const employee = await EmployeeAdministration.findOne({
      where: {
        id: employeeId,
        ownerId: ownerId, // Safety: Owner-ukku ulla employee-ai mattum thaan update panna mudiyum
      },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 },
      );
    }

    // --- RESEND VERIFICATION LOGIC ---
    // Frontend-la irunthu 'isResend' = "true" nu vanthaal
    if (formData.get("isResend") === "true") {
      const randomWords = CryptoJS.lib.WordArray.random(32);
      const newToken = CryptoJS.enc.Hex.stringify(randomWords);
      const newExpiry = new Date(Date.now() + 5 * 60 * 1000); // Reset to 5 mins

      // First: Mail-ai anupa try pannuvom
      const emailResult = await sendEmployeeVerifyEmail(
        employee.email,
        newToken,
        employee.firstName,
      );

      // Mail success-ah send aana mattume DB-la token-ai update pannuvom
      if (emailResult.success) {
        await employee.update({
          verificationToken: newToken,
          verificationExpiry: newExpiry,
          isVerified: false, // Just in case thirumba verify pannanum na
        });

        return NextResponse.json(
          {
            success: true,
            message:
              "Verification email sent successfully to " + employee.email,
          },
          { status: 200 },
        );
      } else {
        // Mail pogala-na DB update panna maatoam, error response anupuvom
        return NextResponse.json(
          {
            success: false,
            message:
              "Failed to send email. Please check your SMTP settings or try again later.",
          },
          { status: 500 },
        );
      }
    }

    // 1. Mandatory Fields Validation
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const role = formData.get("role");

    // Inga check panrom: Field-ae illanaalum illana empty string-ah irundhaalum error kuduppom
    if (!firstName?.trim() || !lastName?.trim() || !role?.trim()) {
      return NextResponse.json(
        { message: "First name, Last name, and Role are required fields." },
        { status: 400 },
      );
    }

    // 2. Email Validation (Optional but recommended)
    const email = formData.get("email");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 },
      );
    }

    // console.log(formData);

    // 3. Extract updated fields  (Normal Update)
    const updateData = {
      firstName: formData.get("firstName") || employee.firstName,
      lastName: formData.get("lastName") || employee.lastName,
      email: formData.get("email") || employee.email,
      role: formData.get("role") || employee.role,
      // hourlyRate: formData.get("hourlyRate") || employee.hourlyRate,
      // isNotifyEnabled: formData.get("isNotifyEnabled") === "true",
    };

    // Boolean check: formData-la field irundhaa mattum update pannu
    if (formData.has("isNotifyEnabled")) {
      updateData.isNotifyEnabled = formData.get("isNotifyEnabled") === "true";
    }
    // 2. Organization & Access Scope Logic (FIX)
    // const isLimitedAllRaw = formData.get("isLimitedAll");
    const organizationsRaw = formData.get("organizations");

    // if (isLimitedAllRaw !== null) {
    //   const isLimitedAll = isLimitedAllRaw === "true";
    //   updateData.accessScope = isLimitedAll ? "ALL" : "SPECIFIC";

    //   if (isLimitedAll) {
    //     updateData.organizations = ["ALL"];
    //   } else if (organizationsRaw) {
    //     // 'SPECIFIC' aanaal, organizations list-ai update pannu
    //     updateData.organizations = JSON.parse(organizationsRaw);
    //   }
    // } else if (organizationsRaw) {
    //   // isLimitedAll anupala, aana organizations mattum anupunaalum update aagum
    //   updateData.organizations = JSON.parse(organizationsRaw);
    // }

    const accessScope = formData.get("accessScope");

    if (accessScope) {
      updateData.accessScope = accessScope;
      if (accessScope === "ALL") {
        updateData.organizations = ["ALL"];
      } else if (organizationsRaw) {
        // SPECIFIC aanaal, antha list-ai update pannurom
        try {
          updateData.organizations = JSON.parse(organizationsRaw);
        } catch (error) {
          console.error("Org Parse Error:", e);
          // Parse error vanthaal existing-aiye vachukalam or empty array
        }
      }
    }

    // 4. Handle Image Update
    const imageFile = formData.get("Employeeimage");
    if (imageFile && imageFile.size > 0) {
      // --- IMAGE SIZE VALIDATION (1MB Limit) ---
      const MAX_SIZE = 1 * 1024 * 1024; // 1MB in bytes
      if (imageFile.size > MAX_SIZE) {
        return NextResponse.json(
          { message: "Image size too large. Maximum limit is 1MB." },
          { status: 400 },
        );
      }

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
      // Puthu image details-ai updateData-la sethukuroam
      updateData.employeeImage = uploadResponse.secure_url;
      updateData.employeeImagePublicId = uploadResponse.public_id;

      // Note: Neenga schema-la eluthuna 'beforeUpdate' hook, automatic-ah Cloudinary-la irunthu
      // pazhaya image-ai (previousPublicId) delete pannidum.
    }

    await employee.update(updateData);
    // console.log(employee);

    return NextResponse.json(
      { message: "Employee updated successfully", data: employee },
      { status: 200 },
    );
  } catch (error) {
    console.error("UPDATE_EMPLOYEE_ERROR:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 },
    );
  }
}
