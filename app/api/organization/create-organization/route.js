import { User } from "@/lib";
import GeneralSettings from "@/lib/models/Organization/GeneralSettings";
import Organization from "@/lib/models/Organization/Organization";
import { NextResponse } from "next/server";
import { Op } from "sequelize";
import slugify from "slugify";

export async function POST(req) {
  // await Organization.sync({ alter: true });

  const userId = req.headers.get("user-id");

  // console.log("ORG CREATE USER ID:", userId);

  if (!userId) {
    return NextResponse.json(
      { error: "User authentication failed. Please login again." },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    console.log(body);
    const {
      organizationName,
      domain,
      jobTitle,
      country,
      username,
      isSetupFlow,
    } = body;

    // --- STEP 1: AUTOMATIC SLUG GENERATION USING SLUGIFY ---
    // slugify("My Org @ 2024") -> "my-org-2024"
    const slug = slugify(organizationName, {
      replacement: "-", // spaces-ku pathila '-'
      remove: /[*+~.()'"!:@]/g, // special characters-ai remove panna
      lower: true, // ellathaiyum lowercase-ah matha
      strict: true, // symbols-ai remove panna
      trim: true, // extra spaces-ai thukkira
    });

    // 2. Manual Validation: Name or Domain already exists-ah nu check pandrom and Slug
    const existingOrg = await Organization.findOne({
      where: {
        [Op.or]: [
          { name: organizationName },
          { domain: domain },
          { slug: slug },
        ],
      },
    });

    if (existingOrg) {
      // Inga exact-ah edhu exist aagudhu-nu find panni error message anuppalaam
      const isNameMatch = existingOrg.name === organizationName;
      return NextResponse.json(
        {
          error: isNameMatch
            ? "Organization name is already taken."
            : "Domain is already in use by another organization.",
        },
        { status: 400 },
      );
    }

    const newOrg = await Organization.create({
      name: organizationName,
      slug: slug,
      domain: domain,
      fullDomainUrl: `${domain}.vercel.app`,
      jobTitle,
      country,
      adminUsername: username,
      adminId: userId,
    });

    // --- AUTOMATIC BASE URL DETECTION ---
    // Development-la 'http://localhost:3000'
    // Vercel-la deploy panna automatic-ah 'https://your-app.vercel.app'
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    // Fix: Vercel_URL sila samayam branch URL-ai tharum.
    // Unga production domain-ai direct-ah handle panna ithu thaan best way.
    const host =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL ||
      "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // --- STEP 2: AUTO-INITIALIZE GENERAL SETTINGS ---
    const newSettings = await GeneralSettings.create({
      orgId: newOrg.id,
      helpDeskUrl: `${baseUrl}/portal/${slug}`,
      portalUrl: `${baseUrl}/portal/${slug}`, // Store: http://localhost:3000/portal/testing-4
      supportEmail: `help@${domain}.vercel.app`,
      autoAssign: false, // Default toggle: Off
    });

    // 3. User table-la setup completed status-ai update pannugirom
    await User.update(
      {
        isSetupCompleted: true,
      },
      { where: { id: userId } },
    );

    return NextResponse.json(
      {
        message: "Organization created successfully",
        org: newOrg,
        settings: newSettings,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("ORG_CREATE_ERROR:", error);

    // Domain unique constraint error-ah handle panna
    if (error.name === "SequelizeUniqueConstraintError") {
      return NextResponse.json(
        { error: "Domain already exists" },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
