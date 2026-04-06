import UserManagement from "@/lib/models/Organization/UserManagement";
import { NextResponse } from "next/server";

/**
 * Common Error Handler Helper
 * Ithu error types-ai check panni sariyaana status code and message anuppum.
 */
const handleError = (error) => {
  console.error("API_ERROR:", error);

  if (error.name === "SequelizeUniqueConstraintError") {
    return NextResponse.json(
      { error: "This email is already registered in this organization." },
      { status: 400 },
    );
  }

  if (error.name === "SequelizeValidationError") {
    return NextResponse.json(
      { error: error.errors[0].message },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { error: "Internal Server Error. Please try again later." },
    { status: 500 },
  );
};

// --- 1. GET: Fetch Users (Read) ---
export async function GET(req, { params }) {
  try {
    const { orgId } = await params;

    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    const users = await UserManagement.findAll({
      where: {
        orgId,
      },
      order: [["createdAt", "DESC"]],
      attributes: {
        exclude: ["updatedAt"], // Optional: Performance-kaaga unwanted fields-ai exclude pannalam
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

// --- 2. POST: Add New User (Create) ---
export async function POST(req, { params }) {
  // await UserManagement.sync({ alter: true });
  try {
    const { orgId } = await params;
    const body = await req.json();
    const { firstName, lastName, email, phoneNumber } = body;

    // Manual Validation
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: First Name, Last Name, and Email are mandatory.",
        },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Manual Email Existence Check:
    // Intha specific organization-kulla intha email already irukkanu check pandrom
    // const existingUser = await UserManagement.findOne({
    //   where: {
    //     orgId: orgId,
    //     email: normalizedEmail,
    //   },
    // });

    // if (existingUser) {
    //   return NextResponse.json(
    //     {
    //       error: `The email '${normalizedEmail}' is already registered in this organization.`,
    //     },
    //     { status: 400 },
    //   );
    // }

    // GLOBAL CHECK: Endha org-la irundhaalum intha email irukka nu paakuroom
    // const globalUser = await UserManagement.findOne({
    //   where: { email: normalizedEmail },
    // });

    // if (globalUser) {
    //   return NextResponse.json(
    //     {
    //       error: `Email already registered in the system.`,
    //     },
    //     { status: 400 },
    //   );
    // }

    const existingUserInOrg = await UserManagement.findOne({
      where: {
        orgId: orgId,
        email: normalizedEmail,
      },
    });

    if (existingUserInOrg) {
      return NextResponse.json(
        {
          error: `Email already registered in Organization`,
        },
        { status: 400 },
      );
    }

    // 3. Create User if email doesn't exist
    const newUser = await UserManagement.create({
      orgId,
      firstName,
      lastName,
      email: normalizedEmail,
      phoneNumber,
    });

    return NextResponse.json(
      { message: "User added successfully!", user: newUser },
      { status: 201 },
    );
  } catch (error) {
    // Inga Sequelize error-ai handle panna namma helper function-ai koopdurom
    return handleError(error);
  }
}

// --- 3. PUT: Edit User (Update) ---
export async function PUT(req, { params }) {
  try {
    const { orgId } = await params;
    const body = await req.json();
    const { id, firstName, lastName, email, phoneNumber } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required for update" },
        { status: 400 },
      );
    }

    // Check if user exists before updating
    const userInstance = await UserManagement.findOne({ where: { id, orgId } });
    if (!userInstance) {
      return NextResponse.json(
        { error: "User not found in this organization" },
        { status: 404 },
      );
    }

    await UserManagement.update(
      {
        firstName: firstName || userInstance.firstName,
        lastName: lastName || userInstance.lastName,
        email: email ? email.toLowerCase().trim() : userInstance.email,
        phoneNumber: phoneNumber || userInstance.phoneNumber,
      },
      {
        where: {
          id,
          orgId,
        },
      },
    );
    return NextResponse.json(
      { message: "User updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error);
  }
}

// --- 4. DELETE: Remove User (Delete) ---
export async function DELETE(req, { params }) {
  try {
    const { orgId } = await params;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required in query params" },
        { status: 400 },
      );
    }

    // STEP 1: Antha user create panna ella tickets-aiyum delete pannuroam
    // Unga Ticket model-la column name 'creatorId', so atha use panroam.

    // await Ticket.destroy({
    //   where: {
    //     creatorId: id,
    //     // organizationId: orgId, // orgId-yum check pannuvathu safety-ku nallathu
    //   },
    // });

    const deleteCount = await UserManagement.destroy({
      where: {
        id,
        // orgId,
      },
    });

    if (deleteCount === 0) {
      return NextResponse.json(
        { error: "User not found or already deleted" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "User removed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error.message);
    return handleError(error);
  }
}
