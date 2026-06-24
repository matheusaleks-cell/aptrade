import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { getUsdBrlRate } from "@/lib/exchange";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/admin/login");

  let usdRate = 5.65;
  let monthSales = 0;
  let stockValue = 0;
  let avgMargin = 0;

  try {
    usdRate = await getUsdBrlRate();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const salesAgg = await prisma.cycleSale.aggregate({
      _sum: { totalValue: true },
      where: { saleDate: { gte: startOfMonth } },
    });
    monthSales = salesAgg._sum.totalValue ?? 0;

    const investmentsAgg = await prisma.investment.aggregate({
      _sum: { amount: true },
      where: { status: "CONFIRMED" },
    });
    stockValue = investmentsAgg._sum.amount ?? 0;

    const cycles = await prisma.operationCycle.findMany({
      where: { status: "COMPLETED", grossRevenue: { gt: 0 } },
      select: { grossRevenue: true, totalCost: true },
    });
    if (cycles.length > 0) {
      const totalMargin = cycles.reduce((acc, c) => {
        return acc + ((c.grossRevenue - c.totalCost) / c.grossRevenue) * 100;
      }, 0);
      avgMargin = totalMargin / cycles.length;
    }
  } catch {}

  return (
    <div className="flex min-h-screen bg-gray-100 p-4 gap-4">
      <Sidebar role="ADMIN" />
      <div className="flex-1 flex flex-col bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden">
        <Header
          userName={session.name}
          role="ADMIN"
          indicators={{ usdRate, monthSales, stockValue, avgMargin }}
        />
        <main className="flex-1 p-6 overflow-y-auto no-scrollbar">{children}</main>
      </div>
    </div>
  );
}
