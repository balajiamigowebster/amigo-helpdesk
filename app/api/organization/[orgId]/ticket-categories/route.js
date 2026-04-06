import { Organization } from "@/lib";
import TicketCategory from "@/lib/models/Organization/TicketCategory";
import { NextResponse } from "next/server";

const DEFAULT_CATEGORIES = [
  "Email",
  "Hardware",
  "Maintenance",
  "Network",
  "Other",
  "Printer",
  "Software",
];

const handleError = (error) => {
  console.error("API_ERROR:", error);
  if (error.name === "SequelizeUniqueConstraintError") {
    return NextResponse.json(
      { error: "Category name already exists in this organization." },
      { status: 400 },
    );
  }
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
};

export async function GET(req, { params }) {
  // await TicketCategory.sync({ alter: true });
  try {
    const { orgId } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 6;
    const offset = (page - 1) * limit;

    // 1. Organization details-ah check panrom
    const org = await Organization.findByPk(orgId);
    if (!org)
      return NextResponse.json({ error: "Org not found" }, { status: 404 });

    // 2. ROMBA MUKKIYAM: isCategoryInitialized false-ah iruntha mattum Bulk Create
    // Ithu nadantha apram user "Software"-ah delete pannaalum, flag true-ah irukkuradhala thirumba varaathu.

    if (!org.isCategoryInitialized && page === 1) {
      const defaultData = DEFAULT_CATEGORIES.map((name) => ({ orgId, name }));
      await TicketCategory.bulkCreate(defaultData);

      // Database-la initialized flag-ah true panrom
      await org.update({ isCategoryInitialized: true });
    }

    // 3. Always fetch from DB (Manual edit/delete reflect aagum)
    const { count, rows: categories } = await TicketCategory.findAndCountAll({
      where: { orgId },
      order: [["name", "ASC"]],
      limit,
      offset,
    });

    return NextResponse.json(
      {
        categories,
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return handleError(error);
  }
}

// --- 2. POST: Create New Category ---
export async function POST(req, { params }) {
  try {
    const { orgId } = await params;
    const { name } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }

    const org = await Organization.findByPk(orgId);
    if (!org)
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );

    // Puthusa create pannumbothu, flag false-ah irundha true-ah mathiduvom
    // Yen na user manual-ah start pannita appram default vara koodathu

    if (!org.isCategoryInitialized) {
      await org.update({ isCategoryInitialized: true });
    }

    const newCategory = await TicketCategory.create({
      orgId,
      name: name.trim(),
    });

    return NextResponse.json(
      {
        message: "Category created successfully",
        category: newCategory,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error);
  }
}

// --- 3. PUT: Update Category ---
export async function PUT(req, { params }) {
  try {
    const { orgId } = await params;
    const { id, name } = await req.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: "Unable to process. Please provide all necessary details." },
        { status: 400 },
      );
    }

    const updated = await TicketCategory.update(
      { name: name.trim() },
      { where: { id, orgId } },
    );

    if (updated[0] === 0) {
      return NextResponse.json(
        { error: "Category not found or no changes made" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Category updated successfully" });
  } catch (error) {
    return handleError(error);
  }
}

// --- 4. DELETE: Remove Category ---
export async function DELETE(req, { params }) {
  try {
    const { orgId } = await params;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required information" },
        { status: 400 },
      );
    }

    const deleted = await TicketCategory.destroy({
      where: { id, orgId },
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    return handleError(error);
  }
}
