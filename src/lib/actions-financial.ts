"use server";

import { prisma } from "./prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

// ==================== ADMIN - FINANCIAL PANEL ====================

export async function getFinancialStats() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const [investmentAgg, cyclesAgg, salesOrders] = await Promise.all([
    prisma.investment.aggregate({
      _sum: { amount: true, netReturn: true, grossReturn: true, irAmount: true },
    }),
    prisma.operationCycle.aggregate({
      _sum: {
        grossRevenue: true,
        investorShare: true,
        companyShare: true,
        carryover: true,
      },
    }),
    prisma.salesOrder.aggregate({
      _sum: { totalValue: true },
      where: { status: { not: "CANCELADO" } },
    }),
  ]);

  const totalCustodia = investmentAgg._sum.amount ?? 0;
  const totalDistribuido = investmentAgg._sum.netReturn ?? 0;
  const totalGrossReturn = investmentAgg._sum.grossReturn ?? 0;
  const totalTaxes = investmentAgg._sum.irAmount ?? 0;
  const totalReinvestment = cyclesAgg._sum.carryover ?? 0;

  // Monthly revenue from current year
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

  const cycleSales = await prisma.cycleSale.findMany({
    where: {
      saleDate: { gte: startOfYear, lte: endOfYear },
    },
    select: { totalValue: true, saleDate: true },
  });

  const monthlyRevenue: number[] = Array(12).fill(0);
  for (const sale of cycleSales) {
    const month = new Date(sale.saleDate).getMonth();
    monthlyRevenue[month] += sale.totalValue;
  }

  return {
    success: true,
    data: {
      totalCustodia,
      totalDistribuido,
      totalReinvestment,
      totalTaxes,
      totalGrossReturn,
      monthlyRevenue,
      salesOrdersTotal: salesOrders._sum.totalValue ?? 0,
    },
  };
}

export async function getMonthlyRevenue(year: number) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

  const sales = await prisma.cycleSale.findMany({
    where: {
      saleDate: { gte: startOfYear, lte: endOfYear },
    },
    select: { totalValue: true, saleDate: true },
  });

  const months: number[] = Array(12).fill(0);
  for (const sale of sales) {
    const month = new Date(sale.saleDate).getMonth();
    months[month] += sale.totalValue;
  }

  return {
    success: true,
    data: months.map((value, index) => ({
      month: index + 1,
      revenue: value,
    })),
  };
}

export async function getRecentTransactions(
  page: number = 1,
  limit: number = 20
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const skip = (page - 1) * limit;

  const [investments, cycleSales, totalInvestments, totalSales] =
    await Promise.all([
      prisma.investment.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          user: { select: { name: true, email: true } },
          operation: { select: { operationCode: true } },
        },
      }),
      prisma.cycleSale.findMany({
        orderBy: { saleDate: "desc" },
        take: limit,
        skip,
        include: {
          cycle: {
            include: {
              operation: { select: { operationCode: true } },
            },
          },
        },
      }),
      prisma.investment.count(),
      prisma.cycleSale.count(),
    ]);

  const transactions = [
    ...investments.map((inv) => ({
      id: inv.id,
      type: "INVESTMENT" as const,
      date: inv.createdAt,
      description: `Aporte de ${inv.user.name} - ${inv.operation.operationCode}`,
      value: inv.amount,
      status: inv.status,
    })),
    ...cycleSales.map((sale) => ({
      id: sale.id,
      type: "SALE" as const,
      date: sale.saleDate,
      description: `Venda ${sale.cycle.operation.operationCode} - ${sale.buyerName}`,
      value: sale.totalValue,
      status: "COMPLETED",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const total = totalInvestments + totalSales;

  return {
    success: true,
    data: transactions.slice(0, limit),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getSplitRules() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const rule = await prisma.financialDistributionRule.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    data: rule ?? {
      name: "Padrao",
      reinvestmentPct: 0,
      investorPct: 50,
      companyPct: 50,
      reservePct: 0,
      operationalCost: 15,
      salesCommission: 0,
      isActive: true,
    },
  };
}

export async function saveSplitRules(data: {
  id?: string;
  name?: string;
  reinvestmentPct: number;
  investorPct: number;
  companyPct: number;
  reservePct: number;
  operationalCost: number;
  salesCommission: number;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  try {
    if (data.id) {
      await prisma.financialDistributionRule.update({
        where: { id: data.id },
        data: {
          name: data.name ?? "Padrao",
          reinvestmentPct: data.reinvestmentPct,
          investorPct: data.investorPct,
          companyPct: data.companyPct,
          reservePct: data.reservePct,
          operationalCost: data.operationalCost,
          salesCommission: data.salesCommission,
        },
      });
    } else {
      // Deactivate existing rules
      await prisma.financialDistributionRule.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      await prisma.financialDistributionRule.create({
        data: {
          name: data.name ?? "Padrao",
          reinvestmentPct: data.reinvestmentPct,
          investorPct: data.investorPct,
          companyPct: data.companyPct,
          reservePct: data.reservePct,
          operationalCost: data.operationalCost,
          salesCommission: data.salesCommission,
          isActive: true,
        },
      });
    }

    revalidatePath("/admin/financeiro");
    return { success: true };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: "Regra duplicada." };
    }
    return { error: "Erro ao salvar regras de distribuicao." };
  }
}

export async function getFinancialCashFlow() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const cycles = await prisma.operationCycle.findMany({
    include: {
      operation: {
        include: {
          importCosts: true,
        },
      },
    },
  });

  let custoTotal = 0;
  let totalRevenue = 0;
  let impostos = 0;
  let operacional = 0;
  let lucroInvestidores = 0;
  let lucroEmpresa = 0;

  for (const cycle of cycles) {
    totalRevenue += cycle.grossRevenue;
    custoTotal += cycle.totalCost;
    lucroInvestidores += cycle.investorShare;
    lucroEmpresa += cycle.companyShare;

    // Tax is approximately 8% of gross revenue
    impostos += cycle.grossRevenue * 0.08;
    // Operational expense is approximately 15% of gross revenue
    operacional += cycle.grossRevenue * 0.15;
  }

  return {
    success: true,
    data: {
      custoTotal,
      totalRevenue,
      impostos,
      operacional,
      lucroInvestidores,
      lucroEmpresa,
      lucroLiquido: totalRevenue - custoTotal - impostos - operacional,
    },
  };
}
