import { getDashboardStats, getRecentProjects, getPendingInvestments, getAllWithdrawals } from "@/lib/actions";
import { formatBRL } from "@/lib/calculations";
import { StatCard } from "@/components/StatCard";
import { AdminCharts } from "./AdminCharts";
import { RevenueBarChart } from "@/components/RevenueBarChart";
import { Users, FolderOpen, Ship, DollarSign, TrendingUp, Wallet, Banknote } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const [stats, recentProjects, pendingInv, allWithdrawals] = await Promise.all([
    getDashboardStats(),
    getRecentProjects(),
    getPendingInvestments(),
    getAllWithdrawals(),
  ]);

  const pendingInvestments = !("error" in pendingInv) ? pendingInv.data.length : 0;
  const pendingWithdrawals = !("error" in allWithdrawals) ? allWithdrawals.data.filter((w) => w.status === "PENDING").length : 0;

  const chartData = stats.operations.map((op) => {
    const totalCycleRevenue = op.cycles.reduce((s, c) => s + c.grossRevenue, 0);
    return {
      name: op.operationCode,
      faturamento: totalCycleRevenue,
      captado: op.fundedAmount,
      status: op.status,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral da plataforma</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Investidores"
          value={String(stats.totalInvestors)}
          icon={Users}
        />
        <StatCard
          title="Projetos"
          value={String(stats.totalProjects)}
          icon={FolderOpen}
        />
        <StatCard
          title="Capital Captado"
          value={formatBRL(stats.totalCaptado)}
          icon={DollarSign}
        />
        <StatCard
          title="Faturamento Total"
          value={formatBRL(stats.totalFaturamento)}
          icon={TrendingUp}
        />
      </div>

      {(pendingInvestments > 0 || pendingWithdrawals > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingInvestments > 0 && (
            <Link href="/admin/aportes" className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Wallet size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-800">{pendingInvestments} aporte(s) pendente(s)</p>
                  <p className="text-xs text-amber-600">Aguardando confirmação</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-200 px-3 py-1 rounded-full">Ver</span>
            </Link>
          )}
          {pendingWithdrawals > 0 && (
            <Link href="/admin/saques" className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Banknote size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-purple-800">{pendingWithdrawals} saque(s) pendente(s)</p>
                  <p className="text-xs text-purple-600">Aguardando aprovação</p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-200 px-3 py-1 rounded-full">Ver</span>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCharts data={chartData} />
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <RevenueBarChart data={chartData} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Ship size={18} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">Operações em Andamento</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-500">Código</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Meta</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Captado</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">%</th>
              </tr>
            </thead>
            <tbody>
              {stats.operations.map((op) => {
                const pct =
                  op.totalAmount > 0
                    ? ((op.fundedAmount / op.totalAmount) * 100).toFixed(0)
                    : "0";
                return (
                  <tr key={op.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-700">
                      {op.operationCode}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          op.status === "OPEN"
                            ? "bg-emerald-50 text-emerald-600"
                            : op.status === "IN_PROGRESS"
                            ? "bg-amber-50 text-amber-600"
                            : op.status === "SETTLED"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {op.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">{formatBRL(op.totalAmount)}</td>
                    <td className="py-2 px-3 text-right">{formatBRL(op.fundedAmount)}</td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, Number(pct))}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen size={18} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">Projetos Recentes</h3>
        </div>

        <div className="space-y-3">
          {recentProjects.map((proj) => (
            <div
              key={proj.id}
              className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
            >
              <div>
                <p className="font-medium text-gray-800">{proj.name}</p>
                <p className="text-xs text-gray-400">{proj.productCategory}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {proj.operations.length} operação(ões)
                </p>
                <p className="text-xs text-gray-400">
                  Max {proj.maxCycles} ciclo(s) | Split{" "}
                  {(proj.profitSplitPct * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
