import { getInvestorKyc } from "@/lib/actions";
import { redirect } from "next/navigation";
import { KycActions } from "./KycActions";
import { ArrowLeft, FileCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function KycPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getInvestorKyc(id);
  if (!data) redirect("/admin/investidores");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/investidores"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            KYC - {data.name}
          </h1>
          <p className="text-sm text-gray-500">{data.email}</p>
        </div>
        <span
          className={`ml-auto px-3 py-1 text-sm rounded-full font-medium ${
            data.approved
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {data.approved ? "Aprovado" : "Pendente"}
        </span>
      </div>

      {data.kycDocuments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertTriangle size={48} className="mx-auto text-amber-300 mb-4" />
          <p className="text-gray-500">
            Nenhum documento de identidade enviado por este investidor.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.kycDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileCheck size={18} className="text-gray-500" />
                  <div>
                    <h3 className="font-medium text-gray-800">
                      Documento: {doc.docType}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Enviado em {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    doc.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-600"
                      : doc.status === "REJECTED"
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {doc.status === "APPROVED"
                    ? "Aprovado"
                    : doc.status === "REJECTED"
                    ? "Rejeitado"
                    : "Pendente"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-2">Frente</p>
                  {doc.frontPath?.startsWith("data:image") ? (
                    <img src={doc.frontPath} alt={`${doc.docType} - Frente`} className="max-w-full max-h-64 rounded-lg border border-gray-200 object-contain" />
                  ) : doc.frontPath?.startsWith("data:application/pdf") ? (
                    <a href={doc.frontPath} download={`${doc.docType}-frente.pdf`} className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors">
                      <FileCheck size={14} /> Baixar PDF
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Documento não disponível</p>
                  )}
                </div>
                {doc.backPath && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-2">Verso</p>
                    {doc.backPath.startsWith("data:image") ? (
                      <img src={doc.backPath} alt={`${doc.docType} - Verso`} className="max-w-full max-h-64 rounded-lg border border-gray-200 object-contain" />
                    ) : doc.backPath.startsWith("data:application/pdf") ? (
                      <a href={doc.backPath} download={`${doc.docType}-verso.pdf`} className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors">
                        <FileCheck size={14} /> Baixar PDF
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Documento não disponível</p>
                    )}
                  </div>
                )}
              </div>

              {doc.reviewNote && (
                <div className="p-3 bg-red-50 rounded-lg mb-4">
                  <p className="text-xs font-medium text-red-600 mb-1">Observação</p>
                  <p className="text-sm text-red-700">{doc.reviewNote}</p>
                </div>
              )}

              {doc.status === "PENDING" && (
                <KycActions documentId={doc.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
