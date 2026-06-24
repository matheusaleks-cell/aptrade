"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface ChartData {
  name: string;
  faturamento: number;
  captado: number;
  status: string;
}

export function AdminCharts({ data }: { data: ChartData[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Faturamento por Operação
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(value as number)
                }
              />
              <Legend />
              <Bar
                dataKey="faturamento"
                name="Faturamento"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="captado"
                name="Captado"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Decomposição de Fluxo de Caixa
        </h3>
        <div className="space-y-4">
          {data.map((item) => {
            const total = item.faturamento + item.captado;
            const fatPct = total > 0 ? (item.faturamento / total) * 100 : 0;
            const capPct = total > 0 ? (item.captado / total) * 100 : 0;

            return (
              <div key={item.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-xs text-gray-400">{item.status}</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                  <div
                    className="bg-emerald-500"
                    style={{ width: `${fatPct}%` }}
                    title={`Faturamento: ${fatPct.toFixed(0)}%`}
                  />
                  <div
                    className="bg-indigo-500"
                    style={{ width: `${capPct}%` }}
                    title={`Captado: ${capPct.toFixed(0)}%`}
                  />
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              Faturamento
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              Captado
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
