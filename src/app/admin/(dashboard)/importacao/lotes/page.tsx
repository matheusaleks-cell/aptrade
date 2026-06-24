import { getImportLots } from "@/lib/actions-import-lots";
import { getSuppliers } from "@/lib/actions-suppliers";
import { getOperationsList } from "@/lib/actions";
import { ImportLotsClient } from "./ImportLotsClient";

export default async function ImportLotesPage() {
  const [lotsResult, suppliersResult, operations] = await Promise.all([
    getImportLots(),
    getSuppliers(),
    getOperationsList(),
  ]);

  if ("error" in lotsResult && lotsResult.error) {
    return <div className="p-6 text-red-600">Erro: {lotsResult.error}</div>;
  }

  const lots = lotsResult.data ?? [];
  const suppliers =
    suppliersResult && "data" in suppliersResult ? suppliersResult.data ?? [] : [];
  const operationOptions = operations.map((op: any) => ({
    id: op.id,
    code: op.operationCode,
    projectName: op.project?.name || "",
  }));

  return (
    <ImportLotsClient
      initialLots={lots}
      suppliers={suppliers}
      operations={operationOptions}
    />
  );
}
