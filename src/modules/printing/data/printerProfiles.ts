import { getDatabase, generateId } from "../../../core/database/connection";

export interface PrinterProfile {
  id: string;
  name: string;
  buildVolumeX: number;
  buildVolumeY: number;
  buildVolumeZ: number;
  nozzleDiameter: number;
  maxVolumetricFlow: number | null;
  extruderType: string;
  bowdenLengthMm: number | null;
  stepsPerMmX: number | null;
  stepsPerMmY: number | null;
  stepsPerMmZ: number | null;
  stepsPerMmE: number | null;
  defaultSpeedMms: number | null;
  defaultTravelMms: number | null;
  isActive: boolean;
  source: string;
  createdAt: string;
}

export interface PrinterProfileRow {
  id: string;
  name: string;
  build_volume_x: number;
  build_volume_y: number;
  build_volume_z: number;
  nozzle_diameter: number;
  max_volumetric_flow: number | null;
  extruder_type: string;
  bowden_length_mm: number | null;
  steps_per_mm_x: number | null;
  steps_per_mm_y: number | null;
  steps_per_mm_z: number | null;
  steps_per_mm_e: number | null;
  default_speed_mms: number | null;
  default_travel_mms: number | null;
  is_active: number;
  source: string;
  created_at: string;
}

export function rowToProfile(row: PrinterProfileRow): PrinterProfile {
  return {
    id: row.id,
    name: row.name,
    buildVolumeX: row.build_volume_x,
    buildVolumeY: row.build_volume_y,
    buildVolumeZ: row.build_volume_z,
    nozzleDiameter: row.nozzle_diameter,
    maxVolumetricFlow: row.max_volumetric_flow,
    extruderType: row.extruder_type,
    bowdenLengthMm: row.bowden_length_mm,
    stepsPerMmX: row.steps_per_mm_x,
    stepsPerMmY: row.steps_per_mm_y,
    stepsPerMmZ: row.steps_per_mm_z,
    stepsPerMmE: row.steps_per_mm_e,
    defaultSpeedMms: row.default_speed_mms,
    defaultTravelMms: row.default_travel_mms,
    isActive: row.is_active === 1,
    source: row.source,
    createdAt: row.created_at,
  };
}

export function getAllProfiles(): PrinterProfile[] {
  const db = getDatabase();
  const rows = db.getAllSync("SELECT * FROM printer_profiles ORDER BY created_at ASC") as PrinterProfileRow[];
  return rows.map(rowToProfile);
}

export function getActiveProfile(): PrinterProfile | null {
  const db = getDatabase();
  const row = db.getFirstSync("SELECT * FROM printer_profiles WHERE is_active = 1 LIMIT 1") as PrinterProfileRow | null;
  return row ? rowToProfile(row) : null;
}

export function createProfile(
  profile: Omit<PrinterProfile, "id" | "isActive">,
): string {
  const db = getDatabase();
  const id = generateId();
  db.runSync(
    `INSERT INTO printer_profiles (
      id, name, build_volume_x, build_volume_y, build_volume_z,
      nozzle_diameter, max_volumetric_flow, extruder_type, bowden_length_mm,
      steps_per_mm_x, steps_per_mm_y, steps_per_mm_z, steps_per_mm_e,
      default_speed_mms, default_travel_mms, is_active, source, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    [
      id,
      profile.name,
      profile.buildVolumeX,
      profile.buildVolumeY,
      profile.buildVolumeZ,
      profile.nozzleDiameter,
      profile.maxVolumetricFlow,
      profile.extruderType,
      profile.bowdenLengthMm,
      profile.stepsPerMmX,
      profile.stepsPerMmY,
      profile.stepsPerMmZ,
      profile.stepsPerMmE,
      profile.defaultSpeedMms,
      profile.defaultTravelMms,
      profile.source,
      profile.createdAt,
    ],
  );
  return id;
}

export function updateProfile(
  id: string,
  partial: Partial<Omit<PrinterProfile, "id" | "createdAt">>,
): void {
  const db = getDatabase();

  const columnMap: Record<string, string> = {
    name: "name",
    buildVolumeX: "build_volume_x",
    buildVolumeY: "build_volume_y",
    buildVolumeZ: "build_volume_z",
    nozzleDiameter: "nozzle_diameter",
    maxVolumetricFlow: "max_volumetric_flow",
    extruderType: "extruder_type",
    bowdenLengthMm: "bowden_length_mm",
    stepsPerMmX: "steps_per_mm_x",
    stepsPerMmY: "steps_per_mm_y",
    stepsPerMmZ: "steps_per_mm_z",
    stepsPerMmE: "steps_per_mm_e",
    defaultSpeedMms: "default_speed_mms",
    defaultTravelMms: "default_travel_mms",
    isActive: "is_active",
    source: "source",
  };

  const setClauses: string[] = [];
  const values: (string | number | null)[] = [];

  for (const [key, value] of Object.entries(partial)) {
    const col = columnMap[key];
    if (!col) continue;
    setClauses.push(`${col} = ?`);
    if (key === "isActive") {
      values.push((value as boolean) ? 1 : 0);
    } else {
      values.push(value as string | number | null);
    }
  }

  if (setClauses.length === 0) return;

  values.push(id);
  db.runSync(
    `UPDATE printer_profiles SET ${setClauses.join(", ")} WHERE id = ?`,
    values,
  );
}

export function setActiveProfile(id: string): void {
  const db = getDatabase();
  db.runSync("UPDATE printer_profiles SET is_active = 0");
  db.runSync("UPDATE printer_profiles SET is_active = 1 WHERE id = ?", [id]);
}

export function deleteProfile(id: string): void {
  const db = getDatabase();
  db.runSync("DELETE FROM printer_profiles WHERE id = ?", [id]);
}
