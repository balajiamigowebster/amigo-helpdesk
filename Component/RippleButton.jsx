"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils"; // Shadcn use panna ithu helpful-ah irukkum

const RippleButton = ({
  children,
  onClick,
  className = "",
  rippleColor = "rgba(255, 255, 255, 0.5)",
  ...props
}) => {
  const [ripples, setRipples] = useState([]);

  const createRipple = (event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    // OnClick function irundha adhai call pannuvom
    if (onClick) onClick(event);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  // Default color ippo prop-ah set pannirukkoam
  const defaultBaseClass =
    "relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-none flex items-center gap-2 shadow-lg shadow-blue-200/50 transition-all active:scale-95 font-bold h-11 px-6 rounded-md";

  return (
    <button
      onClick={createRipple}
      className={cn(defaultBaseClass, className)}
      {...props}
    >
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: ripple.y,
              left: ripple.x,
              width: "20px",
              height: "20px",
              backgroundColor: rippleColor,
              borderRadius: "50%",
              pointerEvents: "none",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Button Content - Ippo children-ah dynamic-ah varum */}
      <div className="relative z-10 flex items-center gap-2">{children}</div>
    </button>
  );
};

export default RippleButton;
