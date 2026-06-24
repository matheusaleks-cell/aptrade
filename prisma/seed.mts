import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "..", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const investorPassword = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { email: "admin@aptrade.com.br" },
    update: {},
    create: {
      name: "Administrador Aptrade",
      email: "admin@aptrade.com.br",
      password: adminPassword,
      role: "ADMIN",
      cpfCnpj: "00.000.000/0001-00",
      approved: true,
    },
  });

  const investor = await prisma.user.upsert({
    where: { email: "investidor@aptrade.com.br" },
    update: {},
    create: {
      name: "João Silva",
      email: "investidor@aptrade.com.br",
      password: investorPassword,
      role: "INVESTOR",
      cpfCnpj: "123.456.789-00",
      phone: "(11) 99999-0000",
      approved: true,
      bankName: "Banco do Brasil",
      bankAgency: "1234",
      bankAccount: "56789-0",
      pixKey: "investidor@aptrade.com.br",
    },
  });

  const investor2 = await prisma.user.upsert({
    where: { email: "maria@aptrade.com.br" },
    update: {},
    create: {
      name: "Maria Oliveira",
      email: "maria@aptrade.com.br",
      password: investorPassword,
      role: "INVESTOR",
      cpfCnpj: "987.654.321-00",
      phone: "(21) 98888-1111",
      approved: false,
    },
  });

  await prisma.kycDocument.create({
    data: {
      userId: investor2.id,
      docType: "CPF",
      frontPath: "/uploads/kyc/maria_cpf_front.jpg",
      backPath: "/uploads/kyc/maria_cpf_back.jpg",
      status: "PENDING",
    },
  });

  const project1 = await prisma.fundingProject.create({
    data: {
      name: "Importação Vezir VR12 Pump",
      description: "Lote de bombas de vácuo industriais Vezir VR12 para revenda no mercado nacional.",
      productCategory: "8414.10.00",
      maxCycles: 3,
      profitSplitPct: 0.5,
      payoutRule: "REINVEST",
    },
  });

  const project2 = await prisma.fundingProject.create({
    data: {
      name: "Importação Sensores IoT TM-200",
      description: "Sensores inteligentes para automação industrial.",
      productCategory: "9031.80.99",
      maxCycles: 2,
      profitSplitPct: 0.45,
      payoutRule: "AT_SETTLEMENT",
    },
  });

  const op1 = await prisma.fundingOperation.create({
    data: {
      operationCode: "OP-2026-001",
      projectId: project1.id,
      totalAmount: 150000,
      fundedAmount: 150000,
      minInvestment: 5000,
      modality: "PROFIT_SHARE",
      status: "SOLD",
      openDate: new Date("2026-01-15"),
      closeDate: new Date("2026-02-15"),
      expectedMonths: 6,
    },
  });

  const op2 = await prisma.fundingOperation.create({
    data: {
      operationCode: "OP-2026-002",
      projectId: project1.id,
      totalAmount: 200000,
      fundedAmount: 120000,
      minInvestment: 10000,
      modality: "PROFIT_SHARE",
      status: "OPEN",
      openDate: new Date("2026-05-01"),
      expectedMonths: 6,
    },
  });

  const op3 = await prisma.fundingOperation.create({
    data: {
      operationCode: "OP-2026-003",
      projectId: project2.id,
      totalAmount: 80000,
      fundedAmount: 80000,
      minInvestment: 5000,
      modality: "FIXED",
      fixedRateMonthly: 0.021,
      status: "IN_PROGRESS",
      openDate: new Date("2026-03-01"),
      closeDate: new Date("2026-03-20"),
      expectedMonths: 4,
    },
  });

  await prisma.importCostEntry.create({
    data: {
      operationId: op1.id,
      fobValue: 120.0,
      freight: 15.0,
      insurance: 3.0,
      quantity: 200,
      exchangeRate: 5.45,
      sellingPrice: 1200.0,
      isActual: false,
    },
  });

  await prisma.importCostEntry.create({
    data: {
      operationId: op1.id,
      fobValue: 118.5,
      freight: 16.2,
      insurance: 2.8,
      quantity: 200,
      exchangeRate: 5.52,
      sellingPrice: 1200.0,
      isActual: true,
    },
  });

  await prisma.importCostEntry.create({
    data: {
      operationId: op3.id,
      fobValue: 45.0,
      freight: 8.0,
      insurance: 1.5,
      quantity: 500,
      exchangeRate: 5.5,
      isActual: false,
    },
  });

  await prisma.investment.create({
    data: {
      userId: investor.id,
      operationId: op1.id,
      amount: 50000,
      status: "SETTLED",
      grossReturn: 12500,
      irAmount: 2500,
      netReturn: 10000,
      contractUrl: "#contrato-op001-joao",
      contractSignedAt: new Date("2026-01-20"),
    },
  });

  await prisma.investment.create({
    data: {
      userId: investor.id,
      operationId: op2.id,
      amount: 30000,
      status: "CONFIRMED",
    },
  });

  await prisma.investment.create({
    data: {
      userId: investor.id,
      operationId: op3.id,
      amount: 20000,
      status: "CONFIRMED",
    },
  });

  await prisma.investment.create({
    data: {
      userId: investor2.id,
      operationId: op1.id,
      amount: 100000,
      status: "SETTLED",
      grossReturn: 25000,
      irAmount: 5000,
      netReturn: 20000,
    },
  });

  const cycle1 = await prisma.operationCycle.create({
    data: {
      operationId: op1.id,
      cycleNumber: 1,
      quantity: 200,
      grossRevenue: 240000,
      totalCost: 150000,
      investorShare: 37500,
      companyShare: 37500,
      carryover: 1250,
      status: "COMPLETED",
    },
  });

  const cycle2 = await prisma.operationCycle.create({
    data: {
      operationId: op1.id,
      cycleNumber: 2,
      quantity: 250,
      grossRevenue: 300000,
      totalCost: 187500,
      investorShare: 46875,
      companyShare: 46875,
      carryover: 800,
      status: "COMPLETED",
    },
  });

  await prisma.cycleSale.createMany({
    data: [
      { cycleId: cycle1.id, buyerName: "Industria ABC Ltda", quantity: 80, unitPrice: 1200, totalValue: 96000, saleDate: new Date("2026-04-10") },
      { cycleId: cycle1.id, buyerName: "Comércio XYZ S.A.", quantity: 50, unitPrice: 1200, totalValue: 60000, saleDate: new Date("2026-04-15") },
      { cycleId: cycle1.id, buyerName: "TechParts do Brasil", quantity: 70, unitPrice: 1200, totalValue: 84000, saleDate: new Date("2026-04-22") },
      { cycleId: cycle2.id, buyerName: "Industria ABC Ltda", quantity: 100, unitPrice: 1200, totalValue: 120000, saleDate: new Date("2026-06-05") },
      { cycleId: cycle2.id, buyerName: "MegaEquip Importados", quantity: 80, unitPrice: 1200, totalValue: 96000, saleDate: new Date("2026-06-10") },
      { cycleId: cycle2.id, buyerName: "Comércio XYZ S.A.", quantity: 70, unitPrice: 1200, totalValue: 84000, saleDate: new Date("2026-06-14") },
    ],
  });

  console.log("Seed concluído com sucesso!");
  console.log("Admin: admin@aptrade.com.br / admin123");
  console.log("Investidor: investidor@aptrade.com.br / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
