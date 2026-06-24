import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyNotifications } from "@/lib/actions";
import { NotificacoesClient } from "./NotificacoesClient";

export default async function NotificacoesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const result = await getMyNotifications();
  if ("error" in result) redirect("/login");

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Notificações</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Acompanhe alertas de captações, logística e pagamentos
        </p>
      </div>

      <NotificacoesClient notifications={result.notifications} />
    </div>
  );
}
