"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface DataPoint {
  label: string;
  capital: number;
}

export function CapitalGrowthChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-sm font-semibold text-white">Evolução do Capital</h3>
        <span className="text-[10px] font-bold text-[#F5C400] bg-[#F5C400]/10 px-2 py-0.5 rounded border border-[#F5C400]/20 uppercase tracking-widest">
          Patrimônio
        </span>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 10, fill: "#64748b" }} 
              axisLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
              tickLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
              tickLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
              tickFormatter={(v) =>
                `R$ ${(v / 1000).toFixed(0)}k`
              }
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value as number;
                  const label = payload[0].payload.label;
                  return (
                    <div className="bg-[#0C1322] border border-white/10 rounded-xl p-3 shadow-xl">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-bold text-emerald-400 mt-1">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(val)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="capital"
              stroke="#10b981"
              fill="url(#capitalGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
