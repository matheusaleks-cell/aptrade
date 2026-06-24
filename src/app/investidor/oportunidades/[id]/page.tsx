import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOpportunityDetail } from "@/lib/actions";
import { formatBRL } from "@/lib/calculations";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Users, Clock, Target, Percent, Info } from "lucide-react";
import { InvestForm } from "./InvestForm";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const result = await getOpportunityDetail(id);

  if (!result || "error" in result) redirect("/investidor/oportunidades");
  const op = result.data;

  const progress = op.totalAmount > 0 ? (op.fundedAmount / op.totalAmount) * 100 : 0;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 animate-fade-in-up">
        <Link
          href="/investidor/oportunidades"
          className="p-2.5 bg-white/5 border border-white/10 hover:border-[#F5C400]/40 text-slate-200 hover:text-white rounded-xl transition-all"
        >
          <ArrowLeft size={16} className="text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">{op.projectName}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{op.operationCode} · {op.productCategory}</p>
        </div>
        <span className="ml-auto px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {op.status === "OPEN" ? "Aberta" : "Captando"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {op.projectDescription && (
            <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl animate-fade-in-up delay-100">
              <div className="flex items-center gap-2 mb-3">
                <Info size={14} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-white">Sobre o Projeto</h2>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{op.projectDescription}</p>
            </div>
          )}

          <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl animate-fade-in-up delay-200">
            <div className="flex items-center gap-2 mb-5">
              <Target size={14} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-white">Progresso da Captação</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Captado</span>
                <span className="font-bold text-white">{formatBRL(op.fundedAmount)} de {formatBRL(op.totalAmount)}</span>
              </div>
              <div className="w-full bg-white/[0.04] h-3 rounded-full overflow-hidden border border-white/[0.06]">
                <div
                  className="bg-gradient-to-r from-[#F5C400] to-[#DF9A00] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,196,0,0.3)]"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-right text-xs font-bold text-[#F5C400]">{progress.toFixed(1)}%</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/[0.04]">
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Aporte Mínimo</p>
                <p className="text-sm font-bold text-white mt-1">{formatBRL(op.minInvestment)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Prazo Estimado</p>
                <p className="text-sm font-bold text-white mt-1 flex items-center gap-1">
                  <Clock size={12} className="text-slate-400" /> {op.expectedMonths} meses
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Investidores</p>
                <p className="text-sm font-bold text-white mt-1 flex items-center gap-1">
                  <Users size={12} className="text-slate-400" /> {op.investorsCount}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Modalidade</p>
                <p className="text-sm font-bold text-white mt-1 flex items-center gap-1">
                  {op.modality === "FIXED" ? (
                    <><TrendingUp size={12} className="text-emerald-400" /> Taxa Fixa</>
                  ) : (
                    <><Percent size={12} className="text-emerald-400" /> Profit Share {(op.profitSplitPct * 100).toFixed(0)}%</>
                  )}
                </p>
              </div>
            </div>

            {op.alreadyInvested !== null && (
              <div className="mt-5 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <p className="text-xs text-blue-400 font-bold">
                  Você já investiu {formatBRL(op.alreadyInvested)} nesta operação.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 animate-fade-in-up delay-300">
          <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl sticky top-6">
            <div className="flex items-center gap-2 mb-5 border-b border-white/5 pb-3">
              <TrendingUp size={14} className="text-[#F5C400]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Realizar Aporte</h2>
            </div>

            <InvestForm
              operationId={op.id}
              minInvestment={op.minInvestment}
              remainingCapacity={op.remainingCapacity}
              availableLimit={op.availableLimit}
              userApproved={op.userApproved}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
