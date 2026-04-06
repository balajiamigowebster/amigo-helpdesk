import {
  EmployeeAdministration,
  Organization,
  User,
  EmployeeOrganizations,
} from "@/lib";
import { NextResponse } from "next/server";

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

    // ------------------------------------------------
    // 1️⃣ Check if SUPER_ADMIN
    // ------------------------------------------------

    const loggedInUser = await User.findByPk(userId);

    let employees = [];
    let ownerId = userId;

    if (loggedInUser) {
      // SUPER_ADMIN → show all employees

      employees = await EmployeeAdministration.findAll({
        where: { ownerId: userId },

        include: [
          {
            model: Organization,
            as: "Organizations",
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
          {
            model: User,
            as: "Owner",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],

        order: [["createdAt", "DESC"]],
      });
    } else {
      // ------------------------------------------------
      // 2️⃣ Employee login (ORG_ADMIN / ORG_TECH)
      // ------------------------------------------------

      const employeeProfile = await EmployeeAdministration.findByPk(userId);

      if (!employeeProfile) {
        return NextResponse.json(
          { success: false, message: "Employee not found" },
          { status: 404 },
        );
      }

      ownerId = employeeProfile.ownerId;

      // ------------------------------------------------
      // 3️⃣ Get employees inside current organization
      // ------------------------------------------------

      employees = await EmployeeAdministration.findAll({
        where: { ownerId },

        include: [
          {
            model: Organization,
            as: "Organizations",
            attributes: ["id", "name"],
            through: { attributes: [] },

            // only this org employees
            where: currentOrgId ? { id: currentOrgId } : undefined,
          },
          {
            model: User,
            as: "Owner",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],

        order: [["createdAt", "DESC"]],
      });
    }

    // ------------------------------------------------
    // 4️⃣ Format response
    // ------------------------------------------------

    const formattedEmployees = employees.map((emp) => {
      const employee = emp.get({ plain: true });

      const orgNames = employee.Organizations?.map((org) => org.name) || [];

      employee.displayOrganizations =
        orgNames.length > 0 ? orgNames.join(", ") : "None";

      employee.organizations =
        employee.Organizations?.map((org) => org.id) || [];

      delete employee.Organizations;

      return employee;
    });

    return NextResponse.json(
      {
        success: true,
        data: formattedEmployees,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET_EMPLOYEES_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
