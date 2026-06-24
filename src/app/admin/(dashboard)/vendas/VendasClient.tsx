"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSalesOrder, cancelSalesOrder, deleteSalesOrder } from "@/lib/actions-sales";
import { formatBRL } from "@/lib/calculations";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { Plus, Search, Trash2, XCircle, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";

interface OrderItem {
  id: string;
  orderNumber: string;
  totalValue: number;
  status: string;
  paymentMethod: string | null;
  createdAt: string | Date;
  customer: { name: string } | null;
}

interface CustomerOption {
  id: string;
  name: string;
}

export function VendasClient({
  orders,
  total,
  page,
  search,
  statusFilter,
  customers,
}: {
  orders: OrderItem[];
  total: number;
  page: number;
  search: string;
  statusFilter: string;
  customers: CustomerOption[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchVal, setSearchVal] = useState(search);
  const totalPages = Math.ceil(total / 20);

  function navigate(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (searchVal) params.set("search", searchVal);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    router.push(`/admin/vendas?${params.toString()}`);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await createSalesOrder({
      customerId: fd.get("customerId") as string,
      products: fd.get("products") as string,
      totalValue: parseFloat(fd.get("totalValue") as string),
      paymentMethod: fd.get("paymentMethod") as string,
      notes: fd.get("notes") as string || undefined,
    });
    setLoading(false);
    if (res && "error" in res) { toast.error(res.error); return; }
    toast.success("Pedido criado!");
    setShowForm(false);
    router.refresh();
  }

  async function handleCancel(id: string) {
    if (!confirm("Cancelar este pedido?")) return;
    const res = await cancelSalesOrder(id);
    if (res && "error" in res) { toast.error(res.error); return; }
    toast.success("Pedido cancelado.");
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este pedido?")) return;
    const res = await deleteSalesOrder(id);
    if (res && "error" in res) { toast.error(res.error); return; }
    toast.success("Pedido excluído.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && navigate({ search: searchVal, page: "1" })}
            placeholder="Buscar pedidos..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          defaultValue={statusFilter}
          onChange={(e) => navigate({ status: e.target.value, page: "1" })}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Todos os status</option>
          <option value="RASCUNHO">Rascunho</option>
          <option value="PAGO">Pago</option>
          <option value="PENDENTE">Pendente</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
          <Plus size={16} /> Novo Pedido
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Novo Pedido de Venda</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cliente *</label>
              <select name="customerId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">Selecione...</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Valor Total *</label>
              <input name="totalValue" type="number" step="0.01" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Pagamento</label>
              <select name="paymentMethod" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="PIX">PIX</option>
                <option value="Boleto">Boleto</option>
                <option value="Cartão">Cartão</option>
                <option value="Transferência">Transferência</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Produtos (descrição)</label>
              <input name="products" placeholder="Ex: 100x Produto A" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Observações</label>
              <textarea name="notes" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                {loading ? "Criando..." : "Criar Pedido"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart size={18} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">{total} pedido(s)</h3>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">Nenhum pedido encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Pedido</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Cliente</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Valor</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Status</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Pagamento</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Data</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-700">{o.orderNumber}</td>
                    <td className="py-2 px-3 text-gray-600">{o.customer?.name || "—"}</td>
                    <td className="py-2 px-3 text-right font-medium">{formatBRL(o.totalValue)}</td>
                    <td className="py-2 px-3 text-center"><StatusBadge status={o.status} /></td>
                    <td className="py-2 px-3 text-center text-gray-500">{o.paymentMethod || "—"}</td>
                    <td className="py-2 px-3 text-center text-gray-500">{new Date(o.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {o.status !== "CANCELADO" && (
                          <button onClick={() => handleCancel(o.id)} className="p-1 hover:bg-amber-50 rounded text-amber-500" title="Cancelar">
                            <XCircle size={14} />
                          </button>
                        )}
                        {(o.status === "RASCUNHO" || o.status === "CANCELADO") && (
                          <button onClick={() => handleDelete(o.id)} className="p-1 hover:bg-red-50 rounded text-red-400" title="Excluir">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <button disabled={page <= 1} onClick={() => navigate({ page: String(page - 1) })} className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronLeft size={16} /></button>
            <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => navigate({ page: String(page + 1) })} className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
