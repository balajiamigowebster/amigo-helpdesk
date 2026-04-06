import React from "react";
import SettingsSidebar from "./_setting-components/SettingsSidebar";
import { getOwnerOrganizations } from "./getOwnerOrganizations";

export const dynamic = "force-dynamic";

const SettingsLayout = async ({ children }) => {
  // Logic: Real app-la Redux state or Session logic inga varum
  // Ippo demo-ku true nu vachukalam
  const isAdmin = true;

  const response = await getOwnerOrganizations();
  // console.log(response);

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] ">
      <SettingsSidebar
        isAdmin={true}
        organizations={response.data || []}
        error={response.error}
      />
      <main className="flex-1 overflow-y-auto bg-[#f9fafb]">
        <div className="mx-auto max-w-5xl rounded-lg px-8 py-6 ">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SettingsLayout;
