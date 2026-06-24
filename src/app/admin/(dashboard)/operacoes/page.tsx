import { getOperationsList, getSystemConfig } from "@/lib/actions";
import { formatBRL } from "@/lib/calculations";
import { OperationActions } from "./OperationActions";
import { ImportCostForm } from "./ImportCostForm";
import { Ship } from "lucide-react";

export default async function OperacoesPage() {
  const operations = await getOperationsList();
  const systemConfig = await getSystemConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Operações</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestão aduaneira e custos de importação
        </p>
      </div>

      {operations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Ship size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            Nenhuma operação cadastrada. Crie um projeto e uma operação primeiro.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {operations.map((op) => {
            const estimated = op.importCosts.find((c) => !c.isActual);
            const actual = op.importCosts.find((c) => c.isActual);

            return (
              <div
                key={op.id}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {op.operationCode}
                    </h3>
                    <p className="text-xs text-gray-400">{op.project.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        op.status === "OPEN"
                          ? "bg-emerald-50 text-emerald-600"
                          : op.status === "IN_PROGRESS"
                          ? "bg-amber-50 text-amber-600"
                          : op.status === "SETTLED"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {op.status}
                    </span>
                    <OperationActions operationId={op.id} currentStatus={op.status} />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-400 text-xs">Meta</p>
                    <p className="font-semibold">{formatBRL(op.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Captado</p>
                    <p className="font-semibold">{formatBRL(op.fundedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Modalidade</p>
                    <p className="font-semibold">
                      {op.modality === "FIXED" ? "Renda Fixa" : "Profit Share"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Investimentos</p>
                    <p className="font-semibold">{op._count.investments}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Custos Estimados
                    </p>
                    {estimated ? (
                      <div className="space-y-1 text-xs">
                        <p>FOB: USD {estimated.fobValue.toFixed(2)}</p>
                        <p>Frete: USD {estimated.freight.toFixed(2)}</p>
                        <p>Qtd: {estimated.quantity} un.</p>
                        <p>Câmbio: R$ {estimated.exchangeRate.toFixed(2)}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Não preenchido</p>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Custos Realizados
                    </p>
                    {actual ? (
                      <div className="space-y-1 text-xs">
                        <p>FOB: USD {actual.fobValue.toFixed(2)}</p>
                        <p>Frete: USD {actual.freight.toFixed(2)}</p>
                        <p>Qtd: {actual.quantity} un.</p>
                        <p>Câmbio: R$ {actual.exchangeRate.toFixed(2)}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Não preenchido</p>
                    )}
                  </div>
                </div>

                <ImportCostForm operationId={op.id} systemConfig={systemConfig} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
