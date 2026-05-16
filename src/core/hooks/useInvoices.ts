import { useEffect } from "react";
import { useInvoiceStore } from "../stores/invoiceStore";

export function useInvoices() {
  const store = useInvoiceStore();
  useEffect(() => {
    if (store.invoices.length === 0 && !store.loading) {
      store.load();
      store.loadOverdue();
    }
  }, []);
  return store;
}
