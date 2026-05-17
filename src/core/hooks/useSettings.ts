import { useEffect, useMemo } from "react";
import { useSettingsStore } from "../stores/settingsStore";

export function useSettings() {
  const store = useSettingsStore();

  useEffect(() => {
    if (!store.loaded) store.load();
  }, [store.loaded]);

  const settings = useMemo(() => ({
    unitSystem: store.unitSystem,
    shopName: store.shopName,
    shopLogoUrl: store.shopLogoUrl,
    hourlyRate: store.hourlyRate,
    taxRate: store.taxRate,
    markupPercent: store.markupPercent,
    quotePrefix: store.quotePrefix,
    invoicePrefix: store.invoicePrefix,
    terms: store.terms,
  }), [store.unitSystem, store.shopName, store.shopLogoUrl, store.hourlyRate, store.taxRate, store.markupPercent, store.quotePrefix, store.invoicePrefix, store.terms]);

  return { settings, set: store.set, loaded: store.loaded, load: store.load };
}
