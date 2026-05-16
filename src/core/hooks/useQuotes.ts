import { useEffect } from "react";
import { useQuoteStore } from "../stores/quoteStore";

export function useQuotes() {
  const store = useQuoteStore();
  useEffect(() => {
    if (store.quotes.length === 0 && !store.loading) store.load();
  }, []);
  return store;
}
