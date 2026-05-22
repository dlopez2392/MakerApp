import { BaseRepository } from "../BaseRepository";
import type { SavedRecipe } from "../../types";

type Row = Record<string, unknown>;

function toModel(row: Row): SavedRecipe {
  return {
    id: row.id as string,
    userId: row.user_id as string | undefined,
    module: row.module as string,
    recipeType: row.recipe_type as string,
    name: row.name as string,
    configJson: JSON.parse((row.config_json as string) || "{}"),
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toRow(model: Partial<SavedRecipe>): Row {
  const row: Row = {};
  if (model.id !== undefined) row.id = model.id;
  if (model.module !== undefined) row.module = model.module;
  if (model.recipeType !== undefined) row.recipe_type = model.recipeType;
  if (model.name !== undefined) row.name = model.name;
  if (model.configJson !== undefined) row.config_json = JSON.stringify(model.configJson);
  if (model.notes !== undefined) row.notes = model.notes || null;
  return row;
}

export const recipeRepository = new BaseRepository<SavedRecipe>("saved_recipes", toModel, toRow);
