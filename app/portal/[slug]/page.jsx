import { Organization } from "@/lib";
import UserPortal from "@/lib/models/Organization/UserPortal";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import UserTicketDashboard from "../_user-portal-component/UserTicketDashboard";
import UserPortalRegister from "../_user-portal-component/UserPortalRegister";

// Theme Configuration Object
const THEMES = {
  orange: {
    banner: "bg-orange-500",
    button: "bg-orange-600 hover:bg-orange-700",
    ring: "#f97316",
    text: "text-orange-500",
    border: "border-orange-500",
    focusBorder:
      "focus-visible:ring-orange-500/20 focus-visible:border-orange-500 focus-visible:ring-4 ring-0",
    avatar: "bg-orange-500",
  },
  blue: {
    banner: "bg-blue-600",
    button: "bg-blue-700 hover:bg-blue-800",
    ring: "#2563eb",
    text: "text-blue-600",
    border: "border-blue-600",
    focusBorder:
      "focus-visible:ring-blue-600/20 focus-visible:border-blue-600 focus-visible:ring-4 ring-0",
    avatar: "bg-blue-600",
  },
  green: {
    banner: "bg-emerald-600",
    button: "bg-emerald-700 hover:bg-emerald-800",
    ring: "#059669",
    text: "text-emerald-600",
    border: "border-emerald-600",
    focusBorder:
      "focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 focus-visible:ring-4 ring-0",
    avatar: "bg-emerald-600",
  },
  purple: {
    banner: "bg-purple-600",
    button: "bg-purple-700 hover:bg-purple-800",
    ring: "#9333ea",
    text: "text-purple-600",
    border: "border-purple-600",
    focusBorder:
      "focus-visible:ring-purple-600/20 focus-visible:border-purple-600 focus-visible:ring-4 ring-0",
    avatar: "bg-purple-600",
  },
  grey: {
    banner: "bg-slate-600",
    button: "bg-slate-700 hover:bg-slate-800",
    ring: "#475569",
    text: "text-slate-600",
    border: "border-slate-600",
    focusBorder:
      "focus-visible:ring-slate-600/20 focus-visible:border-slate-600 focus-visible:ring-4 ring-0",
    avatar: "bg-slate-600",
  },
};

export default async function PortalPage({ params }) {
  const { slug } = await params;

  // 1. Database logic to get Org and Portal settings
  const orgInstance = await Organization.findOne({
    where: { slug },
  });

  if (!orgInstance) return notFound();

  const org = orgInstance.get({ plain: true });

  // console.log(org);

  // Sequelize model object-ai plain JSON object-ah mathuroam

  const portalInstance = await UserPortal.findOne({
    where: {
      orgId: org.id,
    },
  });

  if (!portalInstance || !portalInstance.isEnabled) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-600 italic uppercase">
          Portal Disabled
        </h1>
        <p className="text-gray-400">
          Please contact {org.name} administrator.
        </p>
      </div>
    );
  }

  // Sequelize model object-ai plain JSON object-ah mathuroam
  const portalData = portalInstance.get({ plain: true });

  const themeConfig = THEMES[portalData.portalTheme] || THEMES.blue;

  // 2. Auth Check Logic (Checking for a session cookie)
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("portal_session")?.value;
  const userEmail = cookieStore.get("portal_user_email")?.value;
  const userId = cookieStore.get("portal_user_id")?.value;
  const sessionSlug = cookieStore.get("portal_org_slug")?.value;

  // Decision Making
  const isLoggedIn = Boolean(sessionToken) && sessionSlug === slug;

  return (
    <>
      {isLoggedIn ? (
        /* User verified? Show Dashboard (1st Image UI) */
        <UserTicketDashboard
          org={org}
          portalData={portalData}
          userEmail={userEmail}
          themeConfig={themeConfig}
          userId={userId}
        />
      ) : (
        /* Not logged in? Show Login Card (2nd Image UI) */
        <UserPortalRegister
          org={org}
          portalData={portalData}
          themeConfig={themeConfig}
        />
      )}
    </>
  );
}
