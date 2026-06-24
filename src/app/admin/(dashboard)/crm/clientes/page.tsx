import { getCustomers } from "@/lib/actions-crm";
import { ClientesClient } from "./ClientesClient";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; type?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const type = params.type || "";

  const result = await getCustomers(page, 20, search, type);
  if ("error" in result) return <p className="p-6 text-red-500">{result.error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-sm text-gray-500 mt-1">Cadastro de compradores B2B e B2C</p>
      </div>
      <ClientesClient
        customers={result.data}
        total={result.total}
        page={page}
        search={search}
        typeFilter={type}
      />
    </div>
  );
}
