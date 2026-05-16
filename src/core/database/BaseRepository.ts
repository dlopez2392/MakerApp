import { getDatabase, generateId } from "./connection";

type Row = Record<string, unknown>;

export class BaseRepository<T extends { id: string }> {
  constructor(
    protected tableName: string,
    protected toModel: (row: Row) => T,
    protected toRow: (model: Partial<T>) => Row,
  ) {}

  getAll(where?: string, params?: unknown[]): T[] {
    const db = getDatabase();
    const sql = `SELECT * FROM ${this.tableName}${where ? ` WHERE ${where}` : ""} ORDER BY created_at DESC`;
    const rows = db.getAllSync(sql, params || []) as Row[];
    return rows.map(this.toModel);
  }

  getById(id: string): T | null {
    const db = getDatabase();
    const row = db.getFirstSync(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]) as Row | null;
    return row ? this.toModel(row) : null;
  }

  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): T {
    const db = getDatabase();
    const id = generateId();
    const row = this.toRow({ ...data, id } as Partial<T>);
    const columns = Object.keys(row);
    const placeholders = columns.map(() => "?").join(", ");
    const values = columns.map((col) => row[col]);

    db.runSync(
      `INSERT INTO ${this.tableName} (${columns.join(", ")}) VALUES (${placeholders})`,
      values as any[],
    );

    return this.getById(id)!;
  }

  update(id: string, data: Partial<T>): T | null {
    const db = getDatabase();
    const row = this.toRow(data);
    const columns = Object.keys(row).filter((k) => k !== "id" && k !== "created_at");
    if (columns.length === 0) return this.getById(id);

    const sets = columns.map((col) => `${col} = ?`).join(", ");
    const values = columns.map((col) => row[col]);

    db.runSync(
      `UPDATE ${this.tableName} SET ${sets}, updated_at = datetime('now') WHERE id = ?`,
      [...(values as any[]), id],
    );

    return this.getById(id);
  }

  delete(id: string): boolean {
    const db = getDatabase();
    const result = db.runSync(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return result.changes > 0;
  }

  count(where?: string, params?: unknown[]): number {
    const db = getDatabase();
    const sql = `SELECT COUNT(*) as cnt FROM ${this.tableName}${where ? ` WHERE ${where}` : ""}`;
    const row = db.getFirstSync(sql, params || []) as { cnt: number } | null;
    return row?.cnt ?? 0;
  }
}
