import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const token = request.cookies.get("auth_token")?.value;

  const { pathname } = request.nextUrl;

  // --- ITHA SERUNGA ---
  // Public paths (Login/Register) - Token irunthaal inga poga koodathu
  const isPublicPath = pathname === "/login" || pathname === "/signUp";

  // 1. Token irunthu, user login/signup page-ku poga muyandrual redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 1. Auth related API matrum routes-ah ignore pannunga
  if (
    pathname.startsWith("/api/verify-otp") ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/api/register") ||
    pathname === "/api/settings/employee-administration/verify-employee" ||
    pathname === "/setup-password" // Frontend route-aiyum bypass pannanum
  ) {
    return NextResponse.next();
  }

  // 2. Token illana Unauthorized
  if (!token) {
    if (isPublicPath) return NextResponse.next(); // Login page-ku token thevai illai

    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // 3. jsonwebtoken create panna token-ah jose vachu verify pandrom
    // secret key-ah 'TextEncoder' vachu convert pannanum (Jose requirement)

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const isEmployee =
      payload.role === "ORG_TECH" || payload.role === "ORG_ADMIN";

    // 1. Employee-ah irundha setup-organization page block
    if (pathname === "/setup-organization" && isEmployee) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // --- ITHU THAAN PUDHIYA LOGIC ---
    // User `/setup-organization` page-ku poga muyandrual,
    // avargal setup mudithu-vittargala nu check pannuvom (Payload-il irunthu)
    if (pathname === "/setup-organization" && payload.isSetupCompleted) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Case 2: Setup mudiyala, aanaa manual-a dashboard-ku poga paakuraan -> Redirect to Setup
    // if (pathname.startsWith("/dashboard") && !setupCompleted) {
    //   return NextResponse.redirect(new URL("/setup-organization", request.url));
    // }

    // 4. Token valid-ah iruntha user info-ah headers-la anupuroam
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("user-id", payload.id);
    requestHeaders.set("user-role", payload.role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    console.error("JWT Verification Failed:", error.message);
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: [
    "/login",
    "/signUp",
    "/api/me/:path*",
    "/dashboard/:path*",
    "/setup-organization",
    "/api/organization/:path*",
    "/api/tickets/:path*",
    "/api/settings/:path*",
  ],
};
