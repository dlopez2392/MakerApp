import { woodSpeciesData, WoodSpecies } from "./woodSpecies";

/**
 * Seeds the wood_species table if it is empty.
 * Expects an expo-sqlite SQLiteDatabase instance.
 */
export async function seedWoodSpecies(db: {
  execAsync: (sql: string) => Promise<void>;
  runAsync: (sql: string, params: unknown[]) => Promise<unknown>;
  getFirstAsync: (sql: string) => Promise<Record<string, unknown> | null>;
}): Promise<{ seeded: boolean; count: number }> {
  // Create table if not exists
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS wood_species (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      common_name TEXT NOT NULL UNIQUE,
      botanical_name TEXT NOT NULL,
      janka_hardness INTEGER NOT NULL,
      density_lbs_ft3 REAL NOT NULL,
      tangential_shrinkage REAL NOT NULL,
      radial_shrinkage REAL NOT NULL,
      typical_uses TEXT NOT NULL,
      finishing_notes TEXT NOT NULL,
      toxicity_warnings TEXT,
      price_tier TEXT NOT NULL,
      domestic INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Check if already seeded
  const row = await db.getFirstAsync("SELECT COUNT(*) as cnt FROM wood_species");
  const count = (row as { cnt: number } | null)?.cnt ?? 0;
  if (count > 0) {
    return { seeded: false, count };
  }

  // Insert all species
  for (const species of woodSpeciesData) {
    await db.runAsync(
      `INSERT INTO wood_species (
        common_name, botanical_name, janka_hardness, density_lbs_ft3,
        tangential_shrinkage, radial_shrinkage, typical_uses, finishing_notes,
        toxicity_warnings, price_tier, domestic
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        species.commonName,
        species.botanicalName,
        species.jankaHardness,
        species.densityLbsFt3,
        species.tangentialShrinkage,
        species.radialShrinkage,
        JSON.stringify(species.typicalUses),
        species.finishingNotes,
        species.toxicityWarnings,
        species.priceTier,
        species.domestic ? 1 : 0,
      ]
    );
  }

  return { seeded: true, count: woodSpeciesData.length };
}
