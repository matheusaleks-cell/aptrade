import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getInvestorPortfolio } from "@/lib/actions";
import { formatBRL } from "@/lib/calculations";
import Link from "next/link";
import { Briefcase, ChevronRight } from "lucide-react";

export default async function PortfolioPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const portfolio = await getInvestorPortfolio(session.email);

  // Lógica para formatar tipografia de valores financeiros de luxo
  const renderFinancialValue = (val: number, isPositiveColor = false) => {
    const formatted = formatBRL(val);
    const cleanValue = formatted.replace("R$", "").replace(/\u00a0/g, " ").trim();
    const parts = cleanValue.split(",");
    const parteInteira = parts[0];
    const parteDecimal = parts[1] ? `,${parts[1]}` : "";

    return (
      <span className={`flex items-baseline font-bold tracking-tight transition-all duration-300 ${
        isPositiveColor 
          ? "text-emerald-600 dark:text-gradient-emerald" 
          : "text-gray-900 dark:text-gradient-gold"
      }`}>
        <span className="text-[10px] sm:text-xs font-semibold text-gray-450 dark:text-slate-500 mr-0.5 self-center">
          R$
        </span>
        <span className="text-base sm:text-lg font-extrabold">
          {parteInteira}
        </span>
        {parteDecimal && (
          <span className="text-[10px] sm:text-xs font-medium text-gray-400 dark:text-slate-450 ml-0.5">
            {parteDecimal}
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Portfólio</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Seus projetos de investimento ativos e liquidados
        </p>
      </div>

      {portfolio.length === 0 ? (
        <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-12 text-center animate-fade-in-up delay-100 shadow-2xl">
          <Briefcase size={24} className="mx-auto text-slate-500 mb-4" />
          <p className="text-gray-500 dark:text-slate-400">Você ainda não possui investimentos vinculados a esta conta.</p>
        </div>
      ) : (
        <>
          {/* Grid Desktop (hidden md:grid) */}
          <div className="hidden md:grid md:grid-cols-2 gap-6 animate-fade-in-up delay-100">
            {portfolio.map((item) => (
              <div
                key={item.project.id}
                className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 hover-lift-premium shadow-[0_8px_30px_rgba(15,23,42,0.02)] dark:shadow-2xl transition-all duration-300 relative overflow-hidden group hover:border-[#F5C400]/20"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-[#F5C400] transition-colors duration-300">{item.project.name}</h3>
                    <p className="text-xs text-gray-400 dark:text-slate-455 mt-1">
                      {item.project.productCategory}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      item.project.status === "ACTIVE"
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "bg-gray-100 dark:bg-slate-850 text-gray-600 dark:text-slate-400"
                    }`}
                  >
                    {item.project.status === "ACTIVE" ? "Ativo" : item.project.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-5">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-455 uppercase tracking-wider font-semibold">Investido</p>
                    <div className="mt-1">
                      {renderFinancialValue(item.totalInvested)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-455 uppercase tracking-wider font-semibold">Retorno Líquido</p>
                    <div className="mt-1">
                      {renderFinancialValue(item.totalReturn, true)}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.04]">
                  <p className="text-xs text-gray-400 dark:text-slate-500 mb-2 font-medium">
                    {item.operations.length} operação(ões) vinculada(s)
                  </p>
                  <div className="space-y-1">
                    {item.operations.map((op) => (
                      <Link
                        key={op.id}
                        href={`/investidor/portfolio/${op.id}`}
                        className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.015] border border-transparent hover:border-white/[0.03] transition-colors group/link"
                      >
                        <div>
                          <span className="text-sm font-semibold text-gray-700 dark:text-slate-300 group-hover/link:text-amber-500 dark:group-hover/link:text-[#F5C400] transition-colors duration-200">
                            {op.operationCode}
                          </span>
                          <span
                            className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              op.status === "SETTLED"
                                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : op.status === "IN_PROGRESS"
                                ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400"
                            }`}
                          >
                            {op.status === "SETTLED" ? "Liquidada" : op.status === "IN_PROGRESS" ? "Em andamento" : op.status}
                          </span>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-gray-300 dark:text-slate-650 group-hover/link:text-gray-500 dark:group-hover/link:text-slate-200 transition-all duration-200 group-hover/link:translate-x-0.5"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carrossel de Cartões Fintech Mobile (block md:hidden) */}
          <div className="block md:hidden space-y-6 animate-fade-in-up delay-100">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 py-2 px-1 no-scrollbar">
              {portfolio.flatMap((item) => 
                item.operations.map((op) => {
                  const isSettled = op.status === "SETTLED";
                  const isProgress = op.status === "IN_PROGRESS";
                  return (
                    <Link
                      key={op.id}
                      href={`/investidor/portfolio/${op.id}`}
                      className="w-[290px] h-[175px] shrink-0 snap-center rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-[#0b0e17] via-[#0f1422] to-[#07090f] border border-white/[0.05] group"
                    >
                      {/* Simulação de Chip e Estética do Cartão */}
                      <div className="absolute top-5 right-5 w-8 h-6 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 opacity-80" />
                      <div className="absolute -bottom-12 -left-12 w-28 h-28 rounded-full bg-[#F5C400]/5 blur-2xl pointer-events-none" />

                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${
                          isSettled
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : isProgress
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-white/5 text-slate-400 border border-white/10"
                        }`}>
                          {isSettled ? "Liquidada" : isProgress ? "Em andamento" : op.status}
                        </span>
                        <h4 className="text-slate-100 font-bold text-sm tracking-tight pt-2 truncate pr-12">{item.project.name}</h4>
                        <p className="text-[10px] text-slate-550">{op.operationCode}</p>
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest font-semibold">Valor Investido</p>
                          <div className="text-base font-black text-[#F5C400] mt-0.5">
                            {formatBRL(item.totalInvested)}
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 group-hover:text-white transition-colors flex items-center gap-0.5">
                          Detalhes <ChevronRight size={10} />
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
            
            {/* Lista compacta de operações mobile abaixo do carrossel */}
            <div className="space-y-3 bg-[#0b0e17] border border-white/[0.05] rounded-[28px] p-5 shadow-xl">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Suas Operações</h3>
              <div className="divide-y divide-white/[0.04] space-y-1">
                {portfolio.flatMap((item) => 
                  item.operations.map((op) => (
                    <Link
                      key={op.id}
                      href={`/investidor/portfolio/${op.id}`}
                      className="flex items-center justify-between py-3 group/item transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-200 group-hover/item:text-[#F5C400] transition-colors">{op.operationCode}</span>
                        <p className="text-[9px] text-slate-500 truncate mt-0.5">{item.project.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                          op.status === "SETTLED"
                            ? "bg-blue-500/10 text-blue-400"
                            : op.status === "IN_PROGRESS"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-white/5 text-slate-400"
                        }`}>
                          {op.status === "SETTLED" ? "Liquidada" : op.status === "IN_PROGRESS" ? "Em andamento" : op.status}
                        </span>
                        <ChevronRight size={14} className="text-slate-600" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

