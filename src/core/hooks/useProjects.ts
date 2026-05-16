import { useEffect } from "react";
import { useProjectStore } from "../stores/projectStore";

export function useProjects() {
  const store = useProjectStore();
  useEffect(() => {
    if (store.projects.length === 0 && !store.loading) store.load();
  }, []);
  return store;
}
