"use client";

import { useState } from "react";
import { saveSplitRules } from "@/lib/actions-financial";
import { toast } from "sonner";
import { Save, Settings } from "lucide-react";

interface SplitRule {
  id?: string;
  name?: string;
  investorPct: number;
  companyPct: number;
  reservePct: number;
  reinvestmentPct: number;
  operationalCost: number;
  salesCommission: number;
  isActive?: boolean;
}

export function DistributionRulesForm({ initialRules }: { initialRules: SplitRule }) {
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState({
    investorPct: initialRules.investorPct,
    companyPct: initialRules.companyPct,
    reservePct: initialRules.reservePct,
    reinvestmentPct: initialRules.reinvestmentPct,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await saveSplitRules({
      id: initialRules.id,
      name: initialRules.name ?? "Padrao",
      investorPct: rules.investorPct,
      companyPct: rules.companyPct,
      reservePct: rules.reservePct,
      reinvestmentPct: rules.reinvestmentPct,
      operationalCost: initialRules.operationalCost,
      salesCommission: initialRules.salesCommission,
    });
    setLoading(false);
    if (result && "error" in result && result.error) {
      toast.error(result.error);
    } else {
      toast.success("Regras de distribuicao salvas com sucesso!");
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings size={18} className="text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700">Regras de Distribuicao</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Investidor (%)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              max={100}
              value={rules.investorPct}
              onChange={(e) => setRules({ ...rules, investorPct: parseFloat(e.target.value) || 0 })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Empresa (%)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              max={100}
              value={rules.companyPct}
              onChange={(e) => setRules({ ...rules, companyPct: parseFloat(e.target.value) || 0 })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Reserva (%)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              max={100}
              value={rules.reservePct}
              onChange={(e) => setRules({ ...rules, reservePct: parseFloat(e.target.value) || 0 })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Reinvestimento (%)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              max={100}
              value={rules.reinvestmentPct}
              onChange={(e) => setRules({ ...rules, reinvestmentPct: parseFloat(e.target.value) || 0 })}
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {loading ? "Salvando..." : "Salvar Regras"}
          </button>
        </div>
      </form>
    </div>
  );
}
