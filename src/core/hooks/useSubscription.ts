import { useEffect } from "react";
import { useSubscriptionStore } from "../stores/subscriptionStore";

export function useSubscription() {
  const store = useSubscriptionStore();
  useEffect(() => {
    if (!store.loaded) store.load();
  }, []);
  return store;
}
