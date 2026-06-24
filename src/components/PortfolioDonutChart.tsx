"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface DiversificacaoData {
  name: string;
  value: number;
  percentage: number;
}

interface PortfolioDonutChartProps {
  data: DiversificacaoData[];
}

const COLORS = ["#F5C400", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#F97316"];

export function PortfolioDonutChart({ data }: PortfolioDonutChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-sm text-slate-400">
        Nenhum dado de diversificação disponível.
      </div>
    );
  }

  // Formatador de moeda BRL simples
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full h-44 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={60}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(6, 8, 19, 0.4)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as DiversificacaoData;
                  return (
                    <div className="bg-[#0C1322] border border-white/10 rounded-xl p-3 shadow-xl">
                      <p className="text-xs font-semibold text-slate-200">{item.name}</p>
                      <p className="text-sm font-bold text-[#F5C400] mt-1">{formatBRL(item.value)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.percentage}% do portfólio</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-2 w-full max-h-40 overflow-y-auto px-1">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-slate-350 truncate">{item.name}</span>
            </div>
            <span className="text-slate-400 font-medium shrink-0">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
