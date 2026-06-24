import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyWithdrawals } from "@/lib/actions";
import { SaquesClient } from "./SaquesClient";

export default async function SaquesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const result = await getMyWithdrawals();
  if ("error" in result) redirect("/login");

  return (
    <div className="space-y-6 pb-12">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Saques</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Solicite o resgate dos seus rendimentos via PIX
        </p>
      </div>

      <SaquesClient
        withdrawals={result.withdrawals}
        availableBalance={result.availableBalance}
        pixKey={result.pixKey}
      />
    </div>
  );
}
