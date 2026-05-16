import { useEffect } from "react";
import { useJournalStore } from "../stores/journalStore";

export function useJournal() {
  const store = useJournalStore();
  useEffect(() => {
    if (store.entries.length === 0 && !store.loading) store.load();
  }, []);
  return store;
}
