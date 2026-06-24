"use client";

import { useState } from "react";
import { projectFutureBatches, formatBRL } from "@/lib/calculations";
import type { SimulatorInputs, BatchProjection } from "@/lib/calculations";
import { Calculator, Play, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const defaultInputs: SimulatorInputs = {
  initialCapital: 50000,
  fobUnitUSD: 15,
  freightUnitUSD: 3,
  exchangeRate: 5.5,
  salePricePerUnit: 250,
  iiRate: 0.16,
  pisRate: 0.0211,
  cofinsRate: 0.0965,
  icmsFactor: 0.82,
  icmsRate: 0.18,
  siscomexFixed: 154.23,
  custoOpFixed: 1500,
  salesTaxRate: 0.08,
  opExRate: 0.15,
  investorSplitPct: 0.5,
  numBatches: 7,
};

const inputFields: { key: keyof SimulatorInputs; label: string; step?: string }[] = [
  { key: "initialCapital", label: "Capital Inicial (R$)", step: "100" },
  { key: "fobUnitUSD", label: "FOB Unitario (USD)", step: "0.01" },
  { key: "freightUnitUSD", label: "Frete Unitario (USD)", step: "0.01" },
  { key: "exchangeRate", label: "Taxa de Cambio (BRL/USD)", step: "0.01" },
  { key: "salePricePerUnit", label: "Preco de Venda Unitario (R$)", step: "1" },
  { key: "iiRate", label: "Aliquota II", step: "0.01" },
  { key: "pisRate", label: "Aliquota PIS", step: "0.0001" },
  { key: "cofinsRate", label: "Aliquota COFINS", step: "0.0001" },
  { key: "icmsFactor", label: "Fator ICMS", step: "0.01" },
  { key: "icmsRate", label: "Aliquota ICMS", step: "0.01" },
  { key: "siscomexFixed", label: "SISCOMEX Fixo (R$)", step: "0.01" },
  { key: "custoOpFixed", label: "Custo Operacional Fixo (R$)", step: "100" },
  { key: "salesTaxRate", label: "Imposto s/ Vendas (8%)", step: "0.01" },
  { key: "opExRate", label: "OpEx Rate (15%)", step: "0.01" },
  { key: "investorSplitPct", label: "Split Investidor (%)", step: "0.01" },
  { key: "numBatches", label: "Numero de Lotes", step: "1" },
];

export default function SimuladorPage() {
  const [inputs, setInputs] = useState<SimulatorInputs>(defaultInputs);
  const [results, setResults] = useState<BatchProjection[] | null>(null);

  function handleChange(key: keyof SimulatorInputs, value: string) {
    setInputs((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  }

  function handleSimulate() {
    const projections = projectFutureBatches(inputs);
    setResults(projections);
  }

  // Cumulative chart data
  const chartData = results
    ? results.map((r, i) => {
        const cumulativeInvestor = results
          .slice(0, i + 1)
          .reduce((sum, b) => sum + b.investorShare, 0);
        return {
          name: `Lote ${r.batch}`,
          acumulado: cumulativeInvestor,
        };
      })
    : [];

  // Summary totals
  const totals = results
    ? {
        capital: results[results.length - 1]?.nextCapital ?? 0,
        maxUnits: results.reduce((s, r) => s + r.maxUnits, 0),
        totalImportCost: results.reduce((s, r) => s + r.totalImportCost, 0),
        grossRevenue: results.reduce((s, r) => s + r.grossRevenue, 0),
        salesTax: results.reduce((s, r) => s + r.salesTax, 0),
        opExpenses: results.reduce((s, r) => s + r.opExpenses, 0),
        netProfit: results.reduce((s, r) => s + r.netProfit, 0),
        investorShare: results.reduce((s, r) => s + r.investorShare, 0),
        companyShare: results.reduce((s, r) => s + r.companyShare, 0),
      }
    : null;

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Simulador de Escalamento de Lotes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Projete o crescimento do capital ao longo de multiplos lotes de importacao
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={18} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">Parametros da Simulacao</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {inputFields.map((field) => (
            <div key={field.key}>
              <label className={labelClass}>{field.label}</label>
              <input
                type="number"
                step={field.step || "1"}
                value={inputs[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className={inputClass}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSimulate}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Play size={14} />
            Simular
          </button>
        </div>
      </div>

      {/* Results Table */}
      {results && results.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Resultado da Simulacao</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-medium text-gray-500">Lote#</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">Capital</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">Qtd Max</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">Custo Import</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">Receita Bruta</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">Impostos</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">OpEx</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">Lucro Liq</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">Investidor</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">Empresa</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">ROI%</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.batch} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-2 font-medium text-gray-700">{r.batch}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{formatBRL(r.capital)}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{r.maxUnits.toLocaleString("pt-BR")}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{formatBRL(r.totalImportCost)}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{formatBRL(r.grossRevenue)}</td>
                    <td className="py-2 px-2 text-right text-red-500">{formatBRL(r.salesTax)}</td>
                    <td className="py-2 px-2 text-right text-amber-600">{formatBRL(r.opExpenses)}</td>
                    <td className="py-2 px-2 text-right font-medium text-gray-800">{formatBRL(r.netProfit)}</td>
                    <td className="py-2 px-2 text-right text-emerald-600 font-medium">{formatBRL(r.investorShare)}</td>
                    <td className="py-2 px-2 text-right text-blue-600 font-medium">{formatBRL(r.companyShare)}</td>
                    <td className="py-2 px-2 text-right font-bold text-gray-900">{r.roi.toFixed(2)}%</td>
                  </tr>
                ))}
                {/* Summary row */}
                {totals && (
                  <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                    <td className="py-2 px-2 text-gray-700">Total</td>
                    <td className="py-2 px-2 text-right text-gray-700">-</td>
                    <td className="py-2 px-2 text-right text-gray-700">{totals.maxUnits.toLocaleString("pt-BR")}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{formatBRL(totals.totalImportCost)}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{formatBRL(totals.grossRevenue)}</td>
                    <td className="py-2 px-2 text-right text-red-500">{formatBRL(totals.salesTax)}</td>
                    <td className="py-2 px-2 text-right text-amber-600">{formatBRL(totals.opExpenses)}</td>
                    <td className="py-2 px-2 text-right text-gray-800">{formatBRL(totals.netProfit)}</td>
                    <td className="py-2 px-2 text-right text-emerald-600">{formatBRL(totals.investorShare)}</td>
                    <td className="py-2 px-2 text-right text-blue-600">{formatBRL(totals.companyShare)}</td>
                    <td className="py-2 px-2 text-right text-gray-900">-</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cumulative Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Ganhos Acumulados do Investidor
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [formatBRL(Number(value)), "Acumulado Investidor"]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Area
                type="monotone"
                dataKey="acumulado"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
