"use client";

import { Headphones } from "lucide-react";
import { motion } from "framer-motion";

const HelpDeskLoader = () => {
  return (
    // h-screen matrum overflow-hidden thaan scroll bar-ai thadukkum
    <div className="fixed inset-0 z-9999 h-screen w-screen flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* 1. Hyper-Modern Background (Animated Orbs) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[5%] -left-[5%] w-[40%] h-[40%] bg-blue-600/15 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[5%] -right-[5%] w-[40%] h-[40%] bg-indigo-600/15 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* 2. The Core Icon with "Sonar" Effect */}
        <div className="relative mb-8 md:mb-10">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 2.2 }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeOut",
              }}
              className="absolute inset-0 border border-blue-500/40 rounded-full"
            />
          ))}

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-20 h-20 md:w-24 md:h-24 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)]"
          >
            <motion.div
              animate={{ rotateY: [0, 180, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Headphones className="text-blue-500 w-8 h-8 md:w-10 md:h-10" />
            </motion.div>
          </motion.div>
        </div>

        {/* 3. Typography */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-black tracking-tighter text-white flex items-baseline"
            >
              HelpDesk
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-blue-500 ml-0.5"
              >
                .
              </motion.span>
              <span className="text-blue-500 text-xl md:text-2xl ml-0.5">
                Tech
              </span>
            </motion.h1>
          </div>

          {/* 4. Progress Bar */}
          <div className="relative w-40 md:w-48 h-px bg-white/10 rounded-full mx-auto overflow-hidden mb-4">
            <motion.div
              initial={{ left: "-100%" }}
              animate={{ left: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-0 h-full w-[50%] bg-linear-to-r from-transparent via-blue-500 to-transparent"
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-[0.6em] font-semibold"
          >
            Initializing System
          </motion.p>
        </div>
      </div>

      {/* 5. Bottom Status - Repositioned to be visible without scroll */}
      <div className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2.5 bg-white/5 px-5 py-2 rounded-full border border-white/5 backdrop-blur-xl">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="text-slate-400 text-[9px] font-bold tracking-widest uppercase">
            LOADING
          </span>
        </div>
      </div>
    </div>
  );
};

export default HelpDeskLoader;
