import { woodSpeciesData } from "../../../src/modules/woodworking/data/woodSpecies";

const REQUIRED_SPECIES = [
  "Red Oak", "White Oak", "Hard Maple", "Black Walnut", "Black Cherry",
  "White Ash", "Yellow Poplar", "Hickory", "Eastern White Pine", "Douglas Fir",
  "Soft Maple", "Beech", "Birch", "Alder", "Western Red Cedar", "Redwood",
  "Padauk", "Purpleheart", "Bloodwood", "Zebrawood", "Wenge", "Bubinga",
  "Sapele", "African Mahogany", "Teak", "Ipe", "Jatoba",
];

describe("Wood Species Database", () => {
  test("has at least 60 species", () => {
    expect(woodSpeciesData.length).toBeGreaterThanOrEqual(60);
  });

  test("all required species are present", () => {
    const names = woodSpeciesData.map((s) => s.commonName);
    for (const required of REQUIRED_SPECIES) {
      expect(names).toContain(required);
    }
  });

  test("all species have valid janka hardness (> 0)", () => {
    for (const s of woodSpeciesData) {
      expect(s.jankaHardness).toBeGreaterThan(0);
    }
  });

  test("all species have valid density", () => {
    for (const s of woodSpeciesData) {
      expect(s.densityLbsFt3).toBeGreaterThan(0);
    }
  });

  test("all species have valid shrinkage values", () => {
    for (const s of woodSpeciesData) {
      expect(s.tangentialShrinkage).toBeGreaterThan(0);
      expect(s.radialShrinkage).toBeGreaterThan(0);
      expect(s.tangentialShrinkage).toBeGreaterThan(s.radialShrinkage);
    }
  });

  test("all species have at least one typical use", () => {
    for (const s of woodSpeciesData) {
      expect(s.typicalUses.length).toBeGreaterThan(0);
    }
  });

  test("all species have a valid price tier", () => {
    const validTiers = ["budget", "moderate", "premium", "exotic"];
    for (const s of woodSpeciesData) {
      expect(validTiers).toContain(s.priceTier);
    }
  });

  test("no duplicate common names", () => {
    const names = woodSpeciesData.map((s) => s.commonName);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  test("domestic flag is boolean", () => {
    for (const s of woodSpeciesData) {
      expect(typeof s.domestic).toBe("boolean");
    }
  });
});
