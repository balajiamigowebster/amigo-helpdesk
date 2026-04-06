import { EmployeeAdministration, Organization, User } from "@/lib";
import { NextResponse } from "next/server";
import { Op } from "sequelize";

export async function GET(req) {
  try {
    const userId = req.headers.get("user-id");
    const { searchParams } = new URL(req.url);
    const currentOrgId = searchParams.get("orgId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // --- 1. Identify who is logged in ---
    const loggedInUser = await User.findByPk(userId);
    let employees = [];
    let targetOwnerId = userId;

    if (loggedInUser) {
      // CASE: SUPER_ADMIN Login - Show all employees for this owner
      employees = await EmployeeAdministration.findAll({
        where: { ownerId: userId },
        include: [
          {
            model: User,
            as: "Owner",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } else {
      // CASE: EMPLOYEE Login (ORG_ADMIN, ORG_TECH, etc.)
      const employeeProfile = await EmployeeAdministration.findByPk(userId);
      if (!employeeProfile)
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 },
        );

      targetOwnerId = employeeProfile.ownerId;

      // Logic: Avaroda organization kulla irukkira matha employees-ai fetch panrom
      employees = await EmployeeAdministration.findAll({
        where: {
          ownerId: targetOwnerId,
          [Op.or]: [
            { accessScope: "ALL" }, // "ALL" access irukkira technicians-ai kaattuvom
            {
              // JSON array-kulla currentOrgId irukka-nu check panrom
              organizations: { [Op.like]: `%${currentOrgId}%` },
            },
          ],
        },
        include: [
          {
            model: User,
            as: "Owner",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    }

    // --- 2. Data Formatting (Unga pazhaya formatting logic) ---
    const formattedEmployees = await Promise.all(
      employees.map(async (emp) => {
        const employee = emp.get({ plain: true });
        let orgs = employee.organizations;
        if (typeof orgs === "string") {
          try {
            orgs = JSON.parse(orgs);
          } catch (e) {
            orgs = [];
          }
        }

        if (
          employee.accessScope === "ALL" ||
          (Array.isArray(orgs) && orgs.includes("ALL"))
        ) {
          employee.displayOrganizations = "All Organizations";
          employee.organizations = ["ALL"];
        } else if (Array.isArray(orgs) && orgs.length > 0) {
          const orgDetails = await Organization.findAll({
            where: { id: orgs },
            attributes: ["name"],
          });
          employee.displayOrganizations = orgDetails
            .map((o) => o.name)
            .join(", ");
          employee.organizations = orgs;
        } else {
          employee.displayOrganizations = "None";
          employee.organizations = [];
        }
        return employee;
      }),
    );

    return NextResponse.json(
      { success: true, data: formattedEmployees },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET_EMPLOYEES_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
