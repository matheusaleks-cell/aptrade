"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomer, updateCustomer, deleteCustomer } from "@/lib/actions-crm";
import { formatBRL } from "@/lib/calculations";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Search, ChevronLeft, ChevronRight, Users } from "lucide-react";

interface CustomerItem {
  id: string;
  name: string;
  cpfCnpj: string | null;
  type: string;
  email: string | null;
  phone: string | null;
  state: string | null;
  totalSpent: number;
  ordersCount: number;
}

export function ClientesClient({
  customers,
  total,
  page,
  search,
  typeFilter,
}: {
  customers: CustomerItem[];
  total: number;
  page: number;
  search: string;
  typeFilter: string;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchVal, setSearchVal] = useState(search);
  const totalPages = Math.ceil(total / 20);

  function navigate(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (searchVal) params.set("search", searchVal);
    if (typeFilter) params.set("type", typeFilter);
    params.set("page", String(page));
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    router.push(`/admin/crm/clientes?${params.toString()}`);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    fd.forEach((v, k) => { if (v) data[k] = v as string; });
    const res = await createCustomer(data as any);
    setLoading(false);
    if (res && "error" in res) { toast.error(res.error); return; }
    toast.success("Cliente cadastrado!");
    setShowForm(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este cliente?")) return;
    const res = await deleteCustomer(id);
    if (res && "error" in res) { toast.error(res.error); return; }
    toast.success("Cliente excluído.");
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
            placeholder="Buscar por nome, CPF/CNPJ..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          defaultValue={typeFilter}
          onChange={(e) => navigate({ type: e.target.value, page: "1" })}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Todos os tipos</option>
          <option value="B2B">B2B</option>
          <option value="B2C">B2C</option>
        </select>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Novo Cliente</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="name" required placeholder="Nome *" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input name="cpfCnpj" placeholder="CPF/CNPJ" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <select name="type" className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="B2B">B2B</option>
              <option value="B2C">B2C</option>
            </select>
            <input name="email" type="email" placeholder="E-mail" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input name="phone" placeholder="Telefone" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input name="state" placeholder="Estado (UF)" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input name="city" placeholder="Cidade" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input name="address" placeholder="Endereço" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input name="category" placeholder="Categoria" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                {loading ? "Salvando..." : "Cadastrar"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">{total} cliente(s)</h3>
        </div>
        {customers.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">Nenhum cliente encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Nome</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">CPF/CNPJ</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Tipo</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Email</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Telefone</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Total Gasto</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Pedidos</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-700">{c.name}</td>
                    <td className="py-2 px-3 text-gray-600">{c.cpfCnpj || "—"}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.type === "B2B" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-600">{c.email || "—"}</td>
                    <td className="py-2 px-3 text-gray-600">{c.phone || "—"}</td>
                    <td className="py-2 px-3 text-right font-medium">{formatBRL(c.totalSpent)}</td>
                    <td className="py-2 px-3 text-center">{c.ordersCount}</td>
                    <td className="py-2 px-3 text-center">
                      <button onClick={() => handleDelete(c.id)} className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600" title="Excluir">
                        <Trash2 size={14} />
                      </button>
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
