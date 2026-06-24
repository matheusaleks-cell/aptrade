-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'INVESTOR',
    "cpfCnpj" TEXT,
    "phone" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "bankName" TEXT,
    "bankAgency" TEXT,
    "bankAccount" TEXT,
    "pixKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "kyc_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "frontPath" TEXT NOT NULL,
    "backPath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "kyc_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "funding_projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "productCategory" TEXT NOT NULL,
    "maxCycles" INTEGER NOT NULL DEFAULT 1,
    "profitSplitPct" REAL NOT NULL DEFAULT 0.50,
    "payoutRule" TEXT NOT NULL DEFAULT 'AT_SETTLEMENT',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "funding_operations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operationCode" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL,
    "fundedAmount" REAL NOT NULL DEFAULT 0,
    "minInvestment" REAL NOT NULL DEFAULT 1000,
    "modality" TEXT NOT NULL DEFAULT 'PROFIT_SHARE',
    "fixedRateMonthly" REAL,
    "expectedMonths" INTEGER NOT NULL DEFAULT 6,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "openDate" DATETIME,
    "closeDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "funding_operations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "funding_projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "import_cost_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operationId" TEXT NOT NULL,
    "fobValue" REAL NOT NULL,
    "freight" REAL NOT NULL,
    "insurance" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "exchangeRate" REAL NOT NULL,
    "iiRate" REAL NOT NULL DEFAULT 0.18,
    "pisRate" REAL NOT NULL DEFAULT 0.021,
    "cofinsRate" REAL NOT NULL DEFAULT 0.0965,
    "icmsRate" REAL NOT NULL DEFAULT 0.18,
    "icmsFactor" REAL NOT NULL DEFAULT 0.82,
    "salesTaxRate" REAL NOT NULL DEFAULT 0.08,
    "opExRate" REAL NOT NULL DEFAULT 0.15,
    "siscomexFixed" REAL NOT NULL DEFAULT 154.23,
    "customsOpCost" REAL NOT NULL DEFAULT 0,
    "sellingPrice" REAL,
    "isActual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "import_cost_entries_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "funding_operations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "investments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "grossReturn" REAL,
    "irAmount" REAL,
    "netReturn" REAL,
    "contractUrl" TEXT,
    "contractSignedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "investments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "investments_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "funding_operations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "operation_cycles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operationId" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "grossRevenue" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "investorShare" REAL NOT NULL DEFAULT 0,
    "companyShare" REAL NOT NULL DEFAULT 0,
    "carryover" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "operation_cycles_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "funding_operations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cycle_sales" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cycleId" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalValue" REAL NOT NULL,
    "saleDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cycle_sales_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "operation_cycles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpfCnpj_key" ON "users"("cpfCnpj");

-- CreateIndex
CREATE UNIQUE INDEX "funding_operations_operationCode_key" ON "funding_operations"("operationCode");
