import { woodSpeciesData, WoodSpecies } from "./woodSpecies";
import { getDatabase } from "../../../core/database/connection";

export function seedWoodSpecies(): { seeded: boolean; count: number } {
  const db = getDatabase();

  db.execSync(`
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

  const row = db.getFirstSync("SELECT COUNT(*) as cnt FROM wood_species") as { cnt: number } | null;
  const count = row?.cnt ?? 0;
  if (count > 0) {
    return { seeded: false, count };
  }

  for (const species of woodSpeciesData) {
    db.runSync(
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
