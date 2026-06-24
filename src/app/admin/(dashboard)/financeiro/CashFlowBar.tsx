"use client";

import { formatBRL } from "@/lib/calculations";

interface CashFlowData {
  custoTotal: number;
  totalRevenue: number;
  impostos: number;
  operacional: number;
  lucroInvestidores: number;
  lucroEmpresa: number;
}

export function CashFlowBar({ data }: { data: CashFlowData }) {
  const total = data.custoTotal + data.impostos + data.operacional + data.lucroInvestidores + data.lucroEmpresa;
  if (total === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">Sem dados de fluxo de caixa.</p>;
  }

  const segments = [
    { label: "Custo", value: data.custoTotal, color: "bg-gray-400" },
    { label: "Impostos 8%", value: data.impostos, color: "bg-red-400" },
    { label: "Operacional 15%", value: data.operacional, color: "bg-amber-400" },
    { label: "Lucro Investidores", value: data.lucroInvestidores, color: "bg-emerald-500" },
    { label: "Lucro Empresa", value: data.lucroEmpresa, color: "bg-blue-500" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex h-8 rounded-lg overflow-hidden">
        {segments.map((seg) => {
          const pct = total > 0 ? (seg.value / total) * 100 : 0;
          if (pct <= 0) return null;
          return (
            <div
              key={seg.label}
              className={`${seg.color} transition-all duration-300`}
              style={{ width: `${pct}%` }}
              title={`${seg.label}: ${formatBRL(seg.value)} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 text-xs">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${seg.color}`} />
            <span className="text-gray-600">{seg.label}:</span>
            <span className="font-medium text-gray-800">{formatBRL(seg.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
