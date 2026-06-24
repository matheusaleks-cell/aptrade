"use server";

import { prisma } from "./prisma";
import {
  authenticateUser,
  setSessionCookie,
  clearSession,
  getSession,
  hashPassword,
  verifyPassword,
} from "./auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  calcNationalization,
  calcFixedReturn,
  calcProfitSplit,
  calcReinvestment,
  type ImportCostParams,
} from "./calculations";

// ==================== NOTIFICATION HELPER ====================

async function notify(userId: string, title: string, message: string, type: string = "INFO") {
  await prisma.notification.create({
    data: { userId, title, message, type },
  });
}

// ==================== AUTH ====================

export async function loginInvestor(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = await authenticateUser(email, password);
  if (!result) return { error: "E-mail ou senha inválidos." };
  if (result.user.role !== "INVESTOR")
    return { error: "Acesso restrito a investidores." };

  await setSessionCookie(result.token);
  redirect("/investidor");
}

export async function loginAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = await authenticateUser(email, password);
  if (!result) return { error: "E-mail ou senha inválidos." };
  if (result.user.role !== "ADMIN")
    return { error: "Acesso restrito a administradores." };

  await setSessionCookie(result.token);
  redirect("/admin");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}

export async function updateMyPassword(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const current = formData.get("currentPassword") as string;
  const newPass = formData.get("newPassword") as string;

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return { error: "Usuário não encontrado." };

  const valid = await verifyPassword(current, user.password);
  if (!valid) return { error: "Senha atual incorreta." };

  const hash = await hashPassword(newPass);
  await prisma.user.update({ where: { id: session.id }, data: { password: hash } });
  return { success: true };
}

// ==================== INVESTOR DASHBOARD ====================

export async function getInvestorDashboardData(
  email: string, 
  projectId?: string, 
  period?: string,
  startDateStr?: string,
  endDateStr?: string
) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      investments: {
        include: {
          operation: {
            include: {
              project: true,
              importCosts: true,
              cycles: { include: { sales: true }, orderBy: { cycleNumber: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  // Calcular datas do intervalo
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (startDateStr) {
    startDate = new Date(startDateStr);
  }
  if (endDateStr) {
    endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
  }

  // Se o período fixo estiver selecionado, ele substitui as datas customizadas
  if (period && period !== "all") {
    startDate = new Date();
    endDate = undefined;
    if (period === "30") {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === "90") {
      startDate.setDate(startDate.getDate() - 90);
    } else if (period === "180") {
      startDate.setDate(startDate.getDate() - 180);
    } else if (period === "year") {
      startDate = new Date(new Date().getFullYear(), 0, 1);
    }
  }

  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: { userId: user.id, status: { in: ["PENDING", "APPROVED", "PAID"] } },
    select: { amount: true },
  });
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);

  let totalPatrimonio = 0;
  let totalRendimento = 0;
  let totalDisponivel = 0;
  const capitalPoints: { label: string; capital: number }[] = [
    { label: "Início", capital: 0 },
  ];

  // Cálculo da diversificação
  const categoryMap = new Map<string, number>();
  
  // Cálculo do ROI Médio
  let investidoLiquidado = 0;
  let rendimentoLiquidado = 0;

  for (const inv of user.investments) {
    if (projectId && inv.operation.projectId !== projectId) {
      continue;
    }

    const invDate = new Date(inv.createdAt);
    const isInPeriod = (!startDate || invDate >= startDate) && (!endDate || invDate <= endDate);

    totalPatrimonio += inv.amount;
    if (inv.netReturn) {
      if (isInPeriod) {
        totalRendimento += inv.netReturn;
      }
      totalDisponivel += inv.netReturn;
    }

    if (isInPeriod) {
      capitalPoints.push({
        label: inv.operation.operationCode,
        capital: totalPatrimonio + totalRendimento,
      });
    }

    // Acumular por categoria de produto (Diversificação)
    const cat = inv.operation.project.productCategory || "Outros";
    const currentVal = categoryMap.get(cat) || 0;
    categoryMap.set(cat, currentVal + inv.amount);

    // Acumular liquidados/com retorno para ROI
    if (inv.status === "SETTLED" || inv.netReturn) {
      investidoLiquidado += inv.amount;
      rendimentoLiquidado += inv.netReturn ?? 0;
    }
  }

  const totalInvested = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
  const diversificacao = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value,
    percentage: totalInvested > 0 ? parseFloat(((value / totalInvested) * 100).toFixed(1)) : 0,
  }));

  const roiMedio = investidoLiquidado > 0 ? parseFloat(((rendimentoLiquidado / investidoLiquidado) * 100).toFixed(2)) : 0;

  // Mapear operações ativas para progresso de importações e previsões (Track & Trace)
  const activeOperations = user.investments
    .filter((inv) => inv.operation.status !== "SETTLED" && inv.operation.status !== "DRAFT")
    .map((inv) => {
      const op = inv.operation;
      let estimatedEndDate: Date | null = null;
      if (op.openDate) {
        estimatedEndDate = new Date(op.openDate);
        estimatedEndDate.setMonth(estimatedEndDate.getMonth() + op.expectedMonths);
      }
      return {
        id: op.id,
        operationCode: op.operationCode,
        projectName: op.project.name,
        amount: inv.amount,
        status: op.status,
        expectedMonths: op.expectedMonths,
        openDate: op.openDate,
        estimatedEndDate,
      };
    });

  const provisoes = activeOperations
    .filter((op) => op.estimatedEndDate !== null)
    .map((op) => ({
      operationCode: op.operationCode,
      projectName: op.projectName,
      estimatedDate: op.estimatedEndDate!,
      amount: op.amount,
    }))
    .sort((a, b) => a.estimatedDate.getTime() - b.estimatedDate.getTime());

  const userOperationIds = user.investments.map((inv) => inv.operationId);

  const whereClause: any = {
    cycle: {
      operation: {
        id: { in: userOperationIds },
      },
    },
  };
  if (projectId) {
    whereClause.cycle.operation.projectId = projectId;
  }
  if (startDate || endDate) {
    whereClause.saleDate = {};
    if (startDate) {
      whereClause.saleDate.gte = startDate;
    }
    if (endDate) {
      whereClause.saleDate.lte = endDate;
    }
  }

  const recentSales = await prisma.cycleSale.findMany({
    where: whereClause,
    take: 10,
    orderBy: { saleDate: "desc" },
    include: { cycle: { include: { operation: true } } },
  });

  return {
    user: { id: user.id, name: user.name, email: user.email, approved: user.approved },
    patrimonio: { total: totalPatrimonio, rendimiento: totalRendimento, disponivel: Math.max(0, totalDisponivel - totalWithdrawn) },
    capitalPoints,
    investments: user.investments,
    recentSales,
    diversificacao,
    roiMedio,
    activeOperations,
    provisoes,
  };
}

export async function getInvestorStatement(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      investments: {
        orderBy: { createdAt: "asc" },
        include: { operation: true },
      },
    },
  });

  if (!user) return null;

  let saldo = 0;
  const entries = user.investments.map((inv) => {
    saldo += inv.amount;
    const returnVal = inv.netReturn ?? 0;
    saldo += returnVal;
    return {
      id: inv.id,
      date: inv.createdAt,
      description: `Aporte - ${inv.operation.operationCode}`,
      amount: inv.amount,
      returnVal,
      status: inv.status,
      saldo,
    };
  });

  return { entries, saldoFinal: saldo };
}

export async function getInvestorProfile(email: string) {
  const investor = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      cpfCnpj: true,
      phone: true,
      bankName: true,
      bankAgency: true,
      bankAccount: true,
      pixKey: true,
      approved: true,
      createdAt: true,
      suitabilityResult: true,
      suitabilityFilledAt: true,
      isQualifiedInvestor: true,
    },
  });

  if (!investor) return null;

  // Buscar investimentos confirmados no ano corrente para cálculo do limite CVM
  const investments = await prisma.investment.findMany({
    where: {
      userId: investor.id,
      status: "CONFIRMED",
      createdAt: {
        gte: new Date(new Date().getFullYear(), 0, 1),
      }
    },
    select: {
      amount: true
    }
  });

  const investedThisYear = investments.reduce((sum, inv) => sum + inv.amount, 0);

  return {
    ...investor,
    investedThisYear,
  };
}

// ==================== PORTFOLIO ====================

export async function getInvestorPortfolio(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      investments: {
        include: {
          operation: {
            include: {
              project: true,
              cycles: { orderBy: { cycleNumber: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!user) return [];

  const projectMap = new Map<string, {
    project: typeof user.investments[0]["operation"]["project"];
    operations: typeof user.investments[0]["operation"][];
    totalInvested: number;
    totalReturn: number;
  }>();

  for (const inv of user.investments) {
    const pid = inv.operation.projectId;
    if (!projectMap.has(pid)) {
      projectMap.set(pid, {
        project: inv.operation.project,
        operations: [],
        totalInvested: 0,
        totalReturn: 0,
      });
    }
    const entry = projectMap.get(pid)!;
    entry.operations.push(inv.operation);
    entry.totalInvested += inv.amount;
    entry.totalReturn += inv.netReturn ?? 0;
  }

  return Array.from(projectMap.values());
}

export async function getOperationDetail(operationId: string) {
  return prisma.fundingOperation.findUnique({
    where: { id: operationId },
    include: {
      project: true,
      importCosts: true,
      cycles: {
        orderBy: { cycleNumber: "asc" },
        include: { sales: { orderBy: { saleDate: "desc" } } },
      },
      investments: { include: { user: { select: { name: true, email: true } } } },
    },
  });
}

export async function getCycleSales(cycleId: string) {
  return prisma.cycleSale.findMany({
    where: { cycleId },
    orderBy: { saleDate: "desc" },
  });
}

// ==================== ADMIN DASHBOARD ====================

export async function getDashboardStats() {
  const [
    totalInvestors,
    totalProjects,
    totalOperations,
    investments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "INVESTOR" } }),
    prisma.fundingProject.count(),
    prisma.fundingOperation.count(),
    prisma.investment.aggregate({ _sum: { amount: true } }),
  ]);

  const operations = await prisma.fundingOperation.findMany({
    include: {
      cycles: true,
      importCosts: true,
    },
  });

  let totalFaturamento = 0;
  for (const op of operations) {
    for (const cycle of op.cycles) {
      totalFaturamento += cycle.grossRevenue;
    }
  }

  return {
    totalInvestors,
    totalProjects,
    totalOperations,
    totalCaptado: investments._sum.amount ?? 0,
    totalFaturamento,
    operations,
  };
}

export async function getRecentProjects() {
  return prisma.fundingProject.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      operations: {
        include: {
          _count: { select: { investments: true } },
        },
      },
    },
  });
}

// ==================== ADMIN - PROJECTS ====================

export async function createProject(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Não autorizado." };

  await prisma.fundingProject.create({
    data: {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      productCategory: formData.get("productCategory") as string,
      maxCycles: parseInt(formData.get("maxCycles") as string) || 1,
      profitSplitPct: parseFloat(formData.get("profitSplitPct") as string) || 0.5,
      payoutRule: (formData.get("payoutRule") as string) || "AT_SETTLEMENT",
    },
  });

  return { success: true };
}

export async function createOperation(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Não autorizado." };

  await prisma.fundingOperation.create({
    data: {
      operationCode: formData.get("operationCode") as string,
      projectId: formData.get("projectId") as string,
      totalAmount: parseFloat(formData.get("totalAmount") as string),
      minInvestment: parseFloat(formData.get("minInvestment") as string) || 1000,
      modality: (formData.get("modality") as string) || "PROFIT_SHARE",
      fixedRateMonthly: formData.get("fixedRateMonthly")
        ? parseFloat(formData.get("fixedRateMonthly") as string)
        : null,
      expectedMonths: parseInt(formData.get("expectedMonths") as string) || 6,
      status: "OPEN",
      openDate: new Date(),
    },
  });

  return { success: true };
}

// ==================== ADMIN - IMPORT COSTS ====================

export async function saveImportCosts(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Não autorizado." };

  const operationId = formData.get("operationId") as string;
  const isActual = formData.get("isActual") === "true";

  const systemConfig = await getSystemConfig();

  const getDecimalVal = (fieldName: string, fallback: number) => {
    const raw = formData.get(fieldName) as string | null;
    return raw && raw.trim() !== "" ? parseFloat(raw) : fallback;
  };

  const data = {
    operationId,
    fobValue: parseFloat(formData.get("fobValue") as string) || 0,
    freight: parseFloat(formData.get("freight") as string) || 0,
    insurance: parseFloat(formData.get("insurance") as string) || 0,
    quantity: parseInt(formData.get("quantity") as string) || 0,
    exchangeRate: parseFloat(formData.get("exchangeRate") as string) || 0,
    iiRate: getDecimalVal("iiRate", systemConfig.iiRate),
    pisRate: getDecimalVal("pisRate", systemConfig.pisRate),
    cofinsRate: getDecimalVal("cofinsRate", systemConfig.cofinsRate),
    icmsRate: getDecimalVal("icmsRate", systemConfig.icmsRate),
    icmsFactor: parseFloat(formData.get("icmsFactor") as string) || 0.82,
    salesTaxRate: getDecimalVal("salesTaxRate", systemConfig.salesTaxRate),
    opExRate: getDecimalVal("opExRate", systemConfig.opExRate),
    siscomexFixed: parseFloat(formData.get("siscomexFixed") as string) || 154.23,
    customsOpCost: parseFloat(formData.get("customsOpCost") as string) || 0,
    sellingPrice: formData.get("sellingPrice")
      ? parseFloat(formData.get("sellingPrice") as string)
      : null,
    isActual,
  };

  await prisma.importCostEntry.create({ data });

  const costParams: ImportCostParams = {
    fobValue: data.fobValue,
    freight: data.freight,
    insurance: data.insurance,
    quantity: data.quantity,
    exchangeRate: data.exchangeRate,
    iiRate: data.iiRate,
    pisRate: data.pisRate,
    cofinsRate: data.cofinsRate,
    icmsRate: data.icmsRate,
    icmsFactor: data.icmsFactor,
    siscomexFixed: data.siscomexFixed,
    customsOpCost: data.customsOpCost,
    salesTaxRate: data.salesTaxRate,
    opExRate: data.opExRate,
  };

  const result = calcNationalization(costParams);
  return { success: true, calculation: result };
}

// ==================== ADMIN - INVESTORS ====================

export async function getInvestorsList() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return [];

  return prisma.user.findMany({
    where: { role: "INVESTOR" },
    include: {
      _count: { select: { investments: true, kycDocuments: true } },
      investments: { select: { amount: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvestorKyc(userId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;

  return prisma.user.findUnique({
    where: { id: userId },
    include: { kycDocuments: { orderBy: { createdAt: "desc" } } },
  });
}

export async function approveKyc(documentId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Não autorizado." };

  const doc = await prisma.kycDocument.update({
    where: { id: documentId },
    data: { status: "APPROVED" },
  });
  await prisma.user.update({
    where: { id: doc.userId },
    data: { approved: true },
  });

  await notify(
    doc.userId,
    "KYC Aprovado",
    "Seus documentos de verificação foram aprovados! Agora você pode realizar aportes na plataforma.",
    "INFO"
  );

  return { success: true };
}

export async function rejectKyc(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Não autorizado." };

  const documentId = formData.get("documentId") as string;
  const reviewNote = formData.get("reviewNote") as string;

  const doc = await prisma.kycDocument.update({
    where: { id: documentId },
    data: { status: "REJECTED", reviewNote },
  });

  await notify(
    doc.userId,
    "Documento KYC Rejeitado",
    `Um dos seus documentos de verificação foi rejeitado.${reviewNote ? ` Motivo: ${reviewNote}` : ""} Por favor, envie novamente.`,
    "INFO"
  );

  return { success: true };
}

// ==================== ADMIN - OPERATIONS ====================

export async function getOperationsList() {
  return prisma.fundingOperation.findMany({
    include: {
      project: true,
      importCosts: true,
      _count: { select: { investments: true, cycles: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateOperationStatus(operationId: string, status: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Não autorizado." };

  await prisma.fundingOperation.update({
    where: { id: operationId },
    data: { status },
  });
  return { success: true };
}

// ==================== CALCULATIONS (Server-side wrappers) ====================

export async function simulateFixedReturn(formData: FormData) {
  const principal = parseFloat(formData.get("principal") as string);
  const rate = parseFloat(formData.get("rate") as string);
  const days = parseInt(formData.get("days") as string);

  return calcFixedReturn({ principal, fixedRateMonthly: rate, days });
}

export async function simulateImportCost(formData: FormData) {
  const params: ImportCostParams = {
    fobValue: parseFloat(formData.get("fobValue") as string),
    freight: parseFloat(formData.get("freight") as string),
    insurance: parseFloat(formData.get("insurance") as string),
    quantity: parseInt(formData.get("quantity") as string),
    exchangeRate: parseFloat(formData.get("exchangeRate") as string),
    iiRate: parseFloat(formData.get("iiRate") as string) || 0.18,
    pisRate: parseFloat(formData.get("pisRate") as string) || 0.021,
    cofinsRate: parseFloat(formData.get("cofinsRate") as string) || 0.0965,
    icmsRate: parseFloat(formData.get("icmsRate") as string) || 0.18,
    icmsFactor: parseFloat(formData.get("icmsFactor") as string) || 0.82,
    siscomexFixed: parseFloat(formData.get("siscomexFixed") as string) || 154.23,
    customsOpCost: parseFloat(formData.get("customsOpCost") as string) || 0,
    salesTaxRate: parseFloat(formData.get("salesTaxRate") as string) || 0.08,
    opExRate: parseFloat(formData.get("opExRate") as string) || 0.15,
  };

  return calcNationalization(params);
}

// ==================== SYSTEM CONFIGS & SUITABILITY PERSISTENCE ====================

export async function getSystemConfig() {
  const config = await prisma.systemConfig.findFirst({
    orderBy: { createdAt: "desc" },
  });
  
  if (config) return config;
  
  // Valores padrão/fallback (seed inicial em memória)
  return {
    iiRate: 0.18,
    pisRate: 0.021,
    cofinsRate: 0.0965,
    icmsRate: 0.18,
    salesTaxRate: 0.08,
    opExRate: 0.15,
    cvmLimit: 20000,
  };
}

export async function updateSystemConfig(data: {
  iiRate: number;
  pisRate: number;
  cofinsRate: number;
  icmsRate: number;
  salesTaxRate: number;
  opExRate: number;
  cvmLimit: number;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Não autorizado." };
  
  await prisma.systemConfig.create({
    data: {
      iiRate: data.iiRate,
      pisRate: data.pisRate,
      cofinsRate: data.cofinsRate,
      icmsRate: data.icmsRate,
      salesTaxRate: data.salesTaxRate,
      opExRate: data.opExRate,
      cvmLimit: data.cvmLimit,
    },
  });
  
  return { success: true };
}

export async function updateInvestorSuitability(suitabilityResult: string) {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };
  
  await prisma.user.update({
    where: { id: session.id },
    data: {
      suitabilityResult,
      suitabilityFilledAt: new Date(),
    },
  });
  
  return { success: true };
}

export async function updateInvestorQualifiedStatus(isQualifiedInvestor: boolean) {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };

  await prisma.user.update({
    where: { id: session.id },
    data: {
      isQualifiedInvestor,
    },
  });

  return { success: true };
}

// ==================== INVESTOR - OPORTUNIDADES ====================

export async function getOpenOpportunities() {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };

  const operations = await prisma.fundingOperation.findMany({
    where: { status: { in: ["OPEN", "FUNDING"] } },
    include: {
      project: true,
      _count: { select: { investments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { isQualifiedInvestor: true },
  });

  const investedThisYear = await prisma.investment.aggregate({
    where: {
      userId: session.id,
      status: { not: "CANCELLED" },
      createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) },
    },
    _sum: { amount: true },
  });

  const cvmLimit = user?.isQualifiedInvestor ? Infinity : 20000;
  const usedLimit = investedThisYear._sum.amount ?? 0;
  const availableLimit = Math.max(0, cvmLimit - usedLimit);

  return {
    success: true,
    data: operations.map((op) => ({
      id: op.id,
      operationCode: op.operationCode,
      projectName: op.project.name,
      productCategory: op.project.productCategory,
      description: op.project.description,
      totalAmount: op.totalAmount,
      fundedAmount: op.fundedAmount,
      minInvestment: op.minInvestment,
      modality: op.modality,
      expectedMonths: op.expectedMonths,
      status: op.status,
      investorsCount: op._count.investments,
      profitSplitPct: op.project.profitSplitPct,
    })),
    availableLimit,
    isQualified: user?.isQualifiedInvestor ?? false,
  };
}

export async function getOpportunityDetail(operationId: string) {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };

  const operation = await prisma.fundingOperation.findUnique({
    where: { id: operationId },
    include: {
      project: true,
      importCosts: { where: { isActual: false }, take: 1 },
      _count: { select: { investments: true } },
    },
  });

  if (!operation) return { error: "Operação não encontrada." };

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { isQualifiedInvestor: true, approved: true, pixKey: true },
  });

  const investedThisYear = await prisma.investment.aggregate({
    where: {
      userId: session.id,
      status: { not: "CANCELLED" },
      createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) },
    },
    _sum: { amount: true },
  });

  const existingInvestment = await prisma.investment.findFirst({
    where: { userId: session.id, operationId },
  });

  const cvmLimit = user?.isQualifiedInvestor ? Infinity : 20000;
  const usedLimit = investedThisYear._sum.amount ?? 0;
  const availableLimit = Math.max(0, cvmLimit - usedLimit);
  const remainingCapacity = operation.totalAmount - operation.fundedAmount;

  return {
    success: true,
    data: {
      id: operation.id,
      operationCode: operation.operationCode,
      projectName: operation.project.name,
      projectDescription: operation.project.description,
      productCategory: operation.project.productCategory,
      totalAmount: operation.totalAmount,
      fundedAmount: operation.fundedAmount,
      minInvestment: operation.minInvestment,
      modality: operation.modality,
      fixedRateMonthly: operation.fixedRateMonthly,
      expectedMonths: operation.expectedMonths,
      profitSplitPct: operation.project.profitSplitPct,
      status: operation.status,
      investorsCount: operation._count.investments,
      hasEstimatedCosts: operation.importCosts.length > 0,
      userApproved: user?.approved ?? false,
      availableLimit,
      remainingCapacity,
      isQualified: user?.isQualifiedInvestor ?? false,
      alreadyInvested: existingInvestment ? existingInvestment.amount : null,
    },
  };
}

export async function createInvestment(operationId: string, amount: number) {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { approved: true, isQualifiedInvestor: true },
  });

  if (!user?.approved) return { error: "Seu cadastro precisa ser aprovado antes de investir." };

  const operation = await prisma.fundingOperation.findUnique({ where: { id: operationId } });
  if (!operation) return { error: "Operação não encontrada." };
  if (!["OPEN", "FUNDING"].includes(operation.status)) return { error: "Esta operação não está aceitando aportes." };
  if (amount < operation.minInvestment) return { error: `Aporte mínimo: R$ ${operation.minInvestment.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.` };

  const remaining = operation.totalAmount - operation.fundedAmount;
  if (amount > remaining) return { error: `Capacidade restante: R$ ${remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.` };

  const investedThisYear = await prisma.investment.aggregate({
    where: {
      userId: session.id,
      status: { not: "CANCELLED" },
      createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) },
    },
    _sum: { amount: true },
  });

  const cvmLimit = user.isQualifiedInvestor ? Infinity : 20000;
  const usedLimit = investedThisYear._sum.amount ?? 0;
  if (usedLimit + amount > cvmLimit) {
    return { error: `Limite CVM excedido. Disponível: R$ ${(cvmLimit - usedLimit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.` };
  }

  await prisma.investment.create({
    data: { userId: session.id, operationId, amount, status: "PENDING" },
  });

  await prisma.fundingOperation.update({
    where: { id: operationId },
    data: { fundedAmount: { increment: amount } },
  });

  revalidatePath("/investidor/oportunidades");
  revalidatePath("/investidor/portfolio");
  revalidatePath("/investidor");
  return { success: true };
}

// ==================== INVESTOR - DOCUMENTOS / KYC ====================

export async function getMyDocuments() {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };

  const [kycDocs, generalDocs] = await Promise.all([
    prisma.kycDocument.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.document.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, type: true, category: true, size: true, createdAt: true },
    }),
  ]);

  return { success: true, kycDocs, generalDocs };
}

export async function uploadMyKycDocument(data: {
  docType: string;
  base64Data: string;
  fileName: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };

  await prisma.kycDocument.create({
    data: {
      userId: session.id,
      docType: data.docType,
      frontPath: data.base64Data,
      status: "PENDING",
    },
  });

  revalidatePath("/investidor/documentos");
  return { success: true };
}

export async function uploadMyDocument(data: {
  name: string;
  type: string;
  category: string;
  size: string;
  base64Data: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };

  await prisma.document.create({
    data: {
      name: data.name,
      type: data.type,
      category: data.category,
      size: data.size,
      base64Data: data.base64Data,
      userId: session.id,
    },
  });

  revalidatePath("/investidor/documentos");
  return { success: true };
}

export async function deleteMyDocument(documentId: string) {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };

  const doc = await prisma.document.findUnique({ where: { id: documentId }, select: { userId: true } });
  if (!doc || doc.userId !== session.id) return { error: "Documento não encontrado." };

  await prisma.document.delete({ where: { id: documentId } });
  revalidatePath("/investidor/documentos");
  return { success: true };
}

export async function getMyDocumentContent(documentId: string) {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { base64Data: true, name: true, type: true, userId: true },
  });

  if (!doc || doc.userId !== session.id) return { error: "Documento não encontrado." };
  return { success: true, data: { base64Data: doc.base64Data, name: doc.name, type: doc.type } };
}

// ==================== INVESTOR - CONTRATOS ====================

export async function signContract(investmentId: string, base64Data: string) {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };

  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    select: { userId: true, operationId: true },
  });
  if (!investment || investment.userId !== session.id) return { error: "Investimento não encontrado." };

  const doc = await prisma.document.create({
    data: {
      name: `Contrato - ${investmentId.slice(0, 8)}`,
      type: "PDF",
      category: "Contrato",
      base64Data,
      userId: session.id,
      operationId: investment.operationId,
    },
  });

  await prisma.investment.update({
    where: { id: investmentId },
    data: { contractSignedAt: new Date(), contractUrl: doc.id },
  });

  revalidatePath(`/investidor/portfolio/${investment.operationId}`);
  revalidatePath("/investidor/documentos");
  return { success: true };
}

// ==================== INVESTOR - SAQUES ====================

export async function getMyWithdrawals() {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };

  const [withdrawals, user] = await Promise.all([
    prisma.withdrawalRequest.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: session.id },
      include: {
        investments: {
          where: { status: { in: ["CONFIRMED", "SETTLED"] } },
          select: { netReturn: true, amount: true, status: true },
        },
      },
    }),
  ]);

  const totalReturns = user?.investments.reduce((sum, inv) => sum + (inv.netReturn ?? 0), 0) ?? 0;
  const totalWithdrawn = withdrawals
    .filter((w) => w.status === "PAID" || w.status === "APPROVED")
    .reduce((sum, w) => sum + w.amount, 0);
  const pendingWithdrawals = withdrawals
    .filter((w) => w.status === "PENDING")
    .reduce((sum, w) => sum + w.amount, 0);
  const availableBalance = Math.max(0, totalReturns - totalWithdrawn - pendingWithdrawals);

  return {
    success: true,
    withdrawals,
    availableBalance,
    pixKey: user?.pixKey ?? null,
  };
}

export async function createWithdrawalRequest(amount: number) {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };

  if (amount <= 0) return { error: "Valor inválido." };

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { pixKey: true },
  });
  if (!user?.pixKey) return { error: "Cadastre uma chave PIX antes de solicitar saque." };

  const investments = await prisma.investment.findMany({
    where: { userId: session.id, status: { in: ["CONFIRMED", "SETTLED"] } },
    select: { netReturn: true },
  });
  const totalReturns = investments.reduce((sum, inv) => sum + (inv.netReturn ?? 0), 0);

  const existingWithdrawals = await prisma.withdrawalRequest.findMany({
    where: { userId: session.id, status: { in: ["PENDING", "APPROVED", "PAID"] } },
  });
  const totalWithdrawn = existingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const available = totalReturns - totalWithdrawn;

  if (amount > available) return { error: `Saldo insuficiente. Disponível: R$ ${available.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.` };

  await prisma.withdrawalRequest.create({
    data: { userId: session.id, amount, pixKey: user.pixKey, status: "PENDING" },
  });

  revalidatePath("/investidor/saques");
  return { success: true };
}

// ==================== INVESTOR - NOTIFICAÇÕES ====================

export async function getMyNotifications() {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };

  const notifications = await prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return { success: true, notifications };
}

export async function getUnreadNotificationCount() {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return 0;

  return prisma.notification.count({
    where: { userId: session.id, read: false },
  });
}

export async function markNotificationRead(notificationId: string) {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };

  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  revalidatePath("/investidor/notificacoes");
  return { success: true };
}

export async function markAllNotificationsRead() {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };

  await prisma.notification.updateMany({
    where: { userId: session.id, read: false },
    data: { read: true },
  });

  revalidatePath("/investidor/notificacoes");
  return { success: true };
}

// ==================== INVESTOR - PERFIL SELF-SERVICE ====================

export async function updateMyProfile(data: {
  phone?: string | null;
  bankName?: string | null;
  bankAgency?: string | null;
  bankAccount?: string | null;
  pixKey?: string | null;
}) {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") return { error: "Não autorizado." };

  await prisma.user.update({
    where: { id: session.id },
    data,
  });

  revalidatePath("/investidor/perfil");
  return { success: true };
}

// ==================== ADMIN - GESTÃO DE APORTES ====================

export async function getPendingInvestments() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Não autorizado." };

  const investments = await prisma.investment.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { id: true, name: true, email: true, cpfCnpj: true, approved: true } },
      operation: { include: { project: { select: { name: true, productCategory: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: investments };
}

export async function confirmInvestment(investmentId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Não autorizado." };

  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: { operation: { include: { project: true } } },
  });
  if (!investment) return { error: "Investimento não encontrado." };
  if (investment.status !== "PENDING") return { error: "Investimento não está pendente." };

  await prisma.investment.update({
    where: { id: investmentId },
    data: { status: "CONFIRMED" },
  });

  await notify(
    investment.userId,
    "Aporte Confirmado",
    `Seu aporte de R$ ${investment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} na operação ${investment.operation.operationCode} (${investment.operation.project.name}) foi confirmado.`,
    "PAGAMENTO"
  );

  revalidatePath("/admin/aportes");
  revalidatePath("/investidor/portfolio");
  revalidatePath("/investidor");
  return { success: true };
}

export async function cancelInvestment(investmentId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Não autorizado." };

  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: { operation: { include: { project: true } } },
  });
  if (!investment) return { error: "Investimento não encontrado." };
  if (investment.status !== "PENDING") return { error: "Investimento não está pendente." };

  await prisma.investment.update({
    where: { id: investmentId },
    data: { status: "CANCELLED" },
  });

  await prisma.fundingOperation.update({
    where: { id: investment.operationId },
    data: { fundedAmount: { decrement: investment.amount } },
  });

  await notify(
    investment.userId,
    "Aporte Cancelado",
    `Seu aporte de R$ ${investment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} na operação ${investment.operation.operationCode} foi cancelado pelo administrador.`,
    "INFO"
  );

  revalidatePath("/admin/aportes");
  revalidatePath("/investidor/portfolio");
  return { success: true };
}

// ==================== ADMIN - GESTÃO DE SAQUES ====================

export async function getAllWithdrawals() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Não autorizado." };

  const withdrawals = await prisma.withdrawalRequest.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, cpfCnpj: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: withdrawals };
}

export async function approveWithdrawal(withdrawalId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Não autorizado." };

  const withdrawal = await prisma.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
  if (!withdrawal) return { error: "Solicitação não encontrada." };
  if (withdrawal.status !== "PENDING") return { error: "Solicitação não está pendente." };

  await prisma.withdrawalRequest.update({
    where: { id: withdrawalId },
    data: { status: "APPROVED" },
  });

  await notify(
    withdrawal.userId,
    "Saque Aprovado",
    `Sua solicitação de saque de R$ ${withdrawal.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} foi aprovada e será processada em breve.`,
    "PAGAMENTO"
  );

  revalidatePath("/admin/saques");
  revalidatePath("/investidor/saques");
  return { success: true };
}

export async function rejectWithdrawal(withdrawalId: string, notes?: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Não autorizado." };

  const withdrawal = await prisma.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
  if (!withdrawal) return { error: "Solicitação não encontrada." };
  if (withdrawal.status !== "PENDING") return { error: "Solicitação não está pendente." };

  await prisma.withdrawalRequest.update({
    where: { id: withdrawalId },
    data: { status: "REJECTED", notes: notes || null },
  });

  await notify(
    withdrawal.userId,
    "Saque Rejeitado",
    `Sua solicitação de saque de R$ ${withdrawal.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} foi rejeitada.${notes ? ` Motivo: ${notes}` : ""}`,
    "INFO"
  );

  revalidatePath("/admin/saques");
  revalidatePath("/investidor/saques");
  return { success: true };
}

export async function markWithdrawalPaid(withdrawalId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Não autorizado." };

  const withdrawal = await prisma.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
  if (!withdrawal) return { error: "Solicitação não encontrada." };
  if (withdrawal.status !== "APPROVED") return { error: "Solicitação precisa estar aprovada." };

  await prisma.withdrawalRequest.update({
    where: { id: withdrawalId },
    data: { status: "PAID" },
  });

  await notify(
    withdrawal.userId,
    "Saque Pago",
    `O valor de R$ ${withdrawal.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} foi transferido para sua chave PIX (${withdrawal.pixKey}).`,
    "PAGAMENTO"
  );

  revalidatePath("/admin/saques");
  revalidatePath("/investidor/saques");
  return { success: true };
}

// ==================== ADMIN - CONTRATOS ====================

export async function uploadContractForInvestor(investmentId: string, base64Data: string, fileName: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Não autorizado." };

  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: { operation: { include: { project: true } }, user: { select: { name: true } } },
  });
  if (!investment) return { error: "Investimento não encontrado." };

  const doc = await prisma.document.create({
    data: {
      name: fileName || `Contrato - ${investment.operation.operationCode}`,
      type: "PDF",
      category: "Contrato",
      base64Data,
      userId: investment.userId,
      operationId: investment.operationId,
    },
  });

  await prisma.investment.update({
    where: { id: investmentId },
    data: { contractUrl: doc.id },
  });

  await notify(
    investment.userId,
    "Contrato Disponível",
    `O contrato da operação ${investment.operation.operationCode} (${investment.operation.project.name}) está disponível para assinatura no seu portfólio.`,
    "INFO"
  );

  revalidatePath("/admin/aportes");
  revalidatePath(`/investidor/portfolio/${investment.operationId}`);
  return { success: true };
}

export async function getContractDocument(documentId: string) {
  const session = await getSession();
  if (!session) return { error: "Não autorizado." };

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { base64Data: true, name: true, type: true, userId: true },
  });

  if (!doc) return { error: "Documento não encontrado." };

  if (session.role === "INVESTOR" && doc.userId !== session.id) {
    return { error: "Sem permissão." };
  }

  return { success: true, data: { base64Data: doc.base64Data, name: doc.name, type: doc.type } };
}
