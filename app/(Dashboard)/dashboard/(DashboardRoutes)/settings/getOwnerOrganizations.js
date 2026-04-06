import { EmployeeAdministration, Organization, User } from "@/lib";
import { headers } from "next/headers";
import { Op } from "sequelize";

export async function getOwnerOrganizations() {
  try {
    const headerList = await headers();
    const userId = headerList.get("user-id");

    if (!userId) {
      return { success: false, error: "Unauthorized", data: [] };
    }

    let targetOwnerId = userId;
    let allowedOrgIds = null;

    const isOwner = await User.findByPk(userId);

    if (!isOwner) {
      const employee = await EmployeeAdministration.findByPk(userId, {
        attributes: ["ownerId", "accessScope", "organizations"],
      });

      if (employee) {
        targetOwnerId = employee.ownerId;

        if (employee.accessScope === "SPECIFIC") {
          let orgs = employee.organizations;

          // FIX: Handle Double Stringified JSON (Console log-la iruntha problem ithu thaan)
          if (typeof orgs === "string") {
            try {
              // First parse: "[ \"id1\", \"id2\" ]" -> '["id1", "id2"]'
              let parsedOrgs = JSON.parse(orgs);

              // Second parse: '["id1", "id2"]' -> Array ["id1", "id2"]
              if (typeof parsedOrgs === "string") {
                parsedOrgs = JSON.parse(parsedOrgs);
              }
              orgs = parsedOrgs;
            } catch (e) {
              console.error("JSON Parsing failed:", e);
              orgs = [];
            }
          }

          allowedOrgIds = Array.isArray(orgs) ? orgs : [];
        }
      } else {
        return { success: false, error: "User not found", data: [] };
      }
    }

    const whereClause = {
      adminId: targetOwnerId,
    };

    // Employee SPECIFIC access-la list irunthaal mattum filter pannu
    if (allowedOrgIds && allowedOrgIds.length > 0) {
      whereClause.id = {
        [Op.in]: allowedOrgIds,
      };
    } else if (!isOwner && allowedOrgIds !== null) {
      // SPECIFIC access aanaal empty array irunthaal data-ve vara koodathu
      return { success: true, data: [] };
    }

    const organizations = await Organization.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    return {
      success: true,
      data: organizations,
    };
  } catch (error) {
    console.error("Fetch Organization Error:", error);
    return { success: false, error: "Internal Server Error", data: [] };
  }
}
