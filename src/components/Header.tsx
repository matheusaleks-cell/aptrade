"use client";

import { Bell, Search, DollarSign, TrendingUp, Package, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface HeaderProps {
  userName: string;
  role?: "INVESTOR" | "ADMIN";
  unreadNotifications?: number;
  indicators?: {
    usdRate?: number;
    monthSales?: number;
    stockValue?: number;
    avgMargin?: number;
  };
}

export function Header({ userName, role = "INVESTOR", unreadNotifications = 0, indicators }: HeaderProps) {
  const isInvestor = role === "INVESTOR";
  const [usd, setUsd] = useState(indicators?.usdRate ?? 0);

  useEffect(() => {
    if (indicators?.usdRate) {
      setUsd(indicators.usdRate);
      return;
    }
    fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL")
      .then((r) => r.json())
      .then((d) => setUsd(parseFloat(d.USDBRL?.bid || "0")))
      .catch(() => setUsd(5.65));
  }, [indicators?.usdRate]);

  return (
    <header className={`h-20 flex items-center justify-between transition-all duration-300 ${
      isInvestor
        ? "bg-transparent text-white px-2 border-b border-transparent"
        : "bg-white border-b border-gray-200 px-8"
    }`}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
            isInvestor ? "text-slate-500" : "text-gray-400"
          }`} size={15} />
          <input
            type="text"
            placeholder="Buscar transações ou operações..."
            className={`pl-10 pr-12 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:border-transparent transition-all duration-300 ${
              isInvestor
                ? "bg-[#080B15]/40 border border-white/5 text-slate-200 placeholder:text-slate-600 focus:ring-[#F5C400]/40 focus:border-[#F5C400]/30 focus:bg-[#080B15]/70 w-64 focus:w-80 shadow-inner"
                : "border border-gray-200 text-slate-800 placeholder:text-gray-455 focus:ring-emerald-500 w-56"
            }`}
          />
          {isInvestor && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-bold font-mono text-slate-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded select-none">
              ⌘K
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Financial Indicators (admin) */}
        {!isInvestor && (
          <div className="hidden lg:flex items-center gap-3">
            {usd > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <DollarSign size={12} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-gray-800">USD</span>
                <span className="text-[10px] font-semibold text-emerald-600">R$ {usd.toFixed(2)}</span>
              </div>
            )}
            {indicators?.monthSales != null && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <TrendingUp size={12} className="text-blue-500" />
                <span className="text-[10px] font-bold text-gray-500">Vendas/Mês</span>
                <span className="text-[10px] font-semibold text-gray-800">
                  R$ {(indicators.monthSales / 1000).toFixed(1)}k
                </span>
              </div>
            )}
            {indicators?.stockValue != null && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <Package size={12} className="text-amber-500" />
                <span className="text-[10px] font-bold text-gray-500">Estoque</span>
                <span className="text-[10px] font-semibold text-gray-800">
                  R$ {(indicators.stockValue / 1000).toFixed(1)}k
                </span>
              </div>
            )}
            {indicators?.avgMargin != null && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <BarChart3 size={12} className="text-purple-500" />
                <span className="text-[10px] font-bold text-gray-500">Margem</span>
                <span className="text-[10px] font-semibold text-gray-800">
                  {indicators.avgMargin.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* USD badge for investor */}
        {isInvestor && usd > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg">
            <DollarSign size={11} className="text-[#F5C400]" />
            <span className="text-[10px] font-bold text-slate-400">USD</span>
            <span className="text-[10px] font-semibold text-[#F5C400]">R$ {usd.toFixed(2)}</span>
          </div>
        )}

        <Link
          href={isInvestor ? "/investidor/notificacoes" : "#"}
          className={`relative p-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
            isInvestor
              ? "text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent hover:border-white/[0.04]"
              : "text-gray-400 hover:text-gray-650"
          }`}
        >
          <Bell size={isInvestor ? 15 : 18} />
          {unreadNotifications > 0 && (
            <span className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-black rounded-full px-1 ${
              isInvestor ? "bg-[#F5C400] text-black" : "bg-red-500 text-white"
            }`}>
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-transform duration-300 hover:scale-105 cursor-pointer ${
            isInvestor
              ? "bg-gradient-to-br from-[#F5C400] to-[#DF9A00] text-black border border-black/15 shadow-[0_0_15px_rgba(245,196,0,0.25)]"
              : "bg-emerald-500 text-white font-medium"
          }`}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <span className={`block text-xs font-black tracking-wide ${
              isInvestor ? "text-slate-100" : "text-gray-750"
            }`}>{userName}</span>
            {isInvestor && (
              <span className="block text-[8px] text-[#F5C400] font-extrabold tracking-widest mt-0.5 uppercase">PLATINUM MEMBER</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
