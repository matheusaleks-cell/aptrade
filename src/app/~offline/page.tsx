"use client";

import { WifiOff, RotateCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  function handleReload() {
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-[#03050a] flex items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      {/* Glows de fundo discretos */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#F5C400]/[0.02] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#10B981]/[0.02] blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0C1322] border border-white/[0.04] rounded-[24px] p-8 text-center space-y-8 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        {/* Ícone Pulsante */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F5C400] animate-pulse">
            <WifiOff size={32} />
          </div>
        </div>

        {/* Textos */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">Sem Conexão com a Internet</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Parece que você está offline no momento. Por motivos de segurança, não exibimos saldos e dados financeiros desatualizados em modo offline.
          </p>
        </div>

        {/* Informação Adicional de Segurança */}
        <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl text-left">
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nota de Segurança</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Assim que sua conexão for restabelecida, a plataforma atualizará automaticamente suas cotas e extrato em tempo real.
          </p>
        </div>

        {/* Ações */}
        <div className="space-y-4">
          <button
            onClick={handleReload}
            className="w-full bg-gradient-to-r from-[#F5C400] to-[#DF9A00] hover:shadow-[0_4px_20px_rgba(245,196,0,0.15)] text-black py-3 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCw size={14} className="animate-spin-slow" />
            Tentar Reconectar
          </button>

          <Link
            href="/investidor"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-400 transition-colors"
          >
            <ArrowLeft size={12} />
            Ir para página inicial local
          </Link>
        </div>
      </div>
    </div>
  );
}
