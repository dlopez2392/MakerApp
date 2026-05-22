import { recipeRepository } from "../database/repositories/RecipeRepository";
import type { SavedRecipe } from "../types";
import { FREE_LIMITS } from "../types";

export class RecipeServiceError extends Error {
  constructor(message: string, public code: "LIMIT_REACHED" | "NOT_FOUND" | "INVALID") {
    super(message);
  }
}

export const RecipeService = {
  getAll(): SavedRecipe[] {
    return recipeRepository.getAll();
  },
  getById(id: string): SavedRecipe {
    const recipe = recipeRepository.getById(id);
    if (!recipe) throw new RecipeServiceError("Recipe not found", "NOT_FOUND");
    return recipe;
  },
  getByModule(module: string): SavedRecipe[] {
    return recipeRepository.getAll("module = ?", [module]);
  },
  create(data: Omit<SavedRecipe, "id" | "createdAt" | "updatedAt">): SavedRecipe {
    const count = recipeRepository.count("module = ?", [data.module]);
    if (count >= FREE_LIMITS.savedRecipesPerModule) {
      throw new RecipeServiceError(
        `Free tier limit of ${FREE_LIMITS.savedRecipesPerModule} saved recipes per module reached`,
        "LIMIT_REACHED",
      );
    }
    return recipeRepository.create(data);
  },
  update(id: string, data: Partial<SavedRecipe>): SavedRecipe {
    const recipe = recipeRepository.update(id, data);
    if (!recipe) throw new RecipeServiceError("Recipe not found", "NOT_FOUND");
    return recipe;
  },
  delete(id: string): void {
    recipeRepository.delete(id);
  },
};
