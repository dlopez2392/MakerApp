import { useEffect } from "react";
import { useInventoryStore } from "../stores/inventoryStore";

export function useInventory() {
  const store = useInventoryStore();
  useEffect(() => {
    if (store.items.length === 0 && !store.loading) {
      store.load();
      store.loadLowStock();
    }
  }, []);
  return store;
}
