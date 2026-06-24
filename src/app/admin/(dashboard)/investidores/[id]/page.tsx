import { getInvestorDetail } from "@/lib/actions-investors";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Banknote } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBRL } from "@/lib/calculations";
import { InvestorDetailClient } from "./InvestorDetailClient";
import { prisma } from "@/lib/prisma";

export default async function InvestorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getInvestorDetail(id);

  if (!result || "error" in result) {
    redirect("/admin/investidores");
  }

  const investor = result.data;

  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/investidores"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{investor.name}</h1>
            <StatusBadge status={investor.approved ? "APPROVED" : "PENDING"} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{investor.email}</p>
        </div>
        <Link
          href={`/admin/investidores/${id}/kyc`}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          Ver KYC
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-400 mb-1">Total Investido</p>
          <p className="text-lg font-bold text-gray-900">
            {formatBRL(investor.stats.totalInvested)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-400 mb-1">Total Recebido</p>
          <p className="text-lg font-bold text-emerald-600">
            {formatBRL(investor.stats.totalReceived)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-400 mb-1">ROI</p>
          <p className="text-lg font-bold text-gray-900">
            {investor.stats.roi.toFixed(2)}%
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-400 mb-1">Projetos Ativos</p>
          <p className="text-lg font-bold text-gray-900">
            {investor.stats.activeProjects}
          </p>
        </div>
      </div>

      <InvestorDetailClient investor={investor} />

      {/* Histórico de Saques */}
      {withdrawals.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Banknote size={18} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Histórico de Saques</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-right py-2 px-3 font-medium">Valor</th>
                  <th className="text-left py-2 px-3 font-medium">Chave PIX</th>
                  <th className="text-center py-2 px-3 font-medium">Status</th>
                  <th className="text-left py-2 px-3 font-medium">Data</th>
                  <th className="text-left py-2 px-3 font-medium">Obs.</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 text-right font-bold text-gray-900">{formatBRL(w.amount)}</td>
                    <td className="py-2 px-3 text-gray-600 text-xs font-mono">{w.pixKey}</td>
                    <td className="py-2 px-3 text-center"><StatusBadge status={w.status} /></td>
                    <td className="py-2 px-3 text-gray-500 text-xs">{new Date(w.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="py-2 px-3 text-gray-400 text-xs">{w.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
