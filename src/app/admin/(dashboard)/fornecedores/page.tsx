import { getSuppliers } from "@/lib/actions-suppliers";
import { SuppliersClient } from "./SuppliersClient";

export default async function FornecedoresPage() {
  const result = await getSuppliers();

  if ("error" in result && result.error) {
    return (
      <div className="p-6 text-red-600">Erro: {result.error}</div>
    );
  }

  const suppliers = result.data ?? [];

  return <SuppliersClient initialSuppliers={suppliers} />;
}
