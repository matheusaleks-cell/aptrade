-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "iiRate" REAL NOT NULL DEFAULT 0.18,
    "pisRate" REAL NOT NULL DEFAULT 0.021,
    "cofinsRate" REAL NOT NULL DEFAULT 0.0965,
    "icmsRate" REAL NOT NULL DEFAULT 0.18,
    "salesTaxRate" REAL NOT NULL DEFAULT 0.08,
    "opExRate" REAL NOT NULL DEFAULT 0.15,
    "cvmLimit" REAL NOT NULL DEFAULT 20000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
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
    "suitabilityResult" TEXT,
    "suitabilityFilledAt" DATETIME,
    "isQualifiedInvestor" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("approved", "bankAccount", "bankAgency", "bankName", "cpfCnpj", "createdAt", "email", "id", "name", "password", "phone", "pixKey", "role", "updatedAt") SELECT "approved", "bankAccount", "bankAgency", "bankName", "cpfCnpj", "createdAt", "email", "id", "name", "password", "phone", "pixKey", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_cpfCnpj_key" ON "users"("cpfCnpj");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
