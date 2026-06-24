import { getPendingInvestments } from "@/lib/actions";
import { Wallet } from "lucide-react";
import { AportesClient } from "./AportesClient";

export default async function AportesPage() {
  const result = await getPendingInvestments();

  if ("error" in result) {
    return <div className="p-6 text-red-600">Erro: {result.error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Aportes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Confirme ou cancele aportes pendentes dos investidores
          </p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
          <Wallet size={14} />
          {result.data.length} pendente(s)
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <AportesClient investments={result.data} />
      </div>
    </div>
  );
}
