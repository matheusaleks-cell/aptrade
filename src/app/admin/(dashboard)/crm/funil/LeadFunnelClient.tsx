"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  archiveLead,
  convertLeadToInvestor,
} from "@/lib/actions-crm";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBRL } from "@/lib/calculations";
import { toast } from "sonner";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Archive,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  priority: string;
  value: number | null;
  source: string | null;
  interests: string | null;
  notes: string | null;
  createdAt: Date;
}

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "NOVO", label: "Novo" },
  { value: "CONTATO", label: "Contato" },
  { value: "QUALIFICADO", label: "Qualificado" },
  { value: "PROPOSTA", label: "Proposta" },
  { value: "NEGOCIACAO", label: "Negociacao" },
  { value: "FECHADO", label: "Fechado" },
  { value: "PERDIDO", label: "Perdido" },
];

const priorityOptions = [
  { value: "BAIXA", label: "Baixa" },
  { value: "MEDIA", label: "Media" },
  { value: "ALTA", label: "Alta" },
  { value: "URGENTE", label: "Urgente" },
];

export function LeadFunnelClient({
  initialLeads,
  initialTotal,
  initialPage,
  initialTotalPages,
}: {
  initialLeads: Lead[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
}) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";

  async function fetchLeads(newPage: number, status: string) {
    setLoading(true);
    const result = await getLeads(newPage, 10, "", status);
    if (result && "data" in result && result.data) {
      setLeads(result.data as Lead[]);
      setPage(result.page ?? newPage);
      setTotalPages(result.totalPages ?? 1);
    }
    setLoading(false);
  }

  async function handleStatusFilterChange(status: string) {
    setStatusFilter(status);
    await fetchLeads(1, status);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await createLead({
      name: fd.get("name") as string,
      email: (fd.get("email") as string) || undefined,
      phone: (fd.get("phone") as string) || undefined,
      status: (fd.get("status") as string) || "NOVO",
      priority: (fd.get("priority") as string) || "MEDIA",
      value: fd.get("value") ? parseFloat(fd.get("value") as string) : undefined,
      source: (fd.get("source") as string) || undefined,
      interests: (fd.get("interests") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
    });
    setFormLoading(false);
    if (result && "error" in result && result.error) {
      toast.error(result.error);
    } else {
      toast.success("Lead criado com sucesso!");
      setShowForm(false);
      await fetchLeads(1, statusFilter);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const result = await updateLead(id, { status: newStatus });
    if (result && "error" in result && result.error) {
      toast.error(result.error);
    } else {
      toast.success("Status atualizado!");
      await fetchLeads(page, statusFilter);
    }
  }

  async function handleArchive(id: string) {
    if (!confirm("Arquivar este lead?")) return;
    const result = await archiveLead(id);
    if (result && "error" in result && result.error) {
      toast.error(result.error);
    } else {
      toast.success("Lead arquivado.");
      await fetchLeads(page, statusFilter);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este lead permanentemente?")) return;
    const result = await deleteLead(id);
    if (result && "error" in result && result.error) {
      toast.error(result.error);
    } else {
      toast.success("Lead excluido.");
      await fetchLeads(page, statusFilter);
    }
  }

  async function handleConvert(id: string) {
    if (!confirm("Converter este lead em investidor?")) return;
    const result = await convertLeadToInvestor(id);
    if (result && "error" in result && result.error) {
      toast.error(result.error);
    } else if (result && "data" in result && result.data) {
      toast.success(`Lead convertido! Senha temporaria: ${result.data.tempPassword}`);
      await fetchLeads(page, statusFilter);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funil de Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Gerenciamento e qualificacao de leads</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          {showForm ? <ChevronUp size={14} /> : <Plus size={14} />}
          {showForm ? "Fechar" : "Novo Lead"}
        </button>
      </div>

      {/* New Lead Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-gray-700">Cadastrar Lead</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Nome *</label>
              <input name="name" required className={inputClass} placeholder="Nome completo" />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input name="email" type="email" className={inputClass} placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input name="phone" className={inputClass} placeholder="(11) 99999-0000" />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" className={inputClass} defaultValue="NOVO">
                {statusOptions.filter((s) => s.value).map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Prioridade</label>
              <select name="priority" className={inputClass} defaultValue="MEDIA">
                {priorityOptions.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Valor (R$)</label>
              <input name="value" type="number" step="0.01" className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className={labelClass}>Origem</label>
              <input name="source" className={inputClass} placeholder="Ex: Site, Indicacao..." />
            </div>
            <div>
              <label className={labelClass}>Interesses</label>
              <input name="interests" className={inputClass} placeholder="Ex: Importacao, Crypto..." />
            </div>
            <div>
              <label className={labelClass}>Notas</label>
              <input name="notes" className={inputClass} placeholder="Observacoes" />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={formLoading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Plus size={14} />
              {formLoading ? "Criando..." : "Criar Lead"}
            </button>
          </div>
        </form>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">Leads</h3>
        </div>

        {leads.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Nenhum lead encontrado.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Nome</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Email</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Telefone</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Prioridade</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Valor</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Origem</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-500">Acoes</th>
                  </tr>
                </thead>
                <tbody className={loading ? "opacity-50" : ""}>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium text-gray-700">{lead.name}</td>
                      <td className="py-2 px-3 text-gray-600">{lead.email || "-"}</td>
                      <td className="py-2 px-3 text-gray-600">{lead.phone || "-"}</td>
                      <td className="py-2 px-3">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {statusOptions.filter((s) => s.value).map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            lead.priority === "URGENTE"
                              ? "bg-red-50 text-red-600"
                              : lead.priority === "ALTA"
                              ? "bg-orange-50 text-orange-600"
                              : lead.priority === "MEDIA"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {lead.priority}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-gray-700">
                        {lead.value ? formatBRL(lead.value) : "-"}
                      </td>
                      <td className="py-2 px-3 text-gray-600">{lead.source || "-"}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleArchive(lead.id)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Arquivar"
                          >
                            <Archive size={14} className="text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                          {lead.email && (
                            <button
                              onClick={() => handleConvert(lead.id)}
                              className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Converter para Investidor"
                            >
                              <UserCheck size={14} className="text-emerald-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Pagina {page} de {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchLeads(page - 1, statusFilter)}
                  disabled={page <= 1 || loading}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} className="text-gray-600" />
                </button>
                <button
                  onClick={() => fetchLeads(page + 1, statusFilter)}
                  disabled={page >= totalPages || loading}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
