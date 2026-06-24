"use client";

import { useState, useMemo } from "react";
import { calcFixedReturn, formatBRL } from "@/lib/calculations";
import { Calculator, TrendingUp, Percent, DollarSign, Clock, ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function SimuladorClient() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("2.5");
  const [months, setMonths] = useState("6");

  const numPrincipal = parseFloat(principal.replace(/\D/g, "")) / 100 || 0;
  const numRate = parseFloat(rate) / 100 || 0;
  const numMonths = parseInt(months) || 6;
  const days = numMonths * 30;

  const result = useMemo(() => {
    if (numPrincipal <= 0 || numRate <= 0) return null;
    return calcFixedReturn({ principal: numPrincipal, fixedRateMonthly: numRate, days });
  }, [numPrincipal, numRate, days]);

  const chartData = useMemo(() => {
    if (numPrincipal <= 0 || numRate <= 0) return [];
    const points = [];
    for (let m = 0; m <= numMonths; m++) {
      const d = m * 30;
      const res = calcFixedReturn({ principal: numPrincipal, fixedRateMonthly: numRate, days: d });
      points.push({
        label: `Mês ${m}`,
        capital: numPrincipal + res.netReturn,
        bruto: numPrincipal + res.grossReturn,
      });
    }
    return points;
  }, [numPrincipal, numRate, numMonths]);

  const roi = result && numPrincipal > 0 ? ((result.netReturn / numPrincipal) * 100).toFixed(2) : "0.00";

  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) { setPrincipal(""); return; }
    const val = parseInt(raw) / 100;
    setPrincipal(val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Formulário */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl animate-fade-in-up">
          <div className="flex items-center gap-2 mb-5 border-b border-white/5 pb-3">
            <Calculator size={14} className="text-[#F5C400]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Parâmetros</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Valor do Aporte (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">R$</span>
                <input
                  type="text"
                  value={principal}
                  onChange={handlePrincipalChange}
                  placeholder="10.000,00"
                  className="w-full pl-11 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-[#F5C400]/50 focus:ring-1 focus:ring-[#F5C400]/20 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Taxa Mensal Estimada (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="15"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-[#F5C400]/50 focus:ring-1 focus:ring-[#F5C400]/20 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prazo (meses)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="36"
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-[#F5C400]/50 focus:ring-1 focus:ring-[#F5C400]/20 transition-all"
                />
                <Clock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex gap-2">
                {[5000, 10000, 20000, 50000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPrincipal(v.toLocaleString("pt-BR", { minimumFractionDigits: 2 }))}
                    className="flex-1 text-[10px] font-bold py-2 bg-white/[0.02] border border-white/[0.06] hover:border-[#F5C400]/30 text-slate-400 hover:text-[#F5C400] rounded-lg transition-all cursor-pointer"
                  >
                    {(v / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resultado */}
        {result && numPrincipal > 0 && (
          <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl animate-fade-in-up delay-100">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <TrendingUp size={14} className="text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Projeção de Retorno</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/[0.015] border border-white/[0.04] rounded-xl">
                <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest">Retorno Bruto</span>
                <span className="block text-sm font-bold text-white mt-1">{formatBRL(result.grossReturn)}</span>
              </div>
              <div className="p-3 bg-white/[0.015] border border-white/[0.04] rounded-xl">
                <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest">IR ({(result.irRate * 100).toFixed(1)}%)</span>
                <span className="block text-sm font-bold text-red-400 mt-1">- {formatBRL(result.irAmount)}</span>
              </div>
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <span className="block text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Retorno Líquido</span>
                <span className="block text-lg font-black text-emerald-400 mt-1">{formatBRL(result.netReturn)}</span>
              </div>
              <div className="p-3 bg-[#F5C400]/5 border border-[#F5C400]/20 rounded-xl">
                <span className="block text-[9px] text-[#F5C400] font-bold uppercase tracking-widest">ROI Líquido</span>
                <span className="block text-lg font-black text-[#F5C400] mt-1">{roi}%</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white/[0.015] border border-white/[0.04] rounded-xl flex items-center justify-between">
              <div>
                <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest">Capital Final Estimado</span>
                <span className="block text-lg font-black text-white mt-1">{formatBRL(numPrincipal + result.netReturn)}</span>
              </div>
              <ArrowRight size={16} className="text-slate-500" />
            </div>
          </div>
        )}
      </div>

      {/* Gráfico */}
      <div className="lg:col-span-3 animate-fade-in-up delay-200">
        <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-5 border-b border-white/5 pb-3">
            <DollarSign size={14} className="text-[#F5C400]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Evolução do Capital</h2>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="simGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="simGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5C400" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#F5C400" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0C1322", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                  formatter={(value, name) => [
                    formatBRL(Number(value)),
                    name === "capital" ? "Líquido" : "Bruto",
                  ]}
                />
                <Area type="monotone" dataKey="bruto" stroke="#F5C400" strokeWidth={1} fill="url(#simGradient2)" dot={false} />
                <Area type="monotone" dataKey="capital" stroke="#10b981" strokeWidth={2} fill="url(#simGradient)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[380px]">
              <p className="text-sm text-slate-500">Preencha os parâmetros para visualizar a projeção.</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-400 font-medium">Retorno Líquido</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded-full bg-[#F5C400]" />
              <span className="text-[10px] text-slate-400 font-medium">Retorno Bruto</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
