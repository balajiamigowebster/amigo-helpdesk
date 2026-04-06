import CustomAttribute from "@/lib/models/Organization/CustomAttribute";
import { NextResponse } from "next/server";

/**
 * Common Error Handler for Custom Attributes
 */
const handleError = (error) => {
  console.error("CUSTOM_ATTRIBUTE_API_ERROR:", error);

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

export async function GET(req, { params }) {
  try {
    const { orgId } = await params;

    if (!orgId) {
      return NextResponse.json(
        { message: "Organization ID is required." },
        { status: 400 },
      );
    }

    const attributes = await CustomAttribute.findAll({
      where: {
        orgId: orgId,
      },
      order: [["createdAt", "DESC"]], // Latest first
    });

    return NextResponse.json(
      { success: true, data: attributes },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error);
  }
}

// 2. POST: Create a new custom attribute
export async function POST(req, { params }) {
  // await CustomAttribute.sync({ alter: true });
  try {
    const { orgId } = await params;
    const body = await req.json(); // Attribute data usually JSON-ah thaan varum

    if (!orgId) {
      return NextResponse.json(
        { message: "Organization ID is required." },
        { status: 400 },
      );
    }

    // --- LIST TYPE HANDLING ---
    // Type 'List' ah iruntha options kandaipa array-va irukanum
    if (
      body.type === "List" &&
      (!Array.isArray(body.options) || body.options.length === 0)
    ) {
      return NextResponse.json(
        { message: "For List type, at least one option is required." },
        { status: 400 },
      );
    }

    // Type 'List' illana, options-ah null panni store panrathu clean-ah irukum
    if (body.type !== "List") {
      body.options = null;
    }

    // Create attribute linked to orgId
    const newAttribute = await CustomAttribute.create({
      ...body,
      orgId: orgId,
    });

    return NextResponse.json(
      { message: "Attribute created successfully", data: newAttribute },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error);
  }
}

// 3. PUT: Update an existing attribute
// Note: Usually id path-la varum /api/org/123/custom-attributes/[attrId]
// Illana neenga body-la 'id' anupuna athai vachi update pannalam

export async function PUT(req, { params }) {
  try {
    const { orgId } = await params;
    const body = await req.json();

    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Attribute ID is required" },
        { status: 400 },
      );
    }

    const attribute = await CustomAttribute.findOne({
      where: {
        id: id,
        orgId: orgId,
      },
    });

    if (!attribute) {
      return NextResponse.json(
        { message: "Attribute not found" },
        { status: 404 },
      );
    }

    if (updateData.type) {
      if (updateData.type === "List") {
        if (updateData.options && !Array.isArray(updateData.options)) {
          return NextResponse.json(
            { message: "Options must be an array." },
            { status: 400 },
          );
        }
      } else {
        // Type-ah switch pannuna options-ah clear pannidanum
        updateData.options = null;
      }
    }

    await attribute.update(updateData);
    return NextResponse.json(
      { message: "Attribute updated successfully", data: attribute },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req, { params }) {
  try {
    const { orgId } = await params;
    const { searchParams } = new URL(req.url);
    const attrId = searchParams.get("id"); // URL-la query string-ah id anupalam (?id=...)

    if (!attrId) {
      return NextResponse.json(
        { message: "Attribute ID is required" },
        { status: 400 },
      );
    }

    const deletedCount = await CustomAttribute.destroy({
      where: {
        id: attrId,
        orgId: orgId,
      },
    });

    if (deletedCount === 0) {
      return NextResponse.json(
        { message: "Attribute not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Attribute deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error);
  }
}
