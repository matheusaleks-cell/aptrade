"use client";

import { useState } from "react";
import { getRecentTransactions } from "@/lib/actions-financial";
import { formatBRL } from "@/lib/calculations";
import { StatusBadge } from "@/components/StatusBadge";
import { ChevronLeft, ChevronRight, ArrowDownUp } from "lucide-react";

interface Transaction {
  id: string;
  type: "INVESTMENT" | "SALE";
  date: Date;
  description: string;
  value: number;
  status: string;
}

export function TransactionsTable({
  initialTransactions,
  initialTotal,
  initialPage,
  initialTotalPages,
}: {
  initialTransactions: Transaction[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
}) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);

  async function goToPage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    setLoading(true);
    const result = await getRecentTransactions(newPage, 10);
    if (result && "data" in result && result.data) {
      setTransactions(result.data as Transaction[]);
      setPage(result.page ?? newPage);
      setTotalPages(result.totalPages ?? 1);
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <ArrowDownUp size={18} className="text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700">Transacoes Recentes</h3>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          Nenhuma transacao encontrada.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Tipo</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Descricao</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Valor</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Data</th>
                </tr>
              </thead>
              <tbody className={loading ? "opacity-50" : ""}>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          t.type === "INVESTMENT"
                            ? "bg-purple-50 text-purple-600"
                            : "bg-cyan-50 text-cyan-600"
                        }`}
                      >
                        {t.type === "INVESTMENT" ? "Aporte" : "Venda"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-700">{t.description}</td>
                    <td className="py-2 px-3 text-right font-medium text-gray-800">
                      {formatBRL(t.value)}
                    </td>
                    <td className="py-2 px-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-2 px-3 text-gray-500">
                      {new Date(t.date).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Pagina {page} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1 || loading}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} className="text-gray-600" />
              </button>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages || loading}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
