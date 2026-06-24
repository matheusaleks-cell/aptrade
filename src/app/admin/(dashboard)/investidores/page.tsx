import { getInvestorsAdmin } from "@/lib/actions-investors";
import { formatBRL } from "@/lib/calculations";
import Link from "next/link";
import { Users, Eye, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { InvestorListActions } from "./InvestorListActions";
import { FilterBar } from "@/components/FilterBar";

export default async function InvestidoresPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const page = parseInt(sp.page || "1", 10);
  const search = sp.search || "";

  const result = await getInvestorsAdmin(page, 15, search);

  if ("error" in result && result.error) {
    return (
      <div className="p-6 text-red-600">
        Erro: {result.error}
      </div>
    );
  }

  const investors = result.data ?? [];
  const total = result.total ?? 0;
  const totalPages = result.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investidores</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerenciamento de investidores da plataforma
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
            <Users size={14} />
            {total} cadastrado(s)
          </span>
          <Link
            href="/admin/investidores/novo"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <UserPlus size={14} />
            Novo Investidor
          </Link>
        </div>
      </div>

      <FilterBar
        basePath="/admin/investidores"
        searchPlaceholder="Buscar por nome, email ou CPF/CNPJ..."
      />

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {investors.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            Nenhum investidor encontrado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Nome</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Email</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">CPF/CNPJ</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Status KYC</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Projetos</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Total Investido</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {investors.map((inv: any) => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-medium">
                          {inv.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-700">{inv.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-gray-600">{inv.email}</td>
                    <td className="py-2 px-3 text-gray-600">{inv.cpfCnpj || "-"}</td>
                    <td className="py-2 px-3 text-center">
                      <StatusBadge status={inv.approved ? "APPROVED" : "PENDING"} />
                    </td>
                    <td className="py-2 px-3 text-center text-gray-600">
                      {inv.projectsCount}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-gray-700">
                      {formatBRL(inv.totalInvested)}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/admin/investidores/${inv.id}`}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye size={14} className="text-gray-500" />
                        </Link>
                        <Link
                          href={`/admin/investidores/${inv.id}/kyc`}
                          className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="KYC"
                        >
                          <ShieldCheck size={14} className="text-emerald-600" />
                        </Link>
                        <InvestorListActions investorId={inv.id} investorName={inv.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Pagina {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/investidores?page=${page - 1}${search ? `&search=${search}` : ""}`}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/investidores?page=${page + 1}${search ? `&search=${search}` : ""}`}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Proxima
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
