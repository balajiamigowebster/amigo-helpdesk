"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const NavbarWrapper = () => {
  const pathName = usePathname();

  // Endha routes-la Navbar hide aaganumo adhai inga kudunga
  const hideNavbarRoutes = [
    "/login",
    "/signup",
    "/admin",
    "/dashboard",
    "/signUp",
    "/setup-organization",
    "/setup-password",
    "/reset-password-page",
    "/portal",
    "/unauthorized",
  ];

  // Check if current path starts with any of the hidden routes
  const shouldHideNavbar = hideNavbarRoutes.some((route) =>
    pathName.startsWith(route),
  );

  if (shouldHideNavbar) return null;

  return <Navbar />;
};

export default NavbarWrapper;
