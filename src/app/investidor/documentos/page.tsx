import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyDocuments } from "@/lib/actions";
import { DocumentosClient } from "./DocumentosClient";

export default async function DocumentosPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const result = await getMyDocuments();
  if ("error" in result) redirect("/login");

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Documentos</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Envie seus documentos KYC e gerencie seus anexos
        </p>
      </div>

      <DocumentosClient kycDocs={result.kycDocs} generalDocs={result.generalDocs} />
    </div>
  );
}
