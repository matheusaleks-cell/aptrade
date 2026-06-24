/**
 * Script completo: cria as tabelas no Turso e migra todos os dados do dev.db local.
 * Execute com: node prisma/setup-turso.cjs
 */

const Database = require("better-sqlite3");
const { createClient } = require("@libsql/client");
const path = require("path");

const TURSO_URL = "libsql://aptrade-matheusaleks-cell.aws-us-west-2.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODIzMTg4MTQsImlkIjoiMDE5ZWZhNzktYWMwMS03YWNiLWJjMDQtYTczZWZmYWVhZTk3IiwicmlkIjoiMTAyMDFjNzYtZjYxMy00Y2I5LTkzMDAtNWU4NTM5NGNkMjQwIn0.9ruvhYMOqAMh25yecl_fShpZEcdOnkqsg3V9GPVSEqIvK-nBQS4MyRoQQWW9bkOrCsqJtW5IMnzKxzHHarqLAQ";

const dbPath = path.resolve(process.cwd(), "dev.db");
const localDb = new Database(dbPath, { readonly: true });
const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

// Tabelas na ordem correta para respeitar FK
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
  "suppliers",
  "import_lots",
  "customers",
  "sales_orders",
  "documents",
  "leads",
  "lead_logs",
  "withdrawal_requests",
  "notifications",
];

async function run() {
  console.log("🔧 Criando tabelas no Turso...\n");

  // Desabilitar FK durante operações
  await turso.execute("PRAGMA foreign_keys = OFF");

  // Exportar schema do SQLite local
  const schemaTables = localDb
    .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL")
    .all();
  const schemaIndexes = localDb
    .prepare("SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL")
    .all();

  // Criar tabelas
  for (const t of schemaTables) {
    try {
      await turso.execute(t.sql);
      console.log(`✅ Tabela criada (ou já existia): ${t.sql.match(/CREATE TABLE ["']?(\w+)/i)?.[1]}`);
    } catch (e) {
      if (e.message && e.message.includes("already exists")) {
        console.log(`ℹ️  Tabela já existe, pulando.`);
      } else {
        console.warn(`⚠️  Erro ao criar tabela:`, e.message);
      }
    }
  }

  // Criar índices únicos
  for (const idx of schemaIndexes) {
    try {
      await turso.execute(idx.sql);
    } catch {
      // Índice já existe, ignorar
    }
  }

  console.log("\n📦 Migrando dados...\n");

  for (const table of TABLES) {
    let rows;
    try {
      rows = localDb.prepare(`SELECT * FROM "${table}"`).all();
    } catch {
      console.log(`⚠️  Tabela "${table}" não encontrada, pulando.`);
      continue;
    }

    if (!rows || rows.length === 0) {
      console.log(`ℹ️  Tabela "${table}": vazia, pulando.`);
      continue;
    }

    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => "?").join(", ");
    const insertSql = `INSERT OR REPLACE INTO "${table}" (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders})`;

    let success = 0;
    for (const row of rows) {
      const values = columns.map((col) => {
        const val = row[col];
        if (val instanceof Buffer) return val.toString("base64");
        return val;
      });
      try {
        await turso.execute({ sql: insertSql, args: values });
        success++;
      } catch (e) {
        console.error(`  ❌ Erro linha em "${table}":`, e.message);
      }
    }
    console.log(`✅ "${table}": ${success}/${rows.length} linhas migradas.`);
  }

  await turso.execute("PRAGMA foreign_keys = ON");
  localDb.close();
  console.log("\n🎉 Migração concluída! Banco Turso pronto para produção.");
}

run().catch((e) => {
  console.error("Erro fatal:", e);
  process.exit(1);
});
