import { getAllWithdrawals } from "@/lib/actions";
import { Banknote } from "lucide-react";
import { SaquesAdminClient } from "./SaquesAdminClient";

export default async function SaquesAdminPage() {
  const result = await getAllWithdrawals();

  if ("error" in result) {
    return <div className="p-6 text-red-600">Erro: {result.error}</div>;
  }

  const pending = result.data.filter((w) => w.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Saques</h1>
          <p className="text-sm text-gray-500 mt-1">
            Aprove, rejeite ou marque como pagos os saques solicitados
          </p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
          <Banknote size={14} />
          {pending} pendente(s)
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <SaquesAdminClient withdrawals={result.data} />
      </div>
    </div>
  );
}
