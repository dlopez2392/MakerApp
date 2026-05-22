import { create } from "zustand";
import type { SavedRecipe } from "../types";
import { RecipeService, RecipeServiceError } from "../services/RecipeService";

interface RecipeStore {
  recipes: SavedRecipe[];
  loading: boolean;
  error: string | null;
  limitReached: boolean;
  load: () => void;
  loadByModule: (module: string) => void;
  create: (data: Omit<SavedRecipe, "id" | "createdAt" | "updatedAt">) => SavedRecipe | null;
  update: (id: string, data: Partial<SavedRecipe>) => void;
  remove: (id: string) => void;
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  recipes: [],
  loading: false,
  error: null,
  limitReached: false,
  load: () => {
    set({ loading: true });
    try {
      const recipes = RecipeService.getAll();
      set({ recipes, loading: false, error: null });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  loadByModule: (module: string) => {
    set({ loading: true });
    try {
      const recipes = RecipeService.getByModule(module);
      set({ recipes, loading: false, error: null });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  create: (data) => {
    try {
      const recipe = RecipeService.create(data);
      set((state) => ({ recipes: [recipe, ...state.recipes], limitReached: false }));
      return recipe;
    } catch (e) {
      if (e instanceof RecipeServiceError && e.code === "LIMIT_REACHED") {
        set({ limitReached: true });
        return null;
      }
      throw e;
    }
  },
  update: (id, data) => {
    const updated = RecipeService.update(id, data);
    set((state) => ({ recipes: state.recipes.map((r) => (r.id === id ? updated : r)) }));
  },
  remove: (id) => {
    RecipeService.delete(id);
    set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) }));
  },
}));
