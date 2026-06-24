"use client";

import { confirmInvestment, cancelInvestment, uploadContractForInvestor } from "@/lib/actions";
import { formatBRL } from "@/lib/calculations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, XCircle, Upload, FileText } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

interface Investment {
  id: string;
  amount: number;
  status: string;
  contractUrl: string | null;
  contractSignedAt: Date | string | null;
  createdAt: Date | string;
  user: { id: string; name: string; email: string; cpfCnpj: string | null; approved: boolean };
  operation: {
    operationCode: string;
    project: { name: string; productCategory: string };
  };
}

export function AportesClient({ investments }: { investments: Investment[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const handleConfirm = async (id: string) => {
    setLoading(id);
    const res = await confirmInvestment(id);
    setLoading(null);
    if (res?.error) { toast.error(res.error); return; }
    toast.success("Aporte confirmado!");
    router.refresh();
  };

  const handleCancel = async (id: string) => {
    setLoading(id);
    const res = await cancelInvestment(id);
    setLoading(null);
    if (res?.error) { toast.error(res.error); return; }
    toast.success("Aporte cancelado.");
    router.refresh();
  };

  const handleContractUpload = async (investmentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Arquivo excede 10 MB."); return; }

    setUploadingFor(investmentId);
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await uploadContractForInvestor(investmentId, reader.result as string, file.name);
      setUploadingFor(null);
      if (res?.error) { toast.error(res.error); return; }
      toast.success("Contrato enviado ao investidor!");
      router.refresh();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (investments.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">Nenhum aporte pendente.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="text-left py-3 px-3 font-medium">Investidor</th>
            <th className="text-left py-3 px-3 font-medium">Operação</th>
            <th className="text-right py-3 px-3 font-medium">Valor</th>
            <th className="text-center py-3 px-3 font-medium">KYC</th>
            <th className="text-center py-3 px-3 font-medium">Contrato</th>
            <th className="text-center py-3 px-3 font-medium">Status</th>
            <th className="text-left py-3 px-3 font-medium">Data</th>
            <th className="text-center py-3 px-3 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((inv) => (
            <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-3">
                <p className="font-semibold text-gray-800">{inv.user.name}</p>
                <p className="text-xs text-gray-400">{inv.user.email}</p>
              </td>
              <td className="py-3 px-3">
                <p className="font-semibold text-gray-700">{inv.operation.operationCode}</p>
                <p className="text-xs text-gray-400">{inv.operation.project.name}</p>
              </td>
              <td className="py-3 px-3 text-right font-bold text-gray-900">{formatBRL(inv.amount)}</td>
              <td className="py-3 px-3 text-center">
                {inv.user.approved ? (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Aprovado</span>
                ) : (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pendente</span>
                )}
              </td>
              <td className="py-3 px-3 text-center">
                {inv.contractUrl ? (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 justify-center">
                    <FileText size={10} /> Enviado
                  </span>
                ) : (
                  <label className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full cursor-pointer hover:bg-blue-100 transition-colors">
                    <Upload size={10} />
                    {uploadingFor === inv.id ? "Enviando..." : "Enviar"}
                    <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleContractUpload(inv.id, e)} disabled={uploadingFor === inv.id} />
                  </label>
                )}
              </td>
              <td className="py-3 px-3 text-center">
                <StatusBadge status={inv.status} />
              </td>
              <td className="py-3 px-3 text-gray-500 text-xs">
                {new Date(inv.createdAt).toLocaleDateString("pt-BR")}
              </td>
              <td className="py-3 px-3">
                {inv.status === "PENDING" && (
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleConfirm(inv.id)}
                      disabled={loading === inv.id}
                      className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Confirmar aporte"
                    >
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    </button>
                    <button
                      onClick={() => handleCancel(inv.id)}
                      disabled={loading === inv.id}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancelar aporte"
                    >
                      <XCircle size={16} className="text-red-400" />
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
