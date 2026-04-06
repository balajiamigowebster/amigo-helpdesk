import {
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  MailCheck,
  FingerprintPattern,
  Ticket,
} from "lucide-react"; // Intha icons-ai install pannala na SVG-ah use pannalam

export default function UserPortalRegister({ org, portalData, themeConfig }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-100">
      {/* Header with Pattern Mattrum Dynamic Gradient */}
      <header
        className={`${themeConfig.banner} relative pt-24 pb-40 px-4 overflow-hidden shadow-2xl`}
      >
        {/* Subtle Background Grid */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-8">
          {/* Unique Organization Highlight */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-inner">
            {/* Green Pulse Dot */}
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-white text-sm font-black uppercase tracking-[0.3em] italic">
              {org.name} Official Portal
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic drop-shadow-2xl">
              {portalData.loginWelcomeMessage}
            </h1>
            <p className="text-white/80 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              {portalData.formMessage}
            </p>
          </div>
        </div>

        {/* Smooth Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L1440 120L1440 0C1320 60 1080 80 720 80C360 80 120 60 0 0L0 120Z"
              fill="#F8FAFC"
            />
          </svg>
        </div>
      </header>

      <main className="grow px-4 -mt-24 z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* --- LEFT SIDE: NOW AN ADVERTISEMENT SECTION --- */}
          <div className="lg:col-span-6 hidden lg:block sticky top-10">
            <div className="relative group p-4">
              {/* Lays/Food Style Image */}
              <img
                src="/ads/lays.jpg"
                alt="Hungry for Resolution"
                className="w-full h-auto rounded-[3rem] shadow-2xl transform -rotate-2 group-hover:rotate-0 transition-transform duration-700 border-4 border-white"
              />

              {/* Floating "Fast" Badge */}
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 font-black px-6 py-6 rounded-full shadow-xl animate-bounce border-4 border-white flex flex-col items-center justify-center leading-none">
                <span className="text-xs">SUPER</span>
                <span className="text-lg">Tasty</span>
              </div>

              {/* Ad Content */}
              {/* <div className="mt-10 space-y-4 text-left">
                <h3
                  className={`text-4xl font-black ${themeConfig.text} uppercase italic tracking-tighter`}
                >
                  Hungry for <span className="text-yellow-500">Support?</span>
                </h3>
                <p className="text-slate-500 text-xl font-bold leading-tight uppercase">
                  Tickets served{" "}
                  <span className="underline decoration-wavy decoration-yellow-400">
                    Hot & Fresh
                  </span>{" "}
                  in under 60 seconds!
                </p>
                <div className="bg-slate-900 text-white inline-block px-4 py-1 rounded-md transform -skew-x-12 font-black text-sm">
                  NO DELAYS • NO HASSLE • 100% SATISFACTION
                </div>
              </div> */}
            </div>
          </div>

          {/* Right Side: Login Card */}
          <div className="lg:col-span-6 w-full max-w-lg mx-auto lg:ml-auto">
            <div className="bg-white rounded-[2rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] p-10 border border-white relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 right-0 h-2 ${themeConfig.banner}`}
              ></div>

              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">
                  Log In
                </h2>
                <p className="text-slate-400 font-medium mt-2">
                  Identify yourself to continue.
                </p>
              </div>

              <form className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      className="w-full px-6 py-3 mt-3 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-transparent outline-none ring-offset-2 focus:ring-2 transition-all duration-300 font-bold text-slate-700"
                      style={{ "--tw-ring-color": themeConfig.ring }}
                    />
                  </div>
                </div>

                <button
                  className={`w-full ${themeConfig.button} text-white font-black py-5 rounded-2xl shadow-2xl uppercase tracking-widest transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group`}
                >
                  Continue to Portal
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {/* Enhanced Trust Indicators */}
              <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-around">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    SSL Secured
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Data Protected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="lg:flex lg:justify-center hidden mt-20 right-2 sticky top-10">
        <div className="relative group p-4">
          {/* Lays/Food Style Image */}
          <img
            src="/ads/lays.jpg"
            alt="Hungry for Resolution"
            className="w-150 h-75 rounded-[3rem] shadow-2xl transform -rotate-2 group-hover:rotate-0 transition-transform duration-700 border-4 border-white"
          />

          {/* Floating "Fast" Badge */}
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 font-black px-6 py-6 rounded-full shadow-xl animate-bounce border-4 border-white flex flex-col items-center justify-center leading-none">
            <span className="text-xs">SUPER</span>
            <span className="text-lg">Tasty</span>
          </div>

          {/* Ad Content */}
          {/* <div className="mt-10 space-y-4 text-left">
                <h3
                  className={`text-4xl font-black ${themeConfig.text} uppercase italic tracking-tighter`}
                >
                  Hungry for <span className="text-yellow-500">Support?</span>
                </h3>
                <p className="text-slate-500 text-xl font-bold leading-tight uppercase">
                  Tickets served{" "}
                  <span className="underline decoration-wavy decoration-yellow-400">
                    Hot & Fresh
                  </span>{" "}
                  in under 60 seconds!
                </p>
                <div className="bg-slate-900 text-white inline-block px-4 py-1 rounded-md transform -skew-x-12 font-black text-sm">
                  NO DELAYS • NO HASSLE • 100% SATISFACTION
                </div>
              </div> */}
        </div>
      </div>

      {/* Modern HelpDeskTech Footer */}
      <footer className="py-16 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-200 pt-8">
          <div className="flex items-center gap-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center text-[10px] text-white font-black">
              H
            </div>
            <span className="font-black tracking-tighter text-slate-900 uppercase">
              HelpDesk<span className="text-slate-400">Tech</span>
            </span>
          </div>

          <div className="flex gap-8 text-[10px] font-black text-black underline tracking-widest">
            <a href="#" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-900 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-slate-900 transition-colors">
              Support
            </a>
          </div>

          <p className="text-black text-[13px]    tracking-widest">
            &copy; {new Date().getFullYear()} Precision Built.
          </p>
        </div>
      </footer>
    </div>
  );
}
