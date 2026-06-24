"use client";

import { updateOperationStatus } from "@/lib/actions";
import { useRouter } from "next/navigation";

const statusFlow: Record<string, string[]> = {
  DRAFT: ["OPEN"],
  OPEN: ["FUNDING", "DRAFT"],
  FUNDING: ["IN_PROGRESS"],
  IN_PROGRESS: ["SOLD"],
  SOLD: ["SETTLED"],
};

const statusLabels: Record<string, string> = {
  DRAFT: "Rascunho",
  OPEN: "Abrir Captação",
  FUNDING: "Em Financiamento",
  IN_PROGRESS: "Em Trânsito",
  SOLD: "Vendido",
  SETTLED: "Liquidar",
};

export function OperationActions({
  operationId,
  currentStatus,
}: {
  operationId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const nextStatuses = statusFlow[currentStatus] || [];

  async function handleChange(newStatus: string) {
    await updateOperationStatus(operationId, newStatus);
    router.refresh();
  }

  if (nextStatuses.length === 0) return null;

  return (
    <div className="flex gap-1">
      {nextStatuses.map((status) => (
        <button
          key={status}
          onClick={() => handleChange(status)}
          className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
        >
          {statusLabels[status] || status}
        </button>
      ))}
    </div>
  );
}
