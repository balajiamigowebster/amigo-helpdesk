import { EmployeeAdministration, Organization, User } from "@/lib";
import { NextResponse } from "next/server";
import { Op } from "sequelize";

export async function GET(req) {
  try {
    const userId = req.headers.get("user-id");
    const { searchParams } = new URL(req.url);

    let currentOrgId = searchParams.get("orgId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const loggedInUser = await User.findByPk(userId);
    let employees = [];
    let targetOwnerId;

    if (loggedInUser) {
      // --- CASE A: SUPER_ADMIN / OWNER Login ---
      targetOwnerId = userId;
      employees = await EmployeeAdministration.findAll({
        where: { ownerId: targetOwnerId },
        include: [
          {
            model: User,
            as: "Owner",
            attributes: ["id", "firstName", "lastName", "email"],
          },
          {
            model: Organization,
            as: "Organizations",
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } else {
      // --- CASE B: EMPLOYEE Login ---
      const employeeProfile = await EmployeeAdministration.findByPk(userId);
      if (!employeeProfile)
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 },
        );

      targetOwnerId = employeeProfile.ownerId;

      if (!currentOrgId) {
        let profileOrgs = employeeProfile.organizations;
        if (typeof profileOrgs === "string")
          profileOrgs = JSON.parse(profileOrgs);
        if (Array.isArray(profileOrgs) && profileOrgs.length > 0) {
          currentOrgId = profileOrgs[0];
        }
      }

      // STEP 1: Find IDs of employees belonging to the currentOrgId
      const matchingEmployees = await EmployeeAdministration.findAll({
        attributes: ["id"],
        where: { ownerId: targetOwnerId },
        include: [
          {
            model: Organization,
            as: "Organizations",
            where: { id: currentOrgId }, // Filtering happens here
            attributes: [],
            through: { attributes: [] },
          },
        ],
      });

      const idsToFetch = matchingEmployees.map((e) => e.id);

      // STEP 2: Fetch FULL details for those IDs (without filtering the include)
      employees = await EmployeeAdministration.findAll({
        where: {
          [Op.or]: [
            { id: idsToFetch },
            { accessScope: "ALL", ownerId: targetOwnerId }, // Include global techs
          ],
        },
        include: [
          {
            model: User,
            as: "Owner",
            attributes: ["id", "firstName", "lastName", "email"],
          },
          {
            model: Organization,
            as: "Organizations", // Fetches ALL organizations for these employees
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    }

    // --- Data Formatting Logic ---
    const formattedEmployees = employees.map((emp) => {
      const employee = emp.get({ plain: true });

      if (employee.accessScope === "ALL") {
        employee.displayOrganizations = "All Organizations";
      } else if (employee.Organizations && employee.Organizations.length > 0) {
        employee.displayOrganizations = employee.Organizations.map(
          (o) => o.name,
        ).join(", ");
      } else {
        employee.displayOrganizations = "None";
      }

      // Sync orgIds for UI Select components
      employee.orgIds = employee.Organizations
        ? employee.Organizations.map((o) => o.id)
        : [];

      return employee;
    });

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
