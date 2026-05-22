import { create } from "zustand";
import type { ChatMessage } from "../types";
import { AIService, AIServiceError } from "../services/AIService";

interface ChatStore {
  messages: ChatMessage[];
  streaming: boolean;
  streamingText: string;
  error: string | null;
  limitReached: boolean;
  load: () => void;
  send: (text: string, apiKey: string, isPro: boolean) => Promise<void>;
  clearHistory: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  streaming: false,
  streamingText: "",
  error: null,
  limitReached: false,

  load: () => {
    try {
      const messages = AIService.getMessages();
      set({ messages, error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  send: async (text, apiKey, isPro) => {
    const userMsg = AIService.saveMessage("user", text);
    set((state) => ({
      messages: [...state.messages, userMsg],
      streaming: true,
      streamingText: "",
      error: null,
      limitReached: false,
    }));

    try {
      const response = await AIService.sendMessage(text, apiKey, isPro, (chunk) => {
        set({ streamingText: chunk });
      });

      set((state) => {
        const assistantMsg = state.messages.find(
          (m) => m.role === "assistant" && m.content === response,
        );
        if (assistantMsg) return { streaming: false, streamingText: "" };

        const messages = AIService.getMessages();
        return { messages, streaming: false, streamingText: "" };
      });
    } catch (e) {
      if (e instanceof AIServiceError && e.code === "LIMIT_REACHED") {
        set({ streaming: false, streamingText: "", limitReached: true });
      } else {
        set({
          streaming: false,
          streamingText: "",
          error: (e as Error).message,
        });
      }
    }
  },

  clearHistory: () => {
    AIService.clearHistory();
    set({ messages: [], error: null, limitReached: false });
  },
}));
