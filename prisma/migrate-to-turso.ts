/**
 * Script de migração: copia dados do dev.db local para o banco Turso (libsql remoto).
 * Execute com: npx tsx prisma/migrate-to-turso.ts
 */

import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import path from "node:path";

const TURSO_URL = "libsql://aptrade-matheusaleks-cell.aws-us-west-2.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODIzMTg4MTQsImlkIjoiMDE5ZWZhNzktYWMwMS03YWNiLWJjMDQtYTczZWZmYWVhZTk3IiwicmlkIjoiMTAyMDFjNzYtZjYxMy00Y2I5LTkzMDAtNWU4NTM5NGNkMjQwIn0.9ruvhYMOqAMh25yecl_fShpZEcdOnkqsg3V9GPVSEqIvK-nBQS4MyRoQQWW9bkOrCsqJtW5IMnzKxzHHarqLAQ";

const dbPath = path.resolve(process.cwd(), "dev.db");
const localDb = new Database(dbPath, { readonly: true });

const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

// Ordem importa por causa das chaves estrangeiras
const TABLES = [
  "users",
  "system_configs",
  "financial_distribution_rules",
  "funding_projects",
  "funding_operations",
  "investments",
  "import_cost_entries",
  "operation_cycles",
  "cycle_sales",
  "kyc_documents",
  "documents",
  "suppliers",
  "import_lots",
  "customers",
  "sales_orders",
  "leads",
  "lead_logs",
  "withdrawal_requests",
  "notifications",
];

async function migrate() {
  console.log("🚀 Iniciando migração para Turso...\n");

  // Desabilitar checagem de FK durante importação
  await turso.execute("PRAGMA foreign_keys = OFF;");

  for (const table of TABLES) {
    let rows: Record<string, unknown>[];
    try {
      rows = localDb.prepare(`SELECT * FROM "${table}"`).all() as Record<string, unknown>[];
    } catch {
      console.log(`⚠️  Tabela "${table}" não encontrada localmente, pulando.`);
      continue;
    }

    if (rows.length === 0) {
      console.log(`ℹ️  Tabela "${table}": vazia, pulando.`);
      continue;
    }

    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => "?").join(", ");
    const insertSql = `INSERT OR REPLACE INTO "${table}" (${columns.map(c => `"${c}"`).join(", ")}) VALUES (${placeholders})`;

    let success = 0;
    for (const row of rows) {
      const values = columns.map((col) => {
        const val = row[col];
        // Converter Buffer/Uint8Array para string base64 se necessário
        if (val instanceof Buffer) return val.toString("base64");
        return val;
      });
      try {
        await turso.execute({ sql: insertSql, args: values as never[] });
        success++;
      } catch (e) {
        console.error(`  ❌ Erro ao inserir linha em "${table}":`, e);
      }
    }
    console.log(`✅ Tabela "${table}": ${success}/${rows.length} linhas migradas.`);
  }

  // Reabilitar FK
  await turso.execute("PRAGMA foreign_keys = ON;");

  localDb.close();
  console.log("\n✅ Migração concluída com sucesso!");
}

migrate().catch((e) => {
  console.error("Erro fatal na migração:", e);
  process.exit(1);
});
