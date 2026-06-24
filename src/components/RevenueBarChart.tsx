"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatBRL } from "@/lib/calculations";

interface RevenueBarChartProps {
  data: { name: string; faturamento: number; captado: number }[];
}

export function RevenueBarChart({ data }: RevenueBarChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">Sem dados de faturamento.</p>;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Faturamento por Operação</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(value, name) => [formatBRL(Number(value)), name === "faturamento" ? "Faturamento" : "Captado"]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <Legend
            formatter={(value) => (value === "faturamento" ? "Faturamento" : "Captado")}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="captado" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="faturamento" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
