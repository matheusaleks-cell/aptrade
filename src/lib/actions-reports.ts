"use server";

import { prisma } from "./prisma";
import { getSession } from "./auth";

// ==================== ADMIN - REPORT DATA FETCHING ====================

export async function getInventoryReport() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const operations = await prisma.fundingOperation.findMany({
    include: {
      project: { select: { name: true, productCategory: true } },
      cycles: {
        orderBy: { cycleNumber: "asc" },
        select: {
          id: true,
          cycleNumber: true,
          quantity: true,
          grossRevenue: true,
          totalCost: true,
          investorShare: true,
          companyShare: true,
          status: true,
        },
      },
      importCosts: {
        select: {
          fobValue: true,
          freight: true,
          insurance: true,
          quantity: true,
          exchangeRate: true,
          sellingPrice: true,
          isActual: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    data: operations.map((op) => ({
      id: op.id,
      operationCode: op.operationCode,
      projectName: op.project.name,
      productCategory: op.project.productCategory,
      status: op.status,
      totalAmount: op.totalAmount,
      fundedAmount: op.fundedAmount,
      cycles: op.cycles,
      importCosts: op.importCosts,
    })),
  };
}

export async function getFinancialReport() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const salesOrders = await prisma.salesOrder.findMany({
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          cpfCnpj: true,
          type: true,
          city: true,
          state: true,
        },
      },
      seller: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    data: salesOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.customer,
      seller: order.seller,
      products: order.products,
      totalValue: order.totalValue,
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
    })),
  };
}

export async function getLotTraceabilityReport() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const lots = await prisma.importLot.findMany({
    include: {
      supplier: { select: { name: true, country: true } },
      operation: {
        select: {
          operationCode: true,
          project: { select: { name: true } },
        },
      },
      documents: {
        select: {
          id: true,
          name: true,
          type: true,
          category: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    data: lots.map((lot) => ({
      id: lot.id,
      batchCode: lot.batchCode,
      operationCode: lot.operation.operationCode,
      projectName: lot.operation.project.name,
      supplier: lot.supplier,
      countryOrigin: lot.countryOrigin,
      purchaseDate: lot.purchaseDate,
      expectedArrivalDate: lot.expectedArrivalDate,
      status: lot.status,
      fobValue: lot.fobValue,
      freight: lot.freight,
      insurance: lot.insurance,
      totalCostNationalized: lot.totalCostNationalized,
      quantityItems: lot.quantityItems,
      documents: lot.documents,
      createdAt: lot.createdAt,
    })),
  };
}

export async function getOperationPerformanceReport() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const operations = await prisma.fundingOperation.findMany({
    include: {
      project: { select: { name: true, productCategory: true } },
      investments: { select: { amount: true, status: true } },
      cycles: {
        select: {
          grossRevenue: true,
          totalCost: true,
          investorShare: true,
          companyShare: true,
          status: true,
        },
      },
      _count: { select: { cycles: true, investments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    data: operations.map((op) => {
      const totalFunded = op.investments.reduce((sum, i) => sum + i.amount, 0);
      const fundingPct =
        op.totalAmount > 0
          ? parseFloat(((totalFunded / op.totalAmount) * 100).toFixed(1))
          : 0;

      const totalRevenue = op.cycles.reduce((sum, c) => sum + c.grossRevenue, 0);
      const totalCost = op.cycles.reduce((sum, c) => sum + c.totalCost, 0);

      return {
        id: op.id,
        operationCode: op.operationCode,
        projectName: op.project.name,
        productCategory: op.project.productCategory,
        status: op.status,
        totalAmount: op.totalAmount,
        fundedAmount: totalFunded,
        fundingPct,
        cycleCount: op._count.cycles,
        investorCount: op._count.investments,
        totalRevenue,
        totalCost,
        netResult: totalRevenue - totalCost,
      };
    }),
  };
}

export async function getReinvestmentProjectionReport() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const operations = await prisma.fundingOperation.findMany({
    where: { status: { not: "DRAFT" } },
    include: {
      project: { select: { name: true, profitSplitPct: true } },
      cycles: {
        orderBy: { cycleNumber: "asc" },
        select: {
          cycleNumber: true,
          grossRevenue: true,
          totalCost: true,
          investorShare: true,
          companyShare: true,
          carryover: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    data: operations.map((op) => ({
      id: op.id,
      operationCode: op.operationCode,
      projectName: op.project.name,
      profitSplitPct: op.project.profitSplitPct,
      cycles: op.cycles,
    })),
  };
}

export async function getTransactionHistoryReport() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const [investments, cycleSales] = await Promise.all([
    prisma.investment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        operation: { select: { operationCode: true } },
      },
    }),
    prisma.cycleSale.findMany({
      orderBy: { saleDate: "desc" },
      include: {
        cycle: {
          include: {
            operation: { select: { operationCode: true } },
          },
        },
        customer: { select: { name: true } },
      },
    }),
  ]);

  const transactions = [
    ...investments.map((inv) => ({
      id: inv.id,
      type: "INVESTMENT" as const,
      date: inv.createdAt,
      description: `Aporte - ${inv.user.name}`,
      operationCode: inv.operation.operationCode,
      value: inv.amount,
      netReturn: inv.netReturn,
      status: inv.status,
    })),
    ...cycleSales.map((sale) => ({
      id: sale.id,
      type: "SALE" as const,
      date: sale.saleDate,
      description: `Venda - ${sale.buyerName}`,
      operationCode: sale.cycle.operation.operationCode,
      value: sale.totalValue,
      netReturn: null as number | null,
      status: "COMPLETED",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    success: true,
    data: transactions,
  };
}

export async function getDefaultersReport() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const investments = await prisma.investment.findMany({
    where: {
      status: { in: ["PENDING", "OVERDUE"] },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          cpfCnpj: true,
        },
      },
      operation: {
        select: {
          operationCode: true,
          project: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return {
    success: true,
    data: investments.map((inv) => ({
      id: inv.id,
      investor: inv.user,
      operationCode: inv.operation.operationCode,
      projectName: inv.operation.project.name,
      amount: inv.amount,
      status: inv.status,
      createdAt: inv.createdAt,
      daysPending: Math.floor(
        (Date.now() - new Date(inv.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      ),
    })),
  };
}
