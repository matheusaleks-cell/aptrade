import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SimuladorClient } from "./SimuladorClient";

export default async function SimuladorPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6 pb-12">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Simulador</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Calcule o retorno estimado dos seus investimentos
        </p>
      </div>

      <SimuladorClient />
    </div>
  );
}
