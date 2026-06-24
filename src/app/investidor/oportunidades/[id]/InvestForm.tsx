"use client";

import { useState } from "react";
import { createInvestment } from "@/lib/actions";
import { formatBRL } from "@/lib/calculations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";

interface InvestFormProps {
  operationId: string;
  minInvestment: number;
  remainingCapacity: number;
  availableLimit: number;
  userApproved: boolean;
}

export function InvestForm({
  operationId,
  minInvestment,
  remainingCapacity,
  availableLimit,
  userApproved,
}: InvestFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const numericAmount = parseFloat(amount.replace(/\D/g, "")) / 100 || 0;
  const maxAmount = Math.min(remainingCapacity, availableLimit === Infinity ? remainingCapacity : availableLimit);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) { setAmount(""); return; }
    const val = parseInt(raw) / 100;
    setAmount(val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted || numericAmount <= 0) return;

    setLoading(true);
    const result = await createInvestment(operationId, numericAmount);
    setLoading(false);

    if (result && "error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    setSuccess(true);
    toast.success("Aporte realizado com sucesso!");
    setTimeout(() => router.push("/investidor/portfolio"), 2000);
  };

  if (!userApproved) {
    return (
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 text-center">
        <AlertTriangle size={24} className="text-amber-400 mx-auto mb-3" />
        <p className="text-sm font-bold text-amber-400">Cadastro Pendente</p>
        <p className="text-xs text-slate-400 mt-1">
          Seu cadastro precisa ser aprovado (KYC) antes de realizar aportes.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center animate-fade-in">
        <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-3" />
        <p className="text-sm font-bold text-emerald-400">Aporte Registrado!</p>
        <p className="text-xs text-slate-400 mt-1">
          Seu investimento de {formatBRL(numericAmount)} foi registrado com sucesso. Redirecionando...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Valor do Aporte (R$)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">R$</span>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0,00"
            className="w-full pl-11 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-[#F5C400]/50 focus:ring-1 focus:ring-[#F5C400]/20 transition-all placeholder:text-slate-600"
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-medium">
          <span>Mínimo: {formatBRL(minInvestment)}</span>
          <span>Máximo: {formatBRL(maxAmount)}</span>
        </div>
      </div>

      {numericAmount > 0 && numericAmount < minInvestment && (
        <p className="text-xs text-red-400 font-medium flex items-center gap-1">
          <AlertTriangle size={12} /> Valor abaixo do mínimo permitido.
        </p>
      )}

      {numericAmount > maxAmount && (
        <p className="text-xs text-red-400 font-medium flex items-center gap-1">
          <AlertTriangle size={12} /> Valor excede o limite disponível.
        </p>
      )}

      <label className="flex items-start gap-3 cursor-pointer select-none group">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-5 h-5 rounded-md border border-white/15 bg-black/30 flex items-center justify-center shrink-0 mt-0.5 peer-checked:bg-[#F5C400]/20 peer-checked:border-[#F5C400]/40 transition-all">
          {accepted && <CheckCircle2 size={13} className="text-[#F5C400]" />}
        </div>
        <span className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
          Declaro que li e aceito os termos de investimento, estou ciente dos riscos envolvidos na operação de importação coletiva e concordo com o contrato de mútuo comercial da APTRADE Funding.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading || !accepted || numericAmount < minInvestment || numericAmount > maxAmount}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#F5C400] to-[#DF9A00] text-black font-bold text-sm rounded-xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 cursor-pointer"
      >
        <Wallet size={16} />
        {loading ? "Processando..." : `Confirmar Aporte de ${numericAmount > 0 ? formatBRL(numericAmount) : "R$ 0,00"}`}
      </button>
    </form>
  );
}
