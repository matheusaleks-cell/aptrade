const DB = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'dev.db');
const db = new DB(dbPath, { readonly: true });

const tables = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL").all();
tables.forEach(t => console.log(t.sql + ';'));
const indexes = db.prepare("SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL").all();
indexes.forEach(t => console.log(t.sql + ';'));

db.close();
