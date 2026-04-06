import PermissionClientPage from "../_setting-components/PermissionClientPage";
import { getOwnerOrganizations } from "../getOwnerOrganizations";

export default async function PermissionPage() {
  // Server-side fetch
  const response = await getOwnerOrganizations();
  const organizations = response.data || [];

  // Client component-ku data-vai props-ah anupuroam
  return <PermissionClientPage initialOrganizations={organizations} />;
}
