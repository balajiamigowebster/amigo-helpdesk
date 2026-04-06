import React from "react";

const OrgSettingsLayout = async ({ children, params }) => {
  const { orgId } = await params;

  return (
    <div className="flex-1 flex flex-col h-full  overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8">{children}</div>
    </div>
  );
};

export default OrgSettingsLayout;
