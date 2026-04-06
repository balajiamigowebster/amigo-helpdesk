import { Organization } from "@/lib";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const domain = searchParams.get("domain");

  try {
    let exists = false;
    let message = "";

    if (name) {
      const org = await Organization.findOne({
        where: {
          name,
        },
      });

      if (org) {
        exists = true;
        message = "Organization name is already taken.";
      }
    }

    if (domain) {
      const existingDomain = await Organization.findOne({
        where: {
          domain,
        },
      });
      if (existingDomain) {
        exists = true;
        message = "Domain is already in use.";
      }
    }

    return NextResponse.json(
      {
        exists,
        message,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
