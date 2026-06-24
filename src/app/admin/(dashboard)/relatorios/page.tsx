"use client";

import { useState } from "react";
import {
  getInventoryReport,
  getFinancialReport,
  getLotTraceabilityReport,
  getOperationPerformanceReport,
  getReinvestmentProjectionReport,
  getTransactionHistoryReport,
  getDefaultersReport,
} from "@/lib/actions-reports";
import { toast } from "sonner";
import { FileBarChart, Download, Package, DollarSign, Ship, TrendingUp, RefreshCw, Clock, AlertTriangle } from "lucide-react";

const reports = [
  { key: "inventory", title: "Posição de Estoque", desc: "Operações com ciclos e custos de importação", icon: Package, fetcher: getInventoryReport },
  { key: "financial", title: "DRE / Financeiro", desc: "Pedidos de venda com informações de clientes", icon: DollarSign, fetcher: getFinancialReport },
  { key: "lots", title: "Rastreabilidade por Lote", desc: "Lotes de importação com documentos e operações", icon: Ship, fetcher: getLotTraceabilityReport },
  { key: "performance", title: "Performance por Operação", desc: "Captação, ciclos e receita por operação", icon: TrendingUp, fetcher: getOperationPerformanceReport },
  { key: "reinvestment", title: "Projeção de Reinvestimento", desc: "Projetos com ciclos mostrando divisão de lucros", icon: RefreshCw, fetcher: getReinvestmentProjectionReport },
  { key: "transactions", title: "Histórico de Movimentações", desc: "Investimentos e vendas em ordem cronológica", icon: Clock, fetcher: getTransactionHistoryReport },
  { key: "defaulters", title: "Inadimplência", desc: "Investimentos pendentes ou em atraso", icon: AlertTriangle, fetcher: getDefaultersReport },
];

function exportCsv(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => {
    const val = row[h];
    const str = val == null ? "" : String(val);
    return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
  }).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

export default function RelatoriosPage() {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);

  async function generate(key: string) {
    const report = reports.find((r) => r.key === key);
    if (!report) return;
    setLoading(true);
    setActiveReport(key);
    setData([]);
    const res = await report.fetcher();
    setLoading(false);
    if ("error" in res) { toast.error(res.error as string); return; }
    const items = (res as { data: Record<string, unknown>[] }).data || [];
    setData(items);
    if (items.length === 0) toast.info("Nenhum dado encontrado para este relatório.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Central de Relatórios</h1>
        <p className="text-sm text-gray-500 mt-1">Gere e exporte relatórios da plataforma</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {reports.map((r) => {
          const Icon = r.icon;
          const isActive = activeReport === r.key;
          return (
            <div key={r.key} className={`bg-white rounded-xl border p-5 transition-all hover:shadow-md cursor-pointer ${isActive ? "border-emerald-300 shadow-md" : "border-gray-200"}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800">{r.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{r.desc}</p>
                </div>
              </div>
              <button
                onClick={() => generate(r.key)}
                disabled={loading}
                className="w-full text-xs font-medium py-2 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading && activeReport === r.key ? "Gerando..." : "Gerar Relatório"}
              </button>
            </div>
          );
        })}
      </div>

      {activeReport && data.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileBarChart size={18} className="text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">
                {reports.find((r) => r.key === activeReport)?.title} — {data.length} registro(s)
              </h3>
            </div>
            <button
              onClick={() => exportCsv(data, `relatorio_${activeReport}_${Date.now()}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700"
            >
              <Download size={13} /> Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-200">
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="text-left py-2 px-2 font-medium text-gray-500 whitespace-nowrap">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="py-1.5 px-2 text-gray-600 whitespace-nowrap max-w-[200px] truncate">
                        {val == null ? "—" : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
