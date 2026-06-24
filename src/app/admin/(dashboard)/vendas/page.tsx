import { getSalesOrders } from "@/lib/actions-sales";
import { getCustomers } from "@/lib/actions-crm";
import { VendasClient } from "./VendasClient";

export default async function VendasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const status = params.status || "";

  const [ordersResult, customersResult] = await Promise.all([
    getSalesOrders(page, 20, search, status),
    getCustomers(1, 200, "", ""),
  ]);

  if ("error" in ordersResult) return <p className="p-6 text-red-500">{ordersResult.error}</p>;

  const customers = "error" in customersResult ? [] : customersResult.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
        <p className="text-sm text-gray-500 mt-1">Gestão de pedidos de venda de mercadorias</p>
      </div>
      <VendasClient
        orders={ordersResult.data}
        total={ordersResult.total}
        page={page}
        search={search}
        statusFilter={status}
        customers={customers}
      />
    </div>
  );
}
