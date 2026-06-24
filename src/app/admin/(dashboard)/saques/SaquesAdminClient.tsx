"use client";

import { approveWithdrawal, rejectWithdrawal, markWithdrawalPaid } from "@/lib/actions";
import { formatBRL } from "@/lib/calculations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, XCircle, DollarSign } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

interface Withdrawal {
  id: string;
  amount: number;
  pixKey: string;
  status: string;
  notes: string | null;
  createdAt: Date | string;
  user: { id: string; name: string; email: string; cpfCnpj: string | null };
}

export function SaquesAdminClient({ withdrawals }: { withdrawals: Withdrawal[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const handleApprove = async (id: string) => {
    setLoading(id);
    const res = await approveWithdrawal(id);
    setLoading(null);
    if (res?.error) { toast.error(res.error); return; }
    toast.success("Saque aprovado!");
    router.refresh();
  };

  const handleReject = async (id: string) => {
    setLoading(id);
    const res = await rejectWithdrawal(id, rejectNote);
    setLoading(null);
    if (res?.error) { toast.error(res.error); return; }
    toast.success("Saque rejeitado.");
    setRejectId(null);
    setRejectNote("");
    router.refresh();
  };

  const handlePaid = async (id: string) => {
    setLoading(id);
    const res = await markWithdrawalPaid(id);
    setLoading(null);
    if (res?.error) { toast.error(res.error); return; }
    toast.success("Saque marcado como pago!");
    router.refresh();
  };

  if (withdrawals.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">Nenhuma solicitação de saque.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="text-left py-3 px-3 font-medium">Investidor</th>
            <th className="text-right py-3 px-3 font-medium">Valor</th>
            <th className="text-left py-3 px-3 font-medium">Chave PIX</th>
            <th className="text-center py-3 px-3 font-medium">Status</th>
            <th className="text-left py-3 px-3 font-medium">Data</th>
            <th className="text-center py-3 px-3 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map((w) => (
            <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-3">
                <p className="font-semibold text-gray-800">{w.user.name}</p>
                <p className="text-xs text-gray-400">{w.user.email}</p>
              </td>
              <td className="py-3 px-3 text-right font-bold text-gray-900">{formatBRL(w.amount)}</td>
              <td className="py-3 px-3 text-gray-600 text-xs font-mono">{w.pixKey}</td>
              <td className="py-3 px-3 text-center">
                <StatusBadge status={w.status} />
              </td>
              <td className="py-3 px-3 text-gray-500 text-xs">
                {new Date(w.createdAt).toLocaleDateString("pt-BR")}
                {w.notes && <p className="text-gray-400 mt-0.5">{w.notes}</p>}
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center justify-center gap-1">
                  {w.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleApprove(w.id)}
                        disabled={loading === w.id}
                        className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Aprovar"
                      >
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      </button>
                      <button
                        onClick={() => setRejectId(w.id)}
                        disabled={loading === w.id}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Rejeitar"
                      >
                        <XCircle size={16} className="text-red-400" />
                      </button>
                    </>
                  )}
                  {w.status === "APPROVED" && (
                    <button
                      onClick={() => handlePaid(w.id)}
                      disabled={loading === w.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors"
                      title="Marcar como pago"
                    >
                      <DollarSign size={12} /> Pagar
                    </button>
                  )}
                </div>

                {rejectId === w.id && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Motivo (opcional)"
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-400"
                    />
                    <button
                      onClick={() => handleReject(w.id)}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => { setRejectId(null); setRejectNote(""); }}
                      className="px-2 py-1.5 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
