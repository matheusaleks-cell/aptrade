import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ConfigRulesForm } from "./ConfigRulesForm";
import { getSystemConfig } from "@/lib/actions";

export default async function ConfiguracoesPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/admin/login");

  const initialConfig = await getSystemConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gerencie alíquotas tributárias padrão e limites regulatórios do ecossistema APTRADE.
        </p>
      </div>

      <ConfigRulesForm adminName={session.name} initialConfig={initialConfig} />
    </div>
  );
}
