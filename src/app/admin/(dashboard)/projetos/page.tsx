import { getRecentProjects } from "@/lib/actions";
import { ProjectForm } from "./ProjectForm";
import { FolderOpen } from "lucide-react";

export default async function ProjetosPage() {
  const projects = await getRecentProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie seus projetos de investimento
          </p>
        </div>
      </div>

      <ProjectForm />

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen size={18} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">Projetos Cadastrados</h3>
        </div>

        {projects.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum projeto cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Nome</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Categoria</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Max Ciclos</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Split</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Regra</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Operações</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj) => (
                  <tr key={proj.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-700">{proj.name}</td>
                    <td className="py-2 px-3 text-gray-600">{proj.productCategory}</td>
                    <td className="py-2 px-3 text-center">{proj.maxCycles}</td>
                    <td className="py-2 px-3 text-center">
                      {(proj.profitSplitPct * 100).toFixed(0)}%
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {proj.payoutRule === "REINVEST" ? "Reinvestir" : "Liquidar"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">{proj.operations.length}</td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          proj.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {proj.status === "ACTIVE" ? "Ativo" : proj.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
