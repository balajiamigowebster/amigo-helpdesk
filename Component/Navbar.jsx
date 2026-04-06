"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenuAlt3, HiX, HiChevronDown } from "react-icons/hi"; // HiChevronDown add pannirukaen
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const loginMove = () => {
    router.push("/login");
  };

  const navLinks = [
    { name: "Articles", href: "#" },
    { name: "Community", href: "#" },
    { name: "Research", href: "#" },
    { name: "IT Tools", href: "#" },
    { name: "Newsletters", href: "#" },
    { name: "Vendors", href: "#" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/70 backdrop-blur-md dark:bg-black/70 py-4 shadow px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight">
              HELP<span className="text-blue-600 px-2">DESK</span>
            </Link>

            {/* Desktop Links with Animated Chevron */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <motion.div
                  key={link.name}
                  whileHover="hover" // Hover state-ai activate pannum
                  className="relative flex items-center gap-1 cursor-pointer group"
                >
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-gray-600 group-hover:text-black transition-colors"
                  >
                    {link.name}
                  </Link>

                  {/* Framer Motion Icon Animation */}
                  <motion.div
                    variants={{
                      hover: { rotate: 180 }, // Hover pannum pothu 180 degree rotate aagum (Up arrow effect)
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="text-gray-500 group-hover:text-black"
                  >
                    <HiChevronDown size={16} />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Button
              variant="outline"
              onClick={loginMove}
              className="text-sm text-neutral-900 font-medium px-4 py-5 bg-[#C2E7FF] hover:bg-[#c3e0f3] rounded-md transition"
            >
              Sign in
            </Button>
          </div>

          <div className="lg:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-2xl">
              {isOpen ? <HiX /> : <HiMenuAlt3 />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu (Framer Motion) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-16 left-0 right-0 z-40 bg-white border-b shadow-lg p-6 flex flex-col gap-4 lg:hidden"
          >
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="flex justify-between items-center border-b border-gray-50 pb-2"
              >
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium"
                >
                  {link.name}
                </Link>
                <HiChevronDown className="text-gray-400" />
              </div>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <Button
                variant="outline"
                onClick={loginMove}
                className="text-sm text-neutral-900 font-medium px-4 py-7 bg-[#C2E7FF] hover:bg-[#c3e0f3] rounded-md transition"
              >
                Sign in
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
