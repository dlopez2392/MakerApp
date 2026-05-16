import * as SQLite from "expo-sqlite";
import { TABLE_SCHEMAS, INDEX_SCHEMAS } from "./schema";

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync("makeros.db");
    db.execSync("PRAGMA journal_mode = WAL");
    db.execSync("PRAGMA foreign_keys = ON");
  }
  return db;
}

export function initializeDatabase(): void {
  const database = getDatabase();
  for (const sql of Object.values(TABLE_SCHEMAS)) {
    database.execSync(sql);
  }
  for (const sql of INDEX_SCHEMAS) {
    database.execSync(sql);
  }
}

export function generateId(): string {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
