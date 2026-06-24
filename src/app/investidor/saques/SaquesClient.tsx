"use client";

import { useState } from "react";
import { createWithdrawalRequest } from "@/lib/actions";
import { formatBRL } from "@/lib/calculations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Banknote, Clock, CheckCircle2, XCircle, AlertTriangle, CreditCard, Send } from "lucide-react";

interface Withdrawal {
  id: string;
  amount: number;
  pixKey: string;
  status: string;
  notes: string | null;
  createdAt: Date | string;
}

interface SaquesClientProps {
  withdrawals: Withdrawal[];
  availableBalance: number;
  pixKey: string | null;
}

export function SaquesClient({ withdrawals, availableBalance, pixKey }: SaquesClientProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const numericAmount = parseFloat(amount.replace(/\D/g, "")) / 100 || 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) { setAmount(""); return; }
    const val = parseInt(raw) / 100;
    setAmount(val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) return;
    setLoading(true);
    const result = await createWithdrawalRequest(numericAmount);
    setLoading(false);
    if (result && "error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Solicitação de saque enviada!");
    setAmount("");
    router.refresh();
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PAID": return { label: "Pago", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
      case "APPROVED": return { label: "Aprovado", icon: CheckCircle2, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
      case "REJECTED": return { label: "Rejeitado", icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20" };
      default: return { label: "Pendente", icon: Clock, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Formulário de Saque */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl animate-fade-in-up">
          <div className="flex items-center gap-2 mb-5 border-b border-white/5 pb-3">
            <Send size={14} className="text-[#F5C400]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Solicitar Saque</h2>
          </div>

          <div className="bg-gradient-to-br from-[#F5C400]/5 to-emerald-500/5 border border-[#F5C400]/10 rounded-2xl p-4 mb-5">
            <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest">Saldo Disponível</span>
            <span className="block text-2xl font-black text-[#F5C400] mt-1">{formatBRL(availableBalance)}</span>
          </div>

          {!pixKey ? (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-center">
              <AlertTriangle size={20} className="text-amber-400 mx-auto mb-2" />
              <p className="text-xs text-amber-400 font-bold">Chave PIX não cadastrada</p>
              <p className="text-[10px] text-slate-500 mt-1">Cadastre uma chave PIX no seu perfil para solicitar saques.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-white/[0.015] border border-white/[0.04] rounded-xl">
                <CreditCard size={14} className="text-slate-400" />
                <div>
                  <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest">Chave PIX</span>
                  <span className="block text-xs font-bold text-white">{pixKey}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Valor (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">R$</span>
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0,00"
                    className="w-full pl-11 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-[#F5C400]/50 focus:ring-1 focus:ring-[#F5C400]/20 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              {numericAmount > availableBalance && (
                <p className="text-xs text-red-400 font-medium flex items-center gap-1">
                  <AlertTriangle size={12} /> Valor excede o saldo disponível.
                </p>
              )}

              <button
                type="submit"
                disabled={loading || numericAmount <= 0 || numericAmount > availableBalance}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#F5C400] to-[#DF9A00] text-black font-bold text-sm rounded-xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Banknote size={16} />
                {loading ? "Processando..." : "Solicitar Saque"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Histórico de Saques */}
      <div className="lg:col-span-3 animate-fade-in-up delay-100">
        <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-5 border-b border-white/5 pb-3">
            <Clock size={14} className="text-slate-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Histórico de Saques</h2>
          </div>

          {withdrawals.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">Nenhuma solicitação de saque realizada.</p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => {
                const config = getStatusConfig(w.status);
                const StatusIcon = config.icon;
                return (
                  <div key={w.id} className="flex items-center justify-between p-4 bg-white/[0.015] border border-white/[0.04] rounded-2xl hover:border-white/[0.08] transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center shrink-0">
                        <Banknote size={16} className="text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white">{formatBRL(w.amount)}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(w.createdAt).toLocaleDateString("pt-BR")} · PIX: {w.pixKey}
                        </p>
                        {w.notes && <p className="text-[10px] text-slate-400 mt-0.5">{w.notes}</p>}
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${config.color}`}>
                      <StatusIcon size={10} /> {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
