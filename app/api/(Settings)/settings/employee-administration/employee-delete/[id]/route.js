import { EmployeeAdministration } from "@/lib";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    // 1. URL Params-la irunthu Employee ID-ai edukuroam
    const { id: employeeId } = await params;

    // 2. Middleware-la irunthu Owner ID (Admin ID) edukuroam
    const ownerId = req.headers.get("user-id");

    if (!employeeId) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 },
      );
    }

    // 3. Employee-ai kandupidikkirom
    // Inga ownerId check pandrathu romba mukkiyam (Security)

    const employee = await EmployeeAdministration.findOne({
      where: {
        id: employeeId,
        ownerId: ownerId, // Yar create pannangalo avanga mattum thaan delete panna mudiyum
      },
    });

    if (!employee) {
      return NextResponse.json(
        {
          message: "Employee not found or you don't have permission to delete",
        },
        { status: 404 },
      );
    }

    // 4. Employee-ai Delete panroam
    // Unga model-la 'beforeDestroy' hook irundhaal, image automatic-ah Cloudinary-la delete aagidum
    await employee.destroy();

    return NextResponse.json(
      {
        success: true,
        message: "Employee and their associated data deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE_EMPLOYEE_ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 },
    );
  }
}
