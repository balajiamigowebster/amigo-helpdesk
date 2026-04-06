import { Organization } from "@/lib";
import { NextResponse } from "next/server";
import slugify from "slugify";

export async function GET() {
  // await Organization.sync({ alter: true });
  try {
    // 1. Database-la irukira ella organization-aiyum edukunga
    const organization = await Organization.findAll();
    let updatedCount = 0;
    let errors = [];

    // 2. Loop panni ovvoru organization-ukkum slug update pannuvom
    for (const org of organization) {
      // Slug empty-ah irunthaal mattum update seiyyum
      if (!org.slug || org.slug === "" || org.slug === null) {
        // Unga specific slugify logic
        const generatedSlug = slugify(org.name, {
          replacement: "-",
          remove: /[*+~.()'"!:@]/g,
          lower: true,
          strict: true,
          trim: true,
        });

        try {
          // Intha specific ID ulla org-ku mattum slug-ai update pannugirom
          // Vera entha fields-um (name, domain, etc.) change aagathu
          await Organization.update(
            {
              slug: generatedSlug,
            },
            { where: { id: org.id } },
          );
          updatedCount++;
        } catch (updateError) {
          // Oru velai duplicate slug vanthaal error-ai record pannuvom
          errors.push(`Error updating ${org.name}: ${updateError.message}`);
        }
      }
    }

    return NextResponse.json({
      message: "Migration process finished!",
      totalUpdated: updatedCount,
      errors: errors.length > 0 ? errors : "None",
      status: "Success",
    });
  } catch (error) {
    console.error("Migration Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
