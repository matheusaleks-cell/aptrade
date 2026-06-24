"use client";

import { useState } from "react";
import {
  createImportLot,
  updateLotStatus,
  deleteImportLot,
} from "@/lib/actions-import-lots";
import { formatBRL } from "@/lib/calculations";
import { StatusBadge } from "@/components/StatusBadge";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const STATUS_ORDER = [
  "PEDIDO_FEITO",
  "TRANSITO",
  "NACIONALIZANDO",
  "DISPONIVEL",
  "LIQUIDADO",
] as const;

const STATUS_LABELS: Record<string, string> = {
  PEDIDO_FEITO: "Pedido Feito",
  TRANSITO: "Em Transito",
  NACIONALIZANDO: "Nacionalizando",
  DISPONIVEL: "Disponivel",
  LIQUIDADO: "Liquidado",
};

interface ImportLot {
  id: string;
  batchCode: string;
  operationCode: string;
  projectName: string;
  supplier: { id: string; name: string; country: string } | null;
  countryOrigin: string | null;
  quantityItems: number;
  fobValue: number;
  freight: number;
  insurance: number;
  totalCostNationalized: number;
  status: string;
  progress: number;
  createdAt: string | Date;
}

interface SupplierOption {
  id: string;
  name: string;
  country: string;
}

interface OperationOption {
  id: string;
  code: string;
  projectName: string;
}

export function ImportLotsClient({
  initialLots,
  suppliers,
  operations,
}: {
  initialLots: ImportLot[];
  suppliers: SupplierOption[];
  operations: OperationOption[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Pipeline counts
  const pipelineCounts = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: initialLots.filter((l) => l.status === status).length,
  }));

  function getNextStatus(current: string): string | null {
    const idx = STATUS_ORDER.indexOf(current as (typeof STATUS_ORDER)[number]);
    if (idx < 0 || idx >= STATUS_ORDER.length - 1) return null;
    return STATUS_ORDER[idx + 1];
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const result = await createImportLot(formData);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({
        type: "success",
        text: `Lote ${result.data?.batchCode} criado com sucesso!`,
      });
      setShowForm(false);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleAdvanceStatus(id: string, nextStatus: string) {
    setMessage(null);
    const result = await updateLotStatus(id, nextStatus);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      router.refresh();
    }
  }

  async function handleDelete(id: string, batchCode: string) {
    if (!confirm(`Excluir lote "${batchCode}"?`)) return;
    const result = await deleteImportLot(id);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Lote removido." });
      router.refresh();
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lotes de Importacao</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pipeline de importacao e nacionalizacao
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          {showForm ? <ChevronUp size={14} /> : <Plus size={14} />}
          {showForm ? "Fechar" : "Novo Lote"}
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Pipeline status bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          {pipelineCounts.map((stage, idx) => (
            <div key={stage.status} className="flex items-center gap-2 flex-1">
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <StatusBadge status={stage.status} />
                </div>
                <p className="text-lg font-bold text-gray-900">{stage.count}</p>
              </div>
              {idx < pipelineCounts.length - 1 && (
                <ArrowRight size={16} className="text-gray-300 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-gray-700">Criar Novo Lote</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Operacao *</label>
              <select name="operationId" required className={inputClass}>
                <option value="">Selecione...</option>
                {operations.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.code} - {op.projectName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Fornecedor</label>
              <select name="supplierId" className={inputClass}>
                <option value="">Selecione...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.country})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Pais de Origem</label>
              <input name="countryOrigin" className={inputClass} placeholder="Ex: China" />
            </div>
            <div>
              <label className={labelClass}>Qtd Itens</label>
              <input name="quantityItems" type="number" min={0} className={inputClass} placeholder="0" />
            </div>
            <div>
              <label className={labelClass}>Valor FOB (USD)</label>
              <input name="fobValue" type="number" step="0.01" min={0} className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className={labelClass}>Frete (USD)</label>
              <input name="freight" type="number" step="0.01" min={0} className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className={labelClass}>Seguro (USD)</label>
              <input name="insurance" type="number" step="0.01" min={0} className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className={labelClass}>Taxa de Cambio (USD/BRL)</label>
              <input
                name="exchangeRate"
                type="number"
                step="0.01"
                min={0}
                defaultValue="5.00"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Margem Esperada (%)</label>
              <input name="expectedMarginPct" type="number" step="0.01" className={inputClass} placeholder="Ex: 25" />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Plus size={14} />
              {loading ? "Criando..." : "Criar Lote"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package size={18} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">
            {initialLots.length} lote(s)
          </h3>
        </div>

        {initialLots.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            Nenhum lote de importacao cadastrado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Lote</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Operacao</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Fornecedor</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Pais</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Qtd</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Custo Total</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Status</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {initialLots.map((lot) => {
                  const nextStatus = getNextStatus(lot.status);
                  return (
                    <tr key={lot.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium text-gray-700">
                        {lot.batchCode}
                      </td>
                      <td className="py-2 px-3 text-gray-600">
                        <div>
                          <span className="text-gray-700">{lot.operationCode}</span>
                          <span className="block text-xs text-gray-400">{lot.projectName}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-gray-600">
                        {lot.supplier?.name || "-"}
                      </td>
                      <td className="py-2 px-3 text-gray-600">
                        {lot.countryOrigin || lot.supplier?.country || "-"}
                      </td>
                      <td className="py-2 px-3 text-center text-gray-600">
                        {lot.quantityItems}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-gray-700">
                        {formatBRL(lot.totalCostNationalized)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="space-y-1">
                          <StatusBadge status={lot.status} />
                          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${lot.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-center gap-1">
                          {nextStatus && (
                            <button
                              onClick={() => handleAdvanceStatus(lot.id, nextStatus)}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
                              title={`Avancar para ${STATUS_LABELS[nextStatus]}`}
                            >
                              <ArrowRight size={12} />
                              {STATUS_LABELS[nextStatus]}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(lot.id, lot.batchCode)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
