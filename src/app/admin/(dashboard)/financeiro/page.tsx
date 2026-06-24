import { getFinancialStats, getFinancialCashFlow, getSplitRules, getRecentTransactions } from "@/lib/actions-financial";
import { formatBRL } from "@/lib/calculations";
import { StatCard } from "@/components/StatCard";
import { Wallet, TrendingUp, RefreshCw, Receipt, Banknote } from "lucide-react";
import { CashFlowBar } from "./CashFlowBar";
import { RevenueChart } from "./RevenueChart";
import { DistributionRulesForm } from "./DistributionRulesForm";
import { TransactionsTable } from "./TransactionsTable";

export default async function FinanceiroPage() {
  const [statsResult, cashFlowResult, rulesResult, transactionsResult] = await Promise.all([
    getFinancialStats(),
    getFinancialCashFlow(),
    getSplitRules(),
    getRecentTransactions(1, 10),
  ]);

  const stats = statsResult && "data" in statsResult ? statsResult.data : null;
  const cashFlow = cashFlowResult && "data" in cashFlowResult ? cashFlowResult.data : null;
  const rules = rulesResult && "data" in rulesResult ? rulesResult.data : null;
  const transactions = transactionsResult && "data" in transactionsResult ? transactionsResult : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel Financeiro</h1>
        <p className="text-sm text-gray-500 mt-1">Visao geral financeira da plataforma</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Custodia Total"
          value={formatBRL(stats?.totalCustodia ?? 0)}
          icon={Wallet}
          variant="yellow"
        />
        <StatCard
          title="Total Distribuido"
          value={formatBRL(stats?.totalDistribuido ?? 0)}
          icon={TrendingUp}
          variant="emerald"
        />
        <StatCard
          title="Reinvestimento"
          value={formatBRL(stats?.totalReinvestment ?? 0)}
          icon={RefreshCw}
          variant="blue"
        />
        <StatCard
          title="Impostos Retidos"
          value={formatBRL(stats?.totalTaxes ?? 0)}
          icon={Receipt}
          variant="purple"
        />
        <StatCard
          title="Capital em Giro"
          value={formatBRL(stats?.salesOrdersTotal ?? 0)}
          icon={Banknote}
          variant="yellow"
        />
      </div>

      {/* Cash Flow Decomposition */}
      {cashFlow && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Decomposicao do Fluxo de Caixa</h3>
          <CashFlowBar data={cashFlow} />
        </div>
      )}

      {/* Revenue Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Receita Mensal ({new Date().getFullYear()})</h3>
        <RevenueChart monthlyRevenue={stats?.monthlyRevenue ?? Array(12).fill(0)} />
      </div>

      {/* Distribution Rules */}
      {rules && (
        <DistributionRulesForm
          initialRules={{
            id: "id" in rules ? (rules as any).id : undefined,
            name: "name" in rules ? (rules as any).name : "Padrao",
            investorPct: rules.investorPct,
            companyPct: rules.companyPct,
            reservePct: rules.reservePct,
            reinvestmentPct: rules.reinvestmentPct,
            operationalCost: rules.operationalCost,
            salesCommission: rules.salesCommission,
          }}
        />
      )}

      {/* Recent Transactions */}
      <TransactionsTable
        initialTransactions={(transactions?.data ?? []) as any}
        initialTotal={transactions?.total ?? 0}
        initialPage={transactions?.page ?? 1}
        initialTotalPages={transactions?.totalPages ?? 1}
      />
    </div>
  );
}
