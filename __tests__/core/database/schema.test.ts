import { getTableNames, TABLE_SCHEMAS } from "../../../src/core/database/schema";

describe("Database Schema", () => {
  test("defines all required tables", () => {
    const tableNames = getTableNames();
    const expected = [
      "projects", "inventory_items", "inventory_deductions", "clients",
      "journal_entries", "quotes", "quote_line_items", "invoices",
      "invoice_line_items", "invoice_payments", "calculator_results",
      "saved_recipes", "wood_species", "user_settings",
    ];
    expect(tableNames).toEqual(expect.arrayContaining(expected));
    expect(tableNames.length).toBe(expected.length);
  });

  test("projects table has correct columns", () => {
    const sql = TABLE_SCHEMAS.projects;
    expect(sql).toContain("id TEXT PRIMARY KEY");
    expect(sql).toContain("name TEXT NOT NULL");
    expect(sql).toContain("client_id TEXT");
    expect(sql).toContain("status TEXT NOT NULL DEFAULT 'idea'");
    expect(sql).toContain("discipline_tags TEXT NOT NULL DEFAULT '[]'");
    expect(sql).toContain("created_at TEXT NOT NULL");
  });

  test("inventory_items table has metadata jsonb field", () => {
    const sql = TABLE_SCHEMAS.inventory_items;
    expect(sql).toContain("metadata TEXT DEFAULT '{}'");
  });
});
