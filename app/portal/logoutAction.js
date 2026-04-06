"use server";

import { cookies } from "next/headers";

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    // 1. Check if session exists (Validation)
    const sessionToken = cookieStore.get("portal_session")?.value;

    if (!sessionToken) {
      return {
        success: false,
        message: "No active session found. You might be already logged out.",
        code: "NO_SESSION",
      };
    }

    // 2. Clear all related cookies
    // Note: Cookies delete pannum pothu path "/" nu irukkurathu safe
    cookieStore.delete("portal_session");
    cookieStore.delete("portal_user_email");
    cookieStore.delete("portal_user_id");
    cookieStore.delete("portal_org_slug");

    // Double check (Optional but good for debugging)
    // Most browsers will clear it on the next request cycle

    return {
      success: true,
      message: "Logged out successfully",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Logout Action Error:", error);
    return {
      success: false,
      message: "Server error occurred during logout. Please try again.",
      code: "SERVER_ERROR",
    };
  }
}
