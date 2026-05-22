import { useEffect } from "react";
import { useRecipeStore } from "../stores/recipeStore";

export function useRecipes(module?: string) {
  const store = useRecipeStore();
  useEffect(() => {
    if (store.recipes.length === 0 && !store.loading) {
      if (module) {
        store.loadByModule(module);
      } else {
        store.load();
      }
    }
  }, [module]);
  return store;
}
