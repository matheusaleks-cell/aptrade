import { getLeads } from "@/lib/actions-crm";
import { LeadFunnelClient } from "./LeadFunnelClient";

export default async function LeadFunnelPage() {
  const result = await getLeads(1, 10, "", "");

  const leads = result && "data" in result ? result.data : [];
  const total = result && "total" in result ? result.total : 0;
  const page = result && "page" in result ? result.page : 1;
  const totalPages = result && "totalPages" in result ? result.totalPages : 1;

  return (
    <LeadFunnelClient
      initialLeads={(leads ?? []) as any}
      initialTotal={total ?? 0}
      initialPage={page ?? 1}
      initialTotalPages={totalPages ?? 1}
    />
  );
}
