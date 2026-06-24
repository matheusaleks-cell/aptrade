import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getInvestorDashboardData } from "@/lib/actions";
import Link from "next/link";
import { formatBRL } from "@/lib/calculations";
import { StatCard } from "@/components/StatCard";
import { CapitalGrowthChart } from "@/components/CapitalGrowthChart";
import { DashboardFilter } from "@/components/DashboardFilter";
import { PortfolioDonutChart } from "@/components/PortfolioDonutChart";
import { Wallet, TrendingUp, Banknote, ShoppingCart, Percent, Ship, Calendar as CalendarIcon, FileText, Coins, ShoppingBag, CheckCircle2, Briefcase, User } from "lucide-react";

const stepIcons = [
  FileText,
  Coins,
  Ship,
  ShoppingBag,
  CheckCircle2
];

export default async function InvestorDashboard({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; period?: string; startDate?: string; endDate?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const resolvedParams = await searchParams;
  const projectId = resolvedParams?.project;
  const period = resolvedParams?.period;
  const startDate = resolvedParams?.startDate;
  const endDate = resolvedParams?.endDate;

  const data = await getInvestorDashboardData(session.email, projectId, period, startDate, endDate);
  if (!data) redirect("/login");

  // Extrair a lista exclusiva de projetos em que o usuário investiu para o filtro
  const projects = Array.from(
    new Map(
      data.investments.map((inv) => [
        inv.operation.project.id,
        { id: inv.operation.project.id, name: inv.operation.project.name }
      ])
    ).values()
  );

  // Mapeador de progresso de importações (5 etapas do Track & Trace)
  const getStepIndex = (status: string) => {
    if (status === "DRAFT") return 0;
    if (status === "OPEN" || status === "FUNDING") return 1;
    if (status === "IN_PROGRESS") return 2;
    if (status === "SOLD") return 3;
    if (status === "SETTLED") return 4;
    return 1;
  };

  const steps = [
    "Planejamento",
    "Captação",
    "Trânsito & Aduana",
    "Vendas & Ciclos",
    "Finalizado"
  ];

  return (

    <div className="space-y-6 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Olá, {data.user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Bem-vindo ao seu painel de investimentos em importação
          </p>
        </div>
        <DashboardFilter
          projects={projects}
          selectedProjectId={projectId}
          selectedPeriod={period}
          startDate={startDate}
          endDate={endDate}
        />
      </div>

      {/* KYC Pendente */}
      {!data.user.approved && (
        <div className="bg-amber-500/5 dark:bg-amber-500/[0.03] border border-amber-500/20 rounded-2xl p-4 animate-fade-in-up backdrop-blur-md">
          <p className="text-sm text-amber-500 dark:text-amber-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span><strong>KYC Pendente CVM:</strong> Seus documentos de investidor estão em análise regulatória. Algumas funcionalidades podem estar temporariamente restritas.</span>
          </p>
        </div>
      )}

      {/* Grid de Estatísticas (Desktop/Tablet) */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-100">
        <StatCard
          title="Patrimônio Total"
          value={formatBRL(data.patrimonio.total)}
          icon={Wallet}
          variant="yellow"
        />
        <StatCard
          title="Rendimento Acumulado"
          value={formatBRL(data.patrimonio.rendimiento)}
          icon={TrendingUp}
          subtitle={period && period !== "all" ? `Filtrado (${period} dias / ano)` : "Líquido de IR"}
          variant="emerald"
        />
        <StatCard
          title="ROI Médio Geral"
          value={`${data.roiMedio}%`}
          icon={Percent}
          subtitle="Projetos finalizados"
          variant="purple"
        />
        <StatCard
          title="Disponível para Saque"
          value={formatBRL(data.patrimonio.disponivel)}
          icon={Banknote}
          variant="blue"
        />
      </div>

      {/* Estrutura de Estatísticas e Ações Rápidas (Mobile: ≤767px) */}
      <div className="block md:hidden space-y-5 animate-fade-in-up delay-100">
        {/* Card de Saldo unificado no topo com acento âmbar */}
        <div className="bg-[#0b0e17] border border-white/[0.05] rounded-3xl p-6 shadow-xl relative overflow-hidden">
          {/* Efeito Glow Âmbar de Fundo */}
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#F5C400]/5 blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-450 uppercase tracking-wider">
            <Wallet size={12} className="text-[#F5C400]" />
            <span>Patrimônio Total</span>
          </div>
          <div className="text-3xl font-black text-[#F5C400] mt-2 tracking-tight">
            {formatBRL(data.patrimonio.total)}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Consolidado em todas as operações ativas</p>
          
          {/* Botões de Ação Rápida com ícones circulares translúcidos */}
          <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-white/[0.05]">
            <Link href="/investidor/extrato" className="flex flex-col items-center gap-1.5 group">
              <div className="w-11 h-11 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-200 group-active:bg-white/10 transition-colors">
                <FileText size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-300">Extrato</span>
            </Link>
            <Link href="/investidor/portfolio" className="flex flex-col items-center gap-1.5 group">
              <div className="w-11 h-11 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-200 group-active:bg-white/10 transition-colors">
                <Briefcase size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-300">Carteira</span>
            </Link>
            <Link href="/investidor/saques" className="flex flex-col items-center gap-1.5 group">
              <div className="w-11 h-11 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-200 group-active:bg-white/10 transition-colors">
                <Banknote size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-300">Sacar</span>
            </Link>
            <Link href="/investidor/perfil" className="flex flex-col items-center gap-1.5 group">
              <div className="w-11 h-11 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-200 group-active:bg-white/10 transition-colors">
                <User size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-300">Perfil</span>
            </Link>
          </div>
        </div>

        {/* Carrossel Horizontal das outras 3 métricas com scroll-snap */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 py-1 px-1 no-scrollbar">
          {/* Card 1: Rendimento */}
          <div className="w-[280px] shrink-0 snap-center bg-[#0b0e17] border border-white/[0.05] rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rendimento Acumulado</span>
              <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#F5C400]">
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xl font-black text-slate-100">{formatBRL(data.patrimonio.rendimiento)}</div>
              <p className="text-[9px] text-slate-500 mt-1">
                {period && period !== "all" ? `Filtrado (${period} dias)` : "Líquido de IR"}
              </p>
            </div>
          </div>

          {/* Card 2: ROI Médio */}
          <div className="w-[280px] shrink-0 snap-center bg-[#0b0e17] border border-white/[0.05] rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ROI Médio Geral</span>
              <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#F5C400]">
                <Percent size={14} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xl font-black text-slate-100">{data.roiMedio}%</div>
              <p className="text-[9px] text-slate-500 mt-1">Projetos finalizados</p>
            </div>
          </div>

          {/* Card 3: Disponível para Saque */}
          <div className="w-[280px] shrink-0 snap-center bg-[#0b0e17] border border-white/[0.05] rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Disponível para Saque</span>
              <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#F5C400]">
                <Banknote size={14} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xl font-black text-slate-100">{formatBRL(data.patrimonio.disponivel)}</div>
              <p className="text-[9px] text-slate-500 mt-1">Saldo líquido resgatável</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Conteúdo Secundário (Duas Colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Gráfico de Evolução e Track & Trace (2/3 da largura no desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Evolução de Capital */}
          <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl transition-all duration-300 hover:border-[#F5C400]/20 hover-lift-premium animate-fade-in-up delay-200">
            <CapitalGrowthChart data={data.capitalPoints} />
          </div>

          {/* Progresso de Importações (Track & Trace) */}
          <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 hover-lift-premium shadow-2xl transition-all duration-300 hover:border-[#F5C400]/20 animate-fade-in-up delay-200">
            <div className="flex items-center gap-2 mb-6">
              <Ship size={16} className="text-gray-500 dark:text-slate-400" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">Acompanhamento das Importações (Track & Trace)</h3>
            </div>
            
            {data.activeOperations.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-slate-500 py-4 text-center">Nenhuma importação ativa em andamento no momento.</p>
            ) : (
              <div className="space-y-8">
                {data.activeOperations.map((op) => {
                  const currentStep = getStepIndex(op.status);
                  return (
                    <div key={op.id} className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-800 dark:text-slate-200">{op.projectName} ({op.operationCode})</span>
                        <span className="text-gray-500 dark:text-slate-400">Aporte: <strong className="text-[#F5C400] font-extrabold">{formatBRL(op.amount)}</strong></span>
                      </div>
                      
                      {/* Barra de Progresso com Etapas */}
                      <div className="relative py-2">
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-gray-150 dark:bg-white/[0.04] rounded-full" />
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-[#F5C400] rounded-full transition-all duration-500" 
                          style={{ width: `${(currentStep / 4) * 100}%` }}
                        />
                        <div className="relative flex justify-between">
                          {steps.map((label, idx) => {
                            const isCompleted = idx <= currentStep;
                            const isActive = idx === currentStep;
                            const IconComponent = stepIcons[idx];
                            return (
                              <div key={label} className="flex flex-col items-center gap-2">
                                <div 
                                  className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                    isActive
                                      ? "bg-white text-black border-transparent"
                                      : isCompleted
                                      ? "bg-slate-800 text-slate-200 border-white/10"
                                      : "bg-[#080B15] text-slate-600 border-white/[0.03]"
                                  }`}
                                >
                                  <IconComponent size={13} />
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block ${
                                  isActive ? "text-[#F5C400]" : "text-slate-550"
                                }`}>{label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>



        {/* Coluna Direita: Diversificação e Próximos Pagamentos (1/3 da largura no desktop) */}
        <div className="space-y-6">
          {/* Diversificação da Carteira */}
          <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 hover-lift-premium shadow-2xl transition-all duration-300 hover:border-[#F5C400]/20 animate-fade-in-up delay-100">
            <div className="flex items-center gap-2 mb-4">
                  <Percent size={16} className="text-gray-500 dark:text-slate-400" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">Diversificação do Portfólio</h3>
                </div>
            <PortfolioDonutChart data={data.diversificacao} />
          </div>

          {/* Previsão de Recebimentos */}
          <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 hover-lift-premium shadow-2xl transition-all duration-300 hover:border-[#F5C400]/20 animate-fade-in-up delay-200">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon size={16} className="text-gray-500 dark:text-slate-400" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">Previsões de Retorno</h3>
            </div>
            
            {data.provisoes.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-slate-500 py-6 text-center">Nenhum pagamento previsto para os próximos meses.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                {data.provisoes.map((prov, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-white/[0.015] border border-gray-100 dark:border-white/[0.03] rounded-2xl hover:border-emerald-500/20 transition-all duration-300">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-150 dark:border-white/[0.03] text-slate-400 flex items-center justify-center shrink-0">
                        <CalendarIcon size={13} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate">{prov.projectName}</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-450 mt-0.5">
                          Previsto: {new Date(prov.estimatedDate).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-950 dark:text-emerald-400 shrink-0">{formatBRL(prov.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vendas Recentes (Tabela Desktop / Lista Mobile) */}
      <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 hover-lift-premium shadow-2xl transition-all duration-300 hover:border-[#F5C400]/20 animate-fade-in-up delay-300">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart size={16} className="text-gray-500 dark:text-slate-400" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">Vendas Recentes</h3>
        </div>
        
        {data.recentSales.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 py-4 text-center">Nenhuma venda registrada no período selecionado.</p>
        ) : (
          <>
            {/* Tabela Desktop (md:block hidden) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-150 dark:border-white/[0.04] text-gray-500 dark:text-slate-450">
                    <th className="text-left py-3 px-3 font-medium">Operação</th>
                    <th className="text-left py-3 px-3 font-medium">Comprador</th>
                    <th className="text-right py-3 px-3 font-medium">Qtd</th>
                    <th className="text-right py-3 px-3 font-medium">Valor Unit.</th>
                    <th className="text-right py-3 px-3 font-medium">Total</th>
                    <th className="text-right py-3 px-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-gray-50 dark:border-white/[0.015] hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 px-3 text-gray-700 dark:text-slate-350 font-semibold">
                        <Link 
                          href={`/investidor/portfolio/${sale.cycle.operation.id}`}
                          className="text-amber-600 dark:text-[#F5C400] hover:underline"
                        >
                          {sale.cycle.operation.operationCode}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-gray-700 dark:text-slate-300">{sale.buyerName}</td>
                      <td className="py-3 px-3 text-right text-gray-700 dark:text-slate-350">{sale.quantity}</td>
                      <td className="py-3 px-3 text-right text-gray-700 dark:text-slate-350">{formatBRL(sale.unitPrice)}</td>
                      <td className="py-3 px-3 text-right font-medium text-gray-950 dark:text-white">{formatBRL(sale.totalValue)}</td>
                      <td className="py-3 px-3 text-right text-gray-500 dark:text-slate-400">
                        {new Date(sale.saleDate).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Lista Fintech Mobile (block md:hidden) */}
            <div className="block md:hidden space-y-3">
              {data.recentSales.map((sale, index) => {
                const saleDateStr = new Date(sale.saleDate).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
                const prevSale = index > 0 ? data.recentSales[index - 1] : null;
                const prevSaleDateStr = prevSale ? new Date(prevSale.saleDate).toLocaleDateString("pt-BR", { day: "numeric", month: "long" }) : null;
                const showDateHeader = saleDateStr !== prevSaleDateStr;

                const todayStr = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
                
                let dateHeaderLabel = saleDateStr;
                if (saleDateStr === todayStr) dateHeaderLabel = "Hoje";
                else if (saleDateStr === yesterdayStr) dateHeaderLabel = "Ontem";

                return (
                  <div key={sale.id} className="space-y-1.5">
                    {showDateHeader && (
                      <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest pt-2 pb-0.5">
                        {dateHeaderLabel}
                      </div>
                    )}
                    <div className="flex items-center justify-between p-3.5 bg-white/[0.015] border border-white/[0.04] rounded-2xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#F5C400] flex items-center justify-center shrink-0">
                          <ShoppingCart size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-200 truncate leading-snug">
                            Venda — {sale.cycle.operation.operationCode}
                          </p>
                          <p className="text-[9px] text-slate-450 truncate mt-0.5 leading-none">
                            Cliente: {sale.buyerName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-emerald-550 dark:text-emerald-400 tracking-tight">
                          + {formatBRL(sale.totalValue).replace("R$", "").trim()}
                        </div>
                        <span className="text-[8px] text-slate-500 block mt-0.5">
                          {sale.quantity} un. × {formatBRL(sale.unitPrice).replace("R$", "").trim()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
