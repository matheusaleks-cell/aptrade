import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOpenOpportunities } from "@/lib/actions";
import { formatBRL } from "@/lib/calculations";
import Link from "next/link";
import { TrendingUp, Users, Clock, ArrowRight, ShieldCheck, Target } from "lucide-react";

export default async function OportunidadesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const result = await getOpenOpportunities();
  if ("error" in result) redirect("/login");

  const { data: operations, availableLimit, isQualified } = result;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Oportunidades
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Captações abertas para investimento
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.02] dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-2xl px-4 py-2.5">
          <ShieldCheck size={14} className="text-[#F5C400]" />
          <span className="text-xs font-bold text-gray-600 dark:text-slate-300">
            Limite disponível:{" "}
            <span className="text-[#F5C400]">
              {isQualified ? "Ilimitado" : formatBRL(availableLimit)}
            </span>
          </span>
        </div>
      </div>

      {operations.length === 0 ? (
        <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-12 text-center animate-fade-in-up delay-100 shadow-2xl">
          <Target size={28} className="mx-auto text-slate-500 mb-4" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">
            Nenhuma captação aberta no momento.
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
            Novas oportunidades serão publicadas em breve.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up delay-100">
          {operations.map((op) => {
            const progress = op.totalAmount > 0 ? (op.fundedAmount / op.totalAmount) * 100 : 0;

            return (
              <div
                key={op.id}
                className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 hover-lift-premium shadow-2xl transition-all duration-300 relative overflow-hidden group hover:border-[#F5C400]/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-[#F5C400] transition-colors">
                      {op.projectName}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-slate-450 mt-0.5">
                      {op.operationCode} · {op.productCategory}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                    {op.status === "OPEN" ? "Aberta" : "Captando"}
                  </span>
                </div>

                <div className="space-y-3 mb-5">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500 dark:text-slate-400 font-medium">Progresso da captação</span>
                      <span className="font-bold text-gray-700 dark:text-slate-200">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-white/[0.04] h-2 rounded-full overflow-hidden border border-gray-200 dark:border-white/[0.06]">
                      <div
                        className="bg-gradient-to-r from-[#F5C400] to-[#DF9A00] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                      <span>{formatBRL(op.fundedAmount)}</span>
                      <span>{formatBRL(op.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5 pt-4 border-t border-gray-100 dark:border-white/[0.04]">
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Mínimo</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-white mt-0.5">{formatBRL(op.minInvestment)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Prazo Est.</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-white mt-0.5 flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      {op.expectedMonths} meses
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Investidores</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-white mt-0.5 flex items-center gap-1">
                      <Users size={12} className="text-slate-400" />
                      {op.investorsCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-emerald-500" />
                    <span className="text-xs font-bold text-gray-600 dark:text-slate-300">
                      {op.modality === "FIXED" ? "Taxa Fixa" : `Participação ${(op.profitSplitPct * 100).toFixed(0)}%`}
                    </span>
                  </div>
                  <Link
                    href={`/investidor/oportunidades/${op.id}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#F5C400] hover:text-white bg-[#F5C400]/10 hover:bg-[#F5C400] hover:text-black border border-[#F5C400]/20 hover:border-[#F5C400] px-4 py-2 rounded-xl transition-all active:scale-95"
                  >
                    Investir <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
