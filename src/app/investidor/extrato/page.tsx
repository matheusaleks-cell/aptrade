import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getInvestorStatement } from "@/lib/actions";
import { StatementContainer } from "@/components/StatementContainer";

export default async function ExtratoPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const statement = await getInvestorStatement(session.email);
  if (!statement) redirect("/login");

  return (
    <StatementContainer 
      entries={statement.entries} 
      saldoFinal={statement.saldoFinal} 
    />
  );
}
