"use client";

import React, { useState, useMemo } from "react";
import { formatBRL } from "@/lib/calculations";
import { FileText, ArrowUpRight, ArrowDownRight, Calendar, Search, Printer, DollarSign, Percent } from "lucide-react";

interface RawEntry {
  id: string;
  date: Date | string;
  description: string;
  amount: number;
  returnVal: number;
  status: string;
  saldo: number;
}

interface StatementContainerProps {
  entries: RawEntry[];
  saldoFinal: number;
}

interface Lancamento {
  id: string;
  date: Date;
  description: string;
  type: "APORTE" | "RETORNO";
  amount: number;
  status: string;
  saldo: number;
}

export function StatementContainer({ entries, saldoFinal }: StatementContainerProps) {
  const [filterType, setFilterType] = useState<"ALL" | "APORTE" | "RETORNO">("ALL");
  const [filterPeriod, setFilterPeriod] = useState<"ALL" | "30" | "90" | "180">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Desmembrar os aportes e retornos em lançamentos individuais cronológicos
  const allLancamentos = useMemo(() => {
    const list: Lancamento[] = [];
    let runningSaldo = 0;

    // Percorre os investimentos ordenados cronologicamente do mais antigo para o mais recente para calcular o saldo corrente
    const sortedRaw = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const entry of sortedRaw) {
      // 1. Lançamento do Aporte
      runningSaldo += entry.amount;
      list.push({
        id: `${entry.id}-aporte`,
        date: new Date(entry.date),
        description: `Aporte de Capital — ${entry.description.replace("Aporte - ", "")}`,
        type: "APORTE",
        amount: -entry.amount,
        status: entry.status === "PENDING" ? "PENDING" : "CONFIRMED",
        saldo: runningSaldo,
      });

      // 2. Lançamento do Retorno (se houver rendimento pago)
      if (entry.returnVal > 0) {
        runningSaldo += entry.returnVal;
        const returnDate = new Date(entry.date);
        returnDate.setHours(returnDate.getHours() + 1); // Simula ocorrendo um pouco depois no mesmo dia
        list.push({
          id: `${entry.id}-retorno`,
          date: returnDate,
          description: `Rendimento Líquido Recebido — ${entry.description.replace("Aporte - ", "")}`,
          type: "RETORNO",
          amount: entry.returnVal,
          status: "SETTLED",
          saldo: runningSaldo,
        });
      }
    }

    // Ordena do mais recente para o mais antigo para visualização do extrato
    return list.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [entries]);

  // Aplicar filtros de busca, tipo e período
  const filteredLancamentos = useMemo(() => {
    let result = [...allLancamentos];

    // Filtro por tipo
    if (filterType !== "ALL") {
      result = result.filter((l) => l.type === filterType);
    }

    // Filtro por período
    if (filterPeriod !== "ALL") {
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - parseInt(filterPeriod));
      result = result.filter((l) => l.date >= limitDate);
    }

    // Filtro por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((l) => 
        l.description.toLowerCase().includes(query) || 
        l.amount.toString().includes(query)
      );
    }

    return result;
  }, [allLancamentos, filterType, filterPeriod, searchQuery]);

  // Cálculos dinâmicos com base nos lançamentos filtrados
  const summary = useMemo(() => {
    let aportado = 0;
    let rendido = 0;

    filteredLancamentos.forEach((l) => {
      if (l.type === "APORTE") {
        aportado += Math.abs(l.amount);
      } else {
        rendido += l.amount;
      }
    });

    return {
      aportado,
      rendido,
      saldoConsolidado: rendido - aportado,
    };
  }, [filteredLancamentos]);

  // Formatador tipográfico financeiro
  const renderFinancialValue = (val: number, isTimeline = false) => {
    const isPositive = val >= 0;
    const absoluteVal = Math.abs(val);
    const formatted = formatBRL(absoluteVal);
    const cleanValue = formatted.replace("R$", "").replace(/\u00a0/g, " ").trim();
    const parts = cleanValue.split(",");
    const parteInteira = parts[0];
    const parteDecimal = parts[1] ? `,${parts[1]}` : "";

    return (
      <span className={`flex items-baseline font-bold tracking-tight ${
        isTimeline
          ? isPositive 
            ? "text-emerald-500 dark:text-emerald-400" 
            : "text-slate-700 dark:text-white"
          : "text-gray-900 dark:text-white"
      }`}>
        <span className="text-[10px] sm:text-xs font-semibold mr-0.5">
          {isTimeline ? (isPositive ? "+" : "-") : ""} R$
        </span>
        <span className="text-sm sm:text-base font-extrabold">
          {parteInteira}
        </span>
        {parteDecimal && (
          <span className="text-[10px] sm:text-xs font-medium opacity-80 ml-0.5">
            {parteDecimal}
          </span>
        )}
      </span>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Botões Superiores e Título */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Extrato</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Histórico detalhado de lançamentos e fluxo de caixa
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-[#F5C400]/40 text-slate-200 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer shadow-lg"
        >
          <Printer size={16} className="text-[#F5C400]" />
          <span>Exportar PDF</span>
        </button>
      </div>

      {/* Cards de Resumo Bancário */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:grid-cols-3">
        <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Aportado</p>
            <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-150 dark:border-white/[0.03] text-slate-400 flex items-center justify-center shrink-0">
              <DollarSign size={13} />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">
            {formatBRL(summary.aportado)}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">Soma de todos os aportes</p>
        </div>

        <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total de Retornos</p>
            <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-150 dark:border-white/[0.03] text-slate-400 flex items-center justify-center shrink-0">
              <Percent size={13} />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {formatBRL(summary.rendido)}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">Rendimentos acumulados pagos</p>
        </div>

        <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Saldo Líquido</p>
            <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-150 dark:border-white/[0.03] text-slate-400 flex items-center justify-center shrink-0">
              <FileText size={13} />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">
            {formatBRL(saldoFinal)}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">Saldo consolidado em conta</p>
        </div>
      </div>

      {/* Painel Principal de Lançamentos */}
      <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl relative overflow-hidden group">
        
        {/* Controles de Filtros e Busca */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-100 dark:border-white/5 pb-5 print:hidden">
          
          {/* Abas de Tipos (Aportes/Retornos) */}
          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl self-start">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === "ALL" 
                  ? "bg-white dark:bg-[#0C1322] text-slate-800 dark:text-white shadow" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType("APORTE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === "APORTE" 
                  ? "bg-white dark:bg-[#0C1322] text-slate-800 dark:text-white shadow" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Aportes
            </button>
            <button
              onClick={() => setFilterType("RETORNO")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === "RETORNO" 
                  ? "bg-white dark:bg-[#0C1322] text-slate-800 dark:text-white shadow" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Rendimentos
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Busca */}
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450" size={14} />
              <input
                type="text"
                placeholder="Buscar movimentação..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-700 dark:text-slate-250 focus:outline-none focus:border-[#F5C400]/40 transition-all"
              />
            </div>

            {/* Período */}
            <div className="flex items-center gap-2 bg-gray-150 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-1.5">
              <Calendar size={14} className="text-slate-450" />
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as any)}
                className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-medium focus:outline-none cursor-pointer pr-4 border-none appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0rem center",
                  backgroundSize: "0.85rem",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <option value="ALL" className="bg-[#0C1322] text-slate-350">Todo o período</option>
                <option value="30" className="bg-[#0C1322] text-slate-200">Últimos 30 dias</option>
                <option value="90" className="bg-[#0C1322] text-slate-200">Últimos 90 dias</option>
                <option value="180" className="bg-[#0C1322] text-slate-200">Últimos 180 dias</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timeline UX */}
        {filteredLancamentos.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 py-12 text-center">Nenhum lançamento encontrado para os filtros selecionados.</p>
        ) : (
          <>
            {/* Linha do Extrato Desktop Timeline (hidden md:block) */}
            <div className="hidden md:block relative pl-6 sm:pl-8 space-y-6">
              <div className="absolute top-2 bottom-2 left-[11px] sm:left-[15px] w-0.5 bg-gray-150 dark:bg-white/5" />

              {filteredLancamentos.map((lanc) => {
                const isRetorno = lanc.type === "RETORNO";
                return (
                  <div key={lanc.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6 animate-fade-in-up">
                    <div className="absolute -left-[27px] sm:-left-[31px] w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-150 dark:border-white/10 bg-gray-50 dark:bg-[#080B15] text-slate-400 flex items-center justify-center transition-all">
                      {isRetorno ? (
                        <ArrowUpRight size={13} className="sm:w-[14px] sm:h-[14px]" />
                      ) : (
                        <ArrowDownRight size={13} className="sm:w-[14px] sm:h-[14px]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-500 font-semibold tracking-wider">
                          {new Date(lanc.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                          lanc.status === "SETTLED"
                            ? "bg-blue-500/10 text-blue-400"
                            : lanc.status === "CONFIRMED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {lanc.status === "SETTLED" ? "Liquidado" : lanc.status === "CONFIRMED" ? "Ativo" : "Pendente"}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 mt-1 truncate">
                        {lanc.description}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 sm:gap-1 pl-0 sm:pl-4">
                      {renderFinancialValue(lanc.amount, true)}
                      <span className="text-[10px] text-gray-400 dark:text-slate-500">
                        Saldo: <strong className="text-slate-700 dark:text-slate-350">{formatBRL(lanc.saldo)}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Linha do Extrato Mobile Fintech (block md:hidden) */}
            <div className="block md:hidden space-y-4">
              {filteredLancamentos.map((lanc, index) => {
                const isRetorno = lanc.type === "RETORNO";
                
                const lancDateStr = new Date(lanc.date).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
                const prevLanc = index > 0 ? filteredLancamentos[index - 1] : null;
                const prevLancDateStr = prevLanc ? new Date(prevLanc.date).toLocaleDateString("pt-BR", { day: "numeric", month: "long" }) : null;
                const showDateHeader = lancDateStr !== prevLancDateStr;
                
                const todayStr = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
                
                let dateHeaderLabel = lancDateStr;
                if (lancDateStr === todayStr) dateHeaderLabel = "Hoje";
                else if (lancDateStr === yesterdayStr) dateHeaderLabel = "Ontem";

                return (
                  <div key={lanc.id} className="space-y-2">
                    {showDateHeader && (
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pt-2 pb-1">
                        {dateHeaderLabel}
                      </div>
                    )}
                    <div className="flex items-center justify-between p-3.5 bg-white/[0.015] border border-white/[0.04] rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                          isRetorno 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-white/[0.03] border-white/[0.08] text-[#F5C400]"
                        }`}>
                          {isRetorno ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-200 truncate leading-snug">
                            {isRetorno ? "Rendimento Recebido" : "Aporte de Capital"}
                          </p>
                          <p className="text-[9px] text-slate-450 truncate mt-0.5 leading-none">
                            {lanc.description.replace("Aporte de Capital — ", "").replace("Rendimento Líquido Recebido — ", "").replace("Aporte de Capital — ", "")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <div className={`text-xs font-black tracking-tight ${isRetorno ? "text-emerald-500" : "text-slate-300"}`}>
                          {isRetorno ? "+" : "-"} {formatBRL(Math.abs(lanc.amount)).replace("R$", "").trim()}
                        </div>
                        <span className="text-[8px] text-slate-500 block mt-0.5">
                          Saldo: {formatBRL(lanc.saldo).replace("R$", "").trim()}
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
