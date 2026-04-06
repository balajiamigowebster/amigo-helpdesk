import { Organization } from "@/lib";
import { NextResponse } from "next/server";
import { Op } from "sequelize";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Inputs from Frontend
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "newest";

    const offset = (page - 1) * limit;

    // 2. Search Logic (Name, Country, or Domain)
    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } }, // Name-la 'Prime' enga irunthalum edukkum
          { country: { [Op.like]: `%${search}%` } }, // Country-la 'Prime' irunthaal edukkum
          { domain: { [Op.like]: `%${search}%` } }, // Domain-la 'Prime' irunthaal edukkum
        ],
      };
    }

    // 3. Sorting Logic
    let order = [["createdAt", "DESC"]]; // Default: Newest
    if (sortBy === "oldest") order = [["createdAt", "ASC"]];
    if (sortBy === "name-az") order = [["name", "ASC"]];
    if (sortBy === "name-za") order = [["name", "DESC"]];
    if (sortBy === "country") order = [["country", "ASC"]];
    if (sortBy === "admin-id") order = [["adminId", "ASC"]];

    // 4. Database Query (Fetch data + Count)
    const { count, rows } = await Organization.findAndCountAll({
      where: whereClause,
      order: order,
      limit: limit,
      offset: offset,
    });

    // Initial total count (without filters) to show in UI
    const totalInDb = await Organization.count();

    return NextResponse.json(
      {
        data: rows,
        meta: {
          totalRecords: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          initialTotal: totalInDb, // Absolute total in DB
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("FETCH_ORGS_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
