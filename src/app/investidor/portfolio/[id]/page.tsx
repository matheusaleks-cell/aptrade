import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOperationDetail } from "@/lib/actions";
import { formatBRL, calcNationalization } from "@/lib/calculations";
import Link from "next/link";
import { ArrowLeft, Package, FileText, Clock } from "lucide-react";
import { ContractSign } from "./ContractSign";
import { InvestmentSettings } from "./InvestmentSettings";

export default async function OperationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const operation = await getOperationDetail(id);
  if (!operation) redirect("/investidor/portfolio");

  const estimated = operation.importCosts.find((c) => !c.isActual);
  const actual = operation.importCosts.find((c) => c.isActual);

  const estimatedCalc = estimated
    ? calcNationalization({
        fobValue: estimated.fobValue,
        freight: estimated.freight,
        insurance: estimated.insurance,
        quantity: estimated.quantity,
        exchangeRate: estimated.exchangeRate,
        iiRate: estimated.iiRate,
        pisRate: estimated.pisRate,
        cofinsRate: estimated.cofinsRate,
        icmsRate: estimated.icmsRate,
        icmsFactor: estimated.icmsFactor,
        siscomexFixed: estimated.siscomexFixed,
        customsOpCost: estimated.customsOpCost,
        salesTaxRate: estimated.salesTaxRate,
        opExRate: estimated.opExRate,
      })
    : null;

  const actualCalc = actual
    ? calcNationalization({
        fobValue: actual.fobValue,
        freight: actual.freight,
        insurance: actual.insurance,
        quantity: actual.quantity,
        exchangeRate: actual.exchangeRate,
        iiRate: actual.iiRate,
        pisRate: actual.pisRate,
        cofinsRate: actual.cofinsRate,
        icmsRate: actual.icmsRate,
        icmsFactor: actual.icmsFactor,
        siscomexFixed: actual.siscomexFixed,
        customsOpCost: actual.customsOpCost,
        salesTaxRate: actual.salesTaxRate,
        opExRate: actual.opExRate,
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <Link
          href="/investidor/portfolio"
          className="p-2.5 bg-white/5 border border-white/10 hover:border-[#F5C400]/40 text-slate-200 hover:text-white rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg"
        >
          <ArrowLeft size={16} className="text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {operation.operationCode}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{operation.project.name}</p>
        </div>
        <span
          className={`ml-auto px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${
            operation.status === "SETTLED"
              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              : operation.status === "IN_PROGRESS"
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : operation.status === "SOLD"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-white/5 text-slate-400 border border-white/10"
          }`}
        >
          {operation.status === "SETTLED"
            ? "Liquidada"
            : operation.status === "IN_PROGRESS"
            ? "Em andamento"
            : operation.status === "SOLD"
            ? "Vendida"
            : operation.status}
        </span>
      </div>

      {/* Timeline de Ciclos */}
      <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl hover:border-[#F5C400]/20 transition-all duration-300 animate-fade-in-up delay-100">
        <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
          <Clock size={14} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-white">Timeline de Ciclos</h2>
        </div>

        {operation.cycles.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">Nenhum ciclo registrado para esta operação.</p>
        ) : (
          <div className="space-y-5">
            {operation.cycles.map((cycle) => (
              <div key={cycle.id} className="border border-white/[0.03] bg-white/[0.015] rounded-2xl p-5 hover:border-white/[0.06] transition-all">
                <div className="flex items-center justify-between mb-4 border-b border-white/[0.03] pb-2">
                  <h3 className="text-sm font-bold text-white">
                    Ciclo {cycle.cycleNumber}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cycle.status === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {cycle.status === "COMPLETED" ? "Finalizado" : "Ativo"}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-slate-455 font-semibold uppercase tracking-wider text-[10px]">Qtd. Importada</p>
                    <p className="font-bold text-white mt-1 text-sm">{cycle.quantity} un.</p>
                  </div>
                  <div>
                    <p className="text-slate-455 font-semibold uppercase tracking-wider text-[10px]">Faturamento Bruto</p>
                    <p className="font-bold text-white mt-1 text-sm">{formatBRL(cycle.grossRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-slate-455 font-semibold uppercase tracking-wider text-[10px]">Sua Fatia</p>
                    <p className="font-extrabold text-emerald-400 mt-1 text-sm">
                      {formatBRL(cycle.investorShare)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-455 font-semibold uppercase tracking-wider text-[10px]">Carryover</p>
                    <p className="font-bold text-white mt-1 text-sm">{formatBRL(cycle.carryover)}</p>
                  </div>
                </div>

                {cycle.sales.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/[0.03]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Vendas do Ciclo</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/[0.03] text-slate-500">
                            <th className="text-left py-2 font-medium">Comprador</th>
                            <th className="text-right py-2 font-medium">Qtd</th>
                            <th className="text-right py-2 font-medium">Unitário</th>
                            <th className="text-right py-2 font-medium">Total</th>
                            <th className="text-right py-2 font-medium">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cycle.sales.map((sale) => (
                            <tr key={sale.id} className="border-b border-white/[0.01] hover:bg-white/[0.005]">
                              <td className="py-2 text-slate-300 font-semibold">{sale.buyerName}</td>
                              <td className="text-right py-2 text-slate-350">{sale.quantity}</td>
                              <td className="text-right py-2 text-slate-350">{formatBRL(sale.unitPrice)}</td>
                              <td className="text-right py-2 font-bold text-white">
                                {formatBRL(sale.totalValue)}
                              </td>
                              <td className="text-right py-2 text-slate-450">
                                {new Date(sale.saleDate).toLocaleDateString("pt-BR")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processo de Importação */}
      <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl hover:border-[#F5C400]/20 transition-all duration-300 animate-fade-in-up delay-200">
        <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
          <Package size={14} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-white">
            Processo de Importação - Previsto vs. Realizado
          </h2>
        </div>

        {!estimatedCalc && !actualCalc ? (
          <p className="text-sm text-slate-500 py-4 text-center">Custos de importação não registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.04] text-slate-500">
                  <th className="text-left py-2 px-3 font-medium">Item</th>
                  <th className="text-right py-2 px-3 font-medium">Previsto</th>
                  <th className="text-right py-2 px-3 font-medium">Realizado</th>
                  <th className="text-right py-2 px-3 font-medium">Variação</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Valor Aduaneiro", est: estimatedCalc?.valorAduaneiro, act: actualCalc?.valorAduaneiro },
                  { label: "Imposto de Importação", est: estimatedCalc?.impostoImportacao, act: actualCalc?.impostoImportacao },
                  { label: "PIS", est: estimatedCalc?.pis, act: actualCalc?.pis },
                  { label: "COFINS", est: estimatedCalc?.cofins, act: actualCalc?.cofins },
                  { label: "Base ICMS", est: estimatedCalc?.baseIcms, act: actualCalc?.baseIcms },
                  { label: "ICMS", est: estimatedCalc?.icms, act: actualCalc?.icms },
                  { label: "Custo Total", est: estimatedCalc?.custoTotal, act: actualCalc?.custoTotal },
                  { label: "Custo Unitário", est: estimatedCalc?.custoUnitario, act: actualCalc?.custoUnitario },
                ].map((row) => {
                  const diff =
                    row.est && row.act
                      ? ((row.act - row.est) / row.est) * 100
                      : null;
                  return (
                    <tr key={row.label} className="border-b border-white/[0.015] hover:bg-white/[0.005]">
                      <td className="py-2.5 px-3 text-slate-300 font-semibold">{row.label}</td>
                      <td className="py-2.5 px-3 text-right text-slate-355">
                        {row.est != null ? formatBRL(row.est) : "-"}
                      </td>
                      <td className="py-2.5 px-3 text-right text-white font-bold">
                        {row.act != null ? formatBRL(row.act) : "-"}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-extrabold ${
                          diff && diff > 0
                            ? "text-red-400"
                            : diff && diff < 0
                            ? "text-emerald-400"
                            : "text-slate-455"
                        }`}
                      >
                        {diff != null ? `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%` : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contratos & Anexos */}
      <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl hover:border-[#F5C400]/20 transition-all duration-300 animate-fade-in-up delay-300">
        <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
          <FileText size={14} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-white">Contratos & Anexos</h2>
        </div>

        {operation.investments.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">Nenhum contrato disponível.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {operation.investments.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.03] bg-white/[0.015] hover:bg-white/[0.025] transition-all"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-xs font-bold text-slate-200 truncate">
                    Contrato - {inv.user.name}
                  </p>
                  <p className="text-[10px] text-slate-455 mt-1">
                    {inv.contractSignedAt
                      ? `Assinado em: ${new Date(inv.contractSignedAt).toLocaleDateString("pt-BR")}`
                      : "Pendente de assinatura"}
                  </p>
                </div>
                <ContractSign
                  investmentId={inv.id}
                  investorName={inv.user.name}
                  alreadySigned={!!inv.contractSignedAt}
                  signedAt={inv.contractSignedAt ? inv.contractSignedAt.toISOString() : null}
                  contractDocumentId={inv.contractUrl}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seção Mobile de Configurações de Investimento */}
      <InvestmentSettings operationId={operation.id} />
    </div>
  );
}
