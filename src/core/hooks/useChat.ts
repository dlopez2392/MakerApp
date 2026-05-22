import { useEffect } from "react";
import { useChatStore } from "../stores/chatStore";

export function useChat() {
  const store = useChatStore();
  useEffect(() => {
    if (store.messages.length === 0) store.load();
  }, []);
  return store;
}
