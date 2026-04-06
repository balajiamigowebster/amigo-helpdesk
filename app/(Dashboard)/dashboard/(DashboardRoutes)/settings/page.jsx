import { redirect } from "next/navigation";
import React from "react";

const SettingsPage = () => {
  redirect("/dashboard/settings/global-settings");
  return null;
};

export default SettingsPage;
